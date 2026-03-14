import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { questionId } = await request.json();

    if (!questionId) {
      return NextResponse.json(
        { error: "questionId is required" },
        { status: 400 }
      );
    }

    // Upsert to handle idempotent "Mark as Solved" clicks
    const solved = await prisma.userSolvedQuestion.upsert({
      where: {
        userId_questionId: {
          userId: session.user.id,
          questionId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        questionId,
      },
    });

    return NextResponse.json(solved);
  } catch (error) {
    console.error("Error marking question solved:", error);
    return NextResponse.json(
      { error: "Failed to mark as solved" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { questionId } = await request.json();

    await prisma.userSolvedQuestion.delete({
      where: {
        userId_questionId: {
          userId: session.user.id,
          questionId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unmarking question:", error);
    return NextResponse.json(
      { error: "Failed to unmark question" },
      { status: 500 }
    );
  }
}
