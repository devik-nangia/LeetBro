import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { geminiModel, buildPrompt } from "@/lib/gemini";
import type { GeminiQuestionResponse } from "@/lib/gemini";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const url = new URL(request.url);
    const force = url.searchParams.get("force") === "true";

    const question = await prisma.question.findUnique({
      where: { slug },
      include: { aiContent: true },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    if (question.aiContent && !force) {
      return NextResponse.json(question.aiContent);
    }

    // Delete existing AI content if force regenerating
    if (question.aiContent && force) {
      await prisma.questionAIContent.delete({
        where: { questionId: question.id },
      });
    }

    if (!geminiModel) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 501 }
      );
    }

    const prompt = buildPrompt(
      question.title,
      question.description,
      question.difficulty,
      question.tags
    );

    const result = await geminiModel.generateContent(prompt);
    let responseText = result.response.text();

    // Strip markdown code fences if present (```json ... ```)
    responseText = responseText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

    // Fix invalid escape sequences that Gemini sometimes produces in code strings
    // Replace bad escapes like \' \` etc. with their literal equivalents
    responseText = responseText.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");

    let aiData: GeminiQuestionResponse;
    try {
      aiData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse AI response, raw text:", responseText.substring(0, 500));
      throw new Error("AI returned invalid JSON. Please try again.");
    }

    const aiContent = await prisma.questionAIContent.create({
      data: {
        questionId: question.id,
        hint1: aiData.hint1,
        hint2: aiData.hint2,
        hint3: aiData.hint3,
        approach: aiData.approach,
        algorithm: aiData.algorithm,
        visualize: JSON.stringify(aiData.visualize),
        solutionPython: aiData.solutionPython,
        solutionJava: aiData.solutionJava,
        solutionCpp: aiData.solutionCpp,
      },
    });

    return NextResponse.json(aiContent);
  } catch (error: any) {
    console.error("Error generating AI content:", error);
    
    // Check if it's a rate limit error from Gemini API
    if (error?.status === 429 || error?.message?.includes("429 Too Many Requests")) {
      return NextResponse.json(
        { error: "AI rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate AI content" },
      { status: 500 }
    );
  }
}
