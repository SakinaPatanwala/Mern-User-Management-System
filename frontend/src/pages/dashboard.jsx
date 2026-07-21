import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import api from "../services/api";
import UserTable from "../components/UserTable";

function Dashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");

      setUsers(response.data.users);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
  <div className="dashboard-container">

    <div className="dashboard-card">

      <div className="dashboard-header">

        <div>
          <h1>User Management</h1>
          <p>Welcome back, {loggedInUser?.name}</p>
        </div>

        <div className="header-buttons">

          <button
            className="add-btn"
            onClick={() => navigate("/add-user")}
          >
            + Add User
          </button>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </div>

      <UserTable
        users={users}
        fetchUsers={fetchUsers}
      />

    </div>

  </div>
);
}

export default Dashboard;