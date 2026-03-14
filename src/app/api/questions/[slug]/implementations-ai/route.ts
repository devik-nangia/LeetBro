import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { geminiModel } from "@/lib/gemini";

interface ImplementationTier {
  title: string;
  summary: string;
  timeComplexity: string;
  spaceComplexity: string;
  solutionPython: string;
  solutionJava: string;
  solutionCpp: string;
}

interface ImplementationsResponse {
  implementations: ImplementationTier[];
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const question = await prisma.question.findUnique({
      where: { slug },
      select: {
        title: true,
        difficulty: true,
        description: true,
        tags: true,
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    if (!geminiModel) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 501 }
      );
    }

    const prompt = `You are an expert DSA and interview preparation coach.
Given this LeetCode problem, provide multiple implementation tiers from brute force to most optimal.

Problem: ${question.title}
Difficulty: ${question.difficulty}
Tags: ${question.tags.join(", ")}
Description:
${question.description}

Return ONLY JSON in this exact shape:
{
  "implementations": [
    {
      "title": "Brute Force",
      "summary": "1-2 sentence explanation",
      "timeComplexity": "O(...)",
      "spaceComplexity": "O(...)",
      "solutionPython": "full working python code",
      "solutionJava": "full working java code",
      "solutionCpp": "full working c++ code"
    }
  ]
}

Rules:
- Include 2 to 5 tiers.
- Sort from worst asymptotic performance to best.
- Last tier must be the most optimal practical solution.
- Each code block must be complete and valid for that approach.
- Keep summaries concise and interview-focused.
- Do not use markdown or extra prose outside JSON.`;

    const result = await geminiModel.generateContent(prompt);
    let responseText = result.response.text().trim();

    responseText = responseText
      .replace(/^```(?:json)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    responseText = responseText.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");

    let parsed: ImplementationsResponse;
    try {
      parsed = JSON.parse(responseText) as ImplementationsResponse;
    } catch {
      throw new Error("AI returned invalid JSON for implementations.");
    }

    if (
      !parsed?.implementations ||
      !Array.isArray(parsed.implementations) ||
      parsed.implementations.length === 0
    ) {
      throw new Error("AI did not return valid implementations.");
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Error generating implementations:", error);

    const maybeError = error as { status?: number; message?: string };
    if (maybeError?.status === 429 || maybeError?.message?.includes("429 Too Many Requests")) {
      return NextResponse.json(
        { error: "AI rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate implementations" },
      { status: 500 }
    );
  }
}
