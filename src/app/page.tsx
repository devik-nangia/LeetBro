import Link from "next/link";
import { ArrowRight, Code2, Brain, CheckCircle2, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E8E8E8] selection:bg-[#FFA116]/30">
      {/* Navbar */}
      <nav className="border-b border-[#333] bg-[#1F1F1F]/80 backdrop-blur-md fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-[#FFA116]" />
            <span className="text-xl font-bold">
              Leet<span className="text-[#FFA116]">Bro</span>
            </span>
          </div>
          <div>
            <Link href="/login">
              <Button className="bg-[#FFA116] hover:bg-[#CC8112] text-black font-medium">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Stop reading solutions. <br />
            <span className="text-[#FFA116]">Start thinking.</span>
          </h1>
        </div>

        {/* The Problem vs The Solution Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-lg text-neutral-400">Stop fighting with generic prompt outputs. Watch how LeetBro rethinks the process.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* The Problem */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2 px-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-500 font-bold">1</div>
                <div>
                  <h3 className="text-2xl font-bold text-white">The Old Way</h3>
                  <p className="text-sm text-neutral-400">Copying into ChatGPT</p>
                </div>
              </div>

              <div className="relative rounded-2xl border border-neutral-800 bg-[#141414] overflow-hidden p-1 group">
                {/* Simulated Browser Bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800 bg-[#1A1A1A]">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                {/* Video */}
                <div className="relative aspect-video bg-neutral-900 border border-t-0 border-neutral-800/50 flex flex-col items-center justify-center overflow-hidden">
                  <video 
                    src="/before.mp4" 
                    className="absolute inset-0 w-full h-full object-cover rounded-b-xl"
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                  />
                  <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
                </div>
                {/* Description */}
                <div className="p-6 bg-[#1A1A1A]">
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    You paste the problem text. The AI spits out the entire optimized `O(n)` solution instantly. You glance at it, say "Oh, that makes sense", and learn absolutely nothing about how to derive it yourself.
                  </p>
                </div>
              </div>
            </div>

            {/* The Solution */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2 px-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00B8A3]/10 text-[#00B8A3] font-bold border border-[#00B8A3]/20">2</div>
                <div>
                  <h3 className="text-2xl font-bold text-white">The LeetBro Way</h3>
                  <p className="text-sm text-[#00B8A3]">Progressive Intuition building</p>
                </div>
              </div>

              <div className="relative rounded-2xl border border-[#FFA116]/30 bg-[#1A1A1A] overflow-hidden p-1 shadow-[0_0_50px_rgba(255,161,22,0.05)] group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFA116]/10 blur-[100px] pointer-events-none rounded-full" />

                {/* Simulated LeetBro UI Bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800 bg-[#1A1A1A]">
                  <Code2 className="w-5 h-5 text-[#FFA116]" />
                  <span className="text-sm font-bold text-white tracking-widest uppercase">LeetBro Companion</span>
                </div>

                {/* Video */}
                <div className="relative aspect-video bg-[#0A0A0A] border border-t-0 border-neutral-800/50 flex flex-col items-center justify-center overflow-hidden">
                  <video 
                    src="/after.mp4" 
                    className="absolute inset-0 w-full h-full object-cover rounded-b-xl"
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#FFA116]/5 to-transparent pointer-events-none" />
                </div>
                {/* Description */}
                <div className="p-6 bg-[#1A1A1A]">
                  <p className="text-neutral-300 text-sm leading-relaxed">
                    You load up the same problem in LeetBro. It starts by breaking down the conceptual approach, then guides you with progressive hints, only revealing code when you actively request it.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
