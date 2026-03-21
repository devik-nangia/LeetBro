"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getRoadmapById, type RoadmapGroup, type RoadmapProblem } from "@/lib/roadmaps";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Loader2,
  Map,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

function difficultyColor(d: string) {
  if (d === "Easy") return "text-[#00B8A3] border-[#00B8A3]/30 bg-[#00B8A3]/10";
  if (d === "Medium") return "text-[#FFC01E] border-[#FFC01E]/30 bg-[#FFC01E]/10";
  return "text-[#FF375F] border-[#FF375F]/30 bg-[#FF375F]/10";
}

function ProblemRow({
  problem,
  index,
  isSolved,
  isSignedIn,
  onToggle,
  isToggling,
}: {
  problem: RoadmapProblem;
  index: number;
  isSolved: boolean;
  isSignedIn: boolean;
  onToggle: (slug: string, currentlySolved: boolean) => void;
  isToggling: boolean;
}) {
  const router = useRouter();

  return (
    <div
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer border ${
        isSolved
          ? "border-[#00B8A3]/15 bg-[#00B8A3]/5 hover:bg-[#00B8A3]/8"
          : "border-transparent hover:bg-[#2A2A2A] hover:border-[#333]"
      }`}
      onClick={() => router.push(`/problem/${problem.slug}`)}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isSignedIn || isToggling) return;
          onToggle(problem.slug, isSolved);
        }}
        disabled={!isSignedIn || isToggling}
        className="shrink-0 relative"
        aria-label={isSolved ? "Mark as unsolved" : "Mark as solved"}
      >
        {isToggling ? (
          <Loader2 className="h-5 w-5 text-[#FFA116] animate-spin" />
        ) : isSolved ? (
          <CheckCircle2 className="h-5 w-5 text-[#00B8A3]" />
        ) : (
          <Circle className={`h-5 w-5 transition-colors ${isSignedIn ? "text-neutral-600 group-hover:text-neutral-400" : "text-neutral-700"}`} />
        )}
      </button>

      {/* Number */}
      <span className="text-xs text-neutral-600 w-5 shrink-0 text-right">{index + 1}</span>

      {/* Title */}
      <span
        className={`flex-1 text-sm font-medium truncate transition-colors ${
          isSolved ? "text-neutral-400 line-through decoration-[#00B8A3]/40" : "text-neutral-200 group-hover:text-white"
        }`}
      >
        {problem.title}
      </span>

      {/* Difficulty badge */}
      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${difficultyColor(problem.difficulty)}`}>
        {problem.difficulty[0]}
      </span>

      {/* External link icon */}
      <ExternalLink className="h-3.5 w-3.5 text-neutral-700 shrink-0 group-hover:text-neutral-500 transition-colors" />
    </div>
  );
}

