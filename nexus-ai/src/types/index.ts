export interface AgentMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface AgentContext {
  userId: string
  goals: string[]
  skills: string[]
  roadmaps: string[]
  messages: AgentMessage[]
  userMessage: string
}

export interface AgentOutput {
  agentName: string
  findings: string
  markdown: string
  emoji: string
  status: "thinking" | "complete"
  data?: Record<string, unknown>
}

export interface AgentResult {
  summary: string
  agents: AgentOutput[]
  suggestions?: string[]
  digitalSelfUpdate?: {
    knowledgeScore?: number
    careerScore?: number
    opportunityScore?: number
  }
}

export interface DashboardStats {
  goalsCount: number
  skillsCount: number
  roadmapsCount: number
  achievementsCount: number
  activeRoadmaps: number
  completedMilestones: number
  totalMilestones: number
}

export interface DigitalSelfData {
  knowledgeScore: number
  careerScore: number
  opportunityScore: number
  confidenceScore: number
  consistencyScore: number
  growthScore: number
}
