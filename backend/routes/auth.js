const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
});

// @route   POST /api/auth/register
// @desc    Create the first account / new users (kept open here; lock down or
//          protect with requireRole('admin') once you have seeded an admin)
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    try {
      const { name, email, password, role } = req.body;

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(409).json({ message: 'An account with that email already exists' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role === 'admin' ? 'admin' : 'user',
      });

      const token = signToken(user);
      res.status(201).json({ token, user: sanitizeUser(user) });
    } catch (err) {
      res.status(500).json({ message: 'Server error while registering user', error: err.message });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Authenticate a user and return a JWT
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { email, password } = req.body;

      // Explicitly select password since the schema excludes it by default
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      if (user.status === 'inactive') {
        return res.status(403).json({ message: 'This account has been deactivated' });
      }

      const token = signToken(user);
      res.json({ token, user: sanitizeUser(user) });
    } catch (err) {
      res.status(500).json({ message: 'Server error while logging in', error: err.message });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Return the currently authenticated user (used to persist sessions on refresh)
router.get('/me', protect, async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

module.exports = router;