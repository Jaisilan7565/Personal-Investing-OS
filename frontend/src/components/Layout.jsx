import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FileSignature,
  Menu,
  X,
  GraduationCap,
  Eye,
  Sparkles,
  Settings,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";

export default function Layout({ children, theme, toggleTheme, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamically compute activeTab from location path (e.g. "/journal" -> "journal")
  const activeTab = location.pathname.replace(/^\//, "") || "dashboard";

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "journal", label: "Daily Journal", icon: BookOpen },
    { id: "decisions", label: "Decision Log", icon: FileSignature },
    {
      id: "learning",
      label: "Learning Tracker",
      icon: GraduationCap,
      disabled: true,
    },
    { id: "watchlist", label: "Watchlist", icon: Eye, disabled: true },
    { id: "aimentor", label: "AI Mentor", icon: Sparkles, disabled: true },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-surface text-on-surface overflow-hidden selection:bg-accent-indigo/30 transition-colors duration-200">
      {/* Mobile Header (Sticky Glass Action Bar) */}
      <header className="fixed top-0 left-0 right-0 z-30 md:hidden flex items-center justify-between px-6 py-4 bg-surface/85 backdrop-blur-md border-b border-surface-border w-full">
        <div className="flex flex-col">
          <span className="font-sora font-bold tracking-wide text-[15px] text-on-heading">
            Investing OS
          </span>
          <span className="text-[9px] text-on-variant font-medium -mt-0.5">
            Institutional Grade Analysis
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-on-variant hover:text-on-heading cursor-pointer"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-60 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-200 ease-in-out bg-surface md:bg-surface-lowest backdrop-blur-xl border-r border-surface-border flex flex-col h-[100dvh] md:h-auto`}
      >
        {/* Sidebar Brand Header */}
        <div className="flex flex-col px-6 pt-8 pb-6">
          <span className="font-sora font-bold text-[16px] tracking-[0.01em] text-on-heading">
            Investing OS
          </span>
          <span className="text-[10px] text-on-variant font-medium tracking-[0.02em]">
            Institutional Grade Analysis
          </span>
        </div>

        {/* AI Mentor Call-out Button */}
        <div className="px-3 pb-2">
          <button className="w-full py-2 px-4 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white text-[10px] font-bold rounded-[6px] flex items-center justify-center gap-2 tracking-[0.05em] uppercase shadow-lg shadow-indigo-500/10 border border-[#6366F1]/20 transition-all duration-200 cursor-pointer">
            <Sparkles size={12} />
            AI Mentor
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.disabled) {
              return (
                <div
                  key={item.id}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-on-variant/60 cursor-not-allowed"
                >
                  <Icon size={16} className="opacity-30" />
                  {item.label}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.id === "dashboard" ? "/" : `/${item.id}`);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between py-2.5 pr-3 pl-4 text-xs font-medium transition-all duration-150 relative group cursor-pointer ${
                  isActive
                    ? "text-on-heading bg-surface-low"
                    : "text-on-variant hover:text-on-heading hover:bg-surface-low"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={16}
                    className={`${isActive ? "text-accent-indigo" : "text-on-variant group-hover:text-on-heading"} transition-colors`}
                  />
                  {item.label}
                </div>

                {isActive && (
                  <div className="absolute right-0 top-1.5 bottom-1.5 w-[2px] bg-accent-indigo rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-surface-border bg-surface-lowest mt-auto flex flex-col">
          {/* User Profile Card */}
          <div className="px-4 py-3.5 border-b border-surface-border bg-surface-lowest/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center text-xs font-bold text-accent-indigo uppercase shrink-0">
              {(localStorage.getItem("investorOS_username") || "IN").slice(0, 2)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-on-heading truncate leading-tight">
                {localStorage.getItem("investorOS_username") || "Investor"}
              </span>
              <span className="text-[10px] text-on-variant truncate leading-none mt-0.5">
                Pro Account
              </span>
            </div>
          </div>

          <div className="p-3">
            <button
              onClick={() => {
                setSettingsOpen(true);
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-on-variant hover:text-on-heading hover:bg-surface-low rounded-[6px] transition-colors cursor-pointer"
            >
              <Settings size={16} />
              Settings Panel
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Wrapper */}
      <main className="flex-1 flex flex-col overflow-y-auto h-[calc(100dvh-58px)] mt-[58px] md:mt-0 md:h-[100dvh] relative">
        <div className="max-w-[1200px] w-full mx-auto p-8 md:p-10 flex-1 flex flex-col gap-8">
          {children}
        </div>
      </main>

      {/* Settings Modal Popover */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSettingsOpen(false)}
          ></div>

          {/* Modal Container */}
          <div className="glass-card w-full max-w-sm p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-accent-indigo" />
                <h3 className="font-sora font-bold text-sm text-on-heading">
                  System Settings
                </h3>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-on-variant hover:text-on-heading p-1 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile Detail Card */}
            <div className="flex items-center gap-4 bg-surface-low/50 border border-surface-border p-3.5 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center text-sm font-bold text-accent-indigo uppercase">
                {(localStorage.getItem("investorOS_username") || "IN").slice(0, 2)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-heading">
                  {localStorage.getItem("investorOS_username") || "Investor"}
                </span>
                <span className="text-[10px] text-on-variant font-medium mt-0.5">
                  Pro Trader Account
                </span>
              </div>
            </div>

            {/* Options List */}
            <div className="flex flex-col gap-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-variant font-medium">Appearance Theme</span>
                <button
                  onClick={toggleTheme}
                  className="btn-secondary py-1.5 px-3 flex items-center gap-2 text-xs cursor-pointer"
                >
                  {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-on-variant font-medium">Network Status</span>
                <span className="font-mono text-[10px] text-green-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  CONNECTED
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-on-variant font-medium">Engine Version</span>
                <span className="font-mono text-[10px] text-on-variant">v1.0.0</span>
              </div>
            </div>

            {/* Log Out Primary Call */}
            <div className="border-t border-surface-border pt-4 mt-1 flex flex-col gap-2">
              <button
                onClick={() => {
                  setSettingsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-500 font-bold rounded-[8px] text-xs transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                Terminate Session (Log Out)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
