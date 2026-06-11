import type { Agent, AgentContext, AgentOutput } from "./types";
import { getLLM } from "../llm";
import { parseJSON } from "./types";

const SYSTEM_PROMPT = `You are a Profile Evolution Agent. Track user growth and suggest score changes based on the conversation and history.

Return JSON:
{
  "scoreChanges": { "knowledge": 0, "career": 0, "opportunity": 0 },
  "achievements": [{ "title": "string", "description": "string", "icon": "string" }],
  "summary": "string",
  "markdown": "string"
}

Be conservative with score changes (0-5 points max per category).`;

export const profileEvolutionAgent: Agent = {
  name: "Profile Evolution",
  emoji: "📈",
  description: "Tracks growth and updates your Digital Self",
  async analyze(context: AgentContext): Promise<AgentOutput> {
    const llm = getLLM();

    const historyBlock = context.conversationHistory && context.conversationHistory.length > 0
      ? `\n\nPrevious conversation:\n${context.conversationHistory.slice(-6).map((m) => `${m.role}: ${m.content.slice(0, 200)}`).join("\n")}`
      : "";

    const userMessage = `Message: ${context.message}${historyBlock}

Digital Self: ${JSON.stringify(context.digitalSelf || {})}
Achievements: ${JSON.stringify(context.achievements || [])}
Goals: ${JSON.stringify(context.goals || [])}`;

    const result = await llm.query(SYSTEM_PROMPT, userMessage, {
      temperature: 0.3,
      maxTokens: 512,
    });

    const data = parseJSON<{
      scoreChanges?: { knowledge: number; career: number; opportunity: number };
      achievements?: { title: string; description: string; icon: string }[];
      summary?: string;
      markdown?: string;
    }>(result);

    return {
      markdown: data?.markdown || "Your profile is evolving.",
      summary: data?.summary || "Profile evolution tracked.",
      scoreChanges: data?.scoreChanges,
      achievements: data?.achievements,
    };
  },
};
