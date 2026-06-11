import { queryAgent } from "../openrouter"
import type { AgentContext, AgentOutput } from "@/types"
import type { Agent } from "./types"
import { parseJSON } from "./types"

const SYSTEM_PROMPT = `You are the Profile Evolution Agent for Nexus AI. Track user growth.

Return a JSON object:
{
  "scoreChanges": {
    "knowledgeScore": number,
    "careerScore": number,
    "opportunityScore": number
  },
  "achievements": [{ "title": "string", "description": "string", "icon": "string" }],
  "summary": "string (plain text one-liner)",
  "markdown": "string (formatted markdown with growth indicators, achievement unlocks)"
}`

export const profileEvolutionAgent: Agent = {
  name: "Profile Evolution Agent",
  emoji: "📈",
  description: "Updates Digital Self and tracks growth",
  async analyze(context: AgentContext): Promise<AgentOutput> {
    const userInput = `User message: "${context.userMessage}"
Skills: ${context.skills.join(", ") || "none"}
Goals: ${context.goals.join(", ") || "none"}

Return ONLY valid JSON.`

    const response = await queryAgent(SYSTEM_PROMPT, userInput, { temperature: 0.3, maxTokens: 512 })

    const parsed = parseJSON<{ scoreChanges: { knowledgeScore: number; careerScore: number; opportunityScore: number }; achievements: Array<{ title: string; description: string; icon: string }>; summary: string; markdown: string }>(
      response,
      { scoreChanges: { knowledgeScore: 0, careerScore: 0, opportunityScore: 0 }, achievements: [], summary: "Tracking evolution...", markdown: "**Profile Evolution:** Monitoring your growth metrics." }
    )

    return {
      agentName: this.name,
      emoji: this.emoji,
      findings: parsed.summary,
      markdown: parsed.markdown,
      status: "complete",
      data: parsed,
    }
  },
}
