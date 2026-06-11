import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const digitalSelf = await prisma.digitalSelf.findUnique({
    where: { userId: session.user.id },
  });

  const goalsCount = await prisma.goal.count({
    where: { userId: session.user.id, status: "active" },
  });

  const roadmapsCount = await prisma.roadmap.count({
    where: { userId: session.user.id, status: "active" },
  });

  const milestonesDone = await prisma.milestone.count({
    where: {
      completed: true,
      roadmap: { userId: session.user.id },
    },
  });

  const achievementsCount = await prisma.achievement.count({
    where: { userId: session.user.id },
  });

  const recentGoals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return NextResponse.json({
    digitalSelf: digitalSelf || { knowledge: 0, career: 0, opportunity: 0 },
    stats: {
      activeGoals: goalsCount,
      activeRoadmaps: roadmapsCount,
      milestonesDone,
      achievements: achievementsCount,
    },
    recentGoals,
  });
}
