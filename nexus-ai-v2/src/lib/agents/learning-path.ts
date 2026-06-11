import type { Agent, AgentContext, AgentOutput } from "./types";
import { getLLM } from "../llm";
import { parseJSON } from "./types";

const SYSTEM_PROMPT = `You are a Learning Path Agent. Create personalized roadmaps with milestones based on the user's goals, skills, and conversation history.

Return JSON:
{
  "roadmaps": [{ "title": "string", "description": "string", "milestones": [{ "title": "string", "estimatedDays": 0 }] }],
  "summary": "string",
  "markdown": "string"
}`;

export const learningPathAgent: Agent = {
  name: "Learning Path",
  emoji: "🗺️",
  description: "Creates personalized roadmaps",
  async analyze(context: AgentContext): Promise<AgentOutput> {
    const llm = getLLM();

    const historyBlock = context.conversationHistory && context.conversationHistory.length > 0
      ? `\n\nPrevious conversation:\n${context.conversationHistory.slice(-6).map((m) => `${m.role}: ${m.content.slice(0, 200)}`).join("\n")}`
      : "";

    const userMessage = `Message: ${context.message}${historyBlock}

Goals: ${JSON.stringify(context.goals || [])}
Skills: ${JSON.stringify(context.skills || [])}
Roadmaps: ${JSON.stringify(context.roadmaps || [])}
Memories: ${JSON.stringify(context.memories?.filter((m) => !m.key.startsWith("chat_")) || [])}`;

    const result = await llm.query(SYSTEM_PROMPT, userMessage, {
      temperature: 0.4,
      maxTokens: 1024,
    });

    const data = parseJSON<{
      roadmaps?: { title: string; description: string; milestones: { title: string; estimatedDays: number }[] }[];
      summary?: string;
      markdown?: string;
    }>(result);

    return {
      markdown: data?.markdown || "I've created a learning path for you.",
      summary: data?.summary || "Learning path generated.",
    };
  },
};
