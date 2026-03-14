"use client";

import { useState, useEffect } from "react";
import { Check, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DSA_TOPICS, DSATopic } from "@/lib/constants";

export default function SettingsPage() {
  const [selectedTopics, setSelectedTopics] = useState<Set<DSATopic>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch("/api/user/topics");
        if (res.ok) {
          const data = await res.json();
          setSelectedTopics(new Set(data?.knownTopics ?? []));
        }
      } catch (error) {
        console.error("Failed to load topics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopics();
  }, []);

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
    setSaved(false);
  };

  const selectAll = () => {
    setSelectedTopics(new Set(DSA_TOPICS));
    setSaved(false);
  };

  const clearAll = () => {
    setSelectedTopics(new Set());
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/topics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ knownTopics: Array.from(selectedTopics) }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save topics:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 text-[#FFA116] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-[#FFA116]" />
          <div>
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Update your knowledge base to improve the readiness engine predictions.
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className={`h-10 px-6 font-medium transition-all ${
            saved 
              ? "bg-[#00B8A3] hover:bg-[#009b89] text-white"
              : "bg-[#FFA116] hover:bg-[#CC8112] text-black"
          }`}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <><Check className="mr-2 h-4 w-4" /> Saved</>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      <div className="bg-[#262626] border border-[#333] rounded-2xl p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg">Known DSA Topics</h3>
          <div className="space-x-4">
            <button onClick={selectAll} className="text-sm text-[#00B8A3] hover:underline transition-all">Select All</button>
            <button onClick={clearAll} className="text-sm text-muted-foreground hover:text-white transition-all">Clear All</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {DSA_TOPICS.map((topic) => (
            <div
              key={topic}
              className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors duration-200 ${
                selectedTopics.has(topic)
                  ? "bg-[#FFA116]/10 border-[#FFA116]"
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
                className={`text-sm cursor-pointer flex-1 ${
                  selectedTopics.has(topic) ? "text-[#FFA116]" : ""
                }`}
              >
                {topic}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
