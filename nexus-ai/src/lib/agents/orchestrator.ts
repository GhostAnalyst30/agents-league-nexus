import type { AgentContext, AgentResult } from "@/types"
import { goalAnalysisAgent } from "./goal-analysis"
import { skillGapAgent } from "./skill-gap"
import { learningPathAgent } from "./learning-path"
import { opportunityMatchingAgent } from "./opportunity-matching"
import { profileEvolutionAgent } from "./profile-evolution"
import { futureSimulationAgent } from "./future-simulation"
import { queryOpenRouter } from "../openrouter"

const agents = [
  goalAnalysisAgent,
  skillGapAgent,
  learningPathAgent,
  opportunityMatchingAgent,
  profileEvolutionAgent,
  futureSimulationAgent,
]

function isGoalRelated(message: string): boolean {
  const keywords = [
    "goal", "want to", "i want", "my goal", "aim", "objective", "target",
    "aspire", "dream", "plan", "career", "learn", "study", "become",
    "improve", "develop", "achieve", "accomplish", "milestone", "path",
  ]
  return keywords.some((k) => message.toLowerCase().includes(k))
}

function isFutureRelated(message: string): boolean {
  const keywords = [
    "future", "scenario", "simulat", "predict", "probability", "chance",
    "how long", "estimate", "timeline", "when will", "possible",
  ]
  return keywords.some((k) => message.toLowerCase().includes(k))
}

function isOpportunityRelated(message: string): boolean {
  const keywords = [
    "opportunity", "event", "hackathon", "scholarship", "competition",
    "internship", "job", "network", "community", "find", "recommend",
  ]
  return keywords.some((k) => message.toLowerCase().includes(k))
}

export async function orchestrateAgents(context: AgentContext): Promise<AgentResult> {
  const relevantAgents = agents.filter((agent) => {
    if (agent.name === "Goal Analysis Agent") return true
    if (agent.name === "Skill Gap Agent") return context.goals.length > 0 || isGoalRelated(context.userMessage)
    if (agent.name === "Learning Path Agent") return context.goals.length > 0 || isGoalRelated(context.userMessage)
    if (agent.name === "Opportunity Matching Agent") return isOpportunityRelated(context.userMessage)
    if (agent.name === "Profile Evolution Agent") return true
    if (agent.name === "Future Simulation Agent") return isFutureRelated(context.userMessage)
    return false
  })

  const agentResults = await Promise.all(
    relevantAgents.map((agent) => agent.analyze(context))
  )

  const digitalSelfUpdate = agentResults
    .filter((r) => r.data?.scoreChanges)
    .map((r) => r.data?.scoreChanges as { knowledgeScore?: number; careerScore?: number; opportunityScore?: number })
    .reduce(
      (acc, curr) => ({
        knowledgeScore: (acc.knowledgeScore || 0) + (curr.knowledgeScore || 0),
        careerScore: (acc.careerScore || 0) + (curr.careerScore || 0),
        opportunityScore: (acc.opportunityScore || 0) + (curr.opportunityScore || 0),
      }),
      {} as { knowledgeScore?: number; careerScore?: number; opportunityScore?: number }
    )

  const agentFindings = agentResults.map((r) => r.findings).filter(Boolean)

  const systemPrompt = `You are Nexus AI, a Human Evolution Operating System. You are not a generic chatbot.
You are a mentor, coach, guide, and motivator.

Your tone must be:
- Supportive and encouraging
- Professional and human-centered
- Insightful and personalized

The following agents have analyzed the user's message. Use their findings to craft a comprehensive, personalized response.

Agent Analysis:
${agentResults.map((r) => `[${r.agentName}]: ${r.findings}`).join("\n")}

Rules:
1. Never say you are an AI or chatbot
2. Speak as a guide who knows the user personally
3. Reference specific goals, skills, and progress
4. Offer actionable next steps
5. Be encouraging but honest`

    const response = await queryOpenRouter(
      [
        { role: "system", content: systemPrompt },
        ...context.messages.slice(-6),
        { role: "user", content: context.userMessage },
      ],
      { temperature: 0.7, maxTokens: 1024 }
    )

  return {
    summary: response,
    agents: agentResults,
    digitalSelfUpdate:
      digitalSelfUpdate.knowledgeScore !== undefined || digitalSelfUpdate.careerScore !== undefined || digitalSelfUpdate.opportunityScore !== undefined
        ? {
            knowledgeScore: Math.min(digitalSelfUpdate.knowledgeScore || 0, 100),
            careerScore: Math.min(digitalSelfUpdate.careerScore || 0, 100),
            opportunityScore: Math.min(digitalSelfUpdate.opportunityScore || 0, 100),
          }
        : undefined,
  }
}
