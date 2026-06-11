import type { Agent, AgentContext, AgentOutput } from "./types";
import { getLLM } from "../llm";
import { parseJSON } from "./types";

const SYSTEM_PROMPT = `You are an Opportunity Matching Agent. Match user profiles to relevant opportunities.

Return JSON:
{
  "matches": [{ "title": "string", "type": "hackathon|scholarship|internship|event", "matchScore": 0, "matchReason": "string", "description": "string" }],
  "summary": "string",
  "markdown": "string"
}`;

export const opportunityMatchingAgent: Agent = {
  name: "Opportunity Matching",
  emoji: "🔗",
  description: "Matches you with relevant events and opportunities",
  async analyze(context: AgentContext): Promise<AgentOutput> {
    const llm = getLLM();
    const userMessage = `Message: ${context.message}

Opportunities: ${JSON.stringify(context.opportunities || [])}
Goals: ${JSON.stringify(context.goals || [])}
Skills: ${JSON.stringify(context.skills || [])}`;

    const result = await llm.query(SYSTEM_PROMPT, userMessage, {
      temperature: 0.4,
      maxTokens: 1024,
    });

    const data = parseJSON<{
      matches?: { title: string; type: string; matchScore: number; matchReason: string; description: string }[];
      summary?: string;
      markdown?: string;
    }>(result);

    return {
      markdown: data?.markdown || "I've found matching opportunities.",
      summary: data?.summary || "Opportunities matched.",
    };
  },
};
