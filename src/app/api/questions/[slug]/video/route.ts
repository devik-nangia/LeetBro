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
    const lang = searchParams.get("lang") || "java"; // default to java

    // Fetch the question title to form a better query
    const question = await prisma.question.findUnique({
      where: { slug },
      select: { title: true }
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const query = `LeetCode ${question.title} ${lang} solution`;
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
