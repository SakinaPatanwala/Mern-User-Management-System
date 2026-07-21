import { useState } from "react";
import api from "../services/api";

function UserRow({ user, index, fetchUsers }) {
  const [isEditing, setIsEditing] = useState(false);

  const [editedUser, setEditedUser] = useState({
    name: user.name,
    email: user.email,
  });

  // Handle input changes
  const handleChange = (e) => {
    setEditedUser({
      ...editedUser,
      [e.target.name]: e.target.value,
    });
  };

  // Save updated user
  const handleSave = async () => {
    try {
      await api.put(`/users/${user.id}`, editedUser);

      setIsEditing(false);

      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update user");
    }
  };

  // Delete user
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/users/${user.id}`);

      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <tr>

  <td>{index + 1}</td>

  <td>
    {isEditing ? (
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
      />
    ) : (
      user.name
    )}
  </td>

  <td>
    {isEditing ? (
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
      />
    ) : (
      user.email
    )}
  </td>

  <td>

    {isEditing ? (
      <>
        <button onClick={handleSave}>Save</button>

        <button onClick={handleCancel}>
          Cancel
        </button>
      </>
    ) : (
      <>
        <button onClick={() => setIsEditing(true)}>
          Edit
        </button>

        <button onClick={handleDelete}>
          Delete
        </button>
      </>
    )}

  </td>

</tr>
  );
}

export default UserRow;