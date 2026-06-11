import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roadmaps = await prisma.roadmap.findMany({
    where: { userId: session.user.id },
    include: { milestones: { orderBy: { order: "asc" } }, goal: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(roadmaps);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, goalId } = await req.json();

  const roadmap = await prisma.roadmap.create({
    data: {
      userId: session.user.id,
      title,
      description,
      goalId,
      milestones: {
        create: [
          { title: "Research", order: 0 },
          { title: "Plan", order: 1 },
          { title: "Execute", order: 2 },
          { title: "Review", order: 3 },
        ],
      },
    },
    include: { milestones: true },
  });

  return NextResponse.json(roadmap, { status: 201 });
}
