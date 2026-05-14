import React from "react";
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

export default function Layout({ children, activeTab, setActiveTab, theme, toggleTheme, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

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
    <div className="min-h-screen flex flex-col md:flex-row bg-surface text-on-surface overflow-hidden selection:bg-accent-indigo/30 transition-colors duration-200">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-surface-lowest border-b border-surface-border z-20">
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
          className="p-2 text-on-variant hover:text-on-heading"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-60 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-200 ease-in-out bg-surface-lowest border-r border-surface-border flex flex-col h-screen md:h-auto`}
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

        {/* AI Mentor Call-out Button (from Dashboard Reference) */}
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
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between py-2.5 pr-3 pl-4 text-xs font-medium transition-all duration-150 relative group ${
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

                {/* Right Indicator matching high-fi */}
                {isActive && (
                  <div className="absolute right-0 top-1.5 bottom-1.5 w-[2px] bg-accent-indigo rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-surface-border bg-surface-lowest mt-auto">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-on-variant hover:text-on-heading transition-colors">
            <Settings size={16} />
            Settings
          </button>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-on-variant hover:text-on-heading transition-colors"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors border-t border-surface-border mt-1.5 pt-3"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Wrapper */}
      <main className="flex-1 flex flex-col overflow-y-auto h-[calc(100vh-60px)] md:h-screen relative">
        <div className="max-w-[1200px] w-full mx-auto p-8 md:p-10 flex-1 flex flex-col gap-8">
          {children}
        </div>
      </main>
    </div>
  );
}
