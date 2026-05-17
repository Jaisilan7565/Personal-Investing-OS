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
  Edit2,
} from "lucide-react";
import { decisionService } from "../../services/decisionService";
import { useToast } from "../../hooks/useToast";
import ConfirmDialog from "../shared/ConfirmDialog";

export default function DecisionLog({ decisions, setDecisions }) {
  const [isAdding, setIsAdding] = useState(false);
  const [cooloffSeconds, setCooloffSeconds] = useState(29); // 00:29
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, asset }
  const toast = useToast();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
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

  const handleEditClick = (decision) => {
    setEditingId(decision._id || decision.id);
    setIsAdding(true);
    setCooloffSeconds(0); // Bypass friction timer during database edits!
    setFormData({
      date: decision.date,
      asset: decision.asset,
      horizon: decision.horizon || "Select duration",
      thesis: decision.rationale || "",
      invalidation:
        decision.metrics && decision.metrics.stop ? decision.metrics.stop : "",
      conviction: decision.conviction || 7,
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      asset: "",
      horizon: "Select duration",
      thesis: "",
      invalidation: "",
      conviction: 7,
    });
    setCooloffSeconds(29);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId && cooloffSeconds > 0) return; // Disable if cool-off active only for new entries
    setLoading(true);

    try {
      const payload = {
        date: formData.date,
        asset: formData.asset.toUpperCase(),
        horizon: formData.horizon,
        rationale: formData.thesis,
        conviction: formData.conviction,
        sentimentTag: "Discipline",
        metrics: {
          entry: "Market",
          stop: formData.invalidation,
        },
      };

      if (editingId) {
        const response = await decisionService.update(editingId, payload);
        setDecisions(
          decisions.map((d) =>
            (d._id || d.id) === editingId ? response.data : d,
          ),
        );
        toast.success("Decision thesis updated securely in Database!");
      } else {
        // Only set result to pending for newly created logs
        payload.result = "Pending";
        const response = await decisionService.create(payload);
        setDecisions([response.data, ...decisions]);
        toast.success("Thesis log committed securely to Database!");
      }

      setIsAdding(false);
      setEditingId(null);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        asset: "",
        horizon: "Select duration",
        thesis: "",
        invalidation: "",
        conviction: 7,
      });
      setCooloffSeconds(29);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to commit decision thesis.");
    } finally {
      setLoading(false);
    }
  };

  const updateResult = async (id, newResult) => {
    try {
      const response = await decisionService.updateOutcome(id, newResult);
      setDecisions(
        decisions.map((d) =>
          (d._id || d.id) === id ? { ...d, result: response.data.result } : d,
        ),
      );
      toast.success(`Outcome marked as ${newResult}!`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update decision outcome.");
    }
  };

  const requestDelete = (id, asset) => {
    setConfirmDelete({ id, asset });
  };

  const confirmDeleteDecision = async () => {
    const { id } = confirmDelete;
    setConfirmDelete(null);
    try {
      await decisionService.delete(id);
      setDecisions(decisions.filter((d) => (d._id || d.id) !== id));
      toast.success("Decision thesis deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete decision thesis.");
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full animate-fade-in">
      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title={`Delete "${confirmDelete?.asset}" Decision?`}
        message="This action cannot be undone. The logged thesis and all associated data will be permanently removed from your database."
        onConfirm={confirmDeleteDecision}
        onCancel={() => setConfirmDelete(null)}
      />
      {/* Header — same pattern as Daily Journal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-heading font-sora flex items-center gap-3">
            <FileText className="text-accent-indigo" size={28} /> Decision Log
          </h1>
          <p className="text-sm text-on-variant mt-1">
            Log trade rationale to build discipline and reduce impulsive capital
            allocation.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => {
              setIsAdding(true);
              setCooloffSeconds(29);
            }}
            className="btn-primary flex items-center gap-2 py-2.5 cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} /> New Decision
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
                {editingId
                  ? "Edit Decision Log"
                  : "Anti-Impulse Protocol Active"}
              </h2>
            </div>
            <div className="px-2 py-1 rounded border border-[#10B981]/30 bg-[#10B981]/5 text-[#10B981] font-mono font-semibold text-[10px] uppercase tracking-wider">
              Discipline Check
            </div>
          </div>

          {/* The Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Row 1: Date in FULL LENGTH 1 ROW */}
            <div className="flex flex-col gap-2 w-full">
              <label className="text-xs font-medium text-on-variant tracking-wide">
                Audit Date / Logged Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="input-field py-3 font-semibold w-full"
              />
            </div>

            {/* Row 2: Stock & Horizon (Grid 1x1 on mobile, 1x2 on tablet/desktop) */}
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
                    className="input-field font-medium rounded-[6px] pl-4 pr-10 py-3 appearance-none w-full cursor-pointer"
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

            {/* Row 3: Investment Thesis */}
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

            {/* Row 4: Risk Assessment */}
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
                <span>
                  {editingId
                    ? "Updating logged thesis context."
                    : "Cool-off active. Review entries to proceed."}
                </span>
              </div>
              <div className="flex items-center justify-end gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary py-2.5 text-xs px-6 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || (!editingId && cooloffSeconds > 0)}
                  className="btn-primary bg-surface-low text-on-surface border border-surface-border disabled:opacity-50 disabled:hover:bg-surface-low hover:bg-surface-high text-xs font-semibold px-6 py-2.5 min-w-[160px] cursor-pointer"
                >
                  {loading
                    ? "Saving..."
                    : !editingId && cooloffSeconds > 0
                      ? `Commit to Log ${formatTime(cooloffSeconds)}`
                      : editingId
                        ? "Save Updates"
                        : "Commit to Log"}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* The List of logged decisions - Mobile Responsive */
        <div className="glass-card overflow-hidden flex flex-col">
          {/* Desktop Table View - Hidden on mobile, shown on md+ screens */}
          <div className="hidden md:block overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th className="w-28 text-left">Date</th>
                  <th className="w-24 text-left">Asset</th>
                  <th className="text-left">Log / Thesis</th>
                  <th className="w-48 text-left">Invalidation Threshold</th>
                  <th className="text-right w-32">Outcome</th>
                  <th className="w-16"></th>
                </tr>
              </thead>
              <tbody>
                {decisions.map((item) => {
                  const currentId = item._id || item.id;
                  return (
                    <tr
                      key={currentId}
                      className="border-b border-surface-border/40 hover:bg-surface-low/10 transition-all duration-150"
                    >
                      <td className="font-mono text-[11px] text-on-variant whitespace-nowrap">
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
                        {(item.metrics && item.metrics.stop) || "N/A"}
                      </td>
                      <td className="text-right font-mono py-4">
                        {item.result === "Pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => updateResult(currentId, "Winner")}
                              className="p-1.5 hover:bg-discipline/10 hover:text-discipline text-on-variant rounded transition-all cursor-pointer"
                              title="Mark Winner"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                            <button
                              onClick={() => updateResult(currentId, "Loser")}
                              className="p-1.5 hover:bg-fear/10 hover:text-fear text-on-variant rounded transition-all cursor-pointer"
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
                              onClick={() => updateResult(currentId, "Pending")}
                              className="text-[10px] text-on-variant hover:text-on-surface underline font-sans cursor-pointer animate-fade-in"
                            >
                              Reset
                            </button>
                            <span
                              className={`text-xs font-bold tracking-widest ${
                                item.result === "Winner"
                                  ? "text-discipline"
                                  : "text-fear"
                              }`}
                            >
                              {item.result.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2 pr-2">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="text-on-variant hover:text-accent-indigo p-1.5 hover:bg-surface-low rounded transition-all cursor-pointer"
                            title="Edit Thesis"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => requestDelete(currentId, item.asset)}
                            className="text-on-variant hover:text-fear p-1.5 hover:bg-surface-low rounded transition-all cursor-pointer"
                            title="Delete Decision"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Feed View - Shown only on mobile screens (< 768px) */}
          <div className="block md:hidden flex flex-col divide-y divide-surface-border/40">
            {decisions.map((item) => {
              const currentId = item._id || item.id;
              return (
                <div key={currentId} className="p-5 flex flex-col gap-4">
                  {/* Top Line with Date & Symbol + Actions */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-on-variant whitespace-nowrap bg-surface-low px-2 py-0.5 rounded">
                        {item.date}
                      </span>
                      <span className="font-bold text-on-heading font-sora tracking-wide text-base">
                        {item.asset}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="text-on-variant hover:text-accent-indigo p-1.5 hover:bg-surface-low rounded cursor-pointer"
                        title="Edit Thesis"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => requestDelete(currentId, item.asset)}
                        className="text-on-variant hover:text-fear p-1.5 hover:bg-surface-low rounded cursor-pointer"
                        title="Delete Decision"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Thesis Context */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-on-variant uppercase tracking-wider">
                      Thesis / Rationale
                    </span>
                    <p className="text-on-surface text-sm leading-relaxed font-inter">
                      {item.rationale}
                    </p>
                  </div>

                  {/* Invalidation threshold */}
                  <div className="flex flex-col gap-1 bg-surface-low/30 border border-surface-border/40 rounded p-3">
                    <span className="text-[9px] font-bold text-on-variant uppercase tracking-wider">
                      Invalidation Threshold
                    </span>
                    <p className="text-on-heading text-xs font-mono font-medium">
                      {(item.metrics && item.metrics.stop) || "N/A"}
                    </p>
                  </div>

                  {/* Outcome Trigger */}
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[9px] font-bold text-on-variant uppercase tracking-wider">
                      Outcome Status
                    </span>
                    {item.result === "Pending" ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateResult(currentId, "Winner")}
                          className="bg-discipline/10 text-discipline hover:bg-discipline/20 px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 size={12} /> Winner
                        </button>
                        <button
                          onClick={() => updateResult(currentId, "Loser")}
                          className="bg-fear/10 text-fear hover:bg-fear/20 px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <XCircle size={12} /> Loser
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold tracking-widest ${
                            item.result === "Winner"
                              ? "text-discipline"
                              : "text-fear"
                          }`}
                        >
                          {item.result.toUpperCase()}
                        </span>
                        <button
                          onClick={() => updateResult(currentId, "Pending")}
                          className="text-[10px] text-on-variant hover:text-on-surface underline font-sans cursor-pointer ml-2"
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {decisions.length === 0 && (
            <div className="p-16 flex flex-col items-center justify-center text-center text-on-variant/40">
              <FileText size={36} className="mb-3 opacity-20" />
              <h3 className="text-on-heading text-sm font-semibold">
                No logged decisions yet
              </h3>
              <p className="text-xs mt-1 mb-6">
                Your systematic log is completely empty.
              </p>
              <button
                onClick={() => {
                  setIsAdding(true);
                  setCooloffSeconds(29);
                }}
                className="btn-secondary py-2 px-6 text-xs uppercase tracking-wide font-semibold cursor-pointer"
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
