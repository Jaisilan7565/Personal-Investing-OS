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
  Target,
} from "lucide-react";
import { strategyService } from "../services/strategyService";
import { decisionService } from "../services/decisionService";
import { journalService } from "../services/journalService";
import { authService } from "../services/authService";
import { useToast } from "../hooks/useToast";

export default function Layout({ children, theme, toggleTheme, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [seeding, setSeeding] = React.useState(false);
  const toast = useToast();

  const handleSeedData = async () => {
    setSeeding(true);
    toast.info("Generating and seeding mock data...");

    try {
      // 1. Mock Strategies (15 rows)
      const mockStrategies = [
        { name: "ORB (Opening Range Breakout)", riskProfile: "Moderate", entryRules: "Break above the high of the first 15-minute candle with above-average volume.", exitRules: "Target a 2R price expansion or trail stop at the EMA-9.", stopLossRules: "Candle close below the opening range low." },
        { name: "VWAP Mean Reversion", riskProfile: "Conservative", entryRules: "Price deviates > 2 ATR from daily VWAP with declining volume.", exitRules: "Reclaim of the daily VWAP price level.", stopLossRules: "Price holds close beyond the 3 ATR deviation band." },
        { name: "EMA Ribbon Trend Ride", riskProfile: "Conservative", entryRules: "EMA 9/21 bullish crossover confirmed on 1-hour time frame.", exitRules: "EMA 9 crosses back below EMA 21.", stopLossRules: "Candle close below the daily EMA 50." },
        { name: "Fibonacci Retracement Bounce", riskProfile: "Moderate", entryRules: "Limit order fill at the 61.8% retracement level after a strong impulse leg.", exitRules: "Retake of the recent local swing high.", stopLossRules: "Candle close below the 78.6% retracement boundary." },
        { name: "High-Tight Flag Breakout", riskProfile: "Aggressive", entryRules: "Breakout of a consolidated range after a >100% rally in under 4 weeks.", exitRules: "Take profit at 20% gain or key hourly reversal close.", stopLossRules: "Hourly candle close below the flag support." },
        { name: "RSI Momentum Divergence", riskProfile: "Moderate", entryRules: "Bullish divergence between price action and daily RSI in oversold territory.", exitRules: "RSI crosses above 70 level or local pivot resistance.", stopLossRules: "New price low established without RSI divergence." },
        { name: "Pre-Market Pivot Reclaim", riskProfile: "Aggressive", entryRules: "Reclaim and solid hold of the pre-market high level during regular session open.", exitRules: "1:2 risk-to-reward ratio or next major daily resistance level.", stopLossRules: "Candle close back inside the pre-market range." },
        { name: "Bollinger Band Squeeze", riskProfile: "Moderate", entryRules: "Band contraction to multi-week lows followed by a high volume breakout close.", exitRules: "Price touches the opposing outer Bollinger Band.", stopLossRules: "Breakout candle low is broken on high volume." },
        { name: "Volume Profile POC Bounce", riskProfile: "Conservative", entryRules: "Retest of the high-volume Point of Control (POC) node in an uptrend.", exitRules: "Value Area High breakout reclaim.", stopLossRules: "Close below the Value Area Low support boundary." },
        { name: "Inside Bar Breakout Pattern", riskProfile: "Moderate", entryRules: "Break of the mother bar high following a consecutive series of inside bars.", exitRules: "Target the average daily range (ADR) expansion.", stopLossRules: "Candle close below the inside bar low." },
        { name: "MACD Zero Line Reclaim", riskProfile: "Conservative", entryRules: "MACD line crosses above the zero line on a daily chart.", exitRules: "Bearish MACD crossover above the signal line.", stopLossRules: "Daily candle close below the swing low." },
        { name: "Golden Cross Trend Follow", riskProfile: "Conservative", entryRules: "Confirm of the 50-day simple moving average crossing above the 200-day SMA.", exitRules: "Trailing stop active below the 50-day SMA.", stopLossRules: "50 SMA crosses back below the 200 SMA." },
        { name: "Volume Spread Reversal", riskProfile: "Aggressive", entryRules: "Ultra-high volume candle with a very narrow spread near support, indicating supply absorption.", exitRules: "Test of the nearest daily supply zone.", stopLossRules: "Low of the ultra-high volume candle is breached." },
        { name: "Gap and Go Breakout", riskProfile: "Aggressive", entryRules: "Opening drive reclaiming pre-market high after a positive catalyst gap-up.", exitRules: "Exit at 3% profit target or parabolic breakdown.", stopLossRules: "Fill of the morning gap." },
        { name: "Wyckoff Phase D Spring Reclaim", riskProfile: "Aggressive", entryRules: "Reclaim of the trading range support after a temporary spring breakdown.", exitRules: "Reaching the trading range resistance ceiling.", stopLossRules: "New low established below the spring climax." }
      ];

      const seededStrategies = [];
      for (const strat of mockStrategies) {
        const response = await strategyService.create(strat);
        seededStrategies.push(response.data);
      }

      // Past 15 days dates generator
      const getPastDate = (daysAgo) => {
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        return d.toISOString().split("T")[0];
      };

      // 2. Mock Trade Logs (15 rows)
      const tickers = ["AAPL", "TSLA", "MSFT", "NVDA", "AMD", "COIN", "BTC", "ETH", "SOL", "AMZN", "NFLX", "META", "SPY", "QQQ", "GOOGL"];
      const rationales = [
        "Identified key supply absorption pattern at support. Linking Opening Range Breakout playbook rule to secure entries.",
        "Beautiful consolidation right at the daily Point of Control. Entering long position with tight invalidation.",
        "Daily chart golden cross confirmed. Ride the long-term trend with simple moving averages.",
        "RSI bullish divergence observed on the 4-hour chart. Sentiment extremely fearful, great contrarian setup.",
        "Flag pattern breakout reclaim confirmed on hourly candles. High momentum volume support.",
        "Opening drive gap-up hold. Reclaiming pre-market highs for a high-probability swing trade.",
        "Mean reversion setup. Deviation has exceeded 2.5 ATR from VWAP, preparing for a snap back to mean.",
        "Weekly Bollinger Band squeeze is breaking out. Volume is expanding massively.",
        "Buying at 61.8% Fibonacci retracement level after a solid macro uptrend leg.",
        "Multiple inside bars formed on daily chart. Entering breakout of the mother bar high.",
        "Bullish MACD cross above the zero line. Momentum is shifting to the upside.",
        "Retest of the major 200 SMA support level. Entering defensive position.",
        "High volume reclaim of the local pivot level. Position size is scaled conservatively.",
        "Buying the morning dip at major VWAP support. Risk is strictly defined.",
        "Wyckoff Spring pattern reclaim. Major structural bottom setup."
      ];

      const outcomes = ["Winner", "Loser", "Pending"];

      for (let i = 0; i < 15; i++) {
        const linkedStrategy = seededStrategies[i % seededStrategies.length];
        const result = outcomes[i % outcomes.length];
        const date = getPastDate(i + 1);

        const tradeData = {
          date,
          asset: tickers[i],
          horizon: i % 3 === 0 ? "Day Trade" : i % 3 === 1 ? "Swing Trade" : "Core Position",
          rationale: rationales[i],
          conviction: Math.floor(Math.random() * 5) + 6, // 6 to 10
          sentimentTag: linkedStrategy ? "Discipline" : "Undisciplined",
          metrics: {
            entry: "Market",
            stop: "Defined key pivot level low.",
          },
          strategy: linkedStrategy._id || linkedStrategy.id,
          result: "Pending", // Create as pending first
        };

        const decisionRes = await decisionService.create(tradeData);
        
        // If result is winner or loser, update the outcome
        if (result !== "Pending") {
          const decisionId = decisionRes.data._id || decisionRes.data.id;
          await decisionService.updateOutcome(decisionId, result);
        }
      }

      // 3. Mock Journals (15 rows)
      const thoughts = [
        "Market opened with extreme gap-up. Felt intense urge to chase, but stayed calm and waited for a proper retest. Discipline preserved.",
        "Took a small loss on TSLA early. Felt frustration coming up, but closed the terminal and did not revenge trade.",
        "Executed our ORB playbook rules to perfection today on NVDA. Felt absolutely focused and calm.",
        "A highly neutral session. Focus levels were slightly low due to lack of sleep, but refrained from forced setups.",
        "Market sentiment is in absolute greed today. FOMO was high among peers, but stayed grounded in my own trade plan.",
        "Felt a bit of anxiety after entering SPY long. Trusted the stop loss and let the market play out. Reclaimed calm.",
        "Felt slight greed chasing a breakout that lacked volume. Position was cut early for a tiny loss. Need to stay disciplined.",
        "Outstanding focus today. Followed all risk parameters perfectly. Zero cognitive bias traps active.",
        "A quiet consolidation day. Refused to trade the noise. Calm neutral state preserved.",
        "Felt fear of giving back gains on a winner, exited slightly early. Need to let the setup reach target next time.",
        "Excellent market read today. Fully aligned with high conviction setup. Felt focused and laser-focused.",
        "Felt some recency bias after yesterday's loss, but successfully checked it and executed a fresh setup.",
        "Calm and objective trading session. Market mood was highly fearful, but looked for quality value entries.",
        "Scale position down due to elevated market volatility. Stayed calm and accepted risk perfectly.",
        "A highly disciplined trade log day. Stream of thoughts was completely objective."
      ];

      const moods = ["fear", "neutral", "greed"];
      const tags = ["Discipline", "Calm", "Greed", "Fear"];
      const biases = [
        ["FOMO / Chasing"],
        ["Revenge Trading", "Loss Aversion"],
        ["Overconfidence"],
        ["Recency Bias"],
        ["Loss Aversion"],
        []
      ];

      for (let i = 0; i < 15; i++) {
        const date = getPastDate(i + 1);
        const journalData = {
          date,
          thoughts: thoughts[i],
          stressLevel: Math.floor(Math.random() * 5) + 3, // 3 to 7
          focusLevel: Math.floor(Math.random() * 5) + 6, // 6 to 10
          marketSentiment: moods[i % moods.length],
          tags: [tags[i % tags.length]],
          biasesChecked: biases[i % biases.length]
        };

        await journalService.create(journalData);
      }

      toast.success("Successfully seeded 15 strategies, 15 trade logs, and 15 daily journals!");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("Failed to seed mock data. Check server console.");
    } finally {
      setSeeding(false);
    }
  };

  const [clearing, setClearing] = React.useState(false);

  const handleClearData = async () => {
    if (!window.confirm("⚠️ DANGER: Are you absolutely sure you want to delete all of your Strategies, Trade Logs, and Journals? This action is permanent and cannot be undone!")) {
      return;
    }
    
    setClearing(true);
    toast.info("Purging all database records for this user...");

    try {
      await authService.clearAllData();
      toast.success("Successfully deleted all database records!");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("Failed to clear data. Check connection or backend console.");
    } finally {
      setClearing(false);
    }
  };
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamically compute activeTab from location path (e.g. "/journal" -> "journal")
  const activeTab = location.pathname.replace(/^\//, "") || "dashboard";

  // Scroll the main scrollable container to top when switching tabs/routes
  React.useEffect(() => {
    const mainContainer = document.querySelector("main");
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0 });
    }
  }, [location.pathname]);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "journal", label: "Daily Journal", icon: BookOpen },
    { id: "decisions", label: "Trade Log", icon: FileSignature },
    { id: "strategies", label: "Strategy Hub", icon: Target },
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

              {/* Dev Seeder Section */}
              <div className="border-t border-surface-border/40 pt-3.5 flex flex-col gap-2.5">
                <span className="text-[10px] text-[#6366F1] font-bold uppercase tracking-widest font-mono">
                  🔧 Developer Tools
                </span>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-variant font-medium">Seed 15 Mock Rows</span>
                  <button
                    onClick={handleSeedData}
                    disabled={seeding}
                    className="py-1.5 px-3 bg-[#6366F1]/10 hover:bg-[#6366F1]/20 border border-[#6366F1]/25 text-[#6366F1] font-bold rounded-lg text-[10px] uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    {seeding ? "Seeding..." : "Execute Seed"}
                  </button>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-surface-border/20 pt-2.5">
                  <span className="text-on-variant font-medium text-red-400 font-semibold">Danger: Clear All Data</span>
                  <button
                    onClick={handleClearData}
                    disabled={clearing}
                    className="py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-500 font-bold rounded-lg text-[10px] uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    {clearing ? "Clearing..." : "Purge All"}
                  </button>
                </div>
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