export interface AgentContext {
  message: string;
  userId?: string;
  goals?: { title: string; status: string }[];
  skills?: { name: string; level: number }[];
  roadmaps?: { title: string; status: string }[];
  opportunities?: { title: string; type: string; matchScore?: number }[];
  digitalSelf?: { knowledge: number; career: number; opportunity: number };
  memories?: { key: string; value: string }[];
  achievements?: { title: string }[];
  conversationHistory?: { role: "user" | "assistant"; content: string }[];
}

export interface AgentOutput {
  markdown: string;
  summary: string;
  scoreChanges?: {
    knowledge?: number;
    career?: number;
    opportunity?: number;
  };
  achievements?: { title: string; description: string; icon: string }[];
}

export interface Agent {
  name: string;
  emoji: string;
  description: string;
  analyze(context: AgentContext): Promise<AgentOutput>;
}

export function parseJSON<T>(text: string): T | null {
  try {
    const cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}
