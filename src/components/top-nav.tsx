"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Search, User, Settings, LogOut, Code2, Menu, X, Trophy, Filter, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchResult {
  title: string;
  titleSlug: string;
  difficulty: string;
}

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

export function TopNav() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  // Mobile sidebar state
  const [history, setHistory] = useState<SolvedQuestion[]>([]);
  const [filter, setFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [sidebarLoading, setSidebarLoading] = useState(false);

  // Close mobile menu on route change and handle navigation state
  useEffect(() => {
    setMobileMenuOpen(false);
    
    // If we were navigating to a slug and the pathname now includes it, navigation is complete
    if (navigatingTo && pathname?.includes(navigatingTo)) {
      setNavigatingTo(null);
      setIsOpen(false);
      setQuery("");
      setResults([]);
      setSearchExpanded(false);
    } else if (!navigatingTo) {
      setSearchExpanded(false);
    }
  }, [pathname, navigatingTo]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const fetchHistory = useCallback(async () => {
    if (!session?.user) return;
    setSidebarLoading(true);
    try {
      const res = await fetch("/api/user/history");
      if (res.ok) setHistory(await res.json());
    } catch { /* ignore */ } finally {
      setSidebarLoading(false);
    }
  }, [session]);

  // Fetch sidebar history when mobile menu opens
  useEffect(() => {
    if (mobileMenuOpen && session?.user && history.length === 0) {
      fetchHistory();
    }
  }, [mobileMenuOpen, session, history.length, fetchHistory]);

  // Listen to global history updates
  useEffect(() => {
    window.addEventListener("historyUpdated", fetchHistory);
    return () => window.removeEventListener("historyUpdated", fetchHistory);
  }, [fetchHistory]);

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
    setNavigatingTo(slug);
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

  const sidebarDifficultyColor = (diff: string) => {
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

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.question.title.toLowerCase().includes(filter.toLowerCase());
    const matchesDifficulty = difficultyFilter === "All" || item.question.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-[#1F1F1F]/80 backdrop-blur-xl">
        {/* Main nav row */}
        <div className="relative flex h-full items-center px-4">
          {/* LEFT: Hamburger (mobile) + Logo */}
          <div className="flex items-center gap-2 shrink-0 z-10">
            <button
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg hover:bg-[#2A2A2A] transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <Code2 className="h-6 w-6 text-[#FFA116]" />
              <span className="text-lg font-bold hidden sm:block">
                Leet<span className="text-[#FFA116]">Bro</span>
              </span>
            </Link>
          </div>

          {/* CENTER: Desktop search — absolutely centered in the navbar */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-full max-w-xl px-4">
            <div className="relative w-full">
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
              <div className="absolute top-full left-4 right-4 mt-1 bg-[#262626] border border-[#333] rounded-lg shadow-2xl overflow-hidden z-50">
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
                        {navigatingTo === result.titleSlug ? (
                          <div className="h-4 w-4 border-2 border-[#FFA116] border-t-transparent rounded-full animate-spin ml-2 shrink-0" />
                        ) : (
                          <span className={`text-xs font-medium ml-2 shrink-0 ${difficultyColor(result.difficulty)}`}>
                            {result.difficulty}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Search icon (mobile) + Profile — always visible, pinned to the right */}
          <div className="flex items-center gap-2 shrink-0 ml-auto z-10">
            {/* Mobile search toggle - only show if not on dashboard */}
            {pathname !== "/dashboard" && (
              <button
                className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg hover:bg-[#2A2A2A] transition-colors"
                onClick={() => setSearchExpanded((prev) => !prev)}
                aria-label="Search"
              >
                {searchExpanded ? <X className="h-5 w-5" /> : <Search className="h-5 w-5 text-muted-foreground" />}
              </button>
            )}

            {/* Profile */}
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="h-9 w-9 rounded-full flex items-center justify-center p-0 overflow-hidden hover:opacity-80 focus-visible:outline-none transition-opacity bg-[#2A2A2A] border border-[#444]">
                    {session.user.image ? (
                      <img
                        // eslint-disable-next-line @next/next/no-img-element
                        src={session.user.image}
                        alt={session.user.name ?? "User"}
                        className="h-9 w-9 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="h-5 w-5 text-foreground" />
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

        {/* Mobile expanded search bar (slides down below the header) */}
        {searchExpanded && (
          <div className="md:hidden absolute top-14 left-0 right-0 bg-[#1F1F1F]/95 backdrop-blur-xl border-b border-border px-4 py-2 z-50">
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
                autoFocus
              />
            </div>
            {isOpen && (query.length >= 2) && (
              <div className="absolute top-full left-4 right-4 mt-0 bg-[#262626] border border-[#333] rounded-b-lg shadow-2xl overflow-hidden z-50">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 border-2 border-[#FFA116] border-t-transparent rounded-full animate-spin" />
                      Searching...
                    </div>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">No problems found</div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {results.map((result) => (
                      <button
                        key={result.titleSlug}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#333] transition-colors text-left"
                        onMouseDown={() => handleSelect(result.titleSlug)}
                      >
                        <span className="text-sm truncate">{result.title}</span>
                        {navigatingTo === result.titleSlug ? (
                          <div className="h-4 w-4 border-2 border-[#FFA116] border-t-transparent rounded-full animate-spin ml-2 shrink-0" />
                        ) : (
                          <span className={`text-xs font-medium ml-2 shrink-0 ${difficultyColor(result.difficulty)}`}>
                            {result.difficulty}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </header>


      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer panel */}
          <aside className="relative z-10 w-[280px] max-w-[85vw] bg-[#1F1F1F] flex flex-col h-full shadow-2xl border-r border-[#333]">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-[#333] shrink-0">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <Code2 className="h-5 w-5 text-[#FFA116]" />
                <span className="font-bold">Leet<span className="text-[#FFA116]">Bro</span></span>
              </Link>
              <button
                className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-[#2A2A2A] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Stats */}
            <div className="p-4 border-b border-[#333] shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-[#FFA116]" />
                <span className="text-sm font-medium text-[#FFA116]">Problems Solved</span>
              </div>
              <div className="text-2xl font-bold">{history.length}</div>
              <div className="flex gap-2 mt-2">
                {["Easy", "Medium", "Hard"].map((d) => {
                  const count = history.filter((h) => h.question.difficulty === d).length;
                  return (
                    <span key={d} className={`text-xs px-2 py-0.5 rounded-full border ${sidebarDifficultyColor(d)}`}>
                      {count}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Filter */}
            <div className="p-3 space-y-2 border-b border-[#333] shrink-0">
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
                <DropdownMenuTrigger className="w-full h-8 px-3 text-xs bg-[#2A2A2A] border border-[#333] rounded-md flex items-center justify-between hover:bg-[#333] transition-colors focus:outline-none">
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

            {/* History list */}
            <ScrollArea className="flex-1">
              {sidebarLoading ? (
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
                    onClick={() => { router.push("/login"); setMobileMenuOpen(false); }}
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
                      onClick={() => { router.push(`/problem/${item.question.slug}`); setMobileMenuOpen(false); }}
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
                          className={`text-[10px] px-1.5 py-0 h-4 shrink-0 ${sidebarDifficultyColor(item.question.difficulty)}`}
                        >
                          {item.question.difficulty[0]}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Settings link */}
            <div className="p-3 border-t border-[#333] shrink-0">
              <button
                onClick={() => { router.push("/settings"); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#2A2A2A] transition-colors text-sm text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
