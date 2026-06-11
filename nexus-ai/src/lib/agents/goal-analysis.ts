import { queryAgent } from "../openrouter"
import type { AgentContext, AgentOutput } from "@/types"
import type { Agent } from "./types"
import { parseJSON } from "./types"

const SYSTEM_PROMPT = `You are the Goal Analysis Agent for Nexus AI. Analyze goals and return JSON + a markdown report.

Return a JSON object with:
{
  "goals": [{ "title": "string", "description": "string", "category": "string", "motivation": "string" }],
  "summary": "string (plain text one-liner)",
  "markdown": "string (formatted markdown report with **bold**, bullet lists, and clear sections)"
}`

export const goalAnalysisAgent: Agent = {
  name: "Goal Analysis Agent",
  emoji: "🎯",
  description: "Detects goals, intentions, motivations, and ambitions",
  async analyze(context: AgentContext): Promise<AgentOutput> {
    const userInput = `User message: "${context.userMessage}"
Context - Goals: ${context.goals.join(", ") || "none"}
Skills: ${context.skills.join(", ") || "none"}

Return ONLY valid JSON with goals array, summary, and markdown.`

    const response = await queryAgent(SYSTEM_PROMPT, userInput, { temperature: 0.3, maxTokens: 512 })

    const parsed = parseJSON<{ goals: Array<{ title: string; description: string; category: string; motivation: string }>; summary: string; markdown: string }>(
      response,
      { goals: [], summary: "Analyzing goals...", markdown: "**Goal Analysis:** Analyzing your message for goals and intentions." }
    )

    return {
      agentName: this.name,
      emoji: this.emoji,
      findings: parsed.summary,
      markdown: parsed.markdown,
      status: "complete",
      data: { goals: parsed.goals },
    }
  },
}
