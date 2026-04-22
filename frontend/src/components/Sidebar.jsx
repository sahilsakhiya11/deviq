import { Bot, LayoutDashboard, FileSearch, BookOpen } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/chat", label: "Chatbot", icon: Bot },
  { to: "/sprint-report", label: "Sprint Report", icon: LayoutDashboard },
  { to: "/ticket-explainer", label: "Ticket Explainer", icon: FileSearch },
  { to: "/onboarding", label: "Onboarding", icon: BookOpen },
];

export default function Sidebar({ sidebarOpen, closeSidebar }) {
  return (
    <aside className={sidebarOpen ? "sidebar open" : "sidebar"}>
      <div className="brand">
        <div className="brand-mark">D</div>
        <div>
          <h1>DevIQ</h1>
          <p>Engineering Intelligence</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}