import { queryAgent } from "../openrouter"
import type { AgentContext, AgentOutput } from "@/types"
import type { Agent } from "./types"
import { parseJSON } from "./types"

const SYSTEM_PROMPT = `You are the Future Simulation Agent for Nexus AI. Simulate future scenarios.

Return a JSON object:
{
  "scenarios": [{
    "name": "string",
    "description": "string",
    "estimatedCompletion": "string",
    "successProbability": number,
    "keyFactors": ["string"],
    "recommended": boolean
  }],
  "summary": "string (plain text one-liner)",
  "markdown": "string (formatted markdown with **bold** scenario names, probability percentages, bullet factors)"
}`

export const futureSimulationAgent: Agent = {
  name: "Future Simulation Agent",
  emoji: "🔮",
  description: "Simulates future scenarios and estimates outcomes",
  async analyze(context: AgentContext): Promise<AgentOutput> {
    const userInput = `User message: "${context.userMessage}"
Goals: ${context.goals.join(", ") || "none"}
Skills: ${context.skills.join(", ") || "none"}

Return ONLY valid JSON.`

    const response = await queryAgent(SYSTEM_PROMPT, userInput, { temperature: 0.4, maxTokens: 1024 })

    const parsed = parseJSON<{ scenarios: Array<{ name: string; description: string; estimatedCompletion: string; successProbability: number; keyFactors: string[]; recommended: boolean }>; summary: string; markdown: string }>(
      response,
      { scenarios: [], summary: "Simulating futures...", markdown: "**Future Simulation:** Projecting possible outcomes." }
    )

    return {
      agentName: this.name,
      emoji: this.emoji,
      findings: parsed.summary,
      markdown: parsed.markdown,
      status: "complete",
      data: { scenarios: parsed.scenarios },
    }
  },
}
