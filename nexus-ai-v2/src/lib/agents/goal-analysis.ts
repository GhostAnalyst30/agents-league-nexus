import type { Agent, AgentContext, AgentOutput } from "./types";
import { getLLM } from "../llm";
import { parseJSON } from "./types";

const SYSTEM_PROMPT = `You are a Goal Analysis Agent. Extract goals, intentions, and motivations from the user's message.

Return JSON:
{
  "goals": [{ "title": "string", "category": "string", "description": "string" }],
  "summary": "string",
  "markdown": "string"
}

Include context about existing goals and skills.`;

export const goalAnalysisAgent: Agent = {
  name: "Goal Analysis",
  emoji: "🎯",
  description: "Detects goals, intentions, and ambitions",
  async analyze(context: AgentContext): Promise<AgentOutput> {
    const llm = getLLM();
    const userMessage = `Message: ${context.message}

Existing goals: ${JSON.stringify(context.goals || [])}
Existing skills: ${JSON.stringify(context.skills || [])}`;

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
