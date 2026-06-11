import type { AgentContext, AgentOutput } from "./types";
import { goalAnalysisAgent } from "./goal-analysis";
import { skillGapAgent } from "./skill-gap";
import { learningPathAgent } from "./learning-path";
import { opportunityMatchingAgent } from "./opportunity-matching";
import { profileEvolutionAgent } from "./profile-evolution";
import { futureSimulationAgent } from "./future-simulation";
import { getLLM } from "../llm";

const allAgents = [
  goalAnalysisAgent,
  skillGapAgent,
  learningPathAgent,
  opportunityMatchingAgent,
  profileEvolutionAgent,
  futureSimulationAgent,
];

function isGoalRelated(msg: string): boolean {
  return /goal|want|plan|learn|achieve|become|master|improve/i.test(msg);
}

function isFutureRelated(msg: string): boolean {
  return /future|simulat|scenario|predict|path|career|what if/i.test(msg);
}

function isOpportunityRelated(msg: string): boolean {
  return /opportunity|event|hackathon|scholarship|internship|compete/i.test(msg);
}

export type AgentResult = {
  name: string;
  emoji: string;
  output: AgentOutput;
};

export async function runAgents(context: AgentContext): Promise<{
  results: AgentResult[];
  response: string;
  totalScoreChanges: { knowledge: number; career: number; opportunity: number };
}> {
  const msg = context.message;

  const activeAgents = allAgents.filter((a) => {
    if (a.name === "Goal Analysis") return true;
    if (a.name === "Profile Evolution") return true;
    if (a.name === "Skill Gap") return isGoalRelated(msg);
    if (a.name === "Learning Path") return isGoalRelated(msg);
    if (a.name === "Future Simulation") return isFutureRelated(msg);
    if (a.name === "Opportunity Matching") return isOpportunityRelated(msg);
    return false;
  });

  const results = await Promise.all(
    activeAgents.map(async (agent) => ({
      name: agent.name,
      emoji: agent.emoji,
      output: await agent.analyze(context),
    }))
  );

  const totalScoreChanges = results.reduce(
    (acc, r) => {
      if (r.output.scoreChanges) {
        acc.knowledge += r.output.scoreChanges.knowledge || 0;
        acc.career += r.output.scoreChanges.career || 0;
        acc.opportunity += r.output.scoreChanges.opportunity || 0;
      }
      return acc;
    },
    { knowledge: 0, career: 0, opportunity: 0 }
  );

  const agentSummaries = results
    .map((r) => `**${r.emoji} ${r.name}**: ${r.output.summary}`)
    .join("\n\n");

  // Build conversation history context
  const historyBlock = context.conversationHistory && context.conversationHistory.length > 0
    ? `\n\n## Previous conversation history (oldest to newest):\n${context.conversationHistory
        .map((m) => `**${m.role === "user" ? "User" : "Nexus"}**: ${m.content.slice(0, 300)}`)
        .join("\n")}`
    : "";

  const memoriesBlock = context.memories && context.memories.length > 0
    ? `\n\n## Stored memories about the user:\n${context.memories
        .map((m) => `- ${m.key}: ${m.value.slice(0, 200)}`)
        .join("\n")}`
    : "";

  const llm = getLLM();
  const systemPrompt = `You are Nexus AI, a Human Evolution Operating System with persistent memory.
You remember everything the user has told you in this conversation.

Available context about the user:
- Goals: ${JSON.stringify(context.goals || [])}
- Skills: ${JSON.stringify(context.skills || [])}
- Roadmaps: ${JSON.stringify(context.roadmaps || [])}
- Digital Self: ${JSON.stringify(context.digitalSelf || {})}
- Achievements: ${JSON.stringify(context.achievements || [])}
${historyBlock}
${memoriesBlock}

Your 6 agents analyzed the user's message. Synthesize their findings into a coherent, personalized response.
Reference past conversations when relevant to show you remember.

Agent findings:
${results.map((r) => `${r.emoji} ${r.name}: ${r.output.markdown}`).join("\n\n")}

Respond conversationally and naturally. Use Markdown formatting.`;

  const response = await llm.query(systemPrompt, context.message, {
    temperature: 0.7,
    maxTokens: 1024,
  });

  return {
    results: results.map((r) => ({
      name: r.name,
      emoji: r.emoji,
      output: {
        markdown: r.output.markdown,
        summary: r.output.summary,
        scoreChanges: r.output.scoreChanges,
      },
    })),
    response,
    totalScoreChanges,
  };
}
