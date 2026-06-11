import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runAgents } from "@/lib/agents/orchestrator";
import type { AgentContext } from "@/lib/agents/types";

const MAX_HISTORY = 20;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await req.json();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const userId = session.user.id;

  const [
    goals,
    skills,
    roadmaps,
    opportunities,
    digitalSelf,
    memories,
    achievements,
    historyMemories,
  ] = await Promise.all([
    prisma.goal.findMany({
      where: { userId },
      select: { title: true, status: true },
    }),
    prisma.skill.findMany({
      where: { userId },
      select: { name: true, level: true },
    }),
    prisma.roadmap.findMany({
      where: { userId },
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
      where: { userId },
      select: { knowledge: true, career: true, opportunity: true },
    }),
    prisma.memory.findMany({
      where: { userId, key: { not: { startsWith: "chat_" } } },
      select: { key: true, value: true },
    }),
    prisma.achievement.findMany({
      where: { userId },
      select: { title: true },
    }),
    prisma.memory.findMany({
      where: { userId, key: { startsWith: "chat_" } },
      orderBy: { key: "asc" },
      select: { key: true, value: true },
    }),
  ]);

  // Reconstruct conversation history from stored memories
  const conversationHistory = historyMemories
    .filter((m) => m.key.startsWith("chat_"))
    .map((m) => JSON.parse(m.value) as { role: "user" | "assistant"; content: string });

  const context: AgentContext = {
    message,
    userId,
    goals,
    skills,
    roadmaps,
    opportunities,
    digitalSelf: digitalSelf || undefined,
    memories,
    achievements,
    conversationHistory,
  };

  try {
    const { results, response, totalScoreChanges } = await runAgents(context);

    // Save conversation history (prune old ones)
    const turnIndex = historyMemories.length;
    const userKey = `chat_${turnIndex}_user`;
    const assistantKey = `chat_${turnIndex}_assistant`;

    await prisma.memory.upsert({
      where: { userId_key: { userId, key: userKey } },
      update: { value: JSON.stringify({ role: "user", content: message }) },
      create: { userId, key: userKey, value: JSON.stringify({ role: "user", content: message }), category: "chat" },
    });

    await prisma.memory.upsert({
      where: { userId_key: { userId, key: assistantKey } },
      update: { value: JSON.stringify({ role: "assistant", content: response }) },
      create: { userId, key: assistantKey, value: JSON.stringify({ role: "assistant", content: response }), category: "chat" },
    });

    // Prune old history if over limit
    if (turnIndex > MAX_HISTORY * 2) {
      const toDelete = await prisma.memory.findMany({
        where: { userId, key: { startsWith: "chat_" } },
        orderBy: { key: "asc" },
        take: (turnIndex - MAX_HISTORY * 2),
      });
      if (toDelete.length > 0) {
        await prisma.memory.deleteMany({
          where: { id: { in: toDelete.map((m) => m.id) } },
        });
      }
    }

    // Save key memories extracted by agents
    const newMemories = results.flatMap((r) =>
      r.output.achievements?.map((a) => ({
        key: `achievement_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        value: JSON.stringify(a),
        category: "achievement" as const,
      })) || []
    );

    for (const mem of newMemories) {
      await prisma.memory.create({
        data: { userId, ...mem },
      });
    }

    // Update Digital Self scores
    if (
      totalScoreChanges.knowledge ||
      totalScoreChanges.career ||
      totalScoreChanges.opportunity
    ) {
      await prisma.digitalSelf.upsert({
        where: { userId },
        update: {
          knowledge: { increment: totalScoreChanges.knowledge },
          career: { increment: totalScoreChanges.career },
          opportunity: { increment: totalScoreChanges.opportunity },
        },
        create: {
          userId,
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
