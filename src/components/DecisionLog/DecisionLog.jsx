import React, { useState, useEffect } from "react";
import {
  Plus,
  FileText,
  ArrowDownRight,
  ArrowUpRight,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Clock,
  ChevronDown,
  Trash2,
} from "lucide-react";

export default function DecisionLog({ decisions, setDecisions }) {
  const [isAdding, setIsAdding] = useState(false);
  const [cooloffSeconds, setCooloffSeconds] = useState(179); // 02:59
  const [formData, setFormData] = useState({
    asset: "",
    horizon: "Select duration",
    thesis: "",
    invalidation: "",
    conviction: 7,
  });

  // Start timer when modal/adding opens
  useEffect(() => {
    let interval = null;
    if (isAdding && cooloffSeconds > 0) {
      interval = setInterval(() => {
        setCooloffSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAdding, cooloffSeconds]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cooloffSeconds > 0) return; // Disable if cool-off active

    const newDecision = {
      id: "d" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      asset: formData.asset.toUpperCase(),
      type: "BUY", // Default to buy for basic schema
      rationale: formData.thesis,
      conviction: formData.conviction,
      result: "Pending",
      sentimentTag: "Discipline",
      metrics: {
        entry: "Market",
        stop: formData.invalidation.slice(0, 25) + "...",
      },
    };
    setDecisions([newDecision, ...decisions]);
    setIsAdding(false);
    setFormData({
      asset: "",
      horizon: "Select duration",
      thesis: "",
      invalidation: "",
      conviction: 7,
    });
    setCooloffSeconds(179);
  };

  const updateResult = (id, newResult) => {
    setDecisions(
      decisions.map((d) => (d.id === id ? { ...d, result: newResult } : d)),
    );
  };

  const deleteDecision = (id) => {
    setDecisions(decisions.filter((d) => d.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 h-full animate-fade-in">
      {/* Top Title & Header Area matching thumbnail */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-on-heading font-sora">
            Decision Log
          </h1>
          <p className="text-[13px] leading-relaxed text-on-variant max-w-2xl">
            Document the rationale, risks, and emotional state prior to
            execution. This friction point is designed to reduce impulsive
            capital allocation.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => {
              setIsAdding(true);
              setCooloffSeconds(179);
            }}
            className="btn-primary flex items-center gap-2 py-2.5"
          >
            <Plus size={16} /> New Entry
          </button>
        )}
      </div>

      {/* Form UI - High Fidelity Replication */}
      {isAdding ? (
        <div className="glass-card p-6 md:p-8 animate-slide-up flex flex-col gap-6">
          {/* Card Title Bar */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-on-heading">
              <ShieldAlert size={18} className="text-[#3b82f6]" />
              <h2 className="text-sm font-semibold tracking-wide">
                Anti-Impulse Protocol Active
              </h2>
            </div>
            <div className="px-2 py-1 rounded border border-[#10B981]/30 bg-[#10B981]/5 text-[#10B981] font-mono font-semibold text-[10px] uppercase tracking-wider">
              Discipline Check
            </div>
          </div>

          {/* The Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Row 1: Stock & Horizon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-on-variant tracking-wide">
                  Stock Symbol / Asset
                </label>
                <input
                  type="text"
                  placeholder="E.G. AAPL"
                  required
                  value={formData.asset}
                  onChange={(e) =>
                    setFormData({ ...formData, asset: e.target.value })
                  }
                  className="input-white font-bold font-mono uppercase py-3 placeholder:font-sans"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-on-variant tracking-wide">
                  Expected Time Horizon
                </label>
                <div className="relative">
                  <select
                    value={formData.horizon}
                    onChange={(e) =>
                      setFormData({ ...formData, horizon: e.target.value })
                    }
                    className="input-field font-medium rounded-[6px] pl-4 pr-10 py-3 appearance-none w-full"
                  >
                    <option disabled>Select duration</option>
                    <option value="Day Trade">Day Trade (&lt; 24h)</option>
                    <option value="Swing Trade">
                      Swing Trade (Days/Weeks)
                    </option>
                    <option value="Core Position">
                      Core Position (Months+)
                    </option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-variant pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Investment Thesis */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-variant tracking-wide">
                Investment Thesis
              </label>
              <p className="text-[11px] text-on-variant italic mb-1">
                Articulate the core reason for this trade. If you cannot explain
                it simply, you don't understand it well enough.
              </p>
              <textarea
                required
                rows={4}
                placeholder="Why this asset, and why now?"
                value={formData.thesis}
                onChange={(e) =>
                  setFormData({ ...formData, thesis: e.target.value })
                }
                className="input-field resize-none leading-relaxed w-full px-4 py-3"
              />
            </div>

            {/* Row 3: Risk Assessment */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-variant tracking-wide">
                Risk Assessment & Invalidation Point
              </label>
              <p className="text-[11px] text-on-variant italic mb-1">
                What data points or price action will prove this thesis wrong?
                Define your exit before entry.
              </p>
              <textarea
                required
                rows={3}
                placeholder="I will cut this position if..."
                value={formData.invalidation}
                onChange={(e) =>
                  setFormData({ ...formData, invalidation: e.target.value })
                }
                className="input-field border-red-500/20 dark:border-red-900/40 resize-none leading-relaxed w-full px-4 py-3"
              />
            </div>

            {/* Bottom Bar with Timer and Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center border-t border-surface-border pt-5 mt-2 gap-4">
              <div className="flex items-center gap-2.5 text-on-variant text-xs font-medium">
                <Clock size={14} className="animate-pulse" />
                <span>Cool-off active. Review entries to proceed.</span>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="btn-secondary py-2 text-xs px-6"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cooloffSeconds > 0}
                  className="btn-primary bg-surface-low text-on-surface border border-surface-border disabled:opacity-50 disabled:hover:bg-surface-low hover:bg-surface-high text-xs font-semibold px-6 py-2.5 min-w-[160px]"
                >
                  {cooloffSeconds > 0
                    ? `Commit to Log ${formatTime(cooloffSeconds)}`
                    : "Commit to Log"}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* The List of logged decisions */
        <div className="glass-card overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-24">Date</th>
                  <th className="w-24">Asset</th>
                  <th>Log / Thesis</th>
                  <th className="w-48">Invalidation Threshold</th>
                  <th className="text-right w-32">Outcome</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {decisions.map((item) => {
                  return (
                    <tr key={item.id} className="border-b border-surface-border/40">
                      <td className="font-mono text-[11px] text-on-variant">
                        {item.date}
                      </td>
                      <td className="font-bold text-on-heading font-sora tracking-wide text-sm py-4">
                        {item.asset}
                      </td>
                      <td>
                        <p className="text-on-surface text-[13px] leading-relaxed pr-4 font-inter">
                          {item.rationale}
                        </p>
                      </td>
                      <td className="text-on-variant text-xs pr-4">
                        {item.metrics.stop || "N/A"}
                      </td>
                      <td className="text-right font-mono py-4">
                        {item.result === "Pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => updateResult(item.id, "Winner")}
                              className="p-1.5 hover:bg-discipline/10 hover:text-discipline text-on-variant rounded transition-all"
                              title="Mark Winner"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                            <button
                              onClick={() => updateResult(item.id, "Loser")}
                              className="p-1.5 hover:bg-fear/10 hover:text-fear text-on-variant rounded transition-all"
                              title="Mark Loser"
                            >
                              <XCircle size={14} />
                            </button>
                            <span className="text-[10px] font-medium text-on-variant uppercase tracking-wider">
                              Pending
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => updateResult(item.id, "Pending")}
                              className="text-[10px] text-on-variant hover:text-on-surface underline font-sans"
                            >
                              Reset
                            </button>
                            <span
                              className={`text-xs font-bold tracking-widest ${item.result === "Winner" ? "text-discipline" : "text-fear"}`}
                            >
                              {item.result.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => deleteDecision(item.id)}
                          className="text-on-variant hover:text-fear p-1 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {decisions.length === 0 && (
            <div className="p-16 flex flex-col items-center justify-center text-center text-on-variant/40">
              <FileText size={36} className="mb-3 opacity-20" />
              <h3 className="text-on-heading text-sm font-semibold">
                No locked decisions yet
              </h3>
              <p className="text-xs mt-1 mb-6">
                Your systematic log is completely empty.
              </p>
              <button
                onClick={() => setIsAdding(true)}
                className="btn-secondary py-2 px-6 text-xs uppercase tracking-wide font-semibold"
              >
                Log Initial Setup
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
