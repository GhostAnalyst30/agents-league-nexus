import type { AgentContext, AgentOutput } from "@/types"

export interface Agent {
  name: string
  emoji: string
  description: string
  analyze(context: AgentContext): Promise<AgentOutput>
}

export function parseJSON<T>(text: string, fallback: T): T {
  try {
    const cleaned = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim()
    return JSON.parse(cleaned) as T
  } catch {
    return fallback
  }
}
