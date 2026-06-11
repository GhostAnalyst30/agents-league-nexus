import type { Agent, AgentContext, AgentOutput } from "./types";
import { getLLM } from "../llm";
import { parseJSON } from "./types";

const SYSTEM_PROMPT = `You are a Goal Analysis Agent. Extract goals, intentions, and motivations from the user's message. Use previous conversation history to better understand the user's context.

Return JSON:
{
  "goals": [{ "title": "string", "category": "string", "description": "string" }],
  "summary": "string",
  "markdown": "string"
}

Include context about existing goals and skills. Reference past conversations when relevant.`;

export const goalAnalysisAgent: Agent = {
  name: "Goal Analysis",
  emoji: "🎯",
  description: "Detects goals, intentions, and ambitions",
  async analyze(context: AgentContext): Promise<AgentOutput> {
    const llm = getLLM();

    const historyBlock = context.conversationHistory && context.conversationHistory.length > 0
      ? `\n\nPrevious conversation:\n${context.conversationHistory.slice(-6).map((m) => `${m.role}: ${m.content.slice(0, 200)}`).join("\n")}`
      : "";

    const userMessage = `Message: ${context.message}${historyBlock}

Existing goals: ${JSON.stringify(context.goals || [])}
Existing skills: ${JSON.stringify(context.skills || [])}
Memories: ${JSON.stringify(context.memories?.filter((m) => !m.key.startsWith("chat_")) || [])}`;

    const result = await llm.query(SYSTEM_PROMPT, userMessage, {
      temperature: 0.3,
      maxTokens: 512,
    });

    const data = parseJSON<{
      goals?: { title: string; category: string; description: string }[];
      summary?: string;
      markdown?: string;
    }>(result);

    return {
      markdown: data?.markdown || "I've analyzed your goals and motivations.",
      summary: data?.summary || "Goals analyzed successfully.",
    };
  },
};
