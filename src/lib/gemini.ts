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
    name: string;
    dataStructure: "array" | "tree" | "linkedlist" | "string" | "graph" | "matrix" | "other";
    inputExample: string;
    steps: Array<{
      step: number;
      title: string;
      explanation: string;
      variables: Array<{ name: string; value: string }>;
      visualState: string;
    }>;
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
6. "visualize": An object representing an EXAMPLE ITERATION. For every single question, take a concrete list, array, tree, or string as input and solve the question on that data structure, showing each step of the solution in extreme detail so the user can visualize what actually happens in each iteration.
   Use this exact structure:
   {
     "name": "Algorithm Trace",
     "dataStructure": "array", // Can be array, tree, linkedlist, string, graph, matrix, or other
     "inputExample": "Explain the input concisely, e.g. nums = [2, 7, 11, 15], target = 9",
     "steps": [
       {
         "step": 1,
         "title": "Initialization",
         "explanation": "What we are doing in this step in extreme detail.",
         "variables": [
           { "name": "i", "value": "0" },
           { "name": "current_sum", "value": "2" }
         ],
         "visualState": "An ASCII or structured text representation of the data structure at this exact moment. Highlight pointers, current nodes, or current array indices. For example: [ *2*, 7, 11, 15 ]\\n     ^ i=0"
       }
     ]
   }
   Requirements:
   - Provide enough steps to vividly illustrate the core logic on a non-trivial example input.
   - The visualState MUST be clear, easy to read, and accurately reflect the step's changes. Use ASCII art/markers to show traversal.
   - Keep variable states minimal but impactful (only track the most important pointers/counters).
7. "solutionPython": The optimal solution code in Python. Include comments explaining key lines.
8. "solutionJava": The optimal solution code in Java. Include comments explaining key lines.
9. "solutionCpp": The optimal solution code in C++. Include comments explaining key lines.

Respond ONLY with the JSON object. Keep text explanations concise but educational. No markdown, no extra text.`;
}
