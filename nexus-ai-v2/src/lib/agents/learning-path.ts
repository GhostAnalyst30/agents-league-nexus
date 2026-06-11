import type { Agent, AgentContext, AgentOutput } from "./types";
import { getLLM } from "../llm";
import { parseJSON } from "./types";

const SYSTEM_PROMPT = `You are a Learning Path Agent. Create personalized roadmaps with milestones.

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
    const userMessage = `Message: ${context.message}

Goals: ${JSON.stringify(context.goals || [])}
Skills: ${JSON.stringify(context.skills || [])}
Roadmaps: ${JSON.stringify(context.roadmaps || [])}`;

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
