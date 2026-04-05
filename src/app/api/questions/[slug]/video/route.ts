import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTopVideoForQuery } from "@/lib/youtube";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Extract language from search params
    const { searchParams } = new URL(req.url);
    const langParam = searchParams.get("lang") || "java"; // default to java
    
    // Map language param to a better search term
    let displayLang = langParam;
    if (langParam.toLowerCase() === "cpp") {
      displayLang = "C++";
    } else if (langParam.toLowerCase() === "javascript") {
      displayLang = "JavaScript";
    } else if (langParam.toLowerCase() === "python") {
      displayLang = "Python";
    } else if (langParam.toLowerCase() === "java") {
      displayLang = "Java";
    }

    // Fetch the question title to form a better query
    const question = await prisma.question.findUnique({
      where: { slug },
      select: { title: true }
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Build a strongly language-specific query to prevent cross-language results
    // e.g. for C++: "LeetCode Two Sum C++ solution explanation"
    const query = `LeetCode ${question.title} ${displayLang} solution explanation`;
    const videoId = await getTopVideoForQuery(query);

    if (!videoId) {
      return NextResponse.json({ error: "No video found" }, { status: 404 });
    }

    return NextResponse.json({ videoId });
  } catch (error) {
    console.error("[VIDEO_SOLUTION_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
