import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runAgents } from "@/lib/agents/orchestrator";
import type { AgentContext } from "@/lib/agents/types";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await req.json();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const [
    goals,
    skills,
    roadmaps,
    opportunities,
    digitalSelf,
    memories,
    achievements,
  ] = await Promise.all([
    prisma.goal.findMany({
      where: { userId: session.user.id },
      select: { title: true, status: true },
    }),
    prisma.skill.findMany({
      where: { userId: session.user.id },
      select: { name: true, level: true },
    }),
    prisma.roadmap.findMany({
      where: { userId: session.user.id },
      select: { title: true, status: true },
    }),
    prisma.opportunity.findMany({
      select: { title: true, type: true, matchScore: true },
    }).then((opps) =>
      opps.map((o) => ({
        title: o.title,
        type: o.type,
        matchScore: o.matchScore ?? undefined,
      }))
    ),
    prisma.digitalSelf.findUnique({
      where: { userId: session.user.id },
      select: { knowledge: true, career: true, opportunity: true },
    }),
    prisma.memory.findMany({
      where: { userId: session.user.id },
      select: { key: true, value: true },
    }),
    prisma.achievement.findMany({
      where: { userId: session.user.id },
      select: { title: true },
    }),
  ]);

  const context: AgentContext = {
    message,
    userId: session.user.id,
    goals,
    skills,
    roadmaps,
    opportunities,
    digitalSelf: digitalSelf || undefined,
    memories,
    achievements,
  };

  try {
    const { results, response, totalScoreChanges } = await runAgents(context);

    // Save memory of this interaction
    await prisma.memory.upsert({
      where: {
        userId_key: { userId: session.user.id, key: "last_interaction" },
      },
      update: { value: message.slice(0, 500) },
      create: {
        userId: session.user.id,
        key: "last_interaction",
        value: message.slice(0, 500),
      },
    });

    // Update Digital Self scores
    if (
      totalScoreChanges.knowledge ||
      totalScoreChanges.career ||
      totalScoreChanges.opportunity
    ) {
      await prisma.digitalSelf.upsert({
        where: { userId: session.user.id },
        update: {
          knowledge: { increment: totalScoreChanges.knowledge },
          career: { increment: totalScoreChanges.career },
          opportunity: { increment: totalScoreChanges.opportunity },
        },
        create: {
          userId: session.user.id,
          knowledge: totalScoreChanges.knowledge,
          career: totalScoreChanges.career,
          opportunity: totalScoreChanges.opportunity,
        },
      });
    }

    return NextResponse.json({
      response,
      agents: results,
      scoreChanges: totalScoreChanges,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
