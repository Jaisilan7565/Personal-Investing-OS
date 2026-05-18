import React, { useState, useEffect, useRef } from "react";
import {
  GraduationCap,
  Sparkles,
  Trophy,
  BrainCircuit,
  Play,
  PlaySquare,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  HelpCircle,
  FolderSync,
  Volume2,
  VolumeX,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  FileDown,
  Activity,
  HeartPulse,
  TrendingUp,
  BarChart2,
} from "lucide-react";
import { learningService } from "../../services/learningService";
import { useToast } from "../../hooks/useToast";
import { useAudioPlayer } from "../../context/AudioPlayerContext";

export default function LearningCenter() {
  const toast = useToast();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Consume Global Audio Player Narration & Playback Track state
  const {
    activeLesson,
    setActiveLesson,
    currentSlide,
    setCurrentSlide,
    isPlaying,
    setIsPlaying,
    isMuted,
    setIsMuted,
    speechActive,
    handleNextSlide,
    handlePrevSlide,
    togglePlay,
    toggleMute,
    selectLesson,
    stopSpeech
  } = useAudioPlayer();

  // Quiz States
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  // Syncing / Download States
  const [syncing, setSyncing] = useState(false);

  // Sub-tab Navigation Selection
  const [activeTab, setActiveTab] = useState("player"); // "player" | "tracker" | "curriculum" | "creator"

  // Dynamic Custom Curriculum Creator Form State
  const [customTopic, setCustomTopic] = useState("");
  const [customCategory, setCustomCategory] = useState("Custom Electives");
  const [customFocalPoints, setCustomFocalPoints] = useState("");

  // Expandable Curriculum Category States
  const [expandedCategories, setExpandedCategories] = useState({
    foundations: true,
    risk: true,
    psychology: true,
    macro: true,
    custom: true,
  });

  const CURRICULUM_CATEGORIES = [
    {
      id: "foundations",
      name: "Investing Foundations",
      icon: BookOpen,
      color: "text-[#6366F1]",
      topics: ["Fundamental Analysis", "Technical Analysis"],
      description: "Master baseline charting, balance sheet auditing, and cash flows."
    },
    {
      id: "risk",
      name: "Risk Control & Sizing",
      icon: Activity,
      color: "text-green-500",
      topics: ["Risk Management & Sizing", "Portfolio Diversification"],
      description: "Secure mathematical margins of safety and optimal sizing formulas."
    },
    {
      id: "psychology",
      name: "Investor Psychology & Biases",
      icon: BrainCircuit,
      color: "text-red-400",
      topics: ["Market Psychology & Biases"],
      description: "Dampen FOMO, revenge cycles, loss aversion, and cortisol stress."
    },
    {
      id: "macro",
      name: "Macro Cycles & Execution",
      icon: Sparkles,
      color: "text-yellow-500",
      topics: ["Macroeconomics & Cycles"],
      description: "Navigate global liquidity shifts, interest rates, and inflation pivots."
    },
    {
      id: "custom",
      name: "Custom Electives & Custom Studies",
      icon: Sparkles,
      color: "text-purple-400",
      topics: [], // Dynamically populated
      description: "Explore on-demand AI generated subject tracks created by you."
    }
  ];

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Get dynamic smart recommendation guidance based on actual behavioral logs
  const getSmartGuidance = () => {
    if (!workspace?.behavioralThreats) return null;
    const { fomoScore, revengeScore, overconfidenceScore, lossAversionScore, stressScore } = workspace.behavioralThreats;
    const threats = [
      { name: "FOMO / Chasing Trades", score: fomoScore, rec: "Risk Management & Sizing", reason: "to force strict position caps and risk rules." },
      { name: "Revenge Trading Cycles", score: revengeScore, rec: "Market Psychology & Biases", reason: "to master emotional cooldown limits." },
      { name: "Overconfidence Bias", score: overconfidenceScore, rec: "Portfolio Diversification", reason: "to spread capital and limit individual exposure risks." },
      { name: "Loss Aversion Bias", score: lossAversionScore, rec: "Risk Management & Sizing", reason: "to establish automated, unemotional stop-loss targets." },
      { name: "Cortisol Stress Index", score: stressScore, rec: "Market Psychology & Biases", reason: "to implement behavioral checks and risk reduction parameters." }
    ];
    
    // Find highest score threat
    const highestThreat = threats.reduce((prev, current) => (prev.score > current.score) ? prev : current);
    
    if (highestThreat.score >= 30) {
      return {
        threatName: highestThreat.name,
        score: highestThreat.score,
        recommendedTopic: highestThreat.rec,
        reason: highestThreat.reason,
        severity: highestThreat.score >= 45 ? "critical" : "moderate"
      };
    }
    return {
      threatName: "Baseline Retail Risks",
      score: 15,
      recommendedTopic: "Fundamental Analysis",
      reason: "to set up a solid baseline analysis foundation.",
      severity: "low"
    };
  };

  const smartGuidance = getSmartGuidance();

  const fetchWorkspace = async () => {
    setLoading(true);
    try {
      const res = await learningService.getWorkspace();
      setWorkspace(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load learning workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const handleGenerateLesson = async (topic, forceRegenerate = false, focalPoints = "") => {
    setGenerating(true);
    stopSpeech();
    toast.info(
      forceRegenerate
        ? `AI is purging database cache and re-compiling personalized slides for: "${topic}"...`
        : `AI is analyzing psychological patterns and generating personalized study slides for: "${topic}"...`
    );
    try {
      const res = await learningService.generateLesson(topic, forceRegenerate, focalPoints);
      setActiveLesson(res.data);
      setSelectedTopic(topic);
      setCurrentSlide(0);
      setIsPlaying(false);
      setQuizStarted(false);
      setSelectedOption(null);
      setShowExplanation(false);
      setScore(0);
      toast.success(
        forceRegenerate
          ? "AI lesson successfully re-compiled from scratch!"
          : "AI Adaptive Lesson compiled successfully!"
      );
      fetchWorkspace(); // Refresh progress lists
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate AI lesson. Check API key settings.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectCachedLesson = async (topic) => {
    setLoading(true);
    stopSpeech();
    try {
      const res = await learningService.getLesson(topic);
      setActiveLesson(res.data);
      setSelectedTopic(topic);
      setCurrentSlide(0);
      setIsPlaying(false);
      setQuizStarted(false);
      setSelectedOption(null);
      setShowExplanation(false);
      setScore(0);
      toast.success("Adaptive Lesson loaded successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load generated lesson.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualStatusUpdate = async (topic, status) => {
    try {
      await learningService.updateProgress(topic, status);
      fetchWorkspace();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update topic status.");
    }
  };

  // Google Drive Cloud Sync + Local Markdown direct downloader
  const handleSyncAndDownload = async () => {
    if (!activeLesson) return;
    setSyncing(true);
    toast.info("Compiling physical Markdown Notebook and backing up to cloud folder...");
    try {
      const res = await learningService.syncDrive(activeLesson.topic);
      toast.success("Successfully synchronized and uploaded to Google Drive folder!");
      
      // Update local lesson structure with mock URLs
      setActiveLesson((prev) => ({
        ...prev,
        googleDriveFileId: res.data.fileId,
        googleDriveFileUrl: res.data.url,
      }));

      // Trigger automatic browser download of beautifully compiled Markdown workbook
      if (res.data.markdown) {
        const element = document.createElement("a");
        const file = new Blob([res.data.markdown], { type: "text/markdown" });
        element.href = URL.createObjectURL(file);
        element.download = res.data.fileName || "investing_os_study_notebook.md";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success("Localized Markdown Notebook exported and downloaded onto desktop!");
      }

      fetchWorkspace();
    } catch (err) {
      console.error(err);
      toast.error("Cloud synchronization and notebook download failed.");
    } finally {
      setSyncing(false);
    }
  };



  const handleToggleNarration = () => {
    setIsPlaying(!isPlaying);
  };

  // QUIZ ENGINE MECHANICS
  const handleAnswerSubmit = (optionIdx) => {
    if (showExplanation) return;
    setSelectedOption(optionIdx);
    setShowExplanation(true);

    const isCorrect = optionIdx === activeLesson.contentJson.quiz[currentQuestion].correctOptionIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      toast.success("Splendid! Correct Answer.");
    } else {
      toast.error("Incorrect. Read the behavioral explanation carefully.");
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);

    if (currentQuestion < activeLesson.contentJson.quiz.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Quiz completed! Award mastery status
      const passed = score >= 2; // Pass criteria
      if (passed) {
        handleManualStatusUpdate(activeLesson.topic, "mastered");
        toast.success(`Congratulations! You passed the quiz (${score}/${activeLesson.contentJson.quiz.length}) and mastered this topic! Streak +1.`);
      } else {
        toast.warning(`Quiz Completed (${score}/${activeLesson.contentJson.quiz.length}). Review the slides and try again to unlock mastery.`);
      }
      setQuizStarted(false);
      setCurrentQuestion(0);
    }
  };

  // Colored progress bars for psychological threats
  const getProgressColor = (score) => {
    if (score >= 45) return "bg-red-500";
    if (score >= 25) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getThreatLabel = (score) => {
    if (score >= 45) return "CRITICAL THREAT";
    if (score >= 25) return "MODERATE RISK";
    return "STABLE / HEDGED";
  };

  return (
    <div className="flex flex-col gap-8 w-full pb-16">
      {/* Dynamic Workspace Seeding Loading Screen */}
      {(loading || generating) && (
        <div className="fixed inset-0 bg-surface/90 backdrop-blur-md z-50 flex items-center justify-center flex-col gap-4">
          <div className="w-12 h-12 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-on-heading uppercase tracking-widest font-mono">
            {generating ? "AI Mentor Compiling Curriculum..." : "Synchronizing Investing OS Academy..."}
          </span>
          <span className="text-xs text-on-variant px-6 text-center max-w-sm">
            {generating ? "Gemini is building customized slide visual schemas, TTS scripts, and interactive comprehension quizzes..." : "Fetching active user progress matrix..."}
          </span>
        </div>
      )}

      {/* Hero Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-indigo/20 via-accent-indigo/5 to-transparent border border-surface-border p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="text-[#6366F1]" size={28} />
            <h1 className="font-sora font-extrabold text-2xl md:text-3xl text-on-heading tracking-tight">
              Investing OS Adaptive Academy
            </h1>
          </div>
          <p className="text-xs md:text-sm text-on-variant max-w-2xl">
            A self-evolving educational terminal that audits your daily journals and investment logs to recommend, generate, and narrate personalized curriculum courses.
          </p>
        </div>

        {workspace?.state && (
          <div className="flex w-full sm:w-auto justify-around sm:justify-start gap-4 shrink-0 bg-surface-low border border-surface-border p-4 rounded-xl shadow-lg z-10">
            <div className="flex-1 sm:flex-initial flex flex-col items-center px-3 border-r border-surface-border/50 whitespace-nowrap">
              <Trophy size={20} className="text-yellow-500 mb-1" />
              <span className="text-[10px] text-on-variant font-bold uppercase tracking-wider">Level Tier</span>
              <span className="text-sm font-extrabold text-on-heading">{workspace.state.currentLevel}</span>
            </div>
            <div className="flex-1 sm:flex-initial flex flex-col items-center px-3 whitespace-nowrap">
              <BrainCircuit size={20} className="text-[#6366F1] mb-1 animate-pulse" />
              <span className="text-[10px] text-on-variant font-bold uppercase tracking-wider">Active Streak</span>
              <span className="text-sm font-extrabold text-on-heading">{workspace.state.streak} Days</span>
            </div>
          </div>
        )}
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="grid grid-cols-2 md:flex border border-surface-border/80 bg-surface-low/30 backdrop-blur p-1 rounded-xl gap-1 select-none w-full max-w-5xl mx-auto shadow-md">
        <button
          onClick={() => setActiveTab("player")}
          className={`flex-1 py-3 px-2 rounded-lg font-sora font-extrabold text-[10px] sm:text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "player"
              ? "bg-[#6366F1] text-white shadow-lg shadow-indigo-500/15"
              : "text-on-variant hover:text-on-heading hover:bg-surface-low/50"
          }`}
        >
          <PlaySquare size={14} className={activeTab === "player" ? "animate-pulse" : ""} />
          Academy Player
        </button>

        <button
          onClick={() => setActiveTab("tracker")}
          className={`flex-1 py-3 px-2 rounded-lg font-sora font-extrabold text-[10px] sm:text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "tracker"
              ? "bg-[#6366F1] text-white shadow-lg shadow-indigo-500/15"
              : "text-on-variant hover:text-on-heading hover:bg-surface-low/50"
          }`}
        >
          <Activity size={14} className={activeTab === "tracker" ? "animate-pulse" : ""} />
          Learning Tracker
        </button>

        <button
          onClick={() => setActiveTab("curriculum")}
          className={`flex-1 py-3 px-2 rounded-lg font-sora font-extrabold text-[10px] sm:text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "curriculum"
              ? "bg-[#6366F1] text-white shadow-lg shadow-indigo-500/15"
              : "text-on-variant hover:text-on-heading hover:bg-surface-low/50"
          }`}
        >
          <BookOpen size={14} />
          Investing OS Curriculum
        </button>

        <button
          onClick={() => setActiveTab("creator")}
          className={`flex-1 py-3 px-2 rounded-lg font-sora font-extrabold text-[10px] sm:text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "creator"
              ? "bg-[#6366F1] text-white shadow-lg shadow-indigo-500/15"
              : "text-on-variant hover:text-on-heading hover:bg-surface-low/50"
          }`}
        >
          <Sparkles size={14} className={activeTab === "creator" ? "text-yellow-400" : ""} />
          Curriculum Creator
        </button>
      </div>

      {/* TAB 1: ACADEMY PLAYER */}
      {activeTab === "player" && (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
          {activeLesson ? (
            <div className="flex flex-col gap-8 w-full">
              {/* Premium Glass Video/Slide player */}
              <div className="glass-card border border-surface-border/80 rounded-2xl overflow-hidden shadow-2xl relative bg-gradient-to-b from-surface-low/50 to-surface-lowest">
                {/* Visual Presenter Screen */}
                <div className="relative min-h-[290px] md:h-[340px] h-auto w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-surface-lowest overflow-y-auto border-b border-surface-border/40 select-none">
                  {/* Decorative Glowing Elements */}
                  <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#6366F1]/5 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-accent-indigo/5 rounded-full blur-3xl animate-pulse"></div>

                  <div className="relative z-10 flex flex-col items-center text-center max-w-xl gap-3 sm:gap-4 w-full">
                    {/* Visual Mock Recommendation Graphic */}
                    <div className="py-1.5 px-3 bg-surface-low/80 backdrop-blur border border-surface-border rounded-xl shadow-xl flex items-center gap-2 max-w-full animate-in slide-in-from-bottom-4 duration-300">
                      <BrainCircuit size={16} className="text-[#6366F1] shrink-0" />
                      <span className="text-[9px] sm:text-xs text-on-heading/85 leading-relaxed font-semibold uppercase tracking-wider font-mono text-left break-words">
                        Visual Mock: {activeLesson.contentJson.slides[currentSlide]?.visualDescription}
                      </span>
                    </div>

                    <h2 className="font-sora font-extrabold text-base sm:text-xl md:text-2xl text-on-heading tracking-tight animate-in fade-in duration-300 break-words w-full">
                      {activeLesson.contentJson.slides[currentSlide]?.title}
                    </h2>

                    <div className="text-xs sm:text-sm md:text-base text-on-heading/90 leading-relaxed font-medium space-y-2 whitespace-pre-line animate-in fade-in duration-500 max-w-full break-words">
                      {activeLesson.contentJson.slides[currentSlide]?.text}
                    </div>

                    {/* Speech active pulsating equalizer */}
                    {speechActive && (
                      <div className="flex items-center gap-1 mt-2 h-6 animate-pulse">
                        <span className="text-[8px] font-bold text-accent-indigo uppercase tracking-wider mr-2 font-mono">Narrator Active</span>
                        <div className="w-[3px] h-3 bg-accent-indigo rounded animate-bounce [animation-delay:0.1s]"></div>
                        <div className="w-[3px] h-5 bg-[#6366F1] rounded animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-[3px] h-4 bg-[#6366F1] rounded animate-bounce [animation-delay:0.3s]"></div>
                        <div className="w-[3px] h-2 bg-accent-indigo rounded animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Player Navigation & Control Console */}
                <div className="px-4 py-4 md:px-6 md:py-4 flex flex-col gap-4 bg-surface-low/80 border-t border-surface-border/40">
                  {/* Progress Line bar */}
                  <div className="w-full flex items-center gap-3">
                    <span className="text-[10px] font-mono text-on-variant shrink-0">
                      Slide {currentSlide + 1} / {activeLesson.contentJson.slides.length}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-surface-border overflow-hidden">
                      <div
                        className="h-full bg-[#6366F1] transition-all duration-300 rounded-full"
                        style={{
                          width: `${((currentSlide + 1) / activeLesson.contentJson.slides.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Primary Controller Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full select-none">
                    <div className="flex items-center gap-2 justify-center w-full sm:w-auto">
                      <button
                        onClick={handlePrevSlide}
                        disabled={currentSlide === 0}
                        className="p-2.5 bg-surface-lowest hover:bg-surface-high border border-surface-border/80 text-on-heading rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        title="Previous Slide"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {/* Play Slide TTS Narrator audio */}
                      <button
                        onClick={handleToggleNarration}
                        className={`py-2 px-4 border rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          speechActive
                            ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                            : "bg-[#6366F1]/10 border-[#6366F1]/20 text-[#6366F1] hover:bg-[#6366F1]/20"
                        }`}
                      >
                        {speechActive ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider">
                          {speechActive ? "Mute" : "Narrate"}
                        </span>
                      </button>

                      <button
                        onClick={handleNextSlide}
                        disabled={currentSlide === activeLesson.contentJson.slides.length - 1}
                        className="p-2.5 bg-surface-lowest hover:bg-surface-high border border-surface-border/80 text-on-heading rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        title="Next Slide"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="w-full sm:w-auto flex items-center justify-center gap-2">
                      {activeLesson.googleDriveFileUrl ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={handleSyncAndDownload}
                            className="flex-1 sm:flex-none py-2 px-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-500 font-bold rounded-xl text-xs tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <FileDown size={14} />
                            <span>Redownload</span>
                          </button>
                          <a
                            href={activeLesson.googleDriveFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 sm:flex-none py-2 px-3.5 bg-green-500 hover:bg-green-500/90 text-white font-bold rounded-xl text-xs tracking-wide flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-green-500/10"
                          >
                            <CheckCircle2 size={14} />
                            Drive Folder
                          </a>
                        </div>
                      ) : (
                        <button
                          onClick={handleSyncAndDownload}
                          disabled={syncing}
                          className="w-full sm:w-auto py-2 px-4 bg-green-500 hover:bg-green-500/90 text-white font-bold rounded-xl text-xs tracking-wide flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-green-500/15"
                        >
                          <FolderSync size={14} />
                          {syncing ? "Backing up..." : "Sync & Export Notebook"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* POST-LESSON INTERACTIVE COMPREHENSION QUIZ */}
              <div className="glass-card p-6 border border-surface-border flex flex-col gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#6366F1]/5 rounded-full blur-2xl"></div>

                <div className="flex justify-between items-center border-b border-surface-border/40 pb-4">
                  <div className="flex items-center gap-2.5">
                     <HelpCircle size={20} className="text-[#6366F1]" />
                    <h3 className="font-sora font-extrabold text-sm text-on-heading">
                      Investing OS Adaptive Academy Comprehension Check
                    </h3>
                  </div>
                  <span className="text-[10px] bg-[#6366F1]/10 text-[#6366F1] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                    Mastery Challenge
                  </span>
                </div>

                {!quizStarted ? (
                  <div className="flex flex-col items-center text-center p-6 gap-4">
                    <GraduationCap size={48} className="text-[#6366F1] animate-bounce" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-on-heading">Verify Topic Comprehension</span>
                      <p className="text-[10px] text-on-variant max-w-sm mt-1 leading-relaxed">
                        Complete the Gemini-crafted adaptive multiple choice quiz below to unlock mastery status for this course. Requires 2/3 correct answers.
                      </p>
                    </div>
                    <button
                      onClick={() => setQuizStarted(true)}
                      className="py-2.5 px-6 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-bold rounded-lg text-xs tracking-wider uppercase transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
                    >
                      Start Validation Challenge
                    </button>
                  </div>
                ) : (
                  /* Comprehension Quiz Overlay Board */
                  <div className="glass-card p-6 border-2 border-[#6366F1]/30 bg-surface-low/80 backdrop-blur shadow-2xl flex flex-col gap-5 w-full scroll-mt-24">
                    <div className="flex justify-between items-center border-b border-surface-border/40 pb-3">
                      <div className="flex items-center gap-2">
                        <HelpCircle size={18} className="text-[#6366F1]" />
                        <h3 className="font-sora font-extrabold text-xs text-on-heading uppercase tracking-wider">
                          Comprehension Verification Check
                        </h3>
                      </div>
                      <span className="text-[9px] bg-[#6366F1]/10 text-[#6366F1] font-extrabold px-2 py-0.5 rounded tracking-wide uppercase font-mono">
                        Question {currentQuestion + 1} of {activeLesson.contentJson.quiz.length}
                      </span>
                    </div>

                    {/* Question Prompt */}
                    <p className="font-sora font-extrabold text-sm md:text-base text-on-heading leading-relaxed">
                      {activeLesson.contentJson.quiz[currentQuestion]?.question}
                    </p>

                    {/* Option Selections */}
                    <div className="flex flex-col gap-2.5">
                      {activeLesson.contentJson.quiz[currentQuestion]?.options.map((option, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrect = idx === activeLesson.contentJson.quiz[currentQuestion].correctOptionIndex;
                        let btnStyle = "bg-surface-lowest border-surface-border text-on-heading hover:bg-surface-low/40 hover:border-surface-border/80";
                        
                        if (selectedOption !== null) {
                           if (isCorrect) {
                            btnStyle = "bg-green-500/10 border-green-500/50 text-green-400";
                          } else if (isSelected) {
                            btnStyle = "bg-red-500/10 border-red-500/50 text-red-400";
                          } else {
                            btnStyle = "bg-surface-lowest/40 border-surface-border/20 text-on-variant/50 cursor-not-allowed";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            disabled={selectedOption !== null}
                            onClick={() => handleAnswerSubmit(idx)}
                            className={`p-3 border rounded-xl font-sora font-semibold text-xs md:text-sm text-left transition-all flex items-center gap-3 cursor-pointer ${btnStyle}`}
                          >
                            <span className="w-5 h-5 rounded-full bg-surface-low border border-surface-border/80 flex items-center justify-center shrink-0 font-bold font-mono text-[9px] uppercase">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Detailed AI Explanation details */}
                    {showExplanation && (
                      <div className="p-4 rounded-xl border border-surface-border bg-surface-low/50 flex flex-col gap-2 animate-in slide-in-from-top-4 duration-300">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#6366F1] font-mono">
                          AI Behavioral Rationale
                        </span>
                        <p className="text-xs md:text-sm text-on-heading/90 leading-relaxed font-medium">
                          {activeLesson.contentJson.quiz[currentQuestion]?.explanation}
                        </p>
                        <button
                          onClick={handleNextQuestion}
                          className="mt-3 py-2 px-4 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider font-mono flex items-center justify-center gap-1 transition-all self-end cursor-pointer"
                        >
                          <span>
                            {currentQuestion === activeLesson.contentJson.quiz.length - 1 ? "Complete Quiz" : "Next Question"}
                          </span>
                          <ArrowRight size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 border border-surface-border flex flex-col items-center justify-center text-center gap-6 bg-gradient-to-b from-[#6366F1]/5 to-transparent w-full">
              <GraduationCap size={64} className="text-on-variant animate-pulse" />
              <div className="flex flex-col gap-1.5">
                <h3 className="font-sora font-extrabold text-sm text-on-heading">
                  No Active Study Session
                </h3>
                <p className="text-xs text-on-variant max-w-sm mt-1 leading-relaxed">
                  Select a course topic from the **Curriculum** tab or use the **Curriculum Creator** to compile a personalized AI-narrated study deck.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LEARNING TRACKER */}
      {activeTab === "tracker" && (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
          {/* Tracker Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Level & Streak Stats Card */}
            <div className="glass-card p-5 border border-surface-border bg-gradient-to-br from-accent-indigo/15 to-transparent rounded-2xl flex flex-col justify-between shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-on-variant font-bold uppercase tracking-wider font-mono">Academy Status</span>
                <Trophy size={18} className="text-yellow-500 animate-pulse" />
              </div>
              <div className="flex flex-col gap-1 mt-4">
                <span className="text-2xl font-extrabold text-on-heading font-sora">
                  {workspace?.state?.currentLevel || "Beginner"}
                </span>
                <span className="text-[10px] text-on-variant">
                  Current Level Tier
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-border/50 flex justify-between items-center text-[10px] text-on-variant">
                <span>Active Learning Streak:</span>
                <span className="font-extrabold text-on-heading font-mono text-[#6366F1]">
                  {workspace?.state?.streak || 0} Days
                </span>
              </div>
            </div>

            {/* Mastered & In-Progress stats */}
            <div className="glass-card p-5 border border-surface-border bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl flex flex-col justify-between shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-on-variant font-bold uppercase tracking-wider font-mono">Mastered Topics</span>
                <CheckCircle2 size={18} className="text-green-500" />
              </div>
              <div className="flex flex-col gap-1 mt-4">
                <span className="text-2xl font-extrabold text-on-heading font-sora">
                  {workspace?.curriculum?.filter((p) => p.status === "mastered").length || 0}
                </span>
                <span className="text-[10px] text-on-variant">
                  Completed & Validated
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-border/50 flex justify-between items-center text-[10px] text-on-variant">
                <span>In-Study Lessons:</span>
                <span className="font-extrabold text-yellow-500 font-mono">
                  {workspace?.curriculum?.filter((p) => p.status === "in_progress").length || 0} Topics
                </span>
              </div>
            </div>

            {/* Total Academy Points */}
            <div className="glass-card p-5 border border-surface-border bg-gradient-to-br from-yellow-500/10 to-transparent rounded-2xl flex flex-col justify-between shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-on-variant font-bold uppercase tracking-wider font-mono">Academy Points</span>
                <BrainCircuit size={18} className="text-[#6366F1]" />
              </div>
              <div className="flex flex-col gap-1 mt-4">
                <span className="text-2xl font-extrabold text-on-heading font-sora">
                  {(workspace?.curriculum?.filter((p) => p.status === "mastered").length || 0) * 100 + (workspace?.state?.streak || 0) * 50}
                </span>
                <span className="text-[10px] text-on-variant">
                  Streaks & Masteries Accumulated
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-border/50 flex justify-between items-center text-[10px] text-on-variant">
                <span>Completion Status:</span>
                <span className="font-bold text-on-heading">
                  {Math.round(
                    ((workspace?.curriculum?.filter((p) => p.status === "mastered").length || 0) /
                      Math.max(1, workspace?.curriculum?.length || 8)) *
                      100
                  ) || 0}
                  % Complete
                </span>
              </div>
            </div>
          </div>

          {/* PHASE 5: EMOTIONAL VULNERABILITY AUDIT PANEL */}
          {workspace?.behavioralThreats && (
            <div className="glass-card p-6 border border-surface-border bg-gradient-to-b from-surface-low/30 to-transparent relative overflow-hidden flex flex-col gap-5 shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl animate-pulse"></div>
              
              <div className="flex items-center justify-between border-b border-surface-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-red-500 animate-pulse" />
                  <h2 className="font-sora font-extrabold text-sm text-on-heading uppercase tracking-wider">
                    Behavioral Threat Vulnerability Audit
                  </h2>
                </div>
                <span className="text-[9px] bg-red-500/10 text-red-500 font-extrabold px-2 py-0.5 rounded tracking-wide uppercase font-mono">
                  Live Psychology Audit
                </span>
              </div>

              <p className="text-[11px] text-on-variant leading-relaxed max-w-4xl">
                This matrix is audited dynamically from your trade entries, conviction tags, and journal emotions. High vulnerabilities (&gt;40%) will prioritize specialized trading psychological curriculum topics.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                {/* FOMO */}
                <div className="flex flex-col gap-2 p-3 bg-surface-lowest border border-surface-border/60 rounded-xl">
                  <div className="flex justify-between items-center text-[10px] font-bold text-on-heading uppercase">
                    <span>FOMO Bias</span>
                    <span className={workspace.behavioralThreats.fomoScore >= 45 ? "text-red-400" : workspace.behavioralThreats.fomoScore >= 25 ? "text-yellow-500" : "text-green-500"}>
                      {workspace.behavioralThreats.fomoScore}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
                    <div className={`h-full ${getProgressColor(workspace.behavioralThreats.fomoScore)} rounded-full`} style={{ width: `${workspace.behavioralThreats.fomoScore}%` }}></div>
                  </div>
                  <span className="text-[8px] font-extrabold text-on-variant uppercase font-mono">{getThreatLabel(workspace.behavioralThreats.fomoScore)}</span>
                </div>

                {/* REVENGE TRADING */}
                <div className="flex flex-col gap-2 p-3 bg-surface-lowest border border-surface-border/60 rounded-xl">
                  <div className="flex justify-between items-center text-[10px] font-bold text-on-heading uppercase">
                    <span>Revenge Trades</span>
                    <span className={workspace.behavioralThreats.revengeScore >= 45 ? "text-red-400" : workspace.behavioralThreats.revengeScore >= 25 ? "text-yellow-500" : "text-green-500"}>
                      {workspace.behavioralThreats.revengeScore}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
                    <div className={`h-full ${getProgressColor(workspace.behavioralThreats.revengeScore)} rounded-full`} style={{ width: `${workspace.behavioralThreats.revengeScore}%` }}></div>
                  </div>
                  <span className="text-[8px] font-extrabold text-on-variant uppercase font-mono">{getThreatLabel(workspace.behavioralThreats.revengeScore)}</span>
                </div>

                {/* OVERCONFIDENCE */}
                <div className="flex flex-col gap-2 p-3 bg-surface-lowest border border-surface-border/60 rounded-xl">
                  <div className="flex justify-between items-center text-[10px] font-bold text-on-heading uppercase">
                    <span>Overconfidence</span>
                    <span className={workspace.behavioralThreats.overconfidenceScore >= 45 ? "text-red-400" : workspace.behavioralThreats.overconfidenceScore >= 25 ? "text-yellow-500" : "text-green-500"}>
                      {workspace.behavioralThreats.overconfidenceScore}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
                    <div className={`h-full ${getProgressColor(workspace.behavioralThreats.overconfidenceScore)} rounded-full`} style={{ width: `${workspace.behavioralThreats.overconfidenceScore}%` }}></div>
                  </div>
                  <span className="text-[8px] font-extrabold text-on-variant uppercase font-mono">{getThreatLabel(workspace.behavioralThreats.overconfidenceScore)}</span>
                </div>

                {/* LOSS AVERSION */}
                <div className="flex flex-col gap-2 p-3 bg-surface-lowest border border-surface-border/60 rounded-xl">
                  <div className="flex justify-between items-center text-[10px] font-bold text-on-heading uppercase">
                    <span>Loss Aversion</span>
                    <span className={workspace.behavioralThreats.lossAversionScore >= 45 ? "text-red-400" : workspace.behavioralThreats.lossAversionScore >= 25 ? "text-yellow-500" : "text-green-500"}>
                      {workspace.behavioralThreats.lossAversionScore}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
                    <div className={`h-full ${getProgressColor(workspace.behavioralThreats.lossAversionScore)} rounded-full`} style={{ width: `${workspace.behavioralThreats.lossAversionScore}%` }}></div>
                  </div>
                  <span className="text-[8px] font-extrabold text-on-variant uppercase font-mono">{getThreatLabel(workspace.behavioralThreats.lossAversionScore)}</span>
                </div>

                {/* CORTISOL STRESS */}
                <div className="flex flex-col gap-2 p-3 bg-surface-lowest border border-surface-border/60 rounded-xl">
                  <div className="flex justify-between items-center text-[10px] font-bold text-on-heading uppercase">
                    <span>Cortisol Stress</span>
                    <span className={workspace.behavioralThreats.stressScore >= 45 ? "text-red-400" : workspace.behavioralThreats.stressScore >= 25 ? "text-yellow-500" : "text-green-500"}>
                      {workspace.behavioralThreats.stressScore}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
                    <div className={`h-full ${getProgressColor(workspace.behavioralThreats.stressScore)} rounded-full`} style={{ width: `${workspace.behavioralThreats.stressScore}%` }}></div>
                  </div>
                  <span className="text-[8px] font-extrabold text-on-variant uppercase font-mono">{getThreatLabel(workspace.behavioralThreats.stressScore)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Investing OS Smart Recommendation Wizard */}
          {smartGuidance && (
            <div className={`glass-card p-5 border flex flex-col gap-4 relative overflow-hidden shadow-lg bg-gradient-to-b ${
              smartGuidance.severity === "critical"
                ? "from-red-500/10 via-red-500/5 to-transparent border-red-500/30"
                : smartGuidance.severity === "moderate"
                ? "from-yellow-500/10 via-yellow-500/5 to-transparent border-yellow-500/30"
                : "from-[#6366F1]/10 via-[#6366F1]/5 to-transparent border-[#6366F1]/30"
            }`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-surface-lowest/10 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className={smartGuidance.severity === "critical" ? "text-red-400 animate-bounce" : "text-[#6366F1] animate-bounce"} />
                <h3 className="font-sora font-extrabold text-[10px] text-on-heading uppercase tracking-widest">
                  AI Recommendation Wizard
                </h3>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm font-bold text-on-heading leading-snug">
                  Your highest psychological vulnerability score is: <span className="text-[#6366F1]">{smartGuidance.threatName} ({smartGuidance.score}%)</span>.
                </p>
                <p className="text-xs md:text-sm text-on-heading/90 leading-relaxed font-medium">
                  We highly recommend studying: <span className="font-bold text-on-heading">"{smartGuidance.recommendedTopic}"</span> {smartGuidance.reason}
                </p>
              </div>

              <div className="flex gap-2.5 mt-1 border-t border-surface-border/40 pt-3">
                <button
                  onClick={() => {
                    handleGenerateLesson(smartGuidance.recommendedTopic);
                    setActiveTab("player");
                  }}
                  className="py-1.5 px-3 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-bold rounded text-[9px] uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
                >
                  Generate AI Lesson
                </button>
              </div>
            </div>
          )}

          {/* Mastered Lessons History Log */}
          <div className="glass-card p-6 border border-surface-border bg-surface-low/30 backdrop-blur rounded-2xl flex flex-col gap-4 shadow-lg">
            <h3 className="font-sora font-extrabold text-xs text-on-heading uppercase tracking-wider">
              Completed Academy Masteries
            </h3>
            {workspace?.curriculum?.filter((p) => p.status === "mastered").length === 0 ? (
              <p className="text-[10px] text-on-variant uppercase font-mono tracking-widest italic text-center py-4">
                No verified masteries yet. Finish active lessons and pass quizzes to unlock masteries.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workspace?.curriculum
                  ?.filter((p) => p.status === "mastered")
                  ?.map((prog, idx) => (
                    <div key={idx} className="p-3 bg-surface-lowest border border-surface-border/60 rounded-xl flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-green-500" />
                      <div className="flex flex-col">
                        <span className="font-sora font-bold text-xs text-on-heading">{prog.topic}</span>
                        <span className="text-[8px] font-bold text-green-500 uppercase font-mono tracking-widest mt-0.5">Verified Mastered (Streak +1)</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: INVESTING OS CURRICULUM */}
      {activeTab === "curriculum" && (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
          {/* Curriculum Tracks categorized collapse list */}
          <div className="flex flex-col gap-4">
            <h3 className="font-sora font-extrabold text-xs text-on-heading uppercase tracking-wider mb-1">
              Curriculum Study Categories
            </h3>

            <div className="flex flex-col gap-4">
              {CURRICULUM_CATEGORIES.map((category) => {
                const isExpanded = expandedCategories[category.id];
                
                // Collect and match topics
                let topicsToShow = [...category.topics];
                if (category.id === "custom" && workspace?.customElectives) {
                  topicsToShow = workspace.customElectives;
                }

                return (
                  <div key={category.id} className="glass-card border border-surface-border overflow-hidden transition-all duration-200 shadow-md">
                    {/* Collapsible Category Header bar */}
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full p-4 bg-surface-low/30 hover:bg-surface-low/60 flex items-center justify-between transition-all cursor-pointer text-left border-b border-surface-border/40 select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg bg-surface-lowest border border-surface-border/60 ${category.color}`}>
                          <category.icon size={16} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <h4 className="font-sora font-extrabold text-xs sm:text-sm text-on-heading leading-none">
                            {category.name}
                          </h4>
                          <span className="text-[10px] sm:text-xs text-on-variant">
                            {category.description}
                          </span>
                        </div>
                      </div>
                      <span className="text-on-variant hover:text-on-heading">
                        <ChevronRight
                          size={16}
                          className={`transform transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </span>
                    </button>

                    {/* Expandable Topic progress list */}
                    {isExpanded && (
                      <div className="p-3 bg-surface-lowest/40 divide-y divide-surface-border/30 flex flex-col">
                        {topicsToShow.length === 0 ? (
                          <div className="p-4 text-center text-xs text-on-variant uppercase font-mono tracking-wider italic">
                            No active {category.name.toLowerCase()} yet.
                          </div>
                        ) : (
                          topicsToShow.map((topicName, idx) => {
                            // Find matching progress record
                            const progressRecord = workspace?.curriculum?.find(
                              (p) => p.topic.toLowerCase() === topicName.toLowerCase()
                            );
                            
                            // Determine cache status
                            const isGenerated = workspace?.generatedLessons?.some(
                              (g) => g.topic.toLowerCase() === topicName.toLowerCase()
                            );
                            const status = progressRecord ? progressRecord.status : "todo";

                            return (
                              <div key={idx} className="py-2.5 px-2 flex flex-col sm:flex-row sm:justify-between sm:items-center hover:bg-surface-low/10 transition-all gap-2 sm:gap-4">
                                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                  <span className="font-sora font-bold text-xs sm:text-sm text-on-heading break-words">
                                    {topicName}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {status === "mastered" ? (
                                      <>
                                        <CheckCircle2 size={10} className="text-green-500" />
                                        <span className="text-[8px] sm:text-[9px] text-green-500 uppercase tracking-widest font-mono font-bold">MASTERED</span>
                                      </>
                                    ) : status === "in_progress" ? (
                                      <>
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                                        <span className="text-[8px] sm:text-[9px] text-yellow-500 uppercase tracking-widest font-mono font-bold">IN STUDY</span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="w-0.5 h-0.5 rounded-full bg-surface-border"></span>
                                        <span className="text-[8px] sm:text-[9px] text-green-500 uppercase tracking-widest font-mono font-bold">READY TO STUDY</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 sm:shrink-0 mt-1.5 sm:mt-0 justify-start sm:justify-end">
                                  {isGenerated ? (
                                    <>
                                      <button
                                        onClick={() => {
                                          handleSelectCachedLesson(topicName);
                                          setActiveTab("player");
                                        }}
                                        className="py-1 px-2 bg-accent-indigo/10 hover:bg-accent-indigo/20 border border-accent-indigo/25 text-accent-indigo font-bold rounded text-[8px] uppercase tracking-wider transition-all cursor-pointer"
                                      >
                                        Load
                                      </button>
                                      
                                      {/* Force clean and generate lesson again option */}
                                      <button
                                        onClick={() => {
                                          handleGenerateLesson(topicName, true);
                                          setActiveTab("player");
                                        }}
                                        title="Force Purge Cache & Re-Compile Lesson from Scratch"
                                        className="py-1 px-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 font-bold rounded text-[8px] uppercase tracking-wider transition-all cursor-pointer"
                                      >
                                        Clean Gen
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        handleGenerateLesson(topicName, false);
                                        setActiveTab("player");
                                      }}
                                      className="py-1 px-2 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-bold rounded text-[8px] uppercase tracking-wider transition-all cursor-pointer"
                                    >
                                      AI Gen
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}      {/* TAB 4: CURRICULUM CREATOR */}
      {activeTab === "creator" && (
        <div className="max-w-xl mx-auto w-full animate-in fade-in duration-300 flex flex-col gap-6">
          <div className="glass-card p-8 border border-surface-border bg-gradient-to-b from-[#6366F1]/5 via-transparent to-transparent flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl animate-pulse"></div>
            <div className="flex items-center gap-3 border-b border-surface-border/40 pb-4">
              <div className="p-2 bg-[#6366F1]/10 rounded-lg text-[#6366F1]">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-sora font-extrabold text-sm text-on-heading">
                  AI Curriculum Custom Creator
                </h3>
                <p className="text-[10px] text-on-variant mt-0.5 leading-relaxed">
                  Compile bespoke investing tracks and on-demand behavioral finance studies tailored by Gemini.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Custom Topic Input */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold text-on-heading uppercase tracking-wider font-mono">
                  Bespoke Topic Name
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. Volume Profile Analysis, Option Spreads, Crypto Orderflow..."
                  className="input-field w-full font-sora font-bold text-xs animate-none"
                />
              </div>

              {/* Custom Category Dropdown */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold text-on-heading uppercase tracking-wider font-mono">
                  Curriculum Placement Category
                </label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="input-field w-full font-sora font-bold text-xs bg-surface-low border border-surface-border cursor-pointer select-none"
                >
                  <option value="Custom Electives">Custom Electives (Default)</option>
                  <option value="Investing Foundations">Investing Foundations</option>
                  <option value="Risk Control & Sizing">Risk Control & Sizing</option>
                  <option value="Investor Psychology & Biases">Investor Psychology & Biases</option>
                  <option value="Macro Cycles & Execution">Macro Cycles & Execution</option>
                </select>
              </div>

              {/* Custom Context focal points */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold text-on-heading uppercase tracking-wider font-mono">
                  Bespoke Study Guidelines & Focus Areas
                </label>
                <textarea
                  value={customFocalPoints}
                  onChange={(e) => setCustomFocalPoints(e.target.value)}
                  placeholder="Optional: Instruct the AI on specific details to focus on (e.g. 'explain iron condors and implied volatility', 'include pitfalls of trading volatile earnings announcements')..."
                  rows={4}
                  className="input-field w-full text-xs leading-relaxed font-mono"
                />
              </div>
            </div>

            {/* Submit & Compile Trigger */}
            <button
              disabled={generating || !customTopic.trim()}
              onClick={() => {
                handleGenerateLesson(customTopic, false, customFocalPoints);
                setCustomTopic("");
                setCustomFocalPoints("");
                setActiveTab("player");
              }}
              className="py-3 px-6 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-bold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/15 mt-2"
            >
              <Sparkles size={14} className="animate-pulse" />
              Compile & Launch Bespoke Course
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
