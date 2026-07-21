import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AddUser() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/users", formData);

      alert("User Added Successfully!");

      navigate("/dashboard");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to Add User"
      );
    }
  };

  return (
  <div className="add-user-page">

    <div className="add-user-header">
      <h1>User Management</h1>
      <h2>Add User</h2>
    </div>

    <div className="add-user-card">

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="name"
          placeholder="Enter Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {message && (
          <p className="error-message">{message}</p>
        )}

        <div className="button-group">

          <button type="submit" className="add-btn">
            Save User
          </button>

          <button
            type="button"
            className="logout-btn"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>

        </div>

      </form>

    </div>

  </div>
);
}

export default AddUser;