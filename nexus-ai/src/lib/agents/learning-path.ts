import { queryAgent } from "../openrouter"
import type { AgentContext, AgentOutput } from "@/types"
import type { Agent } from "./types"
import { parseJSON } from "./types"

const SYSTEM_PROMPT = `You are the Learning Path Agent for Nexus AI. Create personalized roadmaps.

Return a JSON object:
{
  "roadmaps": [{
    "title": "string",
    "description": "string",
    "milestones": [{ "title": "string", "order": number, "estimatedDays": number }],
    "resources": [{ "name": "string", "type": "string", "url": "string" }]
  }],
  "summary": "string (plain text one-liner)",
  "markdown": "string (formatted markdown with **bold** milestones, numbered steps, resource links)"
}`

export const learningPathAgent: Agent = {
  name: "Learning Path Agent",
  emoji: "🗺️",
  description: "Creates personalized roadmaps and learning plans",
  async analyze(context: AgentContext): Promise<AgentOutput> {
    const userInput = `User message: "${context.userMessage}"
Goals: ${context.goals.join(", ") || "none"}
Skills: ${context.skills.join(", ") || "none"}

Return ONLY valid JSON.`

    const response = await queryAgent(SYSTEM_PROMPT, userInput, { temperature: 0.4, maxTokens: 1024 })

    const parsed = parseJSON<{ roadmaps: Array<{ title: string; description: string; milestones: Array<{ title: string; order: number; estimatedDays: number }>; resources: Array<{ name: string; type: string; url: string }> }>; summary: string; markdown: string }>(
      response,
      { roadmaps: [], summary: "Creating learning path...", markdown: "**Learning Path:** Building your personalized roadmap." }
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
