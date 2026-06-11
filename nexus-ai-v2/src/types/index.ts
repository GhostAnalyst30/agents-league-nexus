export interface AgentContext {
  message: string;
  userId: string;
  goals?: { title: string; status: string }[];
  skills?: { name: string; level: number }[];
  roadmaps?: { title: string; status: string }[];
  opportunities?: { title: string; type: string }[];
  digitalSelf?: { knowledge: number; career: number; opportunity: number };
  memories?: { key: string; value: string }[];
  achievements?: { title: string }[];
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
