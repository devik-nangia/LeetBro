import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRoadmapById, getAllSlugsForRoadmap } from "@/lib/roadmaps";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const roadmapId = searchParams.get("roadmapId");

  if (!roadmapId) {
    return NextResponse.json({ error: "roadmapId is required" }, { status: 400 });
  }

  const roadmap = getRoadmapById(roadmapId);
  if (!roadmap) {
    return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
  }

  const allSlugs = getAllSlugsForRoadmap(roadmap);

  try {
    const solved = await prisma.userSolvedQuestion.findMany({
      where: {
        userId: session.user.id,
        question: { slug: { in: allSlugs } },
      },
      include: {
        question: { select: { slug: true } },
      },
    });

    const solvedSlugs = solved.map((s) => s.question.slug);
    return NextResponse.json({ solvedSlugs });
  } catch (error) {
    console.error("Error fetching roadmap progress:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}
