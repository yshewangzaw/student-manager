import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "⊞" },
  { to: "/students", label: "Students", icon: "🎓" },
  { to: "/teachers", label: "Teachers", icon: "👨‍🏫" },
  { to: "/courses", label: "Courses", icon: "📚" },
  { to: "/grades", label: "Grades", icon: "📊" },
  { to: "/attendance", label: "Attendance", icon: "📅" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger toggle — only visible on small screens via CSS */}
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Backdrop closes the drawer when tapped outside it */}
      {isOpen && <div className="sidebar-backdrop" onClick={closeSidebar} />}

      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">SM</div>
          <div>
            <div className="sidebar-brand-name">EduManager</div>
            <div className="sidebar-brand-sub">Student Management</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">MENU</div>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "sidebar-link--active" : ""}`
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">A</div>
            <div>
              <div className="sidebar-username">Admin</div>
              <div className="sidebar-role">Administrator</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
