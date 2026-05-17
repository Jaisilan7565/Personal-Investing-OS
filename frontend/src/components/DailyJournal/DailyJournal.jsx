import React, { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  BookOpen,
  Smile,
  Shield,
  Flame,
  PlusCircle,
  Trash2,
  Edit2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { journalService } from "../../services/journalService";
import { useToast } from "../../hooks/useToast";
import ConfirmDialog from "../shared/ConfirmDialog";

export default function DailyJournal({
  journals: globalJournals,
  setJournals: setGlobalJournals,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, date }
  const toast = useToast();

  // Search, Filters & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSentiment, setFilterSentiment] = useState("all");
  const [filterTag, setFilterTag] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // 5 per page for rich textual logs

  // Local paginated records
  const [localJournals, setLocalJournals] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJournals = async () => {
    setListLoading(true);
    try {
      const response = await journalService.getAll(currentPage, itemsPerPage, {
        search: searchTerm,
        marketSentiment: filterSentiment,
        tag: filterTag,
      });
      setLocalJournals(response.data || []);
      if (response.pagination) {
        setTotalItems(response.pagination.totalResults || 0);
        setTotalPages(response.pagination.totalPages || 1);
      } else {
        setTotalItems((response.data || []).length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to retrieve paginated journal logs.");
    } finally {
      setListLoading(false);
    }
  };

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSentiment, filterTag, itemsPerPage]);

  // Fetch data when active page or itemsPerPage changes, or filter resets
  useEffect(() => {
    fetchJournals();
    const mainContainer = document.querySelector("main");
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage, itemsPerPage, searchTerm, filterSentiment, filterTag]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    marketSentiment: "neutral",
    stressLevel: 5,
    focusLevel: 5,
    thoughts: "",
    tag: "Discipline",
    biases: [],
  });

  const commonBiases = [
    "FOMO Resistance",
    "Loss Aversion Resistance",
    "Systematic Execution",
    "Overtrading Avoided",
    "No Revenge Trading",
  ];

  const handleBiasToggle = (bias) => {
    setFormData((prev) => ({
      ...prev,
      biases: prev.biases.includes(bias)
        ? prev.biases.filter((b) => b !== bias)
        : [...prev.biases, bias],
    }));
  };

  const handleEditClick = (journal) => {
    setEditingId(journal._id || journal.id);
    setIsAdding(true);
    setFormData({
      date: journal.date,
      marketSentiment: journal.marketSentiment || "neutral",
      stressLevel: journal.stressLevel || 5,
      focusLevel: journal.focusLevel || 5,
      thoughts: journal.thoughts || "",
      tag: journal.tags && journal.tags[0] ? journal.tags[0] : "Discipline",
      biases: journal.biasesChecked || [],
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      marketSentiment: "neutral",
      stressLevel: 5,
      focusLevel: 5,
      thoughts: "",
      tag: "Discipline",
      biases: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        date: formData.date,
        marketSentiment: formData.marketSentiment.toLowerCase(),
        stressLevel: parseInt(formData.stressLevel),
        focusLevel: parseInt(formData.focusLevel),
        thoughts: formData.thoughts,
        tags: [formData.tag],
        biasesChecked: formData.biases,
      };

      if (editingId) {
        const response = await journalService.update(editingId, payload);
        setGlobalJournals(
          globalJournals.map((j) =>
            (j._id || j.id) === editingId ? response.data : j,
          ),
        );
        toast.success("Journal entry updated successfully in Database!");
      } else {
        const response = await journalService.create(payload);
        setGlobalJournals([response.data, ...globalJournals]);
        toast.success("Journal entry logged successfully to Database!");
      }

      setIsAdding(false);
      setEditingId(null);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        marketSentiment: "neutral",
        stressLevel: 5,
        focusLevel: 5,
        thoughts: "",
        tag: "Discipline",
        biases: [],
      });
      // Re-fetch paginated data
      if (currentPage === 1) {
        fetchJournals();
      } else {
        setCurrentPage(1);
      }
      return;
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to log journal entry.");
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (id, date) => {
    setConfirmDelete({ id, date });
  };

  const confirmDeleteJournal = async () => {
    const { id } = confirmDelete;
    setConfirmDelete(null);
    try {
      await journalService.delete(id);
      setGlobalJournals(globalJournals.filter((j) => (j._id || j.id) !== id));
      toast.success("Journal entry removed successfully!");
      fetchJournals();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete journal entry.");
    }
  };

  // Calculate pagination boundaries
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(totalItems, startIndex + localJournals.length);

  return (
    <div className="flex flex-col gap-6 h-full animate-fade-in">
      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title={`Delete journal entry for ${confirmDelete?.date}?`}
        message="This action cannot be undone. The psychological audit log and all associated data will be permanently removed from your database."
        onConfirm={confirmDeleteJournal}
        onCancel={() => setConfirmDelete(null)}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-heading font-sora flex items-center gap-3">
            <BookOpen className="text-accent-indigo" size={28} /> Daily Journal
          </h1>
          <p className="text-sm text-on-variant mt-1">
            Log psychological context to identify behavioral patterns over time.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary flex items-center gap-2 py-2.5 cursor-pointer"
          >
            <Plus size={16} /> Log Today's Audit
          </button>
        )}
      </div>

      {/* Form to add/edit entry */}
      {isAdding && (
        <div className="glass-card p-6 md:p-8 w-full animate-slide-up">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-surface-border">
            <h2 className="font-semibold text-lg text-on-heading font-sora">
              {editingId
                ? "Edit Psychological Audit"
                : "New Psychological Audit"}
            </h2>
            <button
              onClick={handleCancel}
              className="text-xs text-on-variant hover:text-on-heading underline cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Left Col: Metadata */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-on-variant uppercase tracking-wider">
                  Audit Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              {/* Stress & Focus Gauges */}
              <div className="grid grid-cols-2 gap-6 bg-surface-low/30 border border-surface-border/40 rounded-lg p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-on-variant uppercase tracking-wider">
                      Stress Level
                    </span>
                    <span className="text-xs font-mono font-bold text-on-heading">
                      {formData.stressLevel}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.stressLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, stressLevel: e.target.value })
                    }
                    className="w-full accent-[#EF4444] cursor-pointer"
                  />
                  <span className="text-[9px] text-on-variant italic">
                    {formData.stressLevel > 7
                      ? "High Stress (Alert)"
                      : formData.stressLevel > 4
                        ? "Moderate Stress"
                        : "Optimal Calm"}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-on-variant uppercase tracking-wider">
                      Focus Level
                    </span>
                    <span className="text-xs font-mono font-bold text-on-heading">
                      {formData.focusLevel}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.focusLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, focusLevel: e.target.value })
                    }
                    className="w-full accent-[#10B981] cursor-pointer"
                  />
                  <span className="text-[9px] text-on-variant italic">
                    {formData.focusLevel > 7
                      ? "Laser Focused"
                      : formData.focusLevel > 4
                        ? "Moderate Focus"
                        : "Distracted / Fatigued"}
                  </span>
                </div>
              </div>

              {/* State Label Tag */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-on-variant uppercase tracking-wider">
                  State Label Tag
                </label>
                <select
                  value={formData.tag}
                  onChange={(e) =>
                    setFormData({ ...formData, tag: e.target.value })
                  }
                  className="input-field cursor-pointer"
                >
                  <option value="Discipline">Discipline (Optimal)</option>
                  <option value="Calm">Calm (Neutral Flow)</option>
                  <option value="Greed">Greed (Chasing Pop)</option>
                  <option value="Fear">Fear (Panic / Loss Aversion)</option>
                </select>
              </div>
            </div>

            {/* Right Col: Introspect & Defenses */}
            <div className="flex flex-col gap-6">
              {/* Market Sentiment Selector */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-on-variant uppercase tracking-wider">
                  Dominant Market Sentiment
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {["Fear", "Neutral", "Greed"].map((sentiment) => (
                    <button
                      key={sentiment}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          marketSentiment: sentiment.toLowerCase(),
                        })
                      }
                      className={`py-2 px-4 rounded-[6px] border text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all duration-150 ${
                        formData.marketSentiment === sentiment.toLowerCase()
                          ? "bg-accent-indigo/10 border-accent-indigo text-accent-indigo"
                          : "bg-surface-low border-surface-border text-on-variant hover:text-on-heading"
                      }`}
                    >
                      {sentiment}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stream of Thoughts */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-on-variant uppercase tracking-wider">
                  Introspective Stream (Thoughts)
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Record your raw stream of consciousness. What are you looking to execute? What cognitive traps are you currently feeling?"
                  value={formData.thoughts}
                  onChange={(e) =>
                    setFormData({ ...formData, thoughts: e.target.value })
                  }
                  className="input-field resize-none leading-relaxed text-sm px-4 py-3"
                />
              </div>

              {/* Defenses Checked */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-on-variant uppercase tracking-wider">
                  Biases Checked / Defended
                </span>
                <div className="flex flex-wrap gap-2">
                  {commonBiases.map((bias) => {
                    const isSelected = formData.biases.includes(bias);
                    return (
                      <button
                        key={bias}
                        type="button"
                        onClick={() => handleBiasToggle(bias)}
                        className={`px-3 py-1.5 rounded-full border text-[11px] font-semibold tracking-wide transition-all cursor-pointer ${
                          isSelected
                            ? "bg-discipline/10 border-discipline text-discipline"
                            : "bg-surface-low border-surface-border text-on-variant hover:text-on-heading"
                        }`}
                      >
                        {isSelected ? `✓ ${bias}` : bias}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-surface-border">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary py-2.5 px-6 text-xs uppercase tracking-wide cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary py-2.5 px-8 text-xs font-semibold uppercase tracking-wider min-w-[150px] cursor-pointer"
              >
                {loading
                  ? "Saving..."
                  : editingId
                    ? "Save Updates"
                    : "Publish Audit Log"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filters Panel */}
      <div className="glass-card p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-low/30 animate-fade-in">
        <span className="text-xs font-semibold text-on-heading tracking-wider uppercase font-mono">
          Introspective Audit Logs ({totalItems} / {globalJournals.length})
        </span>

        {/* Filter elements */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-variant"
              size={13}
            />
            <input
              type="text"
              placeholder="Search thoughts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-56 bg-surface-low border border-surface-border/60 hover:border-surface-border focus:border-accent-indigo text-xs text-on-surface rounded-lg pl-9 pr-4 py-1.5 focus:outline-none transition-all placeholder:text-on-variant"
            />
          </div>

          {/* Sentiment Filter */}
          <select
            value={filterSentiment}
            onChange={(e) => setFilterSentiment(e.target.value)}
            className="bg-surface-low border border-surface-border/60 hover:border-surface-border focus:border-accent-indigo text-xs text-on-surface rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer transition-all font-mono"
          >
            <option value="all">All Sentiments</option>
            <option value="greed">🟢 Greed</option>
            <option value="neutral">⚪ Neutral</option>
            <option value="fear">🔴 Fear</option>
          </select>

          {/* Tag Filter */}
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="bg-surface-low border border-surface-border/60 hover:border-surface-border focus:border-accent-indigo text-xs text-on-surface rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer transition-all font-mono"
          >
            <option value="all">All Tags</option>
            <option value="Discipline">Discipline</option>
            <option value="Calm">Calm</option>
            <option value="Greed">Greed State</option>
            <option value="Fear">Fear State</option>
          </select>
        </div>
      </div>

      {/* Main Journal Feeds */}
      <div className="flex flex-col gap-4">
        {localJournals.map((journal) => {
          const currentId = journal._id || journal.id;
          const currentTag =
            journal.tags && journal.tags[0] ? journal.tags[0] : "Discipline";

          return (
            <div
              key={currentId}
              className="glass-card p-6 relative group overflow-hidden transition-all duration-200 border-l-[6px] hover:border-l-[8px]"
              style={{
                borderLeftColor:
                  currentTag === "Discipline"
                    ? "#10B981"
                    : currentTag === "Greed"
                      ? "#F59E0B"
                      : currentTag === "Fear"
                        ? "#EF4444"
                        : "#6366F1",
              }}
            >
              {/* Actions panel absolutely positioned on hover */}
              <div className="absolute right-4 top-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button
                  onClick={() => handleEditClick(journal)}
                  className="text-on-variant hover:text-accent-indigo p-1.5 hover:bg-surface-low rounded cursor-pointer transition-colors"
                  title="Edit Journal Entry"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => requestDelete(currentId, journal.date)}
                  className="text-on-variant hover:text-fear p-1.5 hover:bg-surface-low rounded cursor-pointer transition-colors"
                  title="Delete Entry"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6 md:items-start">
                {/* Meta Column */}
                <div className="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start gap-4 md:gap-5 pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-surface-border/40 md:pr-6 md:w-44 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-accent-indigo" />
                    <span className="font-mono text-xs font-semibold text-on-heading">
                      {journal.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-on-variant uppercase tracking-wider">
                        Market Mood
                      </span>
                      <span
                        className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5 ${
                          journal.marketSentiment === "greed"
                            ? "text-[#f59e0b]"
                            : journal.marketSentiment === "fear"
                              ? "text-[#ef4444]"
                              : "text-on-heading"
                        }`}
                      >
                        {journal.marketSentiment === "greed"
                          ? "🐂 Greed"
                          : journal.marketSentiment === "fear"
                            ? "🐻 Fear"
                            : "⚖️ Neutral"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4 md:w-full">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-on-variant uppercase tracking-wider">
                        Stress
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          journal.stressLevel > 6
                            ? "text-fear"
                            : "text-on-heading"
                        }`}
                      >
                        {journal.stressLevel}/10
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-on-variant uppercase tracking-wider">
                        Focus
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          journal.focusLevel > 7
                            ? "text-discipline"
                            : "text-on-heading"
                        }`}
                      >
                        {journal.focusLevel}/10
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Column */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="text-[14px] leading-relaxed text-on-surface italic font-inter pr-6">
                    "{journal.thoughts}"
                  </div>

                  {journal.biasesChecked &&
                    journal.biasesChecked.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-auto">
                        <span className="text-[10px] font-medium text-on-variant uppercase self-center mr-2">
                          Aligned Defenses:
                        </span>
                        {journal.biasesChecked.map((bias, i) => (
                          <div
                            key={i}
                            className="bg-accent-indigo/5 border border-accent-indigo/10 text-accent-indigo rounded-[4px] px-2.5 py-0.5 text-[11px] font-medium"
                          >
                            {bias}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Premium Pagination controls banner */}
        {totalPages > 1 && (
          <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-low/10 mt-2">
            <span className="text-xs text-on-variant font-mono">
              Showing {startIndex + 1}-{endIndex} of {totalItems} Logs
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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

        {/* Case 1: Database entirely empty */}
        {globalJournals.length === 0 && (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center text-on-variant/50 border-dashed">
            <BookOpen size={40} className="mb-4 opacity-30" />
            <h3 className="font-semibold text-on-heading text-base mb-1">
              No journal entries logged yet
            </h3>
            <p className="text-sm mb-4 max-w-xs">
              Start tracking your psychology to unlock behavioral insights.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="btn-secondary py-2 text-xs cursor-pointer"
            >
              Add First Log
            </button>
          </div>
        )}

        {/* Case 2: Matching results empty due to search/filters */}
        {globalJournals.length > 0 && localJournals.length === 0 && (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center text-on-variant/50 animate-fade-in">
            <Search size={40} className="mb-4 opacity-30" />
            <h3 className="font-semibold text-on-heading text-base mb-1">
              No matching journal entries
            </h3>
            <p className="text-sm mb-4 max-w-xs">
              No written records matched your search term or chosen sentiment
              filter tags.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterSentiment("all");
                setFilterTag("all");
              }}
              className="btn-secondary py-2 px-6 text-xs uppercase tracking-wide font-semibold cursor-pointer animate-fade-in"
            >
              Clear Search Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
