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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface FlowNode {
  id: string;
  label: string;
  type?: "default" | "input" | "output";
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

interface FlowGraph {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface BlueprintStage {
  id: string;
  title: string;
  goal: string;
  inputFocus: string;
  operation: string;
  outputState: string;
  whyItMatters: string;
}

interface BlueprintConnection {
  from: string;
  to: string;
  label: string;
}

interface BlueprintDecision {
  label: string;
  condition: string;
  ifTrue: string;
  ifFalse: string;
}

interface BlueprintSnapshot {
  label: string;
  focus: string;
  items: string[];
}

interface BlueprintComplexity {
  time: string;
  space: string;
  driver: string;
}

interface ProblemBlueprint {
  version: "2";
  metaphor: string;
  objective: string;
  invariant: string;
  stages: BlueprintStage[];
  connections: BlueprintConnection[];
  decisions: BlueprintDecision[];
  snapshots: BlueprintSnapshot[];
  pitfalls: string[];
  complexity: BlueprintComplexity;
  source: "blueprint" | "legacy" | "fallback";
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

function parseVisualization(visualize: string | object | null | undefined): unknown {
  if (!visualize) return null;
  if (typeof visualize === "object") return visualize;
  if (typeof visualize === "string" && visualize.trim().startsWith("{")) {
    try {
      return JSON.parse(visualize);
    } catch {
      return null;
    }
  }
  return null;
}

function isFlowGraph(value: unknown): value is FlowGraph {
  return Boolean(
    value &&
    typeof value === "object" &&
    "nodes" in value &&
    "edges" in value &&
    Array.isArray((value as FlowGraph).nodes) &&
    Array.isArray((value as FlowGraph).edges)
  );
}

function isBlueprint(value: unknown): value is Omit<ProblemBlueprint, "source"> {
  return Boolean(
    value &&
    typeof value === "object" &&
    (value as { version?: string }).version === "2" &&
    Array.isArray((value as ProblemBlueprint).stages)
  );
}

function getLines(text: string | undefined) {
  return (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^\d+[.)]\s*/, "").replace(/^[-*]\s*/, ""));
}

function getSentences(text: string | undefined) {
  return (text ?? "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function shorten(text: string, fallback: string, limit = 56) {
  const value = (text || "").trim() || fallback;
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 1).trimEnd()}...`;
}

function fallbackPitfalls(approach: string) {
  const sentences = getSentences(approach).filter((sentence) => /avoid|careful|mistake|forget|wrong|edge/i.test(sentence));
  if (sentences.length >= 3) {
    return sentences.slice(0, 4).map((sentence) => shorten(sentence, sentence, 96));
  }
  return [
    "Breaking the invariant by updating state in the wrong order.",
    "Missing the boundary condition that tells the algorithm to stop or shrink.",
    "Tracking too much state when one focused structure would be enough.",
  ];
}

function deriveDecisions(lines: string[]) {
  const candidates = lines.filter((line) => /\b(if|when|while|until|else|match|compare|found)\b/i.test(line));
  if (candidates.length === 0) {
    return [
      {
        label: "Progress check",
        condition: "Does the current state satisfy the invariant needed to keep moving?",
        ifTrue: "Advance to the next stage without resetting useful work.",
        ifFalse: "Repair the state before continuing so later steps stay valid.",
      },
    ];
  }

  return candidates.slice(0, 4).map((line, index) => ({
    label: `Decision ${index + 1}`,
    condition: line,
    ifTrue: "Commit the transition and keep the good state.",
    ifFalse: "Adjust the state and try the next valid move.",
  }));
}

function buildFallbackBlueprint(params: {
  title: string;
  approach: string;
  algorithm: string;
  graph: FlowGraph | null;
}): ProblemBlueprint {
  const { title, approach, algorithm, graph } = params;
  const algorithmLines = getLines(algorithm);
  const approachSentences = getSentences(approach);
  const rawStages = graph?.nodes.length
    ? graph.nodes.map((node) => node.label)
    : algorithmLines.slice(0, 6).map((line, index) => shorten(line, `Stage ${index + 1}`, 28));

  const stages = rawStages.slice(0, 6).map((label, index) => {
    const currentLine = algorithmLines[index] ?? `Shape the state for ${label}.`;
    const nextLabel = rawStages[index + 1];

    return {
      id: graph?.nodes[index]?.id ?? `stage-${index + 1}`,
      title: shorten(label, `Stage ${index + 1}`, 28),
      goal: shorten(currentLine, `Move the solution toward ${nextLabel ?? "the answer"}.`, 120),
      inputFocus:
        approachSentences[index] ??
        (index === 0
          ? "Read the input shape and identify the state you need to maintain."
          : "Carry the working state from the previous stage without losing the invariant."),
      operation:
        graph?.edges[index]?.label ||
        currentLine ||
        "Update the tracked state using the current element or pointer position.",
      outputState:
        nextLabel
          ? `The state is now ready to hand off to ${shorten(nextLabel, "the next stage", 24)}.`
          : "The accumulated state is ready to produce the final answer.",
      whyItMatters:
        approachSentences[index + 1] ??
        "This stage prevents wasted work by preserving the one thing the algorithm must keep true.",
    };
  });

  const connections = (graph?.edges.length
    ? graph.edges.map((edge) => ({
      from: edge.source,
      to: edge.target,
      label: edge.label || "Advance when the state is valid",
    }))
    : stages.slice(0, -1).map((stage, index) => ({
      from: stage.id,
      to: stages[index + 1].id,
      label: algorithmLines[index] || "Pass the updated state forward",
    }))) as BlueprintConnection[];

  const snapshots: BlueprintSnapshot[] = [
    {
      label: "Initial landscape",
      focus: "Before the algorithm commits to a direction",
      items: [
        `Understand what ${title} is really asking you to preserve or optimize.`,
        stages[0]?.inputFocus ?? "Spot the starting state.",
        "Decide what data must stay visible at every step.",
      ],
    },
    {
      label: "Working state",
      focus: "Mid-flight while the algorithm is actively updating",
      items: [
        stages[1]?.operation ?? "Transform the tracked state.",
        stages[2]?.whyItMatters ?? "Keep the invariant intact.",
        "Drop stale information as soon as it stops helping.",
      ],
    },
    {
      label: "Resolved state",
      focus: "The moment the answer becomes inevitable",
      items: [
        stages.at(-1)?.outputState ?? "Final answer is now extractable.",
        "Only the minimal final state remains.",
        "Return the answer without redoing the traversal.",
      ],
    },
  ];

  return {
    version: "2",
    metaphor: "Think of the algorithm as a control room that keeps only the signals that still matter and discards the noise.",
    objective:
      approachSentences[0] ??
      "Move through the input while preserving the one state that makes the final answer cheap to produce.",
    invariant:
      approachSentences[1] ??
      "At every step, the tracked state remains sufficient to make the next decision without restarting.",
    stages,
    connections,
    decisions: deriveDecisions(algorithmLines),
    snapshots,
    pitfalls: fallbackPitfalls(approach),
    complexity: {
      time: "See final implementation",
      space: "See final implementation",
      driver: "The main cost comes from how many times the core state is updated while traversing the input.",
    },
    source: graph ? "legacy" : "fallback",
  };
}

function normalizeBlueprint(params: {
  title: string;
  approach: string;
  algorithm: string;
  visualize: string | object | null | undefined;
}) {
  const parsed = parseVisualization(params.visualize);

  if (isBlueprint(parsed)) {
    return {
      ...parsed,
      metaphor: parsed.metaphor || "Visualize the algorithm as a staged system that keeps its useful state alive.",
      objective: parsed.objective || "Track the smallest state that still lets the algorithm make the right next move.",
      invariant: parsed.invariant || "The maintained state stays valid after every transition.",
      stages: parsed.stages.slice(0, 7),
      decisions: parsed.decisions.slice(0, 5),
      snapshots: parsed.snapshots.slice(0, 5),
      pitfalls: parsed.pitfalls.slice(0, 4),
      source: "blueprint" as const,
    };
  }

  return buildFallbackBlueprint({
    title: params.title,
    approach: params.approach,
    algorithm: params.algorithm,
    graph: isFlowGraph(parsed) ? parsed : null,
  });
}

function ArchitectureStudio({
  blueprint,
  onRegenerate,
}: {
  blueprint: ProblemBlueprint;
  onRegenerate?: () => void;
}) {
  const [activeStageId, setActiveStageId] = useState(blueprint.stages[0]?.id ?? "");

  useEffect(() => {
    setActiveStageId(blueprint.stages[0]?.id ?? "");
  }, [blueprint]);

  const activeStage =
    blueprint.stages.find((stage) => stage.id === activeStageId) ?? blueprint.stages[0];
  const activeConnections = blueprint.connections.filter(
    (connection) => connection.from === activeStage?.id || connection.to === activeStage?.id
  );

  if (!activeStage) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <AlertTriangle className="h-8 w-8 text-medium" />
        <p className="text-sm text-muted-foreground">No visual blueprint is available for this problem yet.</p>
        {onRegenerate && (
          <Button size="sm" onClick={onRegenerate} className="bg-leetcode hover:bg-leetcode-dark text-black text-xs">
            Regenerate Visualization
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {blueprint.source !== "blueprint" && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#3A2B13] bg-[#1C1610] p-4 text-sm text-slate-300 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-medium text-medium">This visual is derived from older AI content.</p>
            <p className="text-slate-400">It is richer than the legacy graph, but regenerating will produce the full stage-by-stage blueprint.</p>
          </div>
          {onRegenerate && (
            <Button size="sm" onClick={onRegenerate} className="bg-leetcode hover:bg-leetcode-dark text-black">
              Regenerate Blueprint
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-[28px] border border-[#2D2417] bg-[radial-gradient(circle_at_top_left,rgba(255,161,22,0.18),transparent_38%),linear-gradient(135deg,#18120D_0%,#0F1115_100%)] p-6">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-leetcode">
            <Sparkles className="h-4 w-4" />
            Visual Metaphor
          </div>
          <p className="text-lg font-semibold leading-relaxed text-white">{blueprint.metaphor}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Objective</p>
              <p className="text-sm leading-6 text-slate-200">{blueprint.objective}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Invariant</p>
              <p className="text-sm leading-6 text-slate-200">{blueprint.invariant}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-2xl border border-[#1F3A31] bg-[#0F1916] p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-easy">
              <Route className="h-4 w-4" />
              Time Cost
            </div>
            <p className="text-xl font-semibold text-white">{blueprint.complexity.time}</p>
          </div>
          <div className="rounded-2xl border border-[#2D2417] bg-[#18140D] p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-medium">
              <Boxes className="h-4 w-4" />
              Space Cost
            </div>
            <p className="text-xl font-semibold text-white">{blueprint.complexity.space}</p>
          </div>
          <div className="rounded-2xl border border-[#21263A] bg-[#10131D] p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8DA2FF]">
              <Binary className="h-4 w-4" />
              Cost Driver
            </div>
            <p className="text-sm leading-6 text-slate-200">{blueprint.complexity.driver}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#222] bg-[#0D0F14] p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Stage Timeline</p>
            <h4 className="mt-1 text-lg font-semibold text-white">Follow the state transitions instead of memorizing steps</h4>
          </div>
          <Badge variant="outline" className="border-[#2E3340] bg-[#151922] px-3 py-1 text-[11px] text-slate-300">
            {blueprint.stages.length} stages
          </Badge>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1.1fr_1.3fr]">
          <div className="space-y-3">
            {blueprint.stages.map((stage, index) => {
              const isActive = stage.id === activeStage.id;

              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setActiveStageId(stage.id)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition-all ${isActive
                    ? "border-leetcode/50 bg-[#1A1410] shadow-[0_0_0_1px_rgba(255,161,22,0.15)]"
                    : "border-[#222833] bg-[#11151D] hover:border-[#313949] hover:bg-[#141925]"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${isActive ? "bg-leetcode text-black" : "bg-[#1A2130] text-slate-300"}`}>
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-white">{stage.title}</p>
                        {index < blueprint.stages.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-slate-500" />}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{stage.goal}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-[24px] border border-[#262C38] bg-[linear-gradient(180deg,#121722_0%,#0D1017_100%)] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leetcode">Focused Stage</p>
                <h5 className="mt-1 text-xl font-semibold text-white">{activeStage.title}</h5>
              </div>
              <Badge variant="outline" className="border-[#30384A] bg-[#171C27] text-slate-300">
                {activeStage.id}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Input Focus</p>
                <p className="text-sm leading-6 text-slate-200">{activeStage.inputFocus}</p>
              </div>
              <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Transform</p>
                <p className="text-sm leading-6 text-slate-200">{activeStage.operation}</p>
              </div>
              <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Output State</p>
                <p className="text-sm leading-6 text-slate-200">{activeStage.outputState}</p>
              </div>
              <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Why It Matters</p>
                <p className="text-sm leading-6 text-slate-200">{activeStage.whyItMatters}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[#2A3140] bg-[#0F141D] p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Nearby Transitions</p>
              <div className="flex flex-wrap gap-2">
                {activeConnections.length > 0 ? (
                  activeConnections.map((connection) => (
                    <span
                      key={`${connection.from}-${connection.to}-${connection.label}`}
                      className="rounded-full border border-[#364056] bg-[#151B26] px-3 py-1.5 text-xs text-slate-300"
                    >
                      {connection.label}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">This stage directly resolves into the answer.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-[#222] bg-[#0D1015] p-5 md:p-6">
          <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            <Boxes className="h-4 w-4" />
            State Snapshots
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {blueprint.snapshots.map((snapshot) => (
              <div key={snapshot.label} className="rounded-2xl border border-[#252B36] bg-[#121722] p-4">
                <p className="font-semibold text-white">{snapshot.label}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{snapshot.focus}</p>
                <div className="mt-4 space-y-2">
                  {snapshot.items.map((item) => (
                    <div key={item} className="rounded-xl border border-[#202632] bg-[#0E131C] px-3 py-2 text-sm leading-5 text-slate-300">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-[#222] bg-[#0D1015] p-5 md:p-6">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <Route className="h-4 w-4" />
              Decision Gates
            </div>
            <div className="space-y-3">
              {blueprint.decisions.map((decision) => (
                <div key={decision.label} className="rounded-2xl border border-[#252B36] bg-[#121722] p-4">
                  <p className="font-semibold text-white">{decision.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{decision.condition}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-[#1F3A31] bg-[#0E1714] p-3 text-sm text-slate-300">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-easy">If True</p>
                      {decision.ifTrue}
                    </div>
                    <div className="rounded-xl border border-[#3B2730] bg-[#170E13] p-3 text-sm text-slate-300">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FF7A93]">If False</p>
                      {decision.ifFalse}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#35252B] bg-[#140E12] p-5 md:p-6">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#FF9AAF]">
              <ShieldAlert className="h-4 w-4" />
              Failure Modes
            </div>
            <div className="space-y-2">
              {blueprint.pitfalls.map((pitfall) => (
                <div key={pitfall} className="rounded-xl border border-[#473039] bg-[#1A1116] px-3 py-3 text-sm leading-6 text-slate-200">
                  {pitfall}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
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

  // Hint reveal states
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());

  // Solution language tab
  const [solutionLang, setSolutionLang] = useState<"python" | "java" | "cpp">("python");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

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
      <div className="mt-8 space-y-6">
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
  const blueprint = question.aiContent
    ? normalizeBlueprint({
      title: question.title,
      approach: question.aiContent.approach,
      algorithm: question.aiContent.algorithm,
      visualize: question.aiContent.visualize,
    })
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
    <div className="mt-8">
      {/* ── Header ────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-2xl font-bold leading-tight">{question.title}</h1>
          {session?.user && (
            <Button
              onClick={handleMarkSolved}
              disabled={solvingInProgress}
              className={`shrink-0 transition-all duration-300 ${isSolved
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
          {question.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs bg-[#1A1A1A] border-[#333] text-muted-foreground hover:bg-[#2A2A2A] transition-colors"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────── */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          const next = String(value);
          setActiveTab(next);
          if (aiTabs.has(next)) {
            void ensureAIContent();
          }
          if (next === "complexity") {
            void generateComplexityLadder();
          }
          if (next === "solution") {
            void generateImplementationLadder();
          }
        }}
        className="space-y-6"
      >
        <TabsList className="bg-transparent border-b border-[#333] p-0 h-auto overflow-x-auto overflow-y-hidden no-scrollbar flex-nowrap gap-4 md:gap-6 rounded-none justify-start w-full">
          {[
            { id: "description", label: "Description" },
            { id: "hints", label: "Hints", icon: Lightbulb },
            { id: "approach", label: "Mental Model", icon: Brain },
            { id: "algorithm", label: "Execution", icon: ListOrdered },
            { id: "visualize", label: "Architecture", icon: GitBranch },
            { id: "complexity", label: "Complexity", icon: Gauge },
            { id: "solution", label: "Implementation", icon: Code2 },
            { id: "stats", label: "Reality Check", icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="relative rounded-none bg-transparent px-0 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-leetcode data-[state=active]:shadow-none"
              >
                {Icon && <Icon className="h-4 w-4 mr-2" />}
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabBottom"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-leetcode"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
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
            <div className="bg-[#121212] rounded-xl border border-[#222] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-leetcode/10 p-2.5">
                  <Brain className="h-5 w-5 text-leetcode" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">Mental Model</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The core framework to solve this problem optimally.
                  </p>
                </div>
              </div>
              {hasAIContent ? (
                <div className="mt-6">
                  <div className="relative group overflow-hidden rounded-2xl border border-neutral-800/60 bg-gradient-to-br from-[#1A1A1A] to-[#141414] p-8 shadow-2xl transition-all duration-500 hover:border-[#FFA116]/40 hover:shadow-[0_0_30px_rgba(255,161,22,0.1)]">
                    {/* Decorative Elements */}
                    <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#FFA116]/0 blur-[50px] transition-all duration-700 group-hover:bg-[#FFA116]/15 pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[#00B8A3]/0 blur-[50px] transition-all duration-700 group-hover:bg-[#00B8A3]/10 pointer-events-none" />

                    <div className="relative z-10 flex gap-4">
                      <div className="mt-1 shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFA116]/10 border border-[#FFA116]/20">
                          <Sparkles className="h-5 w-5 text-[#FFA116]" />
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        {question.aiContent?.approach?.split('\n\n').filter(p => p.trim().length > 0).map((paragraph, idx) => (
                          <p key={idx} className={`text-[15.5px] leading-relaxed tracking-wide ${idx === 0 ? 'text-white font-medium text-lg' : 'text-slate-300'} font-sans`}>
                            {paragraph.trim().replace(/^\*\*.*?\*\*\s*/, '')}
                          </p>
                        ))}
                      </div>
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
            <div className="bg-[#121212] rounded-xl border border-[#222] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-leetcode/10 p-2.5">
                  <ListOrdered className="h-5 w-5 text-leetcode" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">Execution Strategy</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Step-by-step breakdown of the optimal algorithm.
                  </p>
                </div>
              </div>
              {hasAIContent ? (
                <div className="relative border-l-2 border-neutral-800/80 ml-4 mt-8 space-y-8 pb-4">
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
            <div className="bg-[#121212] rounded-xl border border-[#222] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-leetcode/10 p-2.5">
                  <GitBranch className="h-5 w-5 text-leetcode" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">Visual Solution Blueprint</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    See the algorithm as a sequence of state transitions, decision gates, and snapshots.
                  </p>
                </div>
              </div>
              {hasAIContent ? (
                <div className="rounded-xl border border-[#222] bg-[#0A0A0A] p-4 md:p-5">
                  {blueprint && (
                    <ArchitectureStudio
                      blueprint={blueprint}
                      onRegenerate={() => ensureAIContent(true)}
                    />
                  )}
                  {!blueprint && (
                    <div className="flex flex-col items-center gap-3 p-6 text-center">
                      <AlertTriangle className="h-8 w-8 text-medium" />
                      <p className="text-sm text-muted-foreground">The current visualization payload could not be interpreted.</p>
                    </div>
                  )}
                  {blueprint?.source !== "blueprint" && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#333] hover:bg-[#161616]"
                        onClick={() => ensureAIContent(true)}
                      >
                        Upgrade This Visual
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                renderAIFallback("visual blueprint")
              )}
            </div>
          </FadeIn>
        </TabsContent>

        {/* Complexity */}
        <TabsContent value="complexity" className="mt-0">
          <FadeIn>
            <div className="rounded-xl border border-[#222] bg-[#121212] p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-leetcode/10 p-2.5">
                  <Gauge className="h-5 w-5 text-leetcode" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">Complexity Ladder</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ordered from brute force to the most optimal practical approach.
                  </p>
                </div>
              </div>

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
              <div className="relative h-full w-full rounded-[15px] bg-[#111] p-8">
                <div className="z-10 relative flex items-center gap-4 mb-8">
                  <div className="rounded-xl bg-leetcode/10 p-3 shadow-[0_0_15px_rgba(255,161,22,0.15)] ring-1 ring-leetcode/20">
                    <BarChart3 className="h-5 w-5 text-leetcode" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-100">Reality Check</h3>
                    <p className="text-sm text-leetcode/80 mt-1">AI assessment of your actual odds</p>
                  </div>
                </div>

                {!session?.user ? (
                  <div className="rounded-xl border border-dashed border-[#333] p-8 text-center text-muted-foreground z-10 relative">
                    <p className="text-sm">Sign in to get your AI success analysis.</p>
                  </div>
                ) : (
                  <div className="min-h-[200px] relative z-10 w-full">
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
