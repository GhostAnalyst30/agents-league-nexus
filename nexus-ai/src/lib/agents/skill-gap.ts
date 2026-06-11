import { queryAgent } from "../openrouter"
import type { AgentContext, AgentOutput } from "@/types"
import type { Agent } from "./types"
import { parseJSON } from "./types"

const SYSTEM_PROMPT = `You are the Skill Gap Agent for Nexus AI. Analyze skills vs goals.

Return a JSON object:
{
  "currentSkills": [{ "name": "string", "level": "string" }],
  "requiredSkills": [{ "name": "string", "forGoal": "string" }],
  "gaps": [{ "skill": "string", "priority": "string", "reason": "string" }],
  "summary": "string (plain text one-liner)",
  "markdown": "string (formatted markdown with **bold** skills, bullet lists, priority indicators)"
}`

export const skillGapAgent: Agent = {
  name: "Skill Gap Agent",
  emoji: "🔍",
  description: "Analyzes current skills vs desired goals",
  async analyze(context: AgentContext): Promise<AgentOutput> {
    const userInput = `User message: "${context.userMessage}"
Skills: ${context.skills.join(", ") || "none"}
Goals: ${context.goals.join(", ") || "none"}

Return ONLY valid JSON.`

    const response = await queryAgent(SYSTEM_PROMPT, userInput, { temperature: 0.3, maxTokens: 512 })

    const parsed = parseJSON<{ currentSkills: Array<{ name: string; level: string }>; requiredSkills: Array<{ name: string; forGoal: string }>; gaps: Array<{ skill: string; priority: string; reason: string }>; summary: string; markdown: string }>(
      response,
      { currentSkills: [], requiredSkills: [], gaps: [], summary: "Analyzing skill gaps...", markdown: "**Skill Gap Analysis:** Evaluating your current skills against your goals." }
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
