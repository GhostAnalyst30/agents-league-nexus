import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardHome from "./home-client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [digitalSelf, goalsCount, roadmapsData, achievementsCount] =
    await Promise.all([
      prisma.digitalSelf.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.goal.count({
        where: { userId: session.user.id, status: "active" },
      }),
      prisma.roadmap.findMany({
        where: { userId: session.user.id, status: "active" },
        include: {
          milestones: true,
        },
      }),
      prisma.achievement.count({
        where: { userId: session.user.id },
      }),
    ]);

  const milestonesDone = roadmapsData.reduce(
    (acc, r) => acc + r.milestones.filter((m) => m.completed).length,
    0
  );

  const ds = digitalSelf || { knowledge: 0, career: 0, opportunity: 0 };

  return (
    <DashboardHome
      digitalSelf={ds}
      stats={{
        activeGoals: goalsCount,
        activeRoadmaps: roadmapsData.length,
        milestonesDone,
        achievements: achievementsCount,
      }}
    />
  );
}
