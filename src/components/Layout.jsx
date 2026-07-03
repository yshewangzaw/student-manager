import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ToastNotification from "./ToastNotification";
import { Outlet } from "react-router-dom";
import "../styles/Layout.css";

export default function Layout() {
  // Initialize from localStorage (falls back to "light")
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  // Persist theme choice
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="layout" data-theme={theme}>
      <Sidebar />
      <div className="layout-body">
        <main className="layout-content">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <Outlet />
        </main>
      </div>
      <ToastNotification />
    </div>
  );
}
