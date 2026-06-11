import type { Agent, AgentContext, AgentOutput } from "./types";
import { getLLM } from "../llm";
import { parseJSON } from "./types";

const SYSTEM_PROMPT = `You are a Skill Gap Agent. Compare the user's current skills against their goals and identify gaps.

Return JSON:
{
  "currentSkills": [{ "name": "string", "level": 0 }],
  "requiredSkills": [{ "name": "string", "level": 0 }],
  "gaps": [{ "skill": "string", "priority": "high|medium|low", "reason": "string" }],
  "summary": "string",
  "markdown": "string"
}`;

export const skillGapAgent: Agent = {
  name: "Skill Gap",
  emoji: "🔍",
  description: "Analyzes current skills vs. desired goals",
  async analyze(context: AgentContext): Promise<AgentOutput> {
    const llm = getLLM();
    const userMessage = `Message: ${context.message}

Skills: ${JSON.stringify(context.skills || [])}
Goals: ${JSON.stringify(context.goals || [])}`;

    const result = await llm.query(SYSTEM_PROMPT, userMessage, {
      temperature: 0.3,
      maxTokens: 512,
    });

    const data = parseJSON<{
      gaps?: { skill: string; priority: string; reason: string }[];
      summary?: string;
      markdown?: string;
    }>(result);

    return {
      markdown: data?.markdown || "I've analyzed your skill gaps.",
      summary: data?.summary || "Skill gaps identified.",
    };
  },
};
