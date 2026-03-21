"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Trophy, ChevronDown, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface SolvedQuestion {
  id: string;
  questionId: string;
  solvedAt: string;
  question: {
    id: string;
    slug: string;
    title: string;
    difficulty: string;
    tags: string[];
  };
}

export function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [history, setHistory] = useState<SolvedQuestion[]>([]);
  const [filter, setFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/user/history");
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();

    const handleHistoryUpdated = () => fetchHistory();
    window.addEventListener("historyUpdated", handleHistoryUpdated);
    return () => window.removeEventListener("historyUpdated", handleHistoryUpdated);
  }, [session]);

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.question.title
      .toLowerCase()
      .includes(filter.toLowerCase());
    const matchesDifficulty =
      difficultyFilter === "All" || item.question.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const difficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy": return "bg-[#00B8A3]/15 text-[#00B8A3] border-[#00B8A3]/30";
      case "Medium": return "bg-[#FFC01E]/15 text-[#FFC01E] border-[#FFC01E]/30";
      case "Hard": return "bg-[#FF375F]/15 text-[#FF375F] border-[#FF375F]/30";
      default: return "";
    }
  };

  const activeSlug = pathname?.startsWith("/problem/")
    ? pathname.split("/problem/")[1]
    : null;

  return (
    <aside className="fixed top-14 left-0 bottom-0 w-[250px] border-r border-border bg-[#1F1F1F] hidden md:flex flex-col z-40">
      {/* Stats Header */}
      <div className="p-4 border-b border-[#333]">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="h-4 w-4 text-[#FFA116]" />
          <span className="text-sm font-medium text-[#FFA116]">
            Problems Solved
          </span>
        </div>
        <div className="text-2xl font-bold">
          {history.length}
        </div>
        <div className="flex gap-2 mt-2">
          {["Easy", "Medium", "Hard"].map((d) => {
            const count = history.filter((h) => h.question.difficulty === d).length;
            return (
              <span
                key={d}
                className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColor(d)}`}
              >
                {count}
              </span>
            );
          })}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="p-3 space-y-2 border-b border-[#333]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Filter solved..."
            className="pl-8 h-8 text-xs bg-[#2A2A2A] border-[#333]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="w-full h-8 px-3 text-xs bg-[#2A2A2A] border border-[#333] rounded-md flex items-center justify-between hover:bg-[#333] transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <span className="flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              {difficultyFilter}
            </span>
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#262626] border-[#333]">
            {["All", "Easy", "Medium", "Hard"].map((d) => (
              <DropdownMenuItem
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className="cursor-pointer focus:bg-[#333] text-xs"
              >
                {d}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* History List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-lg shimmer" />
            ))}
          </div>
        ) : !session?.user ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            <p className="mb-2">Sign in to track progress</p>
            <Button
              size="sm"
              className="bg-[#FFA116] hover:bg-[#CC8112] text-black"
              onClick={() => router.push("/login")}
            >
              Sign In
            </Button>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-xs">
            {filter || difficultyFilter !== "All"
              ? "No matching problems"
              : "No problems solved yet. Start exploring!"}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredHistory.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(`/problem/${item.question.slug}`)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  activeSlug === item.question.slug
                    ? "bg-[#FFA116]/10 border border-[#FFA116]/30"
                    : "hover:bg-[#2A2A2A] border border-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium truncate flex-1 group-hover:text-[#FFA116] transition-colors">
                    {item.question.title}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 h-4 shrink-0 ${difficultyColor(
                      item.question.difficulty
                    )}`}
                  >
                    {item.question.difficulty[0]}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
