import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildAnalyzeCodePrompt, geminiModel } from "@/lib/gemini";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const { slug } = await params;

    const question = await prisma.question.findUnique({
      where: { slug },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Rate limiting: 5 per day limit
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await prisma.userCodeAnalysis.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: startOfDay },
      },
    });

    const DAILY_LIMIT = 5;
    if (todayCount >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: "Daily limit reached. You can only analyze code 5 times per day." },
        { status: 429 }
      );
    }

    // Call Gemini
    if (!geminiModel) {
      return NextResponse.json({ error: "Gemini AI is not configured." }, { status: 500 });
    }

    const prompt = buildAnalyzeCodePrompt(question.title, question.description, code);
    const result = await geminiModel.generateContent(prompt);
    let responseText = result.response.text();

    if (responseText.startsWith("\`\`\`json")) {
      responseText = responseText.replace(/^\`\`\`json\s*/, "").replace(/\s*\`\`\`$/, "");
    } else if (responseText.startsWith("\`\`\`")) {
      responseText = responseText.replace(/^\`\`\`\s*/, "").replace(/\s*\`\`\`$/, "");
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(responseText);
    } catch (e) {
      console.error("Parse error:", responseText);
      return NextResponse.json({ error: "Failed to parse AI response." }, { status: 500 });
    }

    // Record the usage
    await prisma.userCodeAnalysis.create({
      data: {
        userId: session.user.id,
        questionId: question.id,
      },
    });

    return NextResponse.json({
      analysis: analysisResult,
      remaining: DAILY_LIMIT - (todayCount + 1),
    });
  } catch (error) {
    console.error("[ANALYZE_CODE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
