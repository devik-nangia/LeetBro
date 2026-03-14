import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchLeetCodeQuestion } from "@/lib/leetcode";
import { geminiModel, buildPrompt } from "@/lib/gemini";
import type { GeminiQuestionResponse } from "@/lib/gemini";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // ── Step 1: Check DB cache ──────────────────────────
    const cached = await prisma.question.findUnique({
      where: { slug },
      include: { aiContent: true },
    });

    if (cached && cached.aiContent) {
      return NextResponse.json(cached);
    }

    // ── Step 2: Cache miss → Fetch from LeetCode ────────
    if (!cached) {
      const lcData = await fetchLeetCodeQuestion(slug);
      if (!lcData) {
        return NextResponse.json(
          { error: "Question not found on LeetCode" },
          { status: 404 }
        );
      }

      await prisma.question.create({
        data: {
          slug: lcData.titleSlug,
          title: `${lcData.questionFrontendId}. ${lcData.title}`,
          difficulty: lcData.difficulty ?? "Medium",
          description: lcData.content ?? "Description not available. This is usually due to the question requiring a Premium LeetCode subscription.",
          tags: lcData.topicTags ? lcData.topicTags.map((t) => t.name) : [],
          leetcodeId: parseInt(lcData.questionFrontendId, 10),
        },
      });
    }

    // ── Step 3: AI content is generated on-demand via /ai ────────

    // ── Step 4: Return full question ────────────────────
    const fullQuestion = await prisma.question.findUnique({
      where: { slug },
      include: { aiContent: true },
    });

    return NextResponse.json(fullQuestion);
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Failed to fetch question data" },
      { status: 500 }
    );
  }
}
