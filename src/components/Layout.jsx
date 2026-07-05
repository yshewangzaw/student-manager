import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import ToastNotification from "./ToastNotification";

import "../styles/Layout.css";

export default function Layout() {
  const navigate = useNavigate();

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  // Save theme
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="layout" data-theme={theme}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="main-content">
        {/* Top bar */}
        <div className="top-bar">
          <div className="left">{/* optional title */}</div>

          <div className="right">
            {/* Theme toggle */}
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {/* Logout */}
            <button className="logout-btn btn-primary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Page content */}
        <Outlet />
      </div>

      <ToastNotification />
    </div>
  );
}
