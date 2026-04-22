import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ChatbotPage from "./pages/ChatbotPage";
import SprintReportPage from "./pages/SprintReportPage";
import TicketExplainerPage from "./pages/TicketExplainerPage";
import OnboardingPage from "./pages/OnboardingPage";

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);

  useEffect(() => {
    const savedTheme = localStorage.getItem("deviq-theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme = savedTheme || (systemDark ? "dark" : "light");
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("deviq-theme", nextTheme);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    if (window.innerWidth <= 900) {
      setSidebarOpen(false);
    }
  };

  return (
    <Layout
      theme={theme}
      toggleTheme={toggleTheme}
      sidebarOpen={sidebarOpen}
      toggleSidebar={toggleSidebar}
      closeSidebar={closeSidebar}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatbotPage />} />
        <Route path="/sprint-report" element={<SprintReportPage />} />
        <Route path="/ticket-explainer" element={<TicketExplainerPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Routes>
    </Layout>
  );
}