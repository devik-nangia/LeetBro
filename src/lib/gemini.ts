import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const geminiModel = genAI
  ? genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview",
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
    },
  })
  : null;

// Text model (no JSON mime type) for free-form text responses
export const geminiTextModel = genAI
  ? genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview",
    generationConfig: {
      maxOutputTokens: 8192,
    },
  })
  : null;

export interface GeminiQuestionResponse {
  hint1: string;
  hint2: string;
  hint3: string;
  approach: string;
  algorithm: string;
  visualize: {
    version: "2";
    metaphor: string;
    objective: string;
    invariant: string;
    stages: Array<{
      id: string;
      title: string;
      goal: string;
      inputFocus: string;
      operation: string;
      outputState: string;
      whyItMatters: string;
    }>;
    connections: Array<{
      from: string;
      to: string;
      label: string;
    }>;
    decisions: Array<{
      label: string;
      condition: string;
      ifTrue: string;
      ifFalse: string;
    }>;
    snapshots: Array<{
      label: string;
      focus: string;
      items: string[];
    }>;
    pitfalls: string[];
    complexity: {
      time: string;
      space: string;
      driver: string;
    };
  };
  solutionPython: string;
  solutionJava: string;
  solutionCpp: string;
}

export function buildPrompt(
  title: string,
  description: string,
  difficulty: string,
  tags: string[]
): string {
  return `You are an expert competitive programming tutor. Given the following LeetCode problem, generate structured learning content.

**Problem:** ${title}
**Difficulty:** ${difficulty}
**Tags:** ${tags.join(", ")}
**Description:**
${description}

Return a JSON object with these exact keys:

1. "hint1": A very subtle, conceptual nudge. Do NOT mention the specific data structure or algorithm name. Just hint at the underlying pattern (1-2 sentences).
2. "hint2": A more direct hint that names the data structure or technique to use, but does NOT describe the algorithm (1-2 sentences).
3. "hint3": A very strong hint that nearly describes the solution approach without showing any code. Someone reading this should almost know the exact algorithm (2-3 sentences).
4. "approach": A detailed 2-3 paragraph explanation of HOW to think about this problem. Describe the mental model, key observations, and why a particular approach works. Do NOT include any code.
5. "algorithm": A numbered step-by-step list (as a single string with newlines) describing the exact logical steps to implement the solution. NO code blocks. NO pseudocode. Pure english logical steps.
6. "visualize": An object representing a VISUAL SOLUTION BLUEPRINT. This must help the user imagine the algorithm in motion, not restate pseudocode.
   Use this exact structure:
   {
     "version": "2",
     "metaphor": "Short vivid analogy for the algorithm. Example: Sweep a window across the array while a hash map acts like memory.",
     "objective": "One sentence describing what the algorithm is trying to lock in.",
     "invariant": "One sentence describing what remains true throughout execution.",
     "stages": [
       {
         "id": "stage-1",
         "title": "Short stage name",
         "goal": "What this stage accomplishes",
         "inputFocus": "What state/data we are looking at before acting",
         "operation": "What transformation/check/update happens here",
         "outputState": "What the state looks like after this stage",
         "whyItMatters": "Why this stage is necessary"
       }
     ],
     "connections": [
       {
         "from": "stage-1",
         "to": "stage-2",
         "label": "What causes the transition"
       }
     ],
     "decisions": [
       {
         "label": "Decision name",
         "condition": "What is being checked",
         "ifTrue": "What happens if the condition passes",
         "ifFalse": "What happens otherwise"
       }
     ],
     "snapshots": [
       {
         "label": "Snapshot name",
         "focus": "What moment of the algorithm this captures",
         "items": ["3-4 short bullets describing the visible state"]
       }
     ],
     "pitfalls": ["3-4 concise mistakes or failure modes"],
     "complexity": {
       "time": "Big-O time",
       "space": "Big-O space",
       "driver": "Why those costs happen"
     }
   }
   Requirements:
   - Provide 4 to 7 stages.
   - Provide 2 to 5 decisions.
   - Provide 3 to 5 snapshots.
   - Keep every field concise and concrete.
   - The blueprint must be about state transitions, invariants, and data movement.
   - Do NOT output nodes/edges format. Do NOT output pseudocode disguised as labels.
7. "solutionPython": The optimal solution code in Python. Include comments explaining key lines.
8. "solutionJava": The optimal solution code in Java. Include comments explaining key lines.
9. "solutionCpp": The optimal solution code in C++. Include comments explaining key lines.

Respond ONLY with the JSON object. Keep text explanations concise but educational. No markdown, no extra text.`;
}
