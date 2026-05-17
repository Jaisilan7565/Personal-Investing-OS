import React, { useState } from "react";

import {
  Plus,
  Trophy,
  Target,
  Trash2,
  Edit2,
  TrendingUp,
  AlertCircle,
  FileCode,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { strategyService } from "../../services/strategyService";

import { useToast } from "../../hooks/useToast";

import ConfirmDialog from "../shared/ConfirmDialog";

export default function Strategies({ strategies, setStrategies, decisions }) {
  const [activeSubTab, setActiveSubTab] = useState("dashboard"); // "dashboard" or "playbook"

  const [isAddingStrategy, setIsAddingStrategy] = useState(false);

  const [loading, setLoading] = useState(false);

  const [editingStrategyId, setEditingStrategyId] = useState(null);

  const [confirmDeleteStrategy, setConfirmDeleteStrategy] = useState(null); // { id, name }

  const [selectedViewStrategy, setSelectedViewStrategy] = useState(null);

  const toast = useToast();

  // Pagination & Filtering states

  const [leaderboardPage, setLeaderboardPage] = useState(1);

  const [playbookPage, setPlaybookPage] = useState(1);

  const [playbookSearch, setPlaybookSearch] = useState("");

  const [playbookRiskFilter, setPlaybookRiskFilter] = useState("All");

  const leaderboardItemsPerPage = 5;

  const [playbookItemsPerPage, setPlaybookItemsPerPage] = useState(6);

  // Local paginated playbook records

  const [localStrategies, setLocalStrategies] = useState([]);

  const [totalPlaybookItems, setTotalPlaybookItems] = useState(0);

  const [totalPlaybookPages, setTotalPlaybookPages] = useState(1);

  const [playbookLoading, setPlaybookLoading] = useState(false);

  const fetchPlaybook = async () => {
    setPlaybookLoading(true);

    try {
      const response = await strategyService.getAll(
        playbookPage,
        playbookItemsPerPage,
        {
          search: playbookSearch,

          riskProfile: playbookRiskFilter === "All" ? "" : playbookRiskFilter,
        },
      );

      setLocalStrategies(response.data || []);

      if (response.pagination) {
        setTotalPlaybookItems(response.pagination.totalResults || 0);

        setTotalPlaybookPages(response.pagination.totalPages || 1);
      } else {
        setTotalPlaybookItems((response.data || []).length);

        setTotalPlaybookPages(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPlaybookLoading(false);
    }
  };

  const [strategyFormData, setStrategyFormData] = useState({
    name: "",
    description: "",
    entryRules: "",
    exitRules: "",
    stopLossRules: "",
    riskProfile: "1% of Capital",
  });

  // Reset playbook page when filter or search changes
  React.useEffect(() => {
    setPlaybookPage(1);
  }, [playbookSearch, playbookRiskFilter, playbookItemsPerPage]);

  // Fetch playbook strategies when page or items per page change or filters trigger
  React.useEffect(() => {
    fetchPlaybook();
    const mainContainer = document.querySelector("main");
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [playbookPage, playbookItemsPerPage, playbookSearch, playbookRiskFilter]);

  // Scroll to top when leaderboard page changes
  React.useEffect(() => {
    const mainContainer = document.querySelector("main");
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [leaderboardPage]);

  // Calculate stats for all strategies

  const strategyStats = strategies.map((strat) => {
    const stratId = strat._id || strat.id;

    // Account for strategy being populated object or flat string ID

    const stratDecisions = decisions.filter((d) => {
      const dStratId = d.strategy?._id || d.strategy;

      return dStratId === stratId;
    });

    const winners = stratDecisions.filter((d) => d.result === "Winner").length;

    const losers = stratDecisions.filter((d) => d.result === "Loser").length;

    const pending = stratDecisions.filter((d) => d.result === "Pending").length;

    const total = stratDecisions.length;

    const realized = winners + losers;

    const winRate = realized > 0 ? Math.round((winners / realized) * 100) : 0;

    return {
      ...strat,

      total,

      winners,

      losers,

      pending,

      realized,

      winRate,
    };
  });

  // Paginate leaderboard stats

  const totalLeaderboardPages = Math.ceil(
    strategyStats.length / leaderboardItemsPerPage,
  );

  const currentLeaderboardPage = Math.min(
    leaderboardPage,
    totalLeaderboardPages || 1,
  );

  const startIndexLeaderboard =
    (currentLeaderboardPage - 1) * leaderboardItemsPerPage;

  const paginatedLeaderboardStats = strategyStats.slice(
    startIndexLeaderboard,
    startIndexLeaderboard + leaderboardItemsPerPage,
  );

  // Find best performing strategy

  const activeStrategiesWithTrades = strategyStats.filter(
    (s) => s.realized > 0,
  );

  let bestStrategy = null;

  if (activeStrategiesWithTrades.length > 0) {
    bestStrategy = activeStrategiesWithTrades.reduce((prev, current) => {
      if (current.winRate > prev.winRate) return current;

      if (current.winRate === prev.winRate) {
        return current.winners > prev.winners ? current : prev;
      }

      return prev;
    }, activeStrategiesWithTrades[0]);
  }

  // Filter Playbook Strategies (now calculated by the backend, localStrategies contains the pre-filtered page)

  const currentPlaybookPage = playbookPage;

  const paginatedPlaybookStrategies = localStrategies;

  const handleEditStrategyClick = (strat) => {
    setEditingStrategyId(strat._id || strat.id);

    setIsAddingStrategy(true);

    setStrategyFormData({
      name: strat.name,

      description: strat.description || "",

      entryRules: strat.entryRules,

      exitRules: strat.exitRules,

      stopLossRules: strat.stopLossRules,

      riskProfile: strat.riskProfile || "1% of Capital",
    });
  };

  const handleCancelStrategy = () => {
    setIsAddingStrategy(false);

    setEditingStrategyId(null);

    setStrategyFormData({
      name: "",

      description: "",

      entryRules: "",

      exitRules: "",

      stopLossRules: "",

      riskProfile: "1% of Capital",
    });
  };

  const handleStrategySubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      if (editingStrategyId) {
        const response = await strategyService.update(
          editingStrategyId,

          strategyFormData,
        );

        setStrategies(
          strategies.map((s) =>
            (s._id || s.id) === editingStrategyId ? response.data : s,
          ),
        );

        toast.success("Strategy updated successfully!");
      } else {
        const response = await strategyService.create(strategyFormData);

        setStrategies([response.data, ...strategies]);

        toast.success("New strategy saved successfully!");
      }

      setIsAddingStrategy(false);

      setEditingStrategyId(null);

      setStrategyFormData({
        name: "",

        description: "",

        entryRules: "",

        exitRules: "",

        stopLossRules: "",

        riskProfile: "1% of Capital",
      });

      setActiveSubTab("playbook"); // Automatically switch to playbook view to show new strategy

      // Re-fetch paginated playbook rules

      if (playbookPage === 1) {
        fetchPlaybook();
      } else {
        setPlaybookPage(1);
      }
    } catch (err) {
      console.error(err);

      toast.error(err.message || "Failed to save strategy.");
    } finally {
      setLoading(false);
    }
  };

  const requestDeleteStrategy = (id, name) => {
    setConfirmDeleteStrategy({ id, name });
  };

  const confirmDeleteStrat = async () => {
    const { id } = confirmDeleteStrategy;

    setConfirmDeleteStrategy(null);

    try {
      await strategyService.delete(id);

      setStrategies(strategies.filter((s) => (s._id || s.id) !== id));

      toast.success("Strategy removed successfully!");

      fetchPlaybook();
    } catch (err) {
      console.error(err);

      toast.error(err.message || "Failed to remove strategy.");
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full animate-fade-in pb-10">
      {/* Delete confirmation dialog */}

      <ConfirmDialog
        isOpen={!!confirmDeleteStrategy}
        title={`Remove "${confirmDeleteStrategy?.name}" Strategy?`}
        message="This action will remove the strategy rules. Trades already linked to this strategy will keep their reference, but you won't see rules for this strategy."
        onConfirm={confirmDeleteStrat}
        onCancel={() => setConfirmDeleteStrategy(null)}
      />

      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-heading font-sora flex items-center gap-3">
            <Target className="text-accent-indigo" size={28} /> Strategy Hub
          </h1>

          <p className="text-sm text-on-variant mt-1">
            Analyze strategy win rates, optimize sizing, and maintain execution
            discipline rules.
          </p>
        </div>

        {strategies.length > 0 &&
          !isAddingStrategy &&
          activeSubTab === "playbook" && (
            <button
              onClick={() => {
                setIsAddingStrategy(true);

                setEditingStrategyId(null);
              }}
              className="btn-primary flex items-center gap-2 py-2.5 cursor-pointer whitespace-nowrap"
            >
              <Plus size={16} /> New Strategy
            </button>
          )}
      </div>

      {strategies.length === 0 ? (
        isAddingStrategy ? (
          <div className="glass-card p-6 md:p-8 animate-slide-up flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-on-heading">
                <FileCode size={18} className="text-[#6366F1]" />

                <h2 className="text-sm font-semibold tracking-wide font-sora">
                  Design New Strategy
                </h2>
              </div>

              <div className="px-2 py-1 rounded border border-indigo-500/30 bg-indigo-500/5 text-[#6366F1] font-mono font-semibold text-[10px] uppercase tracking-wider">
                Rule Book Form
              </div>
            </div>

            <form
              onSubmit={handleStrategySubmit}
              className="flex flex-col gap-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-on-variant tracking-wide">
                    Strategy Title
                  </label>

                  <input
                    type="text"
                    placeholder="E.G. 20 EMA Bounce Setup"
                    required
                    value={strategyFormData.name}
                    onChange={(e) =>
                      setStrategyFormData({
                        ...strategyFormData,

                        name: e.target.value,
                      })
                    }
                    className="input-white font-semibold py-3"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-on-variant tracking-wide">
                    Risk Profile / Capital Sizing
                  </label>

                  <input
                    type="text"
                    placeholder="E.G. 1% Risk Max / 2% Port Allocation"
                    value={strategyFormData.riskProfile}
                    onChange={(e) =>
                      setStrategyFormData({
                        ...strategyFormData,

                        riskProfile: e.target.value,
                      })
                    }
                    className="input-white font-semibold py-3"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-on-variant tracking-wide">
                  Strategy Overview / Description
                </label>

                <input
                  type="text"
                  placeholder="Short description of the strategy core rationale..."
                  value={strategyFormData.description}
                  onChange={(e) =>
                    setStrategyFormData({
                      ...strategyFormData,

                      description: e.target.value,
                    })
                  }
                  className="input-white py-3"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-on-variant tracking-wide flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                  Entry Triggers & Setup Rules
                </label>

                <textarea
                  required
                  rows={3}
                  placeholder="E.G. Enter ONLY if daily RSI is < 30 and price is within 2% of the weekly demand zone support block."
                  value={strategyFormData.entryRules}
                  onChange={(e) =>
                    setStrategyFormData({
                      ...strategyFormData,

                      entryRules: e.target.value,
                    })
                  }
                  className="input-field resize-none leading-relaxed w-full px-4 py-3"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-on-variant tracking-wide flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></span>
                  Profit Taking (Exit) Targets
                </label>

                <textarea
                  required
                  rows={3}
                  placeholder="E.G. Exit 50% at the next daily swing high resistance and hold remaining with trailing stop at breakeven."
                  value={strategyFormData.exitRules}
                  onChange={(e) =>
                    setStrategyFormData({
                      ...strategyFormData,

                      exitRules: e.target.value,
                    })
                  }
                  className="input-field resize-none leading-relaxed w-full px-4 py-3"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-on-variant tracking-wide flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
                  Stop-Loss / Invalidation Rules
                </label>

                <textarea
                  required
                  rows={3}
                  placeholder="E.G. Cut positions instantly on a 4-hour candle close below the swing low support line."
                  value={strategyFormData.stopLossRules}
                  onChange={(e) =>
                    setStrategyFormData({
                      ...strategyFormData,

                      stopLossRules: e.target.value,
                    })
                  }
                  className="input-field resize-none leading-relaxed w-full px-4 py-3 border-[#ef4444]/20"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-surface-border pt-5 mt-2">
                <button
                  type="button"
                  onClick={handleCancelStrategy}
                  className="btn-secondary py-2.5 text-xs px-6 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary py-2.5 text-xs font-semibold px-6 cursor-pointer"
                >
                  {loading ? "Saving Strategy..." : "Save Strategy"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-12 min-h-[400px] animate-fade-in">
            <div
              onClick={() => {
                setIsAddingStrategy(true);

                setEditingStrategyId(null);
              }}
              className="glass-card max-w-md p-10 flex flex-col justify-center items-center text-center border-dashed border-2 border-surface-border/60 hover:border-accent-indigo/40 hover:bg-surface-low/10 transition-all duration-200 cursor-pointer"
            >
              <Plus
                size={48}
                className="text-accent-indigo mb-4 animate-pulse"
              />

              <h3 className="text-on-heading text-lg font-bold font-sora">
                Create Your First Strategy
              </h3>

              <p className="text-xs text-on-variant/80 mt-2 max-w-[280px] leading-relaxed">
                Systematic edge is built on strict rule execution. Define your
                entry triggers, profit exit targets, and risk profiles before
                allocating capital.
              </p>

              <button className="btn-primary mt-6 py-2 px-6 text-xs font-semibold tracking-wide cursor-pointer flex items-center gap-2">
                <Plus size={14} /> Design Setup Rulebook
              </button>
            </div>
          </div>
        )
      ) : (
        <>
          {/* Sub-tab Navigation */}

          {!isAddingStrategy && (
            <div className="flex border-b border-surface-border/40 gap-1.5 pb-0.5 mt-2">
              <button
                onClick={() => setActiveSubTab("dashboard")}
                className={`px-5 py-2.5 text-xs font-semibold rounded-[6px] tracking-wide cursor-pointer transition-all ${
                  activeSubTab === "dashboard"
                    ? "bg-[#6366F1] text-white shadow-md shadow-indigo-500/10"
                    : "text-on-variant hover:text-on-surface hover:bg-surface-low/30"
                }`}
              >
                Performance Analytics
              </button>

              <button
                onClick={() => setActiveSubTab("playbook")}
                className={`px-5 py-2.5 text-xs font-semibold rounded-[6px] tracking-wide cursor-pointer transition-all ${
                  activeSubTab === "playbook"
                    ? "bg-[#6366F1] text-white shadow-md shadow-indigo-500/10"
                    : "text-on-variant hover:text-on-surface hover:bg-surface-low/30"
                }`}
              >
                Strategy Playbook ({strategies.length})
              </button>
            </div>
          )}

          {/* -------------------- PERFORMANCE DASHBOARD PANELS -------------------- */}

          {!isAddingStrategy && activeSubTab === "dashboard" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* Dashboard Summary Cards */}

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-5 flex flex-col justify-between min-h-[120px]">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-on-variant font-bold font-mono">
                      Strategies Active
                    </span>

                    <h3 className="text-2xl font-bold text-on-heading font-sora mt-1">
                      {strategies.length}
                    </h3>
                  </div>

                  <p className="text-[10px] text-on-variant mt-2 border-t border-surface-border/40 pt-2">
                    Defined playbooks in workspace
                  </p>
                </div>

                <div className="glass-card p-5 flex flex-col justify-between min-h-[120px]">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-on-variant font-bold font-mono">
                      Total Managed Trades
                    </span>

                    <h3 className="text-2xl font-bold text-on-heading font-sora mt-1">
                      {decisions.filter((d) => d.strategy).length}
                    </h3>
                  </div>

                  <p className="text-[10px] text-on-variant mt-2 border-t border-surface-border/40 pt-2">
                    Trades executed under rules
                  </p>
                </div>

                <div className="glass-card p-5 flex flex-col justify-between min-h-[120px]">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-on-variant font-bold font-mono">
                      Realized Win Rate Avg
                    </span>

                    <h3 className="text-2xl font-bold text-on-heading font-sora mt-1">
                      {activeStrategiesWithTrades.length > 0
                        ? Math.round(
                            activeStrategiesWithTrades.reduce(
                              (acc, curr) => acc + curr.winRate,

                              0,
                            ) / activeStrategiesWithTrades.length,
                          )
                        : 0}
                      %
                    </h3>
                  </div>

                  <p className="text-[10px] text-on-variant mt-2 border-t border-surface-border/40 pt-2">
                    Across all used strategies
                  </p>
                </div>

                {/* Strategy Leaderboard comparison Segment */}

                <div className="sm:col-span-3 glass-card p-5 flex flex-col gap-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-on-heading font-mono flex items-center gap-2">
                    <TrendingUp size={14} className="text-accent-indigo" />{" "}
                    Strategy Win/Loss Leaderboard
                  </h4>

                  <div className="flex flex-col gap-4 divide-y divide-surface-border/30">
                    {paginatedLeaderboardStats.map((strat) => {
                      const currentId = strat._id || strat.id;

                      return (
                        <div
                          key={currentId}
                          onClick={() => setSelectedViewStrategy(strat)}
                          className="pt-3 first:pt-2 flex flex-col gap-2 cursor-pointer hover:bg-surface-low/40 rounded p-2.5 -mx-2.5 transition-all"
                          title={`Click to expand ${strat.name} rules`}
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-on-heading font-sora">
                              {strat.name}
                            </span>

                            <div className="flex items-center gap-3 text-on-variant font-mono">
                              <span>
                                {strat.winners}W - {strat.losers}L
                                {strat.pending > 0 &&
                                  ` (${strat.pending} Pending)`}
                              </span>

                              <span className="font-bold text-on-heading text-accent-indigo">
                                {strat.winRate}% WR
                              </span>
                            </div>
                          </div>

                          {/* Segment Visual Progress Bar */}

                          <div className="relative">
                            <div className="flex h-2.5 rounded-full overflow-hidden bg-surface-low border border-surface-border/40">
                              {strat.total > 0 ? (
                                <>
                                  {strat.winners > 0 && (
                                    <div
                                      className="bg-discipline transition-all"
                                      style={{
                                        width: `${(strat.winners / strat.total) * 100}%`,
                                      }}
                                      title={`${strat.winners} Winners`}
                                    />
                                  )}

                                  {strat.losers > 0 && (
                                    <div
                                      className="bg-fear transition-all"
                                      style={{
                                        width: `${(strat.losers / strat.total) * 100}%`,
                                      }}
                                      title={`${strat.losers} Losers`}
                                    />
                                  )}

                                  {strat.pending > 0 && (
                                    <div
                                      className="bg-surface-high transition-all"
                                      style={{
                                        width: `${(strat.pending / strat.total) * 100}%`,
                                      }}
                                      title={`${strat.pending} Pending`}
                                    />
                                  )}
                                </>
                              ) : (
                                <div className="w-full bg-surface-low text-[9px] text-center text-on-variant/50 font-mono py-0.5 leading-[0] flex items-center justify-center">
                                  NO TRADES LOGGED YET
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Leaderboard Pagination Toolbar */}

                    {totalLeaderboardPages > 1 && (
                      <div className="glass-card p-3 flex items-center justify-between gap-4 bg-surface-low/10 mt-4 animate-fade-in">
                        <span className="text-[10px] text-on-variant font-mono">
                          Page {currentLeaderboardPage} of{" "}
                          {totalLeaderboardPages}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              setLeaderboardPage((prev) =>
                                Math.max(prev - 1, 1),
                              )
                            }
                            disabled={currentLeaderboardPage === 1}
                            className="p-1.5 rounded-lg border border-surface-border/60 hover:bg-surface text-on-surface disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all flex items-center justify-center"
                          >
                            <ChevronLeft size={12} />
                          </button>

                          {Array.from({ length: totalLeaderboardPages }).map(
                            (_, idx) => {
                              const pageNum = idx + 1;
                              if (
                                pageNum === 1 ||
                                pageNum === totalLeaderboardPages ||
                                Math.abs(pageNum - currentLeaderboardPage) <= 1
                              ) {
                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => setLeaderboardPage(pageNum)}
                                    className={`w-6 h-6 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                                      currentLeaderboardPage === pageNum
                                        ? "bg-accent-indigo text-white shadow-md shadow-accent-indigo/20 border border-accent-indigo"
                                        : "border border-surface-border/60 hover:bg-surface text-on-surface"
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              } else if (
                                pageNum === 2 ||
                                pageNum === totalLeaderboardPages - 1
                              ) {
                                return (
                                  <span
                                    key={pageNum}
                                    className="text-on-variant text-[10px] px-0.5 select-none font-mono"
                                  >
                                    ...
                                  </span>
                                );
                              }
                              return null;
                            },
                          )}

                          <button
                            onClick={() =>
                              setLeaderboardPage((prev) =>
                                Math.min(totalLeaderboardPages, prev + 1),
                              )
                            }
                            disabled={
                              currentLeaderboardPage === totalLeaderboardPages
                            }
                            className="p-1.5 rounded-lg border border-surface-border/60 hover:bg-surface text-on-surface disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all flex items-center justify-center"
                          >
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Trophy Highlight Panel */}

              <div className="glass-card bg-gradient-to-br from-accent-indigo/10 via-surface-lowest to-surface border border-accent-indigo/20 p-5 flex flex-col gap-4 h-fit relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-300 pointer-events-none transform translate-x-4 -translate-y-4">
                  <Trophy size={130} />
                </div>

                <div>
                  <div className="flex items-center gap-2 text-accent-indigo">
                    <Trophy size={18} className="animate-bounce" />

                    <span className="text-[10px] font-bold tracking-widest uppercase font-mono">
                      Best Performing Strategy
                    </span>
                  </div>

                  {bestStrategy ? (
                    <div className="mt-3 flex flex-col gap-2.5">
                      <h3 className="text-base font-bold text-on-heading font-sora group-hover:text-accent-indigo transition-colors line-clamp-1">
                        {bestStrategy.name}
                      </h3>

                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold text-on-heading font-sora">
                          {bestStrategy.winRate}%
                        </span>

                        <span className="text-[10px] text-on-variant font-mono">
                          Win Rate
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5 bg-surface/40 p-2.5 rounded border border-surface-border/40 text-xs font-mono">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-on-variant">Realized Out:</span>

                          <span className="font-bold text-on-heading">
                            {bestStrategy.winners}W / {bestStrategy.losers}L
                          </span>
                        </div>

                        <div className="flex justify-between text-[11px]">
                          <span className="text-on-variant">Sizing Rule:</span>

                          <span
                            className="font-bold text-[#10B981] truncate max-w-[120px]"
                            title={bestStrategy.riskProfile}
                          >
                            {bestStrategy.riskProfile}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-col gap-1.5 text-on-variant text-xs leading-relaxed">
                      <AlertCircle size={24} className="text-on-variant/40" />

                      <p className="font-semibold mt-1">
                        No realized statistics yet.
                      </p>

                      <p className="text-[10px] opacity-70 leading-normal">
                        Log outcomes in Trade Log under specific strategies to
                        populate!
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-surface-border/40 pt-3">
                  <p className="text-[9.5px] text-on-variant italic font-inter leading-normal">
                    "Edge is not about predicting the next trade. It is the
                    strict execution of custom rules over sample trades."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* -------------------- MY STRATEGIES PLAYBOOK SECTION -------------------- */}

          {isAddingStrategy ? (
            <div className="glass-card p-6 md:p-8 animate-slide-up flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-on-heading">
                  <FileCode size={18} className="text-[#6366F1]" />

                  <h2 className="text-sm font-semibold tracking-wide font-sora">
                    {editingStrategyId
                      ? "Edit Strategy Rules"
                      : "Design New Strategy"}
                  </h2>
                </div>

                <div className="px-2 py-1 rounded border border-indigo-500/30 bg-indigo-500/5 text-[#6366F1] font-mono font-semibold text-[10px] uppercase tracking-wider">
                  Rule Book Form
                </div>
              </div>

              <form
                onSubmit={handleStrategySubmit}
                className="flex flex-col gap-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-on-variant tracking-wide">
                      Strategy Title
                    </label>

                    <input
                      type="text"
                      placeholder="E.G. 20 EMA Bounce Setup"
                      required
                      value={strategyFormData.name}
                      onChange={(e) =>
                        setStrategyFormData({
                          ...strategyFormData,

                          name: e.target.value,
                        })
                      }
                      className="input-white font-semibold py-3"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-on-variant tracking-wide">
                      Risk Profile / Capital Sizing
                    </label>

                    <input
                      type="text"
                      placeholder="E.G. 1% Risk Max / 2% Port Allocation"
                      value={strategyFormData.riskProfile}
                      onChange={(e) =>
                        setStrategyFormData({
                          ...strategyFormData,

                          riskProfile: e.target.value,
                        })
                      }
                      className="input-white font-semibold py-3"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-on-variant tracking-wide">
                    Strategy Overview / Description
                  </label>

                  <input
                    type="text"
                    placeholder="Short description of the strategy core rationale..."
                    value={strategyFormData.description}
                    onChange={(e) =>
                      setStrategyFormData({
                        ...strategyFormData,

                        description: e.target.value,
                      })
                    }
                    className="input-white py-3"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-on-variant tracking-wide flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                    Entry Triggers & Setup Rules
                  </label>

                  <textarea
                    required
                    rows={3}
                    placeholder="E.G. Enter ONLY if daily RSI is < 30 and price is within 2% of the weekly demand zone support block."
                    value={strategyFormData.entryRules}
                    onChange={(e) =>
                      setStrategyFormData({
                        ...strategyFormData,

                        entryRules: e.target.value,
                      })
                    }
                    className="input-field resize-none leading-relaxed w-full px-4 py-3"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-on-variant tracking-wide flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></span>
                    Profit Taking (Exit) Targets
                  </label>

                  <textarea
                    required
                    rows={3}
                    placeholder="E.G. Exit 50% at the next daily swing high resistance and hold remaining with trailing stop at breakeven."
                    value={strategyFormData.exitRules}
                    onChange={(e) =>
                      setStrategyFormData({
                        ...strategyFormData,

                        exitRules: e.target.value,
                      })
                    }
                    className="input-field resize-none leading-relaxed w-full px-4 py-3"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-on-variant tracking-wide flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
                    Stop-Loss / Invalidation Rules
                  </label>

                  <textarea
                    required
                    rows={3}
                    placeholder="E.G. Cut positions instantly on a 4-hour candle close below the swing low support line."
                    value={strategyFormData.stopLossRules}
                    onChange={(e) =>
                      setStrategyFormData({
                        ...strategyFormData,

                        stopLossRules: e.target.value,
                      })
                    }
                    className="input-field resize-none leading-relaxed w-full px-4 py-3 border-[#ef4444]/20"
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-surface-border pt-5 mt-2">
                  <button
                    type="button"
                    onClick={handleCancelStrategy}
                    className="btn-secondary py-2.5 text-xs px-6 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary py-2.5 text-xs font-semibold px-6 cursor-pointer"
                  >
                    {loading
                      ? "Saving Strategy..."
                      : editingStrategyId
                        ? "Save Rules"
                        : "Save Strategy"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            !isAddingStrategy &&
            activeSubTab === "playbook" && (
              <div className="flex flex-col gap-5 animate-fade-in">
                {/* Playbook Filters Row */}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border/40 pb-4">
                  <div>
                    <h3 className="text-sm font-bold tracking-wider text-on-heading uppercase font-mono">
                      Defined Strategy Playbooks ({totalPlaybookItems})
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <input
                      type="text"
                      placeholder="Search playbook name or setup..."
                      value={playbookSearch}
                      onChange={(e) => {
                        setPlaybookSearch(e.target.value);

                        setPlaybookPage(1);
                      }}
                      className="input-white py-2 px-3 text-xs w-full sm:w-64"
                    />

                    <select
                      value={playbookRiskFilter}
                      onChange={(e) => {
                        setPlaybookRiskFilter(e.target.value);

                        setPlaybookPage(1);
                      }}
                      className="input-white py-2 px-3 text-xs w-full sm:w-48 bg-surface"
                    >
                      <option value="All">All Sizing Profiles</option>

                      <option value="Capital">
                        Capital (E.G. % of Capital)
                      </option>

                      <option value="Conservative">Conservative</option>

                      <option value="Moderate">Moderate</option>

                      <option value="Aggressive">Aggressive</option>
                    </select>
                  </div>
                </div>

                {totalPlaybookItems === 0 ? (
                  <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-surface-border">
                    <AlertCircle size={32} className="text-on-variant/40" />

                    <p className="text-xs text-on-variant font-medium">
                      No playbook strategies match your current filters.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Saved Strategies */}

                      {paginatedPlaybookStrategies.map((strat) => {
                        const currentId = strat._id || strat.id;

                        // Pull specific stats calculated above

                        const stat =
                          strategyStats.find(
                            (s) => (s._id || s.id) === currentId,
                          ) || {};

                        return (
                          <div
                            key={currentId}
                            className="glass-card p-6 flex flex-col justify-between border border-surface-border hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200"
                          >
                            <div>
                              <div className="flex justify-between items-start border-b border-surface-border/40 pb-3 mb-3">
                                <div>
                                  <h3 className="font-bold text-on-heading font-sora tracking-wide text-sm">
                                    {strat.name}
                                  </h3>

                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-accent-indigo font-bold font-mono tracking-wider">
                                      🛡️ {strat.riskProfile} Sizing
                                    </span>

                                    <span className="text-[10px] text-on-variant font-mono">
                                      | {stat.winRate || 0}% WR (
                                      {stat.total || 0} Trades)
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() =>
                                      handleEditStrategyClick(strat)
                                    }
                                    className="text-on-variant hover:text-accent-indigo p-1 hover:bg-surface-low rounded transition-all cursor-pointer"
                                    title="Edit Rules"
                                  >
                                    <Edit2 size={12} />
                                  </button>

                                  <button
                                    onClick={() =>
                                      requestDeleteStrategy(
                                        currentId,
                                        strat.name,
                                      )
                                    }
                                    className="text-on-variant hover:text-fear p-1 hover:bg-surface-low rounded transition-all cursor-pointer"
                                    title="Delete Strategy"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>

                              {strat.description && (
                                <p className="text-[11px] text-on-variant italic mb-4">
                                  "{strat.description}"
                                </p>
                              )}

                              <div className="space-y-3">
                                <div className="text-xs border-l-2 border-[#10b981] pl-2 py-0.5">
                                  <span className="font-semibold text-[10px] uppercase text-[#10b981] block font-mono">
                                    🟢 Entry Setup
                                  </span>

                                  <p className="text-on-surface/90 line-clamp-2 mt-0.5 text-xs font-inter leading-relaxed">
                                    {strat.entryRules}
                                  </p>
                                </div>

                                <div className="text-xs border-l-2 border-[#3b82f6] pl-2 py-0.5">
                                  <span className="font-semibold text-[10px] uppercase text-[#3b82f6] block font-mono">
                                    🎯 Profit Exit
                                  </span>

                                  <p className="text-on-surface/90 line-clamp-2 mt-0.5 text-xs font-inter leading-relaxed">
                                    {strat.exitRules}
                                  </p>
                                </div>

                                <div className="text-xs border-l-2 border-[#ef4444] pl-2 py-0.5">
                                  <span className="font-semibold text-[10px] uppercase text-[#ef4444] block font-mono">
                                    🛑 Stop Loss
                                  </span>

                                  <p className="text-on-surface/90 line-clamp-2 mt-0.5 text-xs font-inter leading-relaxed">
                                    {strat.stopLossRules}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => setSelectedViewStrategy(strat)}
                              className="w-full mt-5 py-2 border border-surface-border hover:bg-surface-low hover:text-on-surface rounded-[6px] text-xs font-semibold text-on-variant tracking-wide transition-all cursor-pointer uppercase font-mono"
                            >
                              Focus / Expand rules
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Playbook Pagination controls */}

                    {totalPlaybookPages > 1 &&
                      (() => {
                        const playbookStartIndex =
                          (currentPlaybookPage - 1) * playbookItemsPerPage;
                        const playbookEndIndex = Math.min(
                          playbookStartIndex + playbookItemsPerPage,
                          totalPlaybookItems,
                        );
                        return (
                          <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-low/10 mt-2 animate-fade-in">
                            <span className="text-xs text-on-variant font-mono">
                              Showing {playbookStartIndex + 1}-
                              {playbookEndIndex} of {totalPlaybookItems}{" "}
                              Strategies
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setPlaybookPage((prev) =>
                                    Math.max(1, prev - 1),
                                  )
                                }
                                disabled={currentPlaybookPage === 1}
                                className="p-1.5 rounded-lg border border-surface-border/60 hover:bg-surface text-on-surface disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all flex items-center justify-center"
                              >
                                <ChevronLeft size={13} />
                              </button>

                              {Array.from({ length: totalPlaybookPages }).map(
                                (_, idx) => {
                                  const pageNum = idx + 1;
                                  if (
                                    pageNum === 1 ||
                                    pageNum === totalPlaybookPages ||
                                    Math.abs(pageNum - currentPlaybookPage) <= 1
                                  ) {
                                    return (
                                      <button
                                        key={pageNum}
                                        onClick={() => setPlaybookPage(pageNum)}
                                        className={`w-7 h-7 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                                          currentPlaybookPage === pageNum
                                            ? "bg-accent-indigo text-white shadow-md shadow-accent-indigo/20 border border-accent-indigo"
                                            : "border border-surface-border/60 hover:bg-surface text-on-surface"
                                        }`}
                                      >
                                        {pageNum}
                                      </button>
                                    );
                                  } else if (
                                    pageNum === 2 ||
                                    pageNum === totalPlaybookPages - 1
                                  ) {
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
                                },
                              )}

                              <button
                                onClick={() =>
                                  setPlaybookPage((prev) =>
                                    Math.min(totalPlaybookPages, prev + 1),
                                  )
                                }
                                disabled={
                                  currentPlaybookPage === totalPlaybookPages
                                }
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
                                value={playbookItemsPerPage}
                                onChange={(e) =>
                                  setPlaybookItemsPerPage(
                                    parseInt(e.target.value),
                                  )
                                }
                                className="bg-surface-low border border-surface-border/60 text-xs text-on-surface rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                              >
                                <option value={6}>6</option>
                                <option value={12}>12</option>
                                <option value={24}>24</option>
                                <option value={48}>48</option>
                              </select>
                            </div>
                          </div>
                        );
                      })()}
                  </>
                )}
              </div>
            )
          )}
        </>
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

                <p className="text-xs text-on-surface/90 font-inter leading-relaxed whitespace-pre-line">
                  {selectedViewStrategy.entryRules}
                </p>
              </div>

              <div className="border border-[#3b82f6]/20 rounded p-3.5 bg-[#3b82f6]/5">
                <span className="font-bold text-[10px] font-mono uppercase tracking-wider text-[#3b82f6] block mb-1">
                  🎯 Profit Taking Exit Target
                </span>

                <p className="text-xs text-on-surface/90 font-inter leading-relaxed whitespace-pre-line">
                  {selectedViewStrategy.exitRules}
                </p>
              </div>

              <div className="border border-[#ef4444]/20 rounded p-3.5 bg-[#ef4444]/5">
                <span className="font-bold text-[10px] font-mono uppercase tracking-wider text-[#ef4444] block mb-1">
                  🛑 Invalidation / Stop Loss rules
                </span>

                <p className="text-xs text-on-surface/90 font-inter leading-relaxed whitespace-pre-line">
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
