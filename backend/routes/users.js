const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes below require a valid JWT
router.use(protect);

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// @route   GET /api/users
// @desc    List users, with optional search + pagination
//          ?search=jane&page=1&limit=10
router.get('/', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);

    res.json({
      users: users.map(sanitizeUser),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching users', error: err.message });
  }
});

// @route   GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    res.status(400).json({ message: 'Invalid user id' });
  }
});

// @route   POST /api/users
// @desc    Create a new user record
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Role must be admin or user'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { name, email, password, role, status } = req.body;

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(409).json({ message: 'An account with that email already exists' });
      }

      const user = await User.create({ name, email, password, role, status });
      res.status(201).json({ user: sanitizeUser(user) });
    } catch (err) {
      res.status(500).json({ message: 'Server error while creating user', error: err.message });
    }
  }
);

// @route   PUT /api/users/:id
// @desc    Update a user's name, email, role, status, or password
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('A valid email is required'),
    body('password')
      .optional()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Role must be admin or user'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const { name, email, password, role, status } = req.body;

      if (email && email.toLowerCase() !== user.email) {
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
          return res.status(409).json({ message: 'An account with that email already exists' });
        }
        user.email = email;
      }

      if (name !== undefined) user.name = name;
      if (role !== undefined) user.role = role;
      if (status !== undefined) user.status = status;
      if (password) user.password = password; // pre-save hook re-hashes it

      await user.save();
      res.json({ user: sanitizeUser(user) });
    } catch (err) {
      res.status(500).json({ message: 'Server error while updating user', error: err.message });
    }
  }
);

// @route   DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot delete your own account while logged in' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(400).json({ message: 'Invalid user id' });
  }
});

module.exports = router;