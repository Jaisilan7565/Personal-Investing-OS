import React, { useState, useEffect } from "react";

import {
  Plus,
  FileText,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Clock,
  ChevronDown,
  Trash2,
  Edit2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { decisionService } from "../../services/decisionService";

import { useToast } from "../../hooks/useToast";

import ConfirmDialog from "../shared/ConfirmDialog";

export default function DecisionLog({
  decisions: globalDecisions,
  setDecisions: setGlobalDecisions,
  strategies = [],
}) {
  const [isAdding, setIsAdding] = useState(false);

  const [cooloffSeconds, setCooloffSeconds] = useState(29); // 00:29

  const [loading, setLoading] = useState(false);

  const [listLoading, setListLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(null); // { id, asset }

  const [selectedViewStrategy, setSelectedViewStrategy] = useState(null);

  const toast = useToast();

  // Search, Filters & Pagination States

  const [searchTerm, setSearchTerm] = useState("");

  const [filterStrategy, setFilterStrategy] = useState("all");

  const [filterResult, setFilterResult] = useState("all");

  const [filterDiscipline, setFilterDiscipline] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Local paginated records

  const [localDecisions, setLocalDecisions] = useState([]);

  const [totalItems, setTotalItems] = useState(0);

  const [totalPages, setTotalPages] = useState(1);

  const fetchDecisions = async () => {
    setListLoading(true);
    try {
      const response = await decisionService.getAll(currentPage, itemsPerPage, {
        search: searchTerm,
        strategy: filterStrategy,
        result: filterResult,
        discipline: filterDiscipline,
      });
      setLocalDecisions(response.data || []);
      if (response.pagination) {
        setTotalItems(response.pagination.totalResults || 0);
        setTotalPages(response.pagination.totalPages || 1);
      } else {
        setTotalItems((response.data || []).length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    filterStrategy,
    filterResult,
    filterDiscipline,
    itemsPerPage,
  ]);

  // Fetch data when active page or itemsPerPage changes, or filters reset
  useEffect(() => {
    fetchDecisions();
    const mainContainer = document.querySelector("main");
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    filterStrategy,
    filterResult,
    filterDiscipline,
  ]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    asset: "",
    horizon: "Select duration",
    thesis: "",
    invalidation: "",
    conviction: 7,
    strategy: "",
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
      strategy: decision.strategy
        ? decision.strategy._id || decision.strategy
        : "",
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

      strategy: "",
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

        sentimentTag: formData.strategy ? "Discipline" : "Undisciplined",

        metrics: {
          entry: "Market",

          stop: formData.invalidation,
        },

        strategy: formData.strategy || null,
      };

      if (editingId) {
        const response = await decisionService.update(editingId, payload);

        // Find full strategy object if linked

        const updatedDecision = response.data;

        if (
          updatedDecision.strategy &&
          typeof updatedDecision.strategy === "string"
        ) {
          updatedDecision.strategy =
            strategies.find(
              (s) => (s._id || s.id) === updatedDecision.strategy,
            ) || null;
        }

        setGlobalDecisions(
          globalDecisions.map((d) =>
            (d._id || d.id) === editingId ? updatedDecision : d,
          ),
        );

        toast.success("Trade thesis updated securely in Database!");
      } else {
        payload.result = "Pending";

        const response = await decisionService.create(payload);

        // Find full strategy object if linked

        const newDecision = response.data;

        if (newDecision.strategy && typeof newDecision.strategy === "string") {
          newDecision.strategy =
            strategies.find((s) => (s._id || s.id) === newDecision.strategy) ||
            null;
        }

        setGlobalDecisions([newDecision, ...globalDecisions]);

        toast.success("Trade thesis committed securely to Database!");
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

        strategy: "",
      });

      setCooloffSeconds(29);

      if (currentPage === 1) {
        fetchDecisions();
      } else {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error(err);

      toast.error(err.message || "Failed to commit trade thesis.");
    } finally {
      setLoading(false);
    }
  };

  const updateResult = async (id, newResult) => {
    try {
      const response = await decisionService.updateOutcome(id, newResult);

      setGlobalDecisions(
        globalDecisions.map((d) =>
          (d._id || d.id) === id ? { ...d, result: response.data.result } : d,
        ),
      );

      toast.success(`Outcome marked as ${newResult}!`);

      fetchDecisions();
    } catch (err) {
      console.error(err);

      toast.error(err.message || "Failed to update trade outcome.");
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

      setGlobalDecisions(globalDecisions.filter((d) => (d._id || d.id) !== id));

      toast.success("Trade thesis deleted successfully!");

      fetchDecisions();
    } catch (err) {
      console.error(err);

      toast.error(err.message || "Failed to delete trade thesis.");
    }
  };

  // Calculate pagination boundaries

  const startIndex = (currentPage - 1) * itemsPerPage;

  const endIndex = Math.min(totalItems, startIndex + localDecisions.length);

  return (
    <div className="flex flex-col gap-6 h-full animate-fade-in pb-10">
      {/* Delete confirmation dialog */}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title={`Delete "${confirmDelete?.asset}" Trade Log?`}
        message="This action cannot be undone. The logged thesis and all associated data will be permanently removed from your database."
        onConfirm={confirmDeleteDecision}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Header — same pattern as Daily Journal */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-heading font-sora flex items-center gap-3">
            <FileText className="text-accent-indigo" size={28} /> Trade Log
          </h1>

          <p className="text-sm text-on-variant mt-1">
            Remove human emotion. Use pre-trade cognitive friction to commit
            clear entry, exit, and invalidation rules.
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
            <Plus size={16} /> New Trade Log
          </button>
        )}
      </div>

      {/* Form UI / List View Wrapper */}

      {isAdding ? (
        <div className="glass-card p-6 md:p-8 animate-slide-up flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-on-heading">
              <ShieldAlert size={18} className="text-[#3b82f6]" />

              <h2 className="text-sm font-semibold tracking-wide">
                {editingId ? "Edit Trade Log" : "Anti-Impulse Protocol Active"}
              </h2>
            </div>

            <div className="px-2 py-1 rounded border border-[#10B981]/30 bg-[#10B981]/5 text-[#10B981] font-mono font-semibold text-[10px] uppercase tracking-wider">
              Discipline Check
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-on-variant tracking-wide">
                  Link Strategy (Optional)
                </label>

                <div className="relative">
                  <select
                    value={formData.strategy}
                    onChange={(e) =>
                      setFormData({ ...formData, strategy: e.target.value })
                    }
                    className="input-field font-medium rounded-[6px] pl-4 pr-10 py-3 appearance-none w-full cursor-pointer"
                  >
                    <option value="">No Strategy (Discretionary Trade)</option>

                    {strategies.map((strat) => (
                      <option
                        key={strat._id || strat.id}
                        value={strat._id || strat.id}
                      >
                        {strat.name} ({strat.riskProfile})
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={14}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-variant pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Strategy Rules Preview */}

            {formData.strategy && (
              <div className="bg-surface-low border border-surface-border p-4 rounded-[6px] text-xs space-y-2 animate-fade-in">
                <h4 className="font-semibold text-on-heading flex items-center gap-1.5 border-b border-surface-border/40 pb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo"></span>
                  Rules for:{" "}
                  {
                    strategies.find(
                      (s) => (s._id || s.id) === formData.strategy,
                    )?.name
                  }
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-on-variant">
                  <div>
                    <span className="font-semibold text-on-surface block mb-1">
                      🟢 Entry Setup Trigger:
                    </span>

                    <p className="italic">
                      {
                        strategies.find(
                          (s) => (s._id || s.id) === formData.strategy,
                        )?.entryRules
                      }
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-on-surface block mb-1">
                      🎯 Take Profit exit:
                    </span>

                    <p className="italic">
                      {
                        strategies.find(
                          (s) => (s._id || s.id) === formData.strategy,
                        )?.exitRules
                      }
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-on-surface block mb-1">
                      🛑 Invalidation Stop:
                    </span>

                    <p className="italic">
                      {
                        strategies.find(
                          (s) => (s._id || s.id) === formData.strategy,
                        )?.stopLossRules
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

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
        <div className="glass-card overflow-hidden flex flex-col animate-fade-in">
          {/* Header Action inside List */}

          <div className="p-4 border-b border-surface-border/40 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-low/30">
            <span className="text-xs font-semibold text-on-heading tracking-wider uppercase font-mono">
              Active Logged Trades ({totalItems} / {globalDecisions.length})
            </span>

            {/* Quick search and select filters */}

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}

              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-on-variant"
                  size={13}
                />

                <input
                  type="text"
                  placeholder="Search asset or thesis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-56 bg-surface-low border border-surface-border/60 hover:border-surface-border focus:border-accent-indigo text-xs text-on-surface rounded-lg pl-9 pr-4 py-1.5 focus:outline-none transition-all placeholder:text-on-variant"
                />
              </div>

              {/* Strategy Selector */}

              <select
                value={filterStrategy}
                onChange={(e) => setFilterStrategy(e.target.value)}
                className="bg-surface-low border border-surface-border/60 hover:border-surface-border focus:border-accent-indigo text-xs text-on-surface rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer transition-all font-mono"
              >
                <option value="all">All Strategies</option>

                {strategies.map((strat) => (
                  <option
                    key={strat._id || strat.id}
                    value={strat._id || strat.id}
                  >
                    🛡️ {strat.name}
                  </option>
                ))}
              </select>

              {/* Outcome Selector */}

              <select
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value)}
                className="bg-surface-low border border-surface-border/60 hover:border-surface-border focus:border-accent-indigo text-xs text-on-surface rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer transition-all font-mono"
              >
                <option value="all">All Outcomes</option>

                <option value="Pending">Pending</option>

                <option value="Winner">Winner</option>

                <option value="Loser">Loser</option>
              </select>

              {/* Discipline Selector */}

              <select
                value={filterDiscipline}
                onChange={(e) => setFilterDiscipline(e.target.value)}
                className="bg-surface-low border border-surface-border/60 hover:border-surface-border focus:border-accent-indigo text-xs text-on-surface rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer transition-all font-mono"
              >
                <option value="all">All Execution</option>

                <option value="Discipline">Disciplined Setup</option>

                <option value="Undisciplined">Undisciplined Setup</option>
              </select>
            </div>
          </div>

          {/* Desktop Table View */}

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
                {localDecisions.map((item) => {
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
                        <div className="flex flex-col gap-1 pr-4">
                          {item.strategy && (
                            <div>
                              <span
                                onClick={() =>
                                  setSelectedViewStrategy(item.strategy)
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent-indigo/10 border border-accent-indigo/20 text-accent-indigo text-[10px] font-bold cursor-pointer hover:bg-accent-indigo/20 transition-all shadow-sm"
                              >
                                🛡️ {item.strategy.name}
                              </span>
                            </div>
                          )}

                          <p className="text-on-surface text-[13px] leading-relaxed font-inter">
                            {item.rationale}
                          </p>
                        </div>
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

          {/* Mobile Feed View */}

          <div className="block md:hidden flex flex-col divide-y divide-surface-border/40">
            {localDecisions.map((item) => {
              const currentId = item._id || item.id;

              return (
                <div key={currentId} className="p-5 flex flex-col gap-4">
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

                  {item.strategy && (
                    <div>
                      <span
                        onClick={() => setSelectedViewStrategy(item.strategy)}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent-indigo/10 border border-accent-indigo/20 text-accent-indigo text-[10px] font-bold cursor-pointer"
                      >
                        🛡️ {item.strategy.name}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-on-variant uppercase tracking-wider">
                      Thesis / Rationale
                    </span>

                    <p className="text-on-surface text-sm leading-relaxed font-inter">
                      {item.rationale}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 bg-surface-low/30 border border-surface-border/40 rounded p-3">
                    <span className="text-[9px] font-bold text-on-variant uppercase tracking-wider">
                      Invalidation Threshold
                    </span>

                    <p className="text-on-heading text-xs font-mono font-medium">
                      {(item.metrics && item.metrics.stop) || "N/A"}
                    </p>
                  </div>

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

          {/* Premium Pagination Controls Footer */}

          {totalPages > 1 && (
            <div className="p-4 border-t border-surface-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-low/10">
              <span className="text-xs text-on-variant font-mono">
                Showing {startIndex + 1}-{endIndex} of {totalItems} Trades
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-surface-border/60 hover:bg-surface text-on-surface disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all flex items-center justify-center"
                >
                  <ChevronLeft size={13} />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;

                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                          currentPage === pageNum
                            ? "bg-accent-indigo text-white shadow-md shadow-accent-indigo/20 border border-accent-indigo"
                            : "border border-surface-border/60 hover:bg-surface text-on-surface"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === 2 || pageNum === totalPages - 1) {
                    return (
                      <span
                        key={pageNum}
                        className="text-on-variant text-xs px-1 select-none font-mono"
                      >
                        ...
                      </span>
                    );
                  }

                  return null;
                })}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-surface-border/60 hover:bg-surface text-on-surface disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all flex items-center justify-center"
                >
                  <ChevronRight size={13} />
                </button>
              </div>

              {/* Items Per Page Selector */}

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-on-variant font-mono">
                  Per Page:
                </span>

                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                  className="bg-surface-low border border-surface-border/60 text-xs text-on-surface rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                >
                  <option value={5}>5</option>

                  <option value={10}>10</option>

                  <option value={25}>25</option>

                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          )}

          {/* Case 1: Total empty database logs */}

          {globalDecisions.length === 0 && (
            <div className="p-16 flex flex-col items-center justify-center text-center text-on-variant/40">
              <FileText size={36} className="mb-3 opacity-20" />

              <h3 className="text-on-heading text-sm font-semibold">
                No logged trades yet
              </h3>

              <p className="text-xs mt-1 mb-6">
                Your systematic trade log is completely empty.
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

          {/* Case 2: Matching results is empty due to search/filters */}

          {globalDecisions.length > 0 && localDecisions.length === 0 && (
            <div className="p-16 flex flex-col items-center justify-center text-center text-on-variant/40 animate-fade-in">
              <Search size={36} className="mb-3 opacity-20" />

              <h3 className="text-on-heading text-sm font-semibold">
                No matching results
              </h3>

              <p className="text-xs mt-1 mb-6">
                No logged trades match your selected search or filter settings.
              </p>

              <button
                onClick={() => {
                  setSearchTerm("");

                  setFilterStrategy("all");

                  setFilterResult("all");

                  setFilterDiscipline("all");
                }}
                className="btn-secondary py-2 px-6 text-xs uppercase tracking-wide font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* -------------------- GLOBAL STRATEGY EXPAND MODAL -------------------- */}

      {selectedViewStrategy && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg p-6 md:p-8 animate-slide-up flex flex-col gap-5 border border-surface-border">
            <div className="flex justify-between items-center border-b border-surface-border pb-3">
              <h3 className="text-lg font-bold font-sora text-on-heading flex items-center gap-2">
                🛡️ {selectedViewStrategy.name} Rules
              </h3>

              <button
                onClick={() => setSelectedViewStrategy(null)}
                className="text-on-variant hover:text-on-surface text-sm cursor-pointer font-bold uppercase tracking-wider font-mono bg-surface-low px-3 py-1 rounded"
              >
                Close
              </button>
            </div>

            <div className="flex flex-col gap-4 text-sm leading-relaxed">
              {selectedViewStrategy.description && (
                <p className="text-xs text-on-variant italic">
                  "{selectedViewStrategy.description}"
                </p>
              )}

              <div className="border border-[#10b981]/20 rounded p-3.5 bg-[#10b981]/5">
                <span className="font-bold text-[10px] font-mono uppercase tracking-wider text-[#10b981] block mb-1">
                  🟢 Entry Setup Trigger
                </span>

                <p className="text-xs text-on-surface font-mono leading-relaxed whitespace-pre-line">
                  {selectedViewStrategy.entryRules}
                </p>
              </div>

              <div className="border border-[#3b82f6]/20 rounded p-3.5 bg-[#3b82f6]/5">
                <span className="font-bold text-[10px] font-mono uppercase tracking-wider text-[#3b82f6] block mb-1">
                  🎯 Profit Taking Exit Target
                </span>

                <p className="text-xs text-on-surface font-mono leading-relaxed whitespace-pre-line">
                  {selectedViewStrategy.exitRules}
                </p>
              </div>

              <div className="border border-[#ef4444]/20 rounded p-3.5 bg-[#ef4444]/5">
                <span className="font-bold text-[10px] font-mono uppercase tracking-wider text-[#ef4444] block mb-1">
                  🛑 Invalidation / Stop Loss rules
                </span>

                <p className="text-xs text-on-surface font-mono leading-relaxed whitespace-pre-line">
                  {selectedViewStrategy.stopLossRules}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs font-mono border-t border-surface-border/40 pt-4 mt-2">
                <span className="text-on-variant">MAX RISK PROFILE:</span>

                <span className="font-bold text-accent-indigo text-sm">
                  {selectedViewStrategy.riskProfile || "1% of Capital"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
