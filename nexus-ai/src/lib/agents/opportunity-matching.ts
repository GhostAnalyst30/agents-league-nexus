import { queryAgent } from "../openrouter"
import type { AgentContext, AgentOutput } from "@/types"
import type { Agent } from "./types"
import { parseJSON } from "./types"

const SYSTEM_PROMPT = `You are the Opportunity Matching Agent for Nexus AI. Match opportunities to users.

Return a JSON object:
{
  "matches": [{
    "title": "string",
    "type": "string",
    "matchScore": number,
    "matchReason": "string",
    "description": "string"
  }],
  "summary": "string (plain text one-liner)",
  "markdown": "string (formatted markdown with **bold** opportunity titles, match scores as percentages, bullet lists)"
}`

export const opportunityMatchingAgent: Agent = {
  name: "Opportunity Matching Agent",
  emoji: "⚡",
  description: "Matches opportunities with user profiles",
  async analyze(context: AgentContext): Promise<AgentOutput> {
    const userInput = `User message: "${context.userMessage}"
Goals: ${context.goals.join(", ") || "none"}
Skills: ${context.skills.join(", ") || "none"}

Return ONLY valid JSON.`

    const response = await queryAgent(SYSTEM_PROMPT, userInput, { temperature: 0.3, maxTokens: 1024 })

    const parsed = parseJSON<{ matches: Array<{ title: string; type: string; matchScore: number; matchReason: string; description: string }>; summary: string; markdown: string }>(
      response,
      { matches: [], summary: "Finding opportunities...", markdown: "**Opportunity Matching:** Searching for relevant opportunities." }
    )

    return {
      agentName: this.name,
      emoji: this.emoji,
      findings: parsed.summary,
      markdown: parsed.markdown,
      status: "complete",
      data: { opportunities: parsed.matches },
    }
  },
}
