import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AddUser from "./pages/AddUser";

function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Login />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/add-user" element={
        <ProtectedRoute>
          <AddUser />
        </ProtectedRoute>
      } />

    </Routes>
  );
}

export default AppRoutes;