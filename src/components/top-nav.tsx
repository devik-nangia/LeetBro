"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, User, Settings, LogOut, Code2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface SearchResult {
  title: string;
  titleSlug: string;
  difficulty: string;
}

export function TopNav() {
  const { data: session } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchQuestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchQuestions(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchQuestions]);

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/problem/${slug}`);
  };

  const difficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy": return "text-[#00B8A3]";
      case "Medium": return "text-[#FFC01E]";
      case "Hard": return "text-[#FF375F]";
      default: return "text-muted-foreground";
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-[#1F1F1F]/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 min-w-[250px] transition-opacity hover:opacity-80">
          <Code2 className="h-6 w-6 text-[#FFA116]" />
          <span className="text-lg font-bold">
            Leet<span className="text-[#FFA116]">Bro</span>
          </span>
        </Link>

        {/* Search */}
        <div className="relative flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search LeetCode problems..."
              className="pl-10 bg-[#2A2A2A] border-[#333] focus:border-[#FFA116] focus:ring-[#FFA116]/20 transition-all"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => query.length >= 2 && setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            />
          </div>

          {isOpen && (query.length >= 2) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#262626] border border-[#333] rounded-lg shadow-2xl overflow-hidden z-50">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-[#FFA116] border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No problems found
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {results.map((result) => (
                    <button
                      key={result.titleSlug}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#333] transition-colors text-left"
                      onMouseDown={() => handleSelect(result.titleSlug)}
                    >
                      <span className="text-sm truncate">{result.title}</span>
                      <span className={`text-xs font-medium ml-2 ${difficultyColor(result.difficulty)}`}>
                        {result.difficulty}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 min-w-[100px] justify-end">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="h-9 w-9 rounded-full flex items-center justify-center p-0 overflow-hidden hover:bg-accent focus-visible:outline-none transition-colors border border-transparent">
                  {session.user.image ? (
                    <img
                      // eslint-disable-next-line @next/next/no-img-element
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#262626] border-[#333]">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-[#333]" />
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-[#333]"
                  onClick={() => router.push("/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-[#333] text-red-400 focus:text-red-400"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="border-[#FFA116] text-[#FFA116] hover:bg-[#FFA116]/10"
              onClick={() => router.push("/login")}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
