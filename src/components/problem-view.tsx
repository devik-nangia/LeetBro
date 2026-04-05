"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import confetti from "canvas-confetti";
import {
  ArrowRight,
  Binary,
  Boxes,
  CheckCircle2,
  Lightbulb,
  Brain,
  ListOrdered,
  GitBranch,
  Gauge,
  Code2,
  BarChart3,
  Eye,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  Route,
  ShieldAlert,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Circle,
  ExternalLink,
  Activity,
  Youtube,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface QuestionData {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  description: string;
  tags: string[];
  aiContent: {
    hint1: string;
    hint2: string;
    hint3: string;
    approach: string;
    algorithm: string;
    visualize: string | any;
    solutionPython: string;
    solutionJava: string;
    solutionCpp: string;
    complexity?: string;
    implementations?: string;
  } | null;
}

function FadeIn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

interface ExampleIterationStep {
  step: number;
  title: string;
  explanation: string;
  variables: Array<{ name: string; value: string }>;
  visualState: string;
}

interface ExampleIteration {
  name: string;
  dataStructure: "array" | "tree" | "linkedlist" | "string" | "graph" | "matrix" | "other";
  inputExample: string;
  steps: ExampleIterationStep[];
}

interface ComplexityTier {
  title: string;
  summary: string;
  timeComplexity: string;
  spaceComplexity: string;
  tradeoff: string;
}

interface ImplementationTier {
  title: string;
  summary: string;
  timeComplexity: string;
  spaceComplexity: string;
  solutionPython: string;
  solutionJava: string;
  solutionCpp: string;
}

function parseVisualization(visualize: string | object | null | undefined): ExampleIteration | null {
  if (!visualize) return null;
  let parsed = visualize;
  if (typeof visualize === "string" && visualize.trim().startsWith("{")) {
    try {
      parsed = JSON.parse(visualize);
    } catch {
      return null;
    }
  }
  
  if (typeof parsed === "object" && parsed !== null && "steps" in parsed) {
    return parsed as ExampleIteration;
  }
  return null;
}

function IterationVisualizer({
  iteration,
  onRegenerate,
}: {
  iteration: ExampleIteration;
  onRegenerate?: () => void;
}) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setActiveStepIndex(0);
    setIsPlaying(false);
  }, [iteration]);

  // Auto-play: advance step every 2.5s
  useEffect(() => {
    if (!isPlaying) return;
    if (activeStepIndex >= iteration.steps.length - 1) {
      setIsPlaying(false);
      return;
    }
    const t = setTimeout(() => setActiveStepIndex((i) => i + 1), 2500);
    return () => clearTimeout(t);
  }, [isPlaying, activeStepIndex, iteration.steps.length]);

  const activeStep = iteration.steps[activeStepIndex] ?? iteration.steps[0];

  if (!activeStep) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <AlertTriangle className="h-8 w-8 text-medium" />
        <p className="text-sm text-muted-foreground">No example iteration available yet.</p>
        {onRegenerate && (
          <Button size="sm" onClick={onRegenerate} className="bg-leetcode hover:bg-leetcode-dark text-black text-xs">
            Regenerate Visualization
          </Button>
        )}
      </div>
    );
  }

  const totalSteps = iteration.steps.length;
  const progress = ((activeStepIndex + 1) / totalSteps) * 100;

  return (
    <div className="space-y-5">
      {/* Input Banner */}
      <div className="rounded-2xl border border-[#2D2417] bg-gradient-to-r from-[#18120D] to-[#0F1115] px-5 py-5 flex items-center justify-between gap-4">
        <p className="text-base font-bold text-white leading-relaxed font-mono">{iteration.inputExample}</p>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-slate-500 hover:text-leetcode transition-colors"
            title="Regenerate"
          >
            ↺ Regen
          </button>
        )}
      </div>

      {/* Progress bar + controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setIsPlaying(false); setActiveStepIndex(0); }}
              disabled={activeStepIndex === 0 && !isPlaying}
              className="h-7 w-7 rounded-lg border border-[#2E3340] bg-[#151922] text-slate-400 hover:text-white hover:border-[#444] disabled:opacity-30 transition-all flex items-center justify-center text-xs"
              title="Reset"
            >⏮</button>
            <button
              onClick={() => { setIsPlaying(false); setActiveStepIndex((i) => Math.max(0, i - 1)); }}
              disabled={activeStepIndex === 0}
              className="h-7 w-7 rounded-lg border border-[#2E3340] bg-[#151922] text-slate-400 hover:text-white hover:border-[#444] disabled:opacity-30 transition-all flex items-center justify-center text-xs"
              title="Previous"
            >◀</button>
            <button
              onClick={() => setIsPlaying((p) => !p)}
              disabled={activeStepIndex >= totalSteps - 1 && !isPlaying}
              className="h-7 px-3 rounded-lg border border-leetcode/40 bg-leetcode/10 text-leetcode text-xs font-semibold hover:bg-leetcode/20 disabled:opacity-30 transition-all"
            >
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
            <button
              onClick={() => { setIsPlaying(false); setActiveStepIndex((i) => Math.min(totalSteps - 1, i + 1)); }}
              disabled={activeStepIndex >= totalSteps - 1}
              className="h-7 w-7 rounded-lg border border-[#2E3340] bg-[#151922] text-slate-400 hover:text-white hover:border-[#444] disabled:opacity-30 transition-all flex items-center justify-center text-xs"
              title="Next"
            >▶</button>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Step <span className="text-slate-300 font-semibold">{activeStepIndex + 1}</span> / {totalSteps}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-[#1A1F2E] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-leetcode/80 to-leetcode transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Step pills */}
        <div className="flex flex-wrap gap-1.5">
          {iteration.steps.map((step, index) => (
            <button
              key={index}
              onClick={() => { setIsPlaying(false); setActiveStepIndex(index); }}
              className={`h-6 min-w-[24px] px-2 rounded-md text-[11px] font-bold transition-all ${
                index === activeStepIndex
                  ? "bg-leetcode text-black shadow-[0_0_8px_rgba(255,161,22,0.4)]"
                  : index < activeStepIndex
                  ? "bg-[#1E2810] text-easy/70 border border-easy/20"
                  : "bg-[#151922] text-slate-500 border border-[#2E3340] hover:border-slate-500"
              }`}
              title={step.title}
            >
              {step.step}
            </button>
          ))}
        </div>
      </div>

      {/* Active step card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStepIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          className="rounded-2xl border border-leetcode/25 bg-gradient-to-br from-[#15110A] to-[#0D1017] overflow-hidden"
        >
          {/* Step header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-[#1E2030] bg-[#0F1219]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-leetcode text-black text-sm font-bold shadow-[0_0_12px_rgba(255,161,22,0.35)]">
              {activeStep.step}
            </div>
            <h4 className="font-bold text-white text-base">{activeStep.title}</h4>
          </div>

          <div className="p-5 space-y-4">
            {/* Explanation */}
            <div className="rounded-xl bg-[#0A0D14] border border-[#1E2535] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-2">What Happens</p>
              <p className="text-sm leading-6 text-slate-200">{activeStep.explanation}</p>
            </div>

            {/* Visual State */}
            <div className="rounded-xl border border-[#1B3529] bg-[#091510] p-4 overflow-x-auto">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-easy/80 mb-3">Visual State</p>
              <pre className="text-sm font-mono text-slate-200 leading-relaxed whitespace-pre">{activeStep.visualState}</pre>
            </div>

            {/* Variables */}
            {activeStep.variables.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8DA2FF] mb-2">Variable Snapshot</p>
                <div className="flex flex-wrap gap-2">
                  {activeStep.variables.map((v, i) => (
                    <div key={i} className="rounded-lg border border-[#2A3A60] bg-[#0D1325] px-3 py-1.5 flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">{v.name}</span>
                      <span className="text-[10px] text-slate-600">=</span>
                      <span className="text-sm font-bold font-mono text-[#A8BFFF]">{v.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


interface ProblemViewProps {
  slug: string;
}

export function ProblemView({ slug }: ProblemViewProps) {
  const { data: session } = useSession();
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSolved, setIsSolved] = useState(false);
  const [solvingInProgress, setSolvingInProgress] = useState(false);
  const [showTopics, setShowTopics] = useState(false);

  // Hint reveal states
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());

  // Solution language tab
  const [solutionLang, setSolutionLang] = useState<"python" | "java" | "cpp">("python");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Analyze Code feature
  const [userCode, setUserCode] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<any | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [remainingAnalyses, setRemainingAnalyses] = useState<number | null>(null);

  const handleAnalyzeCode = async () => {
    if (!userCode.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalyzeError(null);
    try {
      const res = await fetch(`/api/questions/${slug}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: userCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze code");
      }
      setAnalyzeResult(data.analysis);
      setRemainingAnalyses(data.remaining);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Video Solution feature
  const [videoLang, setVideoLang] = useState<"python" | "java" | "cpp" | "javascript">("python");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const fetchVideo = useCallback(async (lang: string) => {
    setIsVideoLoading(true);
    setVideoError(null);
    setVideoId(null); // clear previous video immediately so stale video doesn't show
    try {
      const res = await fetch(`/api/questions/${slug}/video?lang=${lang}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch video");
      setVideoId(data.videoId);
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : "Video fetch failed");
    } finally {
      setIsVideoLoading(false);
    }
  }, [slug]);

  // Video is pre-fetched in the background when the question loads.
  // The manual lang-change buttons in the Video tab call fetchVideo(lang) directly.

  // User known topics
  const [knownTopics, setKnownTopics] = useState<string[]>([]);

  // Stats AI analysis
  const [statsAnalysis, setStatsAnalysis] = useState<string | null>(null);
  const [isGeneratingStatsAI, setIsGeneratingStatsAI] = useState(false);
  const [statsAiError, setStatsAiError] = useState<string | null>(null);
  const [complexityLadder, setComplexityLadder] = useState<ComplexityTier[] | null>(null);
  const [isGeneratingComplexity, setIsGeneratingComplexity] = useState(false);
  const [complexityError, setComplexityError] = useState<string | null>(null);
  const [implementationLadder, setImplementationLadder] = useState<ImplementationTier[] | null>(null);
  const [isGeneratingImplementations, setIsGeneratingImplementations] = useState(false);
  const [implementationsError, setImplementationsError] = useState<string | null>(null);
  const [selectedImplementationIndex, setSelectedImplementationIndex] = useState(0);

  const fetchQuestion = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRevealedHints(new Set());
    try {
      const res = await fetch(`/api/questions/${slug}`);
      if (!res.ok) {
        let message = "Failed to fetch question";
        try {
          const errorBody = await res.json();
          if (errorBody?.error) message = errorBody.error;
        } catch { }
        throw new Error(message);
      }
      const data = await res.json();
      setQuestion(data);
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : "Failed to load this problem. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  // Load cached AI data if present
  useEffect(() => {
    if (question?.aiContent) {
      if (question.aiContent.complexity) {
        try {
          const parsed = JSON.parse(question.aiContent.complexity) as { ladder: ComplexityTier[] };
          if (parsed?.ladder?.length > 0) {
            setComplexityLadder(parsed.ladder);
          }
        } catch { }
      }
      if (question.aiContent.implementations) {
        try {
          const parsed = JSON.parse(question.aiContent.implementations) as { implementations: ImplementationTier[] };
          if (parsed?.implementations?.length > 0) {
            setImplementationLadder(parsed.implementations);
            setSelectedImplementationIndex(Math.max(0, parsed.implementations.length - 1));
          }
        } catch { }
      }
    }
  }, [question]);

  // Background prefetch: fire ALL API requests as soon as the question loads
  // so every tab is ready before the user clicks on it
  useEffect(() => {
    if (!question) return;
    void ensureAIContent();
    void generateComplexityLadder();
    void generateImplementationLadder();
    void fetchVideo(videoLang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id]);

  // Check if already solved
  useEffect(() => {
    if (!session?.user || !question) return;
    const checkSolved = async () => {
      try {
        const res = await fetch("/api/user/history");
        if (res.ok) {
          const data = await res.json();
          const found = data.find(
            (item: { questionId: string }) => item.questionId === question.id
          );
          if (found) setIsSolved(true);
        }
      } catch { }
    };
    checkSolved();
  }, [session, question]);

  // Fetch known topics for Stats tab
  useEffect(() => {
    if (!session?.user) return;
    const fetchTopics = async () => {
      try {
        const res = await fetch("/api/user/topics");
        if (res.ok) {
          const data = await res.json();
          setKnownTopics(data?.knownTopics ?? []);
        }
      } catch { }
    };
    fetchTopics();
  }, [session]);

  const handleMarkSolved = async () => {
    if (!session?.user || !question || solvingInProgress) return;
    setSolvingInProgress(true);

    // Optimistic update
    const wasSolved = isSolved;
    setIsSolved(!isSolved);

    try {
      if (wasSolved) {
        await fetch("/api/user/solved", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: question.id }),
        });
      } else {
        await fetch("/api/user/solved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: question.id }),
        });

        // Confetti on first solve!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FFA116", "#00B8A3", "#FFC01E", "#FF375F"],
        });
      }
      
      // Notify sidebar components to refresh history
      window.dispatchEvent(new CustomEvent('historyUpdated'));
    } catch {
      // Revert optimistic update
      setIsSolved(wasSolved);
    } finally {
      setSolvingInProgress(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const revealHint = (hintNum: number) => {
    setRevealedHints((prev) => new Set(prev).add(hintNum));
  };

  const ensureAIContent = useCallback(async (force = false) => {
    if (!question || isGeneratingAI) return;
    if (question.aiContent && !force) return;
    setIsGeneratingAI(true);
    setAiError(null);
    try {
      const url = force ? `/api/questions/${slug}/ai?force=true` : `/api/questions/${slug}/ai`;
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) {
        let message = "Failed to generate AI content";
        try {
          const errorBody = await res.json();
          if (errorBody?.error) message = errorBody.error;
        } catch { }
        throw new Error(message);
      }
      const aiContent = await res.json();
      setQuestion((prev) => (prev ? { ...prev, aiContent } : prev));
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to generate AI content.");
    } finally {
      setIsGeneratingAI(false);
    }
  }, [isGeneratingAI, question, slug]);

  const generateStatsAnalysis = useCallback(async () => {
    if (!question || isGeneratingStatsAI || statsAnalysis) return;
    setIsGeneratingStatsAI(true);
    setStatsAiError(null);
    try {
      const res = await fetch(`/api/questions/${slug}/stats-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          knownTopics,
          currentQuestionTitle: question.title,
        }),
      });
      if (!res.ok) {
        let message = "Failed to generate AI analysis";
        try {
          const errorBody = await res.json();
          if (errorBody?.error) message = errorBody.error;
        } catch { }
        throw new Error(message);
      }
      const data = await res.json();
      setStatsAnalysis(data.analysis);
    } catch (err) {
      setStatsAiError(err instanceof Error ? err.message : "Failed to generate analysis.");
    } finally {
      setIsGeneratingStatsAI(false);
    }
  }, [question, slug, isGeneratingStatsAI, statsAnalysis, knownTopics]);

  const generateComplexityLadder = useCallback(async () => {
    if (!question || isGeneratingComplexity || complexityLadder) return;
    setIsGeneratingComplexity(true);
    setComplexityError(null);

    try {
      const res = await fetch(`/api/questions/${slug}/complexity-ai`, {
        method: "POST",
      });

      if (!res.ok) {
        let message = "Failed to generate complexity ladder";
        try {
          const errorBody = await res.json();
          if (errorBody?.error) message = errorBody.error;
        } catch { }
        throw new Error(message);
      }

      const data = (await res.json()) as { ladder?: ComplexityTier[] };

      if (!data?.ladder || !Array.isArray(data.ladder) || data.ladder.length === 0) {
        throw new Error("Complexity ladder is empty.");
      }

      setComplexityLadder(data.ladder);
    } catch (err) {
      setComplexityError(err instanceof Error ? err.message : "Failed to generate complexity ladder.");
    } finally {
      setIsGeneratingComplexity(false);
    }
  }, [question, slug, isGeneratingComplexity, complexityLadder]);

  const generateImplementationLadder = useCallback(async () => {
    if (!question || isGeneratingImplementations || implementationLadder) return;
    setIsGeneratingImplementations(true);
    setImplementationsError(null);

    try {
      const res = await fetch(`/api/questions/${slug}/implementations-ai`, {
        method: "POST",
      });

      if (!res.ok) {
        let message = "Failed to generate implementations";
        try {
          const errorBody = await res.json();
          if (errorBody?.error) message = errorBody.error;
        } catch { }
        throw new Error(message);
      }

      const data = (await res.json()) as { implementations?: ImplementationTier[] };

      if (!data?.implementations || !Array.isArray(data.implementations) || data.implementations.length === 0) {
        throw new Error("Implementation list is empty.");
      }

      setImplementationLadder(data.implementations);
      setSelectedImplementationIndex(Math.max(0, data.implementations.length - 1));
    } catch (err) {
      setImplementationsError(err instanceof Error ? err.message : "Failed to generate implementations.");
    } finally {
      setIsGeneratingImplementations(false);
    }
  }, [question, slug, isGeneratingImplementations, implementationLadder]);

  const difficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy": return "bg-[#00B8A3]/15 text-[#00B8A3] border-[#00B8A3]/30";
      case "Medium": return "bg-[#FFC01E]/15 text-[#FFC01E] border-[#FFC01E]/30";
      case "Hard": return "bg-[#FF375F]/15 text-[#FF375F] border-[#FF375F]/30";
      default: return "";
    }
  };

  if (isLoading) {
    return (
      <div className="mt-4 space-y-6">
        <div className="space-y-3">
          <div className="h-8 w-2/3 rounded-lg shimmer" />
          <div className="flex gap-2">
            <div className="h-6 w-16 rounded-full shimmer" />
            <div className="h-6 w-20 rounded-full shimmer" />
            <div className="h-6 w-24 rounded-full shimmer" />
          </div>
        </div>
        <div className="h-10 w-full rounded-lg shimmer" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 rounded shimmer" style={{ width: `${100 - i * 10}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-medium" />
        <h2 className="text-xl font-semibold mb-2">Problem Not Found</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchQuestion} className="bg-leetcode hover:bg-leetcode-dark text-black">
          Try Again
        </Button>
      </div>
    );
  }

  const solutionCode =
    solutionLang === "python"
      ? question.aiContent?.solutionPython
      : solutionLang === "java"
        ? question.aiContent?.solutionJava
        : question.aiContent?.solutionCpp;
  const selectedImplementation = implementationLadder?.[selectedImplementationIndex] ?? null;
  const ladderSolutionCode =
    solutionLang === "python"
      ? selectedImplementation?.solutionPython
      : solutionLang === "java"
        ? selectedImplementation?.solutionJava
        : selectedImplementation?.solutionCpp;
  const displayedSolutionCode = ladderSolutionCode ?? solutionCode;
  const iterationData = question.aiContent
    ? parseVisualization(question.aiContent.visualize)
    : null;

  const hasAIContent = Boolean(question.aiContent);
  const aiTabs = new Set(["hints", "approach", "algorithm", "visualize", "solution"]);

  const renderAIFallback = (label: string) => {
    if (isGeneratingAI) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating {label}...
        </div>
      );
    }

    if (aiError) {
      return (
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>{aiError}</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-leetcode hover:bg-leetcode/10"
            onClick={() => ensureAIContent()}
          >
            Try again
          </Button>
        </div>
      );
    }

    return <div className="text-sm text-muted-foreground">{label} is not available yet.</div>;
  };

  return (
    <div className="mt-4">
      {/* ── Header ────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start gap-3 mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight truncate">{question.title}</h1>
            <a
              href={`https://leetcode.com/problems/${question.slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
              title="Open in LeetCode"
            >
              <Button type="button" variant="outline" size="sm" className="h-7 px-2.5 text-xs bg-[#1A1A1A]/60 border-[#222] text-muted-foreground hover:bg-[#2A2A2A] hover:text-white transition-colors">
                <ExternalLink className="h-3.5 w-3.5 sm:mr-1" />
                <span className="hidden sm:inline">LeetCode</span>
              </Button>
            </a>
          </div>
          {session?.user && (
            <Button
              onClick={handleMarkSolved}
              disabled={solvingInProgress}
              className={`shrink-0 transition-all duration-300 text-xs sm:text-sm ${isSolved
                ? "bg-easy hover:bg-easy/80 text-white solved-glow"
                : "bg-[#2A2A2A] hover:bg-[#333] text-foreground border border-[#333]"
                }`}
            >
              {solvingInProgress ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isSolved ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {isSolved ? "Solved" : "Mark as Solved"}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={`${difficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </Badge>
          {!showTopics && question.tags.length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTopics(true)}
              className="h-6 px-2 text-xs bg-[#1A1A1A] border-[#333] text-muted-foreground hover:bg-[#2A2A2A] transition-colors"
            >
              Reveal Topics
            </Button>
          ) : (
            question.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs bg-[#1A1A1A] border-[#333] text-muted-foreground hover:bg-[#2A2A2A] transition-colors"
              >
                {tag}
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────── */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(String(value));
        }}
        className="space-y-6"
      >
        <TabsList className="bg-transparent p-0 flex flex-wrap gap-2 md:gap-3 !h-auto w-full mb-8 justify-start">
          {[
            { id: "description", label: "Description" },
            { id: "hints", label: "Hints", icon: Lightbulb },
            { id: "approach", label: "Mental Model", icon: Brain },
            { id: "algorithm", label: "Algorithm", icon: ListOrdered },
            { id: "visualize", label: "Example Iteration", icon: GitBranch },
            { id: "solution", label: "Implementation", icon: Code2 },
            { id: "complexity", label: "Complexity", icon: Gauge },
            { id: "video", label: "Video Solution", icon: Youtube },
            { id: "analyze", label: "Analyse My Code", icon: Activity },
            { id: "stats", label: "Reality Check", icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex-none h-10 px-4 py-2 text-xs sm:text-sm font-medium rounded-full border border-[#222] bg-[#1A1A1A]/60 text-muted-foreground transition-all hover:bg-[#2A2A2A] hover:text-white data-[state=active]:bg-leetcode/10 data-[state=active]:text-leetcode data-[state=active]:border-leetcode/40 data-[state=active]:shadow-none"
              >
                {Icon && <Icon className="h-4 w-4" />}
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Description */}
        <TabsContent value="description" className="mt-0">
          <FadeIn>
            <div
              className="leetcode-content prose prose-invert max-w-none text-slate-300"
              dangerouslySetInnerHTML={{ __html: question.description }}
            />
          </FadeIn>
        </TabsContent>

        {/* Analyse My Code */}
        <TabsContent value="analyze" className="mt-0">
          <FadeIn>
            <div className="bg-[#121212] rounded-xl border border-[#222] p-4 sm:p-6 shadow-sm">
              {remainingAnalyses !== null && (
                <div className="flex justify-end mb-4">
                  <Badge variant="outline" className="border-leetcode/30 bg-leetcode/10 text-leetcode">
                    {remainingAnalyses}/5 queries remaining today
                  </Badge>
                </div>
              )}

              {!analyzeResult ? (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Paste your code here..."
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    className="min-h-[250px] font-mono text-sm bg-[#1A1A1A] border-[#333] focus-visible:ring-leetcode"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      * This is an API Intensive task. You only have 5 inputs a day.
                    </p>
                    <Button
                      onClick={handleAnalyzeCode}
                      disabled={isAnalyzing || !userCode.trim()}
                      className="bg-leetcode hover:bg-leetcode-dark text-black"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing Code...
                        </>
                      ) : (
                        "Analyze Code"
                      )}
                    </Button>
                  </div>
                  {analyzeError && (
                    <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                      {analyzeError}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-[#222] bg-[#1A1A1A] p-4 text-center">
                      <div className="text-xs font-medium tracking-wider text-muted-foreground uppercase mb-1">Time Complexity</div>
                      <div className="text-lg font-bold text-easy">{analyzeResult.timeComplexity}</div>
                    </div>
                    <div className="rounded-xl border border-[#222] bg-[#1A1A1A] p-4 text-center">
                      <div className="text-xs font-medium tracking-wider text-muted-foreground uppercase mb-1">Space Complexity</div>
                      <div className="text-lg font-bold text-[#8DA2FF]">{analyzeResult.spaceComplexity}</div>
                    </div>
                  </div>

                  {analyzeResult.flaws && analyzeResult.flaws.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-widest text-[#FF375F] mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> Logical Flaws
                      </h4>
                      <ul className="space-y-2">
                        {analyzeResult.flaws.map((flaw: string, i: number) => (
                          <li key={i} className="text-sm text-slate-300 p-3 bg-[#FF375F]/10 border border-[#FF375F]/20 rounded-lg">
                            {flaw}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="p-4 bg-easy/10 border border-easy/20 rounded-xl flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-easy" />
                      <p className="text-sm text-easy font-medium">Looks good! No logical flaws found.</p>
                    </div>
                  )}

                  {analyzeResult.correctedCode && (
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-widest text-leetcode mb-3 flex items-center gap-2">
                        <Code2 className="h-4 w-4" /> Corrected Code
                      </h4>
                      <div className="relative rounded-xl overflow-hidden bg-[#1E1E1E] border border-[#333]">
                        <SyntaxHighlighter
                          language="javascript"
                          style={vscDarkPlus}
                          customStyle={{ margin: 0, padding: "1.5rem", fontSize: "14px", background: "transparent" }}
                        >
                          {analyzeResult.correctedCode}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  )}

                  {analyzeResult.exampleIteration && (
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-widest text-warning mb-3 flex items-center gap-2">
                        <GitBranch className="h-4 w-4" /> Failure Trace
                      </h4>
                      <div className="p-1 rounded-2xl border border-warning/20 bg-warning/5">
                        <IterationVisualizer iteration={analyzeResult.exampleIteration} />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => { setAnalyzeResult(null); setUserCode(""); }}
                      className="text-xs bg-[#222] border-[#333] hover:bg-[#333]"
                    >
                      Analyze Another Solution
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </FadeIn>
        </TabsContent>

        {/* Video Solution */}
        <TabsContent value="video" className="mt-0">
          <FadeIn>
            <div className="bg-[#121212] rounded-xl border border-[#222] p-4 sm:p-6 shadow-sm">
              <div className="flex justify-end mb-4">
                <div className="flex bg-[#1A1A1A] p-1 rounded-lg border border-[#333]">
                  {(["python", "java", "cpp", "javascript"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setVideoLang(lang);
                        fetchVideo(lang);
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        videoLang === lang
                          ? "bg-[#2A2A2A] text-white shadow-sm"
                          : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      {lang === "cpp" ? "C++" : lang === "javascript" ? "JS" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full aspect-video bg-[#0A0A0A] rounded-xl overflow-hidden border border-[#222] relative flex items-center justify-center">
                {isVideoLoading ? (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-3 text-leetcode" />
                    <p className="text-sm">Finding best video for {videoLang}...</p>
                  </div>
                ) : videoError ? (
                  <div className="flex flex-col items-center text-red-400">
                    <Activity className="h-8 w-8 mb-3" />
                    <p className="text-sm">{videoError}</p>
                    <Button variant="outline" size="sm" onClick={() => fetchVideo(videoLang)} className="mt-4 border-red-400/20 bg-red-400/10 hover:bg-red-400/20 text-red-400">
                      Retry
                    </Button>
                  </div>
                ) : videoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="text-sm text-muted-foreground">No video found.</div>
                )}
              </div>
            </div>
          </FadeIn>
        </TabsContent>

        {/* Hints */}
        <TabsContent value="hints" className="mt-0 space-y-4">
          <FadeIn>
            {!hasAIContent ? (
              <div className="bg-[#121212] rounded-xl border border-[#222] p-6 shadow-sm">
                {renderAIFallback("Insights")}
              </div>
            ) : (
              <div className="space-y-4">
                {[1, 2, 3].map((num) => {
                  const hintKey = `hint${num}` as "hint1" | "hint2" | "hint3";
                  const hintContent = question.aiContent?.[hintKey];
                  const isRevealed = revealedHints.has(num);

                  return (
                    <div
                      key={num}
                      className={`bg-[#1A1A1A] rounded-xl border ${isRevealed ? 'border-[#FFA116]/30 shadow-[0_0_15px_rgba(255,161,22,0.05)]' : 'border-[#222]'} overflow-hidden transition-all duration-300 hover:border-[#FFA116]/50 group`}
                    >
                      <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-lg p-2 ${isRevealed ? "bg-leetcode/10" : "bg-[#222]"}`}>
                            <Lightbulb className={`h-4 w-4 ${isRevealed ? "text-leetcode" : "text-muted-foreground"}`} />
                          </div>
                          <span className="text-sm font-medium tracking-wide">Hint {num}</span>
                          {num === 3 && (
                            <span className="rounded-full border border-hard/20 bg-hard/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-hard">
                              Crucial
                            </span>
                          )}
                        </div>
                        {!isRevealed && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs font-medium text-leetcode hover:bg-leetcode/10"
                            onClick={() => revealHint(num)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            Reveal
                          </Button>
                        )}
                      </div>
                      <AnimatePresence>
                        {isRevealed && hintContent && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-5 py-4 bg-[#121212]"
                          >
                            <p className="text-sm leading-relaxed text-slate-300">
                              {hintContent}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </FadeIn>
        </TabsContent>

        {/* Approach */}
        <TabsContent value="approach" className="mt-0">
          <FadeIn>
            <div className="bg-[#121212] rounded-xl border border-[#222] p-6 md:p-8 shadow-sm">
              {hasAIContent ? (
                <div>
                  <div className="relative group overflow-hidden rounded-2xl border border-neutral-800/60 bg-gradient-to-br from-[#1A1A1A] to-[#141414] p-8 shadow-2xl transition-all duration-500 hover:border-[#FFA116]/40 hover:shadow-[0_0_30px_rgba(255,161,22,0.1)]">
                    {/* Decorative Elements */}
                    <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#FFA116]/0 blur-[50px] transition-all duration-700 group-hover:bg-[#FFA116]/15 pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[#00B8A3]/0 blur-[50px] transition-all duration-700 group-hover:bg-[#00B8A3]/10 pointer-events-none" />

                    <div className="relative z-10 space-y-4">
                      {question.aiContent?.approach?.split('\n\n').filter(p => p.trim().length > 0).map((paragraph, idx) => (
                        <p key={idx} className={`text-[15.5px] leading-relaxed tracking-wide ${idx === 0 ? 'text-white font-medium text-lg' : 'text-slate-300'} font-sans`}>
                          {paragraph.trim().replace(/^\*\*.*?\*\*\s*/, '')}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                renderAIFallback("Mental model")
              )}
            </div>
          </FadeIn>
        </TabsContent>

        {/* Algorithm */}
        <TabsContent value="algorithm" className="mt-0">
          <FadeIn>
            <div className="bg-[#121212] rounded-xl border border-[#222] p-4 sm:p-6 md:p-8 shadow-sm">
              {hasAIContent ? (
                <div className="relative border-l-2 border-neutral-800/80 ml-4 space-y-8 pb-4">
                  {question.aiContent?.algorithm?.split('\n').filter(line => line.trim().length > 0).map((step, idx) => {
                    const cleanStep = step.replace(/^(\d+\.|Step \d+:?)\s*/i, '').trim();
                    return (
                      <div key={idx} className="relative pl-8 group">
                        <span className="absolute -left-[17px] top-1 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-[#121212] bg-neutral-800 text-sm font-bold text-neutral-400 group-hover:bg-[#FFA116] group-hover:text-black group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(255,161,22,0.4)] transition-all duration-300 z-10">
                          {idx + 1}
                        </span>
                        <div className="rounded-xl border border-neutral-800/60 bg-gradient-to-br from-[#1A1A1A] to-[#141414] p-5 shadow-sm relative overflow-hidden group-hover:border-[#FFA116]/30 transition-colors duration-300">
                          <div className="absolute -right-16 -top-16 w-32 h-32 bg-[#FFA116]/0 blur-[40px] rounded-full pointer-events-none group-hover:bg-[#FFA116]/10 transition-all duration-500" />
                          <p className="text-neutral-300 leading-relaxed font-sans text-[15px]">{cleanStep}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                renderAIFallback("Execution steps")
              )}
            </div>
          </FadeIn>
        </TabsContent>

        {/* Visualise */}
        <TabsContent value="visualize" className="mt-0">
          <FadeIn>
            {hasAIContent ? (
              iterationData ? (
                <IterationVisualizer
                  iteration={iterationData}
                  onRegenerate={() => ensureAIContent(true)}
                />
              ) : (
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-medium" />
                  <p className="text-sm text-muted-foreground">The current visualization payload could not be interpreted.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 border-[#333] hover:bg-[#161616]"
                    onClick={() => ensureAIContent(true)}
                  >
                    Generate Iteration Trace
                  </Button>
                </div>
              )
            ) : (
              renderAIFallback("example iteration")
            )}
          </FadeIn>
        </TabsContent>

        {/* Complexity */}
        <TabsContent value="complexity" className="mt-0">
          <FadeIn>
            <div className="rounded-xl border border-[#222] bg-[#121212] p-4 sm:p-6 md:p-8 shadow-sm">
              {isGeneratingComplexity ? (
                <div className="flex min-h-36 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-leetcode" />
                  Generating complexity ladder...
                </div>
              ) : complexityError ? (
                <div className="flex flex-col items-start gap-3 rounded-lg border border-hard/20 bg-hard/10 p-4">
                  <p className="text-sm text-hard">{complexityError}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#444] hover:bg-[#333]"
                    onClick={() => {
                      setComplexityLadder(null);
                      void generateComplexityLadder();
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              ) : complexityLadder ? (
                <div className="space-y-4">
                  {complexityLadder.map((tier, index) => {
                    const isOptimal = index === complexityLadder.length - 1;

                    return (
                      <div
                        key={`${tier.title}-${index}`}
                        className={`rounded-xl border p-4 ${isOptimal
                          ? "border-easy/30 bg-easy/10"
                          : "border-[#2B2B2B] bg-[#1A1A1A]"
                          }`}
                      >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={isOptimal ? "border-easy/30 text-easy" : "border-[#3A3A3A] text-slate-300"}
                            >
                              Tier {index + 1}
                            </Badge>
                            <h4 className="font-semibold text-white">{tier.title}</h4>
                          </div>
                          {isOptimal && (
                            <Badge variant="outline" className="border-easy/30 text-easy">
                              Most Optimal
                            </Badge>
                          )}
                        </div>

                        <p className="mb-4 text-sm leading-6 text-slate-300">{tier.summary}</p>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg border border-[#303030] bg-[#111111] px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Time</p>
                            <p className="mt-1 text-sm font-medium text-medium">{tier.timeComplexity}</p>
                          </div>
                          <div className="rounded-lg border border-[#303030] bg-[#111111] px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Space</p>
                            <p className="mt-1 text-sm font-medium text-leetcode">{tier.spaceComplexity}</p>
                          </div>
                        </div>

                        <div className="mt-3 rounded-lg border border-[#303030] bg-[#111111] px-3 py-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Tradeoff</p>
                          <p className="mt-1 text-sm leading-6 text-slate-300">{tier.tradeoff}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-lg border border-[#2B2B2B] bg-[#1A1A1A] p-6 text-center text-sm text-muted-foreground">
                  <p>Open this tab to generate complexity comparisons from brute force to optimal.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#444] hover:bg-[#333]"
                    onClick={() => void generateComplexityLadder()}
                  >
                    Generate Complexity Ladder
                  </Button>
                </div>
              )}
            </div>
          </FadeIn>
        </TabsContent>

        {/* Solution */}
        <TabsContent value="solution" className="mt-0">
          <FadeIn>
            <div className="bg-[#121212] rounded-xl border border-[#222] overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 bg-[#1A1A1A] border-b border-[#222]">
                <div className="flex flex-wrap gap-2">
                  {(["python", "java", "cpp"] as const).map((lang) => (
                    <Button
                      key={lang}
                      size="sm"
                      variant={solutionLang === lang ? "default" : "ghost"}
                      className={`h-8 px-4 text-xs font-medium rounded-md transition-all ${solutionLang === lang
                        ? "bg-leetcode text-[#0A0A0A] shadow-sm hover:bg-leetcode-dark"
                        : "hover:bg-[#222] text-muted-foreground hover:text-foreground"
                        }`}
                      onClick={() => setSolutionLang(lang)}
                    >
                      {lang === "cpp" ? "C++" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </Button>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-3 text-xs font-medium hover:bg-[#222] text-muted-foreground hover:text-foreground transition-all"
                  onClick={() => handleCopy(displayedSolutionCode ?? "")}
                  disabled={!displayedSolutionCode}
                >
                  {copied ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5 text-easy" />
                      <span className="text-easy">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>

              {isGeneratingImplementations ? (
                <div className="flex items-center gap-2 border-b border-[#222] bg-[#151515] px-6 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-leetcode" />
                  Generating implementation ladder...
                </div>
              ) : implementationsError ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222] bg-hard/10 px-6 py-3">
                  <p className="text-sm text-hard">{implementationsError}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#444] hover:bg-[#333]"
                    onClick={() => {
                      setImplementationLadder(null);
                      void generateImplementationLadder();
                    }}
                  >
                    Retry
                  </Button>
                </div>
              ) : implementationLadder && implementationLadder.length > 0 ? (
                <div className="space-y-3 border-b border-[#222] bg-[#151515] px-6 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {implementationLadder.map((tier, index) => {
                      const isSelected = index === selectedImplementationIndex;

                      return (
                        <Button
                          key={`${tier.title}-${index}`}
                          size="sm"
                          variant={isSelected ? "default" : "ghost"}
                          className={`h-8 px-3 text-xs ${isSelected
                            ? "bg-leetcode text-[#0A0A0A] hover:bg-leetcode-dark"
                            : "text-slate-300 hover:bg-[#252525]"
                            }`}
                          onClick={() => setSelectedImplementationIndex(index)}
                        >
                          {tier.title}
                        </Button>
                      );
                    })}
                  </div>

                  {selectedImplementation && (
                    <div className="rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 py-3">
                      <p className="text-sm text-slate-300">{selectedImplementation.summary}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-[#3A3A3A] text-slate-300">
                          Time: <span className="ml-1 text-medium">{selectedImplementation.timeComplexity}</span>
                        </Badge>
                        <Badge variant="outline" className="border-[#3A3A3A] text-slate-300">
                          Space: <span className="ml-1 text-leetcode">{selectedImplementation.spaceComplexity}</span>
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="overflow-x-auto text-[13px] leading-relaxed syntax-highlighter-wrapper">
                {displayedSolutionCode ? (
                  <SyntaxHighlighter
                    language={solutionLang === "python" ? "python" : solutionLang === "java" ? "java" : "cpp"}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: "1.5rem",
                      background: "transparent",
                      fontSize: "13px",
                    }}
                    showLineNumbers={true}
                    wrapLines={true}
                  >
                    {displayedSolutionCode || ""}
                  </SyntaxHighlighter>
                ) : (
                  <div className="p-6">
                    {renderAIFallback("Implementation snippet")}
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        </TabsContent>

        {/* Stats */}
        <TabsContent value="stats" className="mt-0">
          <FadeIn>
            <div className="relative overflow-hidden rounded-2xl border border-leetcode/20 bg-[#0A0A0A] p-[1px]">
              <div className="absolute inset-0 bg-gradient-to-br from-leetcode/20 via-transparent to-transparent opacity-50" />
              <div className="relative h-full w-full rounded-[15px] bg-[#111] p-4 sm:p-6 md:p-8">
                {!session?.user ? (
                  <div className="rounded-xl border border-dashed border-[#333] p-8 text-center text-muted-foreground">
                    <p className="text-sm">Sign in to get your AI success analysis.</p>
                  </div>
                ) : (
                  <div className="min-h-[200px] w-full">
                    {statsAnalysis ? (
                      <div className="group relative overflow-hidden rounded-xl border border-[#333] bg-[#161616] p-6 transition-all hover:border-leetcode/30 hover:shadow-[0_0_20px_rgba(255,161,22,0.05)]">
                        <div className="absolute inset-0 bg-gradient-to-b from-leetcode/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="relative space-y-4 text-[14.5px] leading-relaxed text-slate-300">
                          {statsAnalysis.split('\n').map((para, i) => para.trim() ? (
                            <p 
                               key={i} 
                               className="leading-relaxed" 
                               dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, "<span class='text-leetcode font-semibold'>$1</span>") }} 
                            />
                          ) : null)}
                        </div>
                      </div>
                    ) : isGeneratingStatsAI ? (
                      <div className="flex flex-col items-center justify-center gap-4 h-[200px] text-muted-foreground">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full animate-ping bg-leetcode/20" />
                          <Loader2 className="relative h-8 w-8 animate-spin text-leetcode" />
                        </div>
                        <p className="text-[15px] font-medium animate-pulse text-slate-300">Crunching global success rates...</p>
                      </div>
                    ) : statsAiError ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-12 rounded-xl border border-dashed border-red-500/20 bg-red-500/5">
                        <AlertTriangle className="h-8 w-8 text-hard" />
                        <p className="text-[15px] text-hard font-medium">{statsAiError}</p>
                        <Button
                          variant="outline"
                          onClick={() => generateStatsAnalysis()}
                          className="mt-2 border-red-500/30 text-slate-200 hover:bg-red-500/10 hover:text-white"
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-5 py-12 text-muted-foreground bg-[#141414] rounded-xl border border-[#222] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                        <div className="relative p-4 bg-[#1A1A1A] rounded-2xl mb-2 transition-transform duration-500 hover:scale-110 border border-[#333]">
                          <BarChart3 className="relative z-10 h-8 w-8 text-leetcode" />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-[16px] font-medium text-slate-200">Ready for a harsh reality check?</p>
                          <p className="text-sm text-muted-foreground">Discover common pitfalls and global statistics for this problem.</p>
                        </div>
                        <Button
                          onClick={() => generateStatsAnalysis()}
                          className="mt-2 bg-leetcode text-[#0A0A0A] hover:bg-leetcode-dark font-semibold px-8 py-5 rounded-xl transition-all duration-300 shadow-[0_4px_14px_0_rgba(255,161,22,0.39)] hover:shadow-[0_6px_20px_rgba(255,161,22,0.23)] hover:-translate-y-0.5"
                        >
                          Assess My Odds
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        </TabsContent>
      </Tabs>
    </div>
  );
}
