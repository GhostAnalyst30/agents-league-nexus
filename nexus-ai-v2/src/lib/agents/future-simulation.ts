import type { Agent, AgentContext, AgentOutput } from "./types";
import { getLLM } from "../llm";
import { parseJSON } from "./types";

const SYSTEM_PROMPT = `You are a Future Simulation Agent. Simulate future scenarios based on user goals.

Return JSON:
{
  "scenarios": [{ "name": "string", "description": "string", "estimatedCompletion": "string", "successProbability": 0, "keyFactors": ["string"], "recommended": true }],
  "summary": "string",
  "markdown": "string"
}`;

export const futureSimulationAgent: Agent = {
  name: "Future Simulation",
  emoji: "🔮",
  description: "Simulates scenarios and estimates success",
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
      scenarios?: { name: string; description: string; estimatedCompletion: string; successProbability: number; keyFactors: string[]; recommended: boolean }[];
      summary?: string;
      markdown?: string;
    }>(result);

    return {
      markdown: data?.markdown || "I've simulated your future scenarios.",
      summary: data?.summary || "Future scenarios simulated.",
    };
  },
};
