import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { orchestrateAgents } from "@/lib/agents/orchestrator"
import type { AgentMessage } from "@/types"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { message, history } = (await req.json()) as {
      message: string
      history?: AgentMessage[]
    }

    const userId = session.user.id

    const [goals, skills, roadmaps, digitalSelf] = await Promise.all([
      prisma.goal.findMany({ where: { userId, status: "active" }, select: { title: true } }),
      prisma.skill.findMany({ where: { userId }, select: { name: true, level: true } }),
      prisma.roadmap.findMany({ where: { userId, status: "active" }, select: { title: true } }),
      prisma.digitalSelf.findUnique({ where: { userId } }),
    ])

    const result = await orchestrateAgents({
      userId,
      goals: goals.map((g) => g.title),
      skills: skills.map((s) => `${s.name} (level ${s.level})`),
      roadmaps: roadmaps.map((r) => r.title),
      messages: history || [],
      userMessage: message,
    })

    if (result.digitalSelfUpdate) {
      const ds = digitalSelf || {
        knowledgeScore: 0,
        careerScore: 0,
        opportunityScore: 0,
        confidenceScore: 0,
        consistencyScore: 0,
        growthScore: 0,
      }

      const newKnowledge = Math.min(100, Math.max(0, ds.knowledgeScore + (result.digitalSelfUpdate.knowledgeScore || 0)))
      const newCareer = Math.min(100, Math.max(0, ds.careerScore + (result.digitalSelfUpdate.careerScore || 0)))
      const newOpportunity = Math.min(100, Math.max(0, ds.opportunityScore + (result.digitalSelfUpdate.opportunityScore || 0)))

      await prisma.digitalSelf.upsert({
        where: { userId },
        update: {
          knowledgeScore: newKnowledge,
          careerScore: newCareer,
          opportunityScore: newOpportunity,
          confidenceScore: Math.min(100, (ds.confidenceScore || 0) + 1),
          consistencyScore: Math.min(100, (ds.consistencyScore || 0) + 0.5),
          growthScore: Math.min(100, (ds.growthScore || 0) + 1),
        },
        create: {
          userId,
          knowledgeScore: newKnowledge,
          careerScore: newCareer,
          opportunityScore: newOpportunity,
          confidenceScore: 1,
          consistencyScore: 0.5,
          growthScore: 1,
        },
      })
    }

    await prisma.memory.upsert({
      where: { userId_key: { userId, key: "last_interaction" } },
      update: { value: message, updatedAt: new Date() },
      create: { userId, key: "last_interaction", value: message, category: "interaction" },
    })

    await prisma.agentLog.create({
      data: {
        userId,
        agentName: "Orchestrator",
        action: "chat_response",
        input: message,
        output: result.summary,
      },
    })

    return NextResponse.json({
      response: result.summary,
      agents: result.agents,
      digitalSelfUpdate: result.digitalSelfUpdate,
    })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}
