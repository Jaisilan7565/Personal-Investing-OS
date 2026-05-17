import React from "react";
import {
  Sun,
  TrendingUp,
  Eye,
  ArrowUpRight,
  ChevronRight,
  Plus,
  FilePlus,
  ShieldCheck,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function Dashboard({
  decisions,
  journals,
  metricsData,
  setActiveTab,
  theme,
}) {
  const isDark = theme === "dark";
  const gridStroke = isDark ? "rgba(255,255,255,0.02)" : "rgba(15, 23, 42, 0.05)";
  const axisStroke = isDark ? "rgba(255,255,255,0.1)" : "rgba(15, 23, 42, 0.15)";
  const pieStroke = isDark ? "rgba(13, 17, 23, 0.8)" : "#ffffff";
  const gaugeTrack = isDark ? "#161b22" : "#f1f5f9";
  // Calculate actual discipline score
  const totalDecisions = decisions.length;
  const disciplineEntries = decisions.filter(
    (d) => d.sentimentTag === "Discipline",
  ).length;
  const disciplineScore =
    totalDecisions > 0
      ? Math.round((disciplineEntries / totalDecisions) * 100)
      : 85;

  // Pie data representing Emotion Frequency
  const tagsCount = decisions.reduce((acc, curr) => {
    const tag = curr.sentimentTag || "Discipline";
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});

  const COLORS = {
    Discipline: "#10B981",
    Fear: "#EF4444",
    Greed: "#F59E0B",
    Calm: "#6366F1",
  };

  const pieData =
    Object.keys(tagsCount).length > 0
      ? Object.keys(tagsCount).map((key) => ({
          name: key,
          value: tagsCount[key],
          color: COLORS[key] || "#6366F1",
        }))
      : [
          { name: "Discipline", value: 85, color: "#10B981" },
          { name: "Greed", value: 15, color: "#F59E0B" },
        ];

  // Format recent decisions for the Thesis Log table
  const recentDecisions = decisions.slice(0, 3);

  // Compute a dynamic Mon-Fri discipline trend from real data or provide elegant default trend
  const dynamicMetricsData = (() => {
    if (totalDecisions === 0) {
      return [
        { day: 'Mon', disciplined: 85, greed: 10, fear: 5 },
        { day: 'Tue', disciplined: 75, greed: 15, fear: 10 },
        { day: 'Wed', disciplined: 90, greed: 5, fear: 5 },
        { day: 'Thu', disciplined: 88, greed: 7, fear: 5 },
        { day: 'Fri', disciplined: 92, greed: 4, fear: 4 },
      ];
    }
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    return days.map((day, idx) => {
      const sliceEnd = Math.max(1, Math.round((decisions.length / 5) * (idx + 1)));
      const subset = decisions.slice(0, sliceEnd);
      const disc = subset.filter(d => d.sentimentTag === "Discipline").length;
      const score = Math.round((disc / subset.length) * 100);
      return {
        day,
        disciplined: score,
        greed: 100 - score > 0 ? Math.round((100 - score) / 2) : 5,
        fear: 100 - score > 0 ? Math.round((100 - score) / 2) : 5,
      };
    });
  })();

  return (
    <div className="flex flex-col gap-6 animate-fade-in selection:bg-accent-indigo/30">
      {/* Grid Layout: 3 columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* ==================== LEFT COLUMN (Grid Span 2) ==================== */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* 1. Morning Briefing Card */}
          <div className="glass-card p-6 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#6366F1]/[0.02] rounded-full blur-3xl"></div>
            <div className="flex items-center gap-2 text-on-variant text-[10px] font-mono font-bold tracking-[0.1em] uppercase">
              <Sun size={12} className="text-amber-400" />
              Morning Briefing
            </div>
            <h2 className="text-2xl font-bold text-on-heading mt-1 font-sora">
              Maintain Emotional Distance.
            </h2>
            <p className="text-xs leading-relaxed text-on-variant mt-1 max-w-xl">
              Volatility is elevated today. Stick to your predefined thesis for
              AAPL and MSFT. Do not let short-term noise dictate long-term
              strategy. Your discipline score is trending upwards.
            </p>
          </div>

          {/* 2. Middle Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Emotion Frequency (Donut Chart) */}
            <div className="glass-card p-5 flex flex-col h-[260px]">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-semibold text-on-heading tracking-wide font-sora">
                  Emotion Frequency
                </h3>
                <HelpCircle size={12} className="text-on-variant" />
              </div>

              <div className="flex-1 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={55}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      stroke={pieStroke}
                      strokeWidth={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-[10px] text-on-variant font-mono uppercase tracking-widest pointer-events-none">
                  Aggregating...
                </div>
              </div>
            </div>

            {/* Discipline Trend (Area Chart) */}
            <div className="glass-card p-5 flex flex-col h-[260px]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-semibold text-on-heading tracking-wide font-sora">
                  Discipline Trend
                </h3>
                <TrendingUp size={12} className="text-on-variant" />
              </div>

              <div className="flex-1 relative w-full h-full -ml-2 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dynamicMetricsData}
                    margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="dashColor"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10B981"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10B981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={gridStroke}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      stroke={axisStroke}
                      tick={{ fontSize: 9, fill: isDark ? '#8b949e' : '#64748b' }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke={axisStroke}
                      tick={{ fontSize: 9, fill: isDark ? '#8b949e' : '#64748b' }}
                      tickLine={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="disciplined"
                      stroke="#10B981"
                      strokeWidth={1.5}
                      fillOpacity={1}
                      fill="url(#dashColor)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] text-on-variant font-mono uppercase tracking-widest">
                  Computing...
                </div>
              </div>
            </div>
          </div>

          {/* 3. Recent Thesis Logs (High Fidelity Table) */}
          <div className="glass-card flex flex-col">
            <div className="flex justify-between items-center px-5 py-4 border-b border-surface-border">
              <h3 className="text-xs font-semibold text-on-heading font-sora tracking-wide">
                Recent Thesis Logs
              </h3>
              <button
                onClick={() => setActiveTab("decisions")}
                className="text-[10px] font-bold text-accent-indigo hover:underline tracking-wider"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-surface-border text-[9px] font-mono uppercase tracking-widest">
                    <th className="py-3 px-5 font-medium text-on-variant">Ticker</th>
                    <th className="py-3 px-5 font-medium text-on-variant">Type</th>
                    <th className="py-3 px-5 font-medium text-on-variant">Summary</th>
                    <th className="py-3 px-5 font-medium text-right text-on-variant">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDecisions.length > 0 ? (
                    recentDecisions.map((dec) => (
                      <tr
                        key={dec.id}
                        className="border-b border-surface-border last:border-0 text-[11px] text-on-surface"
                      >
                        <td className="py-3 px-5 font-bold font-sora text-on-heading tracking-wide">
                          {dec.asset}
                        </td>
                        <td className="py-3 px-5">
                          <span
                            className={`px-2 py-0.5 text-[9px] rounded-[3px] font-medium ${
                              dec.sentimentTag === "Discipline"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                                : dec.sentimentTag === "Greed"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/10"
                                  : "bg-[#6366F1]/10 text-[#8b8dfc] border border-[#6366F1]/10"
                            }`}
                          >
                            {dec.sentimentTag}
                          </span>
                        </td>
                        <td className="py-3 px-5 font-inter text-on-variant truncate max-w-xs">
                          {dec.rationale}
                        </td>
                        <td className="py-3 px-5 text-right font-mono text-on-variant">
                          {dec.date}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-12 text-center text-on-variant text-xs italic"
                      >
                        No locked thesis logs available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN (Grid Span 1) ==================== */}
        <div className="flex flex-col gap-5">
          {/* 1. Discipline Score Gauge (Top Right) */}
          <div className="glass-card p-6 flex flex-col items-center text-center h-[212px]">
            <div className="w-full text-left mb-3">
              <h3 className="text-xs font-semibold text-on-heading font-sora tracking-wide">
                Discipline Score
              </h3>
            </div>

            <div className="relative w-24 h-24 flex items-center justify-center flex-1 mt-1">
              {/* Simple SVG Circular Progress Gauge matching thumbnail */}
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                {/* Outer Background track */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke={gaugeTrack}
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Active Green Indicator */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#10B981"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={264}
                  strokeDashoffset={264 - 264 * (disciplineScore / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center leading-none">
                <span className="text-2xl font-bold text-on-heading font-sora">
                  {disciplineScore}
                </span>
                <span className="text-[8px] text-discipline uppercase tracking-widest font-bold mt-0.5">
                  {disciplineScore > 80 ? "Excellent" : "Neutral"}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 bg-emerald-500/5 px-3 py-0.5 border border-emerald-500/10 rounded-full text-[10px] text-emerald-400 font-bold">
              <ArrowUpRight size={10} />
              +3 pts this week
            </div>
          </div>

          {/* 2. Quick Actions (Middle Right) */}
          <div className="glass-card p-5 flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-on-heading font-sora tracking-wide mb-1">
              Quick Actions
            </h3>

            <button
              onClick={() => setActiveTab("journal")}
              className="w-full py-2.5 rounded-[6px] bg-[#6366F1] hover:bg-[#6366F1]/90 text-white text-[11px] font-bold flex items-center justify-center gap-2 tracking-wide transition-all border border-[#6366F1]/20"
            >
              <Plus size={14} /> New Journal Entry
            </button>

            <button
              onClick={() => setActiveTab("decisions")}
              className="w-full py-2.5 rounded-[6px] border border-surface-border hover:bg-surface-high text-on-surface text-[11px] font-bold flex items-center justify-center gap-2 tracking-wide transition-all"
            >
              <FilePlus size={14} className="text-on-variant" /> New Decision
              Thesis
            </button>
          </div>

          {/* 3. Market Context (Bottom Right) */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-on-heading font-sora tracking-wide">
              Market Context
            </h3>

            <div className="flex flex-col gap-3">
              {/* Key Row: VIX */}
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-on-variant uppercase font-mono tracking-wider">
                  VIX
                </span>
                <div className="flex items-center gap-1.5 text-red-400 font-bold font-mono">
                  18.45 <span className="text-[9px]">↑</span>
                </div>
              </div>

              {/* Key Row: SPY Trend */}
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-on-variant uppercase font-mono tracking-wider">
                  SPY Trend
                </span>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  Bullish <TrendingUp size={12} />
                </div>
              </div>

              {/* Key Row: Fear/Greed */}
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-on-variant uppercase font-mono tracking-wider">
                  Macro Fear/Greed
                </span>
                <div className="font-bold text-amber-400">Greed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
