import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const solved = await prisma.userSolvedQuestion.findMany({
      where: { userId: session.user.id },
      include: {
        question: {
          select: {
            id: true,
            slug: true,
            title: true,
            difficulty: true,
            tags: true,
          },
        },
      },
      orderBy: { solvedAt: "desc" },
    });

    return NextResponse.json(solved);
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
