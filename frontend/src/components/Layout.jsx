import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout({
  children,
  theme,
  toggleTheme,
  sidebarOpen,
  toggleSidebar,
  closeSidebar,
}) {
  return (
    <div className="app-shell">
      <Sidebar sidebarOpen={sidebarOpen} closeSidebar={closeSidebar} />
      <div className="app-main">
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          toggleSidebar={toggleSidebar}
        />
        <main className="page-content">{children}</main>
      </div>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={closeSidebar} />}
    </div>
  );
}