import { NextResponse } from "next/server";
import { geminiTextModel } from "@/lib/gemini";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const { knownTopics, currentQuestionTitle } = await request.json();

    if (!geminiTextModel) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 501 }
      );
    }

    const prompt = `You are a brutally honest competitive programming mentor. A user on a LeetCode-style platform has solved problems covering these topics: ${
      knownTopics?.length ? knownTopics.join(", ") : "None yet"
    }.

They are currently attempting: "${currentQuestionTitle}".

Give a blunt, realistic assessment in 1-2 short paragraphs:
- What percentage of people solve this problem optimally on the first try?
- Based on the user's known topics, how prepared are they? Be specific.
- Do NOT sugarcoat. Be direct and professional.

IMPORTANT: Respond in plain text only. Do NOT use JSON, markdown headings, or code blocks. You may use **bold** for emphasis.`;

    const result = await geminiTextModel.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ analysis: responseText });
  } catch (error: any) {
    console.error("Error generating stats AI content:", error);
    
    if (error?.status === 429 || error?.message?.includes("429 Too Many Requests")) {
      return NextResponse.json(
        { error: "AI rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate AI analysis" },
      { status: 500 }
    );
  }
}
