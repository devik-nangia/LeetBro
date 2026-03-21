"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROADMAPS, type Roadmap } from "@/lib/roadmaps";
import { Map, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";

function DifficultyDot({ difficulty }: { difficulty: string }) {
  const color =
    difficulty === "Easy"
      ? "bg-[#00B8A3]"
      : difficulty === "Medium"
      ? "bg-[#FFC01E]"
      : "bg-[#FF375F]";
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
}

function RoadmapCard({
  roadmap,
  solvedSlugs,
  isLoading,
}: {
  roadmap: Roadmap;
  solvedSlugs: string[] | null;
  isLoading: boolean;
}) {
  const router = useRouter();
  const total = roadmap.totalProblems;
  const solved = solvedSlugs
    ? roadmap.groups
        .flatMap((g) => g.problems)
        .filter((p) => solvedSlugs.includes(p.slug)).length
    : 0;
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  const easy = roadmap.groups
    .flatMap((g) => g.problems)
    .filter((p) => p.difficulty === "Easy").length;
  const medium = roadmap.groups
    .flatMap((g) => g.problems)
    .filter((p) => p.difficulty === "Medium").length;
  const hard = roadmap.groups
    .flatMap((g) => g.problems)
    .filter((p) => p.difficulty === "Hard").length;

  return (
    <div
      onClick={() => router.push(`/roadmaps/${roadmap.id}`)}
      className="group relative flex flex-col rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#1A1A1A] to-[#141414] p-6 cursor-pointer hover:border-[#FFA116]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,161,22,0.06)] overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFA116]/5 blur-3xl rounded-full pointer-events-none group-hover:bg-[#FFA116]/10 transition-all duration-500" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFA116]/10 border border-[#FFA116]/20">
            <Map className="h-5 w-5 text-[#FFA116]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{roadmap.name}</h2>
            <p className="text-xs text-neutral-500">{roadmap.groups.length} topics</p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-neutral-600 group-hover:text-[#FFA116] group-hover:translate-x-1 transition-all duration-200 shrink-0 mt-1" />
      </div>

      <p className="text-sm text-neutral-400 leading-relaxed mb-5 relative z-10 flex-1">
        {roadmap.description}
      </p>

      {/* Difficulty breakdown */}
      <div className="flex gap-4 mb-5 relative z-10">
        <div className="flex items-center gap-1.5 text-xs text-[#00B8A3]">
          <DifficultyDot difficulty="Easy" />
          <span>{easy} Easy</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#FFC01E]">
          <DifficultyDot difficulty="Medium" />
          <span>{medium} Med</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#FF375F]">
          <DifficultyDot difficulty="Hard" />
          <span>{hard} Hard</span>
        </div>
      </div>

      {/* Progress */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-neutral-500">Progress</span>
          {isLoading ? (
            <div className="h-3 w-12 rounded shimmer" />
          ) : (
            <span className="text-xs font-semibold text-neutral-300">
              {solved}/{total}{" "}
              <span className="text-[#FFA116]">({pct}%)</span>
            </span>
          )}
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#2A2A2A] overflow-hidden">
          {isLoading ? (
            <div className="h-full w-1/3 shimmer rounded-full" />
          ) : (
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FFA116] to-[#FF8C00] transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function RoadmapsPage() {
  const { data: session, status } = useSession();
  const [progressMap, setProgressMap] = useState<Record<string, string[]>>({});
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoadingProgress(true);
    Promise.all(
      ROADMAPS.map((r) =>
        fetch(`/api/user/roadmap-progress?roadmapId=${r.id}`)
          .then((res) => (res.ok ? res.json() : { solvedSlugs: [] }))
          .then((data) => ({ id: r.id, slugs: data.solvedSlugs ?? [] }))
          .catch(() => ({ id: r.id, slugs: [] }))
      )
    ).then((results) => {
      const map: Record<string, string[]> = {};
      results.forEach(({ id, slugs }) => { map[id] = slugs; });
      setProgressMap(map);
      setLoadingProgress(false);
    });
  }, [status]);

  return (
    <div className="max-w-5xl mx-auto pb-24 mt-2">
      {/* Header */}
      <div className="mb-10 px-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFA116]/10 border border-[#FFA116]/20 text-[#FFA116] text-sm font-medium mb-4">
          <Map className="w-4 h-4" />
          <span>Structured Learning Paths</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
          Interview Roadmaps
        </h1>
        <p className="text-neutral-400 max-w-xl">
          Follow a proven curriculum. Track your progress problem-by-problem and stay on top of every topic.
        </p>
        {!session?.user && (
          <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500">
            <Lock className="h-4 w-4" />
            <span>
              <Link href="/login" className="text-[#FFA116] underline-offset-2 hover:underline">
                Sign in
              </Link>{" "}
              to track your progress across roadmaps.
            </span>
          </div>
        )}
        {session?.user && (
          <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500">
            <CheckCircle2 className="h-4 w-4 text-[#00B8A3]" />
            <span>Your solved problems are synced automatically.</span>
          </div>
        )}
      </div>

      {/* Roadmap cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">
        {ROADMAPS.map((roadmap) => (
          <RoadmapCard
            key={roadmap.id}
            roadmap={roadmap}
            solvedSlugs={progressMap[roadmap.id] ?? null}
            isLoading={status === "authenticated" && loadingProgress}
          />
        ))}
      </div>
    </div>
  );
}