function TopicGroup({
  group,
  solvedSlugs,
  isSignedIn,
  onToggle,
  togglingSlug,
}: {
  group: RoadmapGroup;
  solvedSlugs: Set<string>;
  isSignedIn: boolean;
  onToggle: (slug: string, currentlySolved: boolean) => void;
  togglingSlug: string | null;
}) {
  const solved = group.problems.filter((p) => solvedSlugs.has(p.slug)).length;
  const total = group.problems.length;
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-[#222] bg-[#141414] overflow-hidden">
      {/* Group header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#1A1A1A] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold border ${
              pct === 100
                ? "bg-[#00B8A3]/10 border-[#00B8A3]/30 text-[#00B8A3]"
                : "bg-[#FFA116]/10 border-[#FFA116]/20 text-[#FFA116]"
            }`}
          >
            {pct === 100 ? "✓" : `${solved}`}
          </div>
          <span className="font-semibold text-white text-sm truncate">{group.title}</span>
        </div>

        <div className="flex items-center gap-4 shrink-0 ml-3">
          {/* Mini progress */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-20 h-1.5 rounded-full bg-[#2A2A2A] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FFA116] to-[#FF8C00] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-neutral-500 w-16 text-right">
              {solved}/{total}
            </span>
          </div>
          {open ? (
            <ChevronUp className="h-4 w-4 text-neutral-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          )}
        </div>
      </button>

      {/* Mobile progress bar */}
      {open && (
        <div className="sm:hidden px-5 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-[#2A2A2A] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FFA116] to-[#FF8C00]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-neutral-500">{solved}/{total}</span>
          </div>
        </div>
      )}

      {/* Problems list */}
      {open && (
        <div className="border-t border-[#1E1E1E] px-3 py-2 space-y-0.5">
          {group.problems.map((problem, i) => (
            <ProblemRow
              key={problem.slug}
              problem={problem}
              index={i}
              isSolved={solvedSlugs.has(problem.slug)}
              isSignedIn={isSignedIn}
              onToggle={onToggle}
              isToggling={togglingSlug === problem.slug}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const roadmap = getRoadmapById(id);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [solvedSlugs, setSolvedSlugs] = useState<Set<string>>(new Set());
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (status !== "authenticated" || !roadmap) return;
    setLoadingProgress(true);
    try {
      const res = await fetch(`/api/user/roadmap-progress?roadmapId=${roadmap.id}`);
      if (res.ok) {
        const data = await res.json();
        setSolvedSlugs(new Set(data.solvedSlugs ?? []));
      }
    } catch { /* ignore */ } finally {
      setLoadingProgress(false);
    }
  }, [status, roadmap]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Listen for historyUpdated from problem page (when marking solved there)
  useEffect(() => {
    window.addEventListener("historyUpdated", fetchProgress);
    return () => window.removeEventListener("historyUpdated", fetchProgress);
  }, [fetchProgress]);

  const handleToggle = useCallback(
    async (slug: string, currentlySolved: boolean) => {
      if (!session?.user || togglingSlug) return;
      setTogglingSlug(slug);

      // Optimistic update
      setSolvedSlugs((prev) => {
        const next = new Set(prev);
        if (currentlySolved) next.delete(slug);
        else next.add(slug);
        return next;
      });

      try {
        // Find the question ID from slug
        const res = await fetch(`/api/questions/${slug}`);
        if (!res.ok) throw new Error("Failed to fetch question");
        const question = await res.json();

        await fetch("/api/user/solved", {
          method: currentlySolved ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: question.id }),
        });
        window.dispatchEvent(new CustomEvent("historyUpdated"));
      } catch {
        // Revert
        setSolvedSlugs((prev) => {
          const next = new Set(prev);
          if (currentlySolved) next.add(slug);
          else next.delete(slug);
          return next;
        });
      } finally {
        setTogglingSlug(null);
      }
    },
    [session, togglingSlug]
  );

  if (!roadmap) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Map className="h-12 w-12 text-neutral-600 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Roadmap Not Found</h2>
        <p className="text-neutral-500 mb-4">This roadmap doesn&apos;t exist.</p>
        <Link
          href="/roadmaps"
          className="text-[#FFA116] hover:underline text-sm"
        >
          Back to Roadmaps
        </Link>
      </div>
    );
  }

  const allProblems = roadmap.groups.flatMap((g) => g.problems);
  const totalSolved = allProblems.filter((p) => solvedSlugs.has(p.slug)).length;
  const totalProblems = allProblems.length;
  const overallPct = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  const easySolved = allProblems.filter((p) => p.difficulty === "Easy" && solvedSlugs.has(p.slug)).length;
  const easyTotal = allProblems.filter((p) => p.difficulty === "Easy").length;
  const medSolved = allProblems.filter((p) => p.difficulty === "Medium" && solvedSlugs.has(p.slug)).length;
  const medTotal = allProblems.filter((p) => p.difficulty === "Medium").length;
  const hardSolved = allProblems.filter((p) => p.difficulty === "Hard" && solvedSlugs.has(p.slug)).length;
  const hardTotal = allProblems.filter((p) => p.difficulty === "Hard").length;

  return (
    <div className="max-w-5xl mx-auto pb-24 mt-2">
      {/* Back link */}
      <button
        onClick={() => router.push("/roadmaps")}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-[#FFA116] transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        All Roadmaps
      </button>

      {/* Header card */}
      <div className="relative rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#1A1A1A] to-[#111] p-6 mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFA116]/5 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Map className="h-5 w-5 text-[#FFA116]" />
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#FFA116]">
                  Roadmap
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
                {roadmap.name}
              </h1>
              <p className="text-sm text-neutral-400 max-w-lg">{roadmap.description}</p>
            </div>

            {/* Overall progress ring-like stat */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-1 shrink-0">
              {loadingProgress ? (
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                <>
                  <div className="text-4xl font-black text-white">{overallPct}%</div>
                  <div className="text-xs text-neutral-500">{totalSolved} / {totalProblems} solved</div>
                </>
              )}
            </div>
          </div>

          {/* Big progress bar */}
          <div className="mb-4">
            <div className="h-2 w-full rounded-full bg-[#222] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FFA116] to-[#FF8C00] transition-all duration-700"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>

          {/* Per-difficulty stats */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00B8A3]" />
              <span className="text-xs text-neutral-400">
                Easy: <span className="text-[#00B8A3] font-semibold">{easySolved}/{easyTotal}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FFC01E]" />
              <span className="text-xs text-neutral-400">
                Medium: <span className="text-[#FFC01E] font-semibold">{medSolved}/{medTotal}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF375F]" />
              <span className="text-xs text-neutral-400">
                Hard: <span className="text-[#FF375F] font-semibold">{hardSolved}/{hardTotal}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sign-in prompt */}
      {status === "unauthenticated" && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-[#FFA116]/20 bg-[#FFA116]/5 px-4 py-3">
          <p className="text-sm text-neutral-400">
            Sign in to track your progress on this roadmap.
          </p>
          <Link
            href="/login"
            className="shrink-0 text-sm font-semibold text-[#FFA116] hover:underline"
          >
            Sign In →
          </Link>
        </div>
      )}

      {/* Topic groups */}
      <div className="space-y-3">
        {roadmap.groups.map((group) => (
          <TopicGroup
            key={group.title}
            group={group}
            solvedSlugs={solvedSlugs}
            isSignedIn={Boolean(session?.user)}
            onToggle={handleToggle}
            togglingSlug={togglingSlug}
          />
        ))}
      </div>
    </div>
  );
}
