import React from "react";
import {
  Plus,
  Calendar,
  BookOpen,
  Smile,
  Shield,
  Flame,
  PlusCircle,
} from "lucide-react";

export default function DailyJournal({ journals, setJournals }) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [formData, setFormData] = React.useState({
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now().toString(),
      date: formData.date,
      marketSentiment: formData.marketSentiment,
      stressLevel: parseInt(formData.stressLevel),
      focusLevel: parseInt(formData.focusLevel),
      thoughts: formData.thoughts,
      tags: [formData.tag],
      biasesChecked: formData.biases,
    };
    setJournals([newEntry, ...journals]);
    setIsAdding(false);
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

  return (
    <div className="flex flex-col gap-6 h-full animate-fade-in">
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
            className="btn-primary flex items-center gap-2 py-2.5"
          >
            <Plus size={16} /> Log Today's Audit
          </button>
        )}
      </div>

      {/* Form to add entry */}
      {isAdding && (
        <div className="glass-card p-6 md:p-8 w-full animate-slide-up">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-surface-border">
            <h2 className="font-semibold text-lg text-on-heading font-sora">
              New Psychological Audit
            </h2>
            <button
              onClick={() => setIsAdding(false)}
              className="text-xs text-on-variant hover:text-on-heading underline"
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

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-on-variant uppercase tracking-wider">
                  Dominant Market Sentiment
                </label>
                <div className="grid grid-cols-3 gap-3 mt-1">
                  {["Fear", "Neutral", "Greed"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          marketSentiment: s.toLowerCase(),
                        })
                      }
                      className={`px-3 py-2.5 text-xs font-semibold rounded-[8px] border transition-all duration-200 ${
                        formData.marketSentiment === s.toLowerCase()
                          ? "bg-accent-indigo/10 border-accent-indigo text-on-heading font-bold"
                          : "border-surface-border hover:bg-surface-low text-on-variant"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-on-variant uppercase tracking-wider flex justify-between">
                    Stress Level <span>{formData.stressLevel}/10</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.stressLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, stressLevel: e.target.value })
                    }
                    className="accent-accent-indigo h-1.5 bg-surface-lowest rounded-lg cursor-pointer mt-2"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-on-variant uppercase tracking-wider flex justify-between">
                    Focus Level <span>{formData.focusLevel}/10</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.focusLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, focusLevel: e.target.value })
                    }
                    className="accent-discipline h-1.5 bg-surface-lowest rounded-lg cursor-pointer mt-2"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-on-variant uppercase tracking-wider">
                  State Label Tag
                </label>
                <select
                  value={formData.tag}
                  onChange={(e) =>
                    setFormData({ ...formData, tag: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="Discipline">Discipline (Optimal)</option>
                  <option value="Calm">Calm (Neutral)</option>
                  <option value="Fear">Fear (Triggered)</option>
                  <option value="Greed">Greed (Overextended)</option>
                </select>
              </div>
            </div>

            {/* Right Col: Content & Biases */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-on-variant uppercase tracking-wider">
                  Introspective Stream (Thoughts)
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your mindset today, did you feel urges to overtrade? How does the portfolio drawdown make you feel?"
                  value={formData.thoughts}
                  onChange={(e) =>
                    setFormData({ ...formData, thoughts: e.target.value })
                  }
                  className="input-field resize-none text-sm leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-on-variant uppercase tracking-wider">
                  Biases Checked / Defended
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {commonBiases.map((bias) => {
                    const isSelected = formData.biases.includes(bias);
                    return (
                      <button
                        key={bias}
                        type="button"
                        onClick={() => handleBiasToggle(bias)}
                        className={`px-3 py-1.5 rounded-[6px] text-xs border transition-all ${
                          isSelected
                            ? "bg-discipline/10 border-discipline text-discipline font-medium"
                            : "border-surface-border text-on-variant hover:border-on-variant"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}
                        {bias}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2 mt-auto">
                <button
                  type="submit"
                  className="btn-primary w-full md:w-auto font-sora tracking-wide text-sm py-3 px-8"
                >
                  Publish Audit Log
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Past entries timeline / feed */}
      <div className="grid grid-cols-1 gap-6">
        {journals.map((journal) => (
          <div
            key={journal.id}
            className="glass-card p-6 hover:border-surface-border/80 transition-all duration-200 relative overflow-hidden group"
          >
            <div
              className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                journal.tags[0] === "Discipline"
                  ? "bg-discipline"
                  : journal.tags[0] === "Greed"
                    ? "bg-greed"
                    : journal.tags[0] === "Fear"
                      ? "bg-fear"
                      : "bg-calm"
              }`}
            ></div>

            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Side Meta Column */}
              <div className="w-full lg:w-48 shrink-0 flex flex-col gap-3 border-b lg:border-b-0 lg:border-r border-surface-border/40 pb-4 lg:pb-0 lg:pr-6">
                <div className="flex items-center gap-2 text-on-variant">
                  <Calendar size={14} />
                  <span className="text-xs font-mono font-medium">
                    {journal.date}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap lg:flex-col lg:items-start">
                  <span
                    className={`badge badge-${journal.tags[0].toLowerCase()} border border-current/10`}
                  >
                    {journal.tags[0]}
                  </span>
                  <span className="text-[11px] text-on-variant">
                    Sentiment:{" "}
                    <span className="text-on-heading font-medium capitalize">
                      {journal.marketSentiment}
                    </span>
                  </span>
                </div>

                <div className="flex gap-4 mt-1">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-on-variant uppercase tracking-wider">
                      Stress
                    </span>
                    <span
                      className={`text-sm font-semibold ${journal.stressLevel > 6 ? "text-fear" : "text-on-heading"}`}
                    >
                      {journal.stressLevel}/10
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-on-variant uppercase tracking-wider">
                      Focus
                    </span>
                    <span
                      className={`text-sm font-semibold ${journal.focusLevel > 7 ? "text-discipline" : "text-on-heading"}`}
                    >
                      {journal.focusLevel}/10
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Column */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="text-[14px] leading-relaxed text-on-surface italic font-inter">
                  "{journal.thoughts}"
                </div>

                {journal.biasesChecked && journal.biasesChecked.length > 0 && (
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
        ))}

        {journals.length === 0 && (
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
              className="btn-secondary py-2 text-xs"
            >
              Add First Log
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
