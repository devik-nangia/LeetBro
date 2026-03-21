import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { geminiModel } from "@/lib/gemini";

interface ComplexityTier {
  title: string;
  summary: string;
  timeComplexity: string;
  spaceComplexity: string;
  tradeoff: string;
}

interface ComplexityResponse {
  ladder: ComplexityTier[];
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
        id: true,
        title: true,
        difficulty: true,
        description: true,
        tags: true,
        aiContent: true,
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    if (question.aiContent?.complexity) {
      try {
        const cached = JSON.parse(question.aiContent.complexity) as ComplexityResponse;
        if (cached?.ladder && Array.isArray(cached.ladder) && cached.ladder.length > 0) {
          return NextResponse.json(cached);
        }
      } catch {
        // Cache invalid, proceed to regenerate
      }
    }

    if (!geminiModel) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 501 }
      );
    }

    const prompt = `You are an expert DSA coach.
Given this LeetCode problem, generate a complexity ladder from brute force to most optimal.

Problem: ${question.title}
Difficulty: ${question.difficulty}
Tags: ${question.tags.join(", ")}
Description:
${question.description}

Return ONLY a JSON object with this exact shape:
{
  "ladder": [
    {
      "title": "Brute Force",
      "summary": "1-2 sentence explanation of this approach",
      "timeComplexity": "O(...)",
      "spaceComplexity": "O(...)",
      "tradeoff": "Why someone would or would not use this"
    }
  ]
}

Rules:
- Include 3 to 6 tiers.
- Sort tiers from worst to best asymptotic performance.
- Include brute force when applicable.
- Last tier must be the most optimal practical approach.
- Keep explanations concise and interview-focused.
- No markdown, no prose outside JSON.`;

    const result = await geminiModel.generateContent(prompt);
    let responseText = result.response.text().trim();

    responseText = responseText
      .replace(/^```(?:json)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    responseText = responseText.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");

    let parsed: ComplexityResponse;
    try {
      parsed = JSON.parse(responseText) as ComplexityResponse;
    } catch {
      throw new Error("AI returned invalid JSON for complexity ladder.");
    }

    if (!parsed?.ladder || !Array.isArray(parsed.ladder) || parsed.ladder.length === 0) {
      throw new Error("AI did not return a valid complexity ladder.");
    }

    if (question.aiContent) {
      await prisma.questionAIContent.update({
        where: { id: question.aiContent.id },
        data: { complexity: JSON.stringify(parsed) },
      });
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Error generating complexity ladder:", error);

    const maybeError = error as { status?: number; message?: string };
    if (maybeError?.status === 429 || maybeError?.message?.includes("429 Too Many Requests")) {
      return NextResponse.json(
        { error: "AI rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate complexity ladder" },
      { status: 500 }
    );
  }
}
