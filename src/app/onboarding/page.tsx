"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, Target, Loader2, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DSA_TOPICS, DSATopic } from "@/lib/constants";

export default function OnboardingPage() {
  const router = useRouter();
  const { status } = useSession();
  
  const [selectedTopics, setSelectedTopics] = useState<Set<DSATopic>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const toggleTopic = (topic: DSATopic) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) {
        next.delete(topic);
      } else {
        next.add(topic);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedTopics(new Set(DSA_TOPICS));
  };

  const clearAll = () => {
    setSelectedTopics(new Set());
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/topics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ knownTopics: Array.from(selectedTopics) }),
      });
      if (res.ok) {
        router.push("/dashboard"); // Use absolute push to trigger properly
      }
    } catch (error) {
      console.error("Failed to save topics:", error);
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#FFA116] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-foreground p-6 sm:p-12">
      <div className="max-w-3xl mx-auto py-12">
        <div className="flex items-center gap-2 mb-8">
          <Code2 className="h-8 w-8 text-[#FFA116]" />
          <span className="text-2xl font-bold">
            Leet<span className="text-[#FFA116]">Bro</span> Setup
          </span>
        </div>

        <div className="bg-[#262626] border border-[#333] rounded-2xl p-8 sm:p-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-2">
            <Target className="h-8 w-8 text-[#00B8A3]" />
            <h1 className="text-3xl font-bold">Topic Mastery</h1>
          </div>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Select the Data Structures and Algorithms you are currently comfortable with. 
            LeetBro uses this perfectly tune the readiness engine and warn you if an upcoming problem requires topics you haven&apos;t mastered yet.
          </p>

          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-xl text-[#FFA116]">Available Topics</h3>
            <div className="space-x-4">
              <button onClick={selectAll} className="text-sm text-[#00B8A3] hover:underline transition-all">Select All</button>
              <button onClick={clearAll} className="text-sm text-muted-foreground hover:text-white transition-all">Clear All</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {DSA_TOPICS.map((topic) => (
              <div
                key={topic}
                className={`flex flex-row items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedTopics.has(topic)
                    ? "bg-[#FFA116]/10 border-[#FFA116] ring-1 ring-[#FFA116]"
                    : "bg-[#1A1A1A] hover:bg-[#2A2A2A] border-[#333]"
                }`}
                onClick={() => toggleTopic(topic)}
              >
                <Checkbox
                  checked={selectedTopics.has(topic)}
                  onCheckedChange={() => toggleTopic(topic)}
                  className="data-[state=checked]:bg-[#FFA116] data-[state=checked]:border-[#FFA116]"
                />
                <Label
                  className={`text-sm tracking-wide leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${
                    selectedTopics.has(topic) ? "text-[#FFA116]" : ""
                  }`}
                >
                  {topic}
                </Label>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-[#333] pt-8">
            <p className="text-sm text-muted-foreground">
              {selectedTopics.size} out of {DSA_TOPICS.length} topics selected
            </p>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#FFA116] hover:bg-[#CC8112] text-black h-12 px-8 font-semibold text-base transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Check className="mr-2 h-5 w-5" />
              )}
              Complete Setup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
