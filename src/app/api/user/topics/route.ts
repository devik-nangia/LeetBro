import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { knownTopics } = await request.json();

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        knownTopics,
        onboarded: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating topics:", error);
    return NextResponse.json(
      { error: "Failed to update topics" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { knownTopics: true, onboarded: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}
