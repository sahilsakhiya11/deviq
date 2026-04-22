import { useEffect, useState } from "react";
import { Menu, Moon, Sun } from "lucide-react";
import { getHealth } from "../services/api";

export default function Header({ theme, toggleTheme, toggleSidebar }) {
  const [status, setStatus] = useState("Checking...");
  const [statusClass, setStatusClass] = useState("status-pill");

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const data = await getHealth();
        if (data?.status === "ok") {
          setStatus("Backend Healthy");
          setStatusClass("status-pill healthy");
        } else {
          setStatus("Backend Unavailable");
          setStatusClass("status-pill unhealthy");
        }
      } catch {
        setStatus("Backend Unavailable");
        setStatusClass("status-pill unhealthy");
      }
    };

    loadHealth();
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="icon-button mobile-only" onClick={toggleSidebar}>
          <Menu size={18} />
        </button>

        <div>
          <h2>DevIQ Dashboard</h2>
          <p>AI-powered engineering intelligence for delivery teams</p>
        </div>
      </div>

      <div className="topbar-actions">
        <div className="topbar-badge">BM25 + LLM</div>
        <div className={statusClass}>{status}</div>

        <button type="button" className="icon-button" onClick={toggleTheme}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}