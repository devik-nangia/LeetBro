"use client";

import { useSession } from "next-auth/react";
import {
  ArrowRight,
  Loader2,
  Terminal,
  Target,
  SparklesIcon,
  Search
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";

interface SearchResult {
  title: string;
  titleSlug: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
}

interface Question {
  id: string;
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  tags: string[];
}

interface SolvedRecord {
  id: string;
  userId: string;
  questionId: string;
  solvedAt: string;
  question: Question;
}

export default function DashboardHome() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userName = session?.user?.name?.split(" ")[0] ?? "Bro";

  const [history, setHistory] = useState<SolvedRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/user/history");
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchHistory();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const totalSolved = history.length;
  const easyCount = history.filter(h => h.question.difficulty === "Easy").length;
  const mediumCount = history.filter(h => h.question.difficulty === "Medium").length;
  const hardCount = history.filter(h => h.question.difficulty === "Hard").length;
  const recentActivity = history.slice(0, 10);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchSearching, setIsSearchSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchQuestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearchSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearchSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchQuestions(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchQuestions]);

  const difficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy": return "text-[#00B8A3]";
      case "Medium": return "text-[#FFC01E]";
      case "Hard": return "text-[#FF375F]";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="max-w-6xl mx-auto min-h-[80vh] flex flex-col pt-8 pb-20 relative">
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#FFA116]/10 blur-[120px] rounded-full pointer-events-none opacity-50" />

      {/* Header Section */}
      <div className="relative z-10 mt-8 px-4 md:px-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFA116]/10 border border-[#FFA116]/20 text-[#FFA116] text-sm font-medium mb-6">
          <SparklesIcon className="w-4 h-4" />
          <span>Level up your algorithmic intuition</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-neutral-200 to-neutral-600 mb-6 drop-shadow-sm">
          Welcome back,<br />{userName}.
        </h1>
      </div>

      {/* Mobile Search Section */}
      <div className="relative z-10 md:hidden mb-12 px-4 flex flex-col gap-4">
        <h2 className="text-2xl text-white">Start solving today</h2>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search LeetCode problems..."
            className="pl-10 h-12 text-base bg-[#1A1A1A] border-neutral-800 focus:border-[#FFA116] focus:ring-[#FFA116]/20 transition-all rounded-xl shadow-lg"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
            onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
          />
          {isSearchOpen && (searchQuery.length >= 2) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#262626] border border-[#333] rounded-xl shadow-2xl overflow-hidden z-50">
              {isSearchSearching ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-[#FFA116] border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No problems found
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.titleSlug}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#333] transition-colors text-left"
                      onMouseDown={() => router.push(`/problem/${result.titleSlug}`)}
                    >
                      <span className="text-sm font-medium text-white truncate">{result.title}</span>
                      <span className={`text-xs font-bold ml-2 shrink-0 ${difficultyColor(result.difficulty)}`}>
                        {result.difficulty}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 px-4 md:px-0">

        {/* Main Action Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
          </div>

          <div className="bg-[#1A1A1A] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-[#FFA116] animate-spin" />
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="divide-y divide-neutral-800/50">
                {recentActivity.map((record, i) => (
                  <div
                    key={record.id}
                    onClick={() => router.push(`/problem/${record.question.slug}`)}
                    className="p-4 hover:bg-neutral-800/30 transition-colors cursor-pointer group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-neutral-500 font-mono text-sm w-6">
                        {(i + 1).toString().padStart(2, '0')}
                      </div>
                      <div>
                        <h3 className="text-white font-medium group-hover:text-[#FFA116] transition-colors">
                          {record.question.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${record.question.difficulty === 'Easy' ? 'bg-[#00B8A3]/10 text-[#00B8A3] border border-[#00B8A3]/20' :
                            record.question.difficulty === 'Medium' ? 'bg-[#FFA116]/10 text-[#FFA116] border border-[#FFA116]/20' :
                              'bg-[#FF375F]/10 text-[#FF375F] border border-[#FF375F]/20'
                            }`}>
                            {record.question.difficulty}
                          </span>
                          <span className="text-xs text-neutral-500 font-mono">
                            {new Date(record.solvedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-neutral-600 group-hover:text-[#FFA116] transition-colors group-hover:translate-x-1" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                <Terminal className="w-12 h-12 text-neutral-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No problems solved yet</h3>
                <p className="text-neutral-400 max-w-sm mb-6">
                  Ready to test your skills? Head over to your first challenge.
                </p>
                <button
                  onClick={() => router.push('/problem/two-sum')}
                  className="bg-white text-black px-6 py-2.5 rounded-full font-semibold hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  Start Practicing
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Stats Glassmorphic Panel */}
          <div className="rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#141414] border border-neutral-800 p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-semibold text-white/90">Problem Stats</h3>
              <Target className="w-5 h-5 text-neutral-500" />
            </div>

            <div className="flex items-baseline gap-2 mb-8 group-hover:translate-x-1 transition-transform duration-300">
              <span className="text-4xl font-black text-white">{loading ? "-" : totalSolved}</span>
              <span className="text-neutral-400 font-medium">Total Solved</span>
            </div>

            <div className="space-y-4 relative">
              <div className="absolute inset-y-0 left-3 w-px bg-neutral-800 -z-10" />

              <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1A1A1A] border border-neutral-800 flex items-center justify-center z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00B8A3] shadow-[0_0_10px_rgba(0,184,163,0.5)]" />
                  </div>
                  <span className="text-neutral-300 font-medium tracking-wide">Easy</span>
                </div>
                <span className="text-white font-bold">{loading ? "-" : easyCount}</span>
              </div>

              <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform duration-300 delay-75">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1A1A1A] border border-neutral-800 flex items-center justify-center z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFA116] shadow-[0_0_10px_rgba(255,161,22,0.5)]" />
                  </div>
                  <span className="text-neutral-300 font-medium tracking-wide">Medium</span>
                </div>
                <span className="text-white font-bold">{loading ? "-" : mediumCount}</span>
              </div>

              <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform duration-300 delay-150">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1A1A1A] border border-neutral-800 flex items-center justify-center z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF375F] shadow-[0_0_10px_rgba(255,55,95,0.5)]" />
                  </div>
                  <span className="text-neutral-300 font-medium tracking-wide">Hard</span>
                </div>
                <span className="text-white font-bold">{loading ? "-" : hardCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
