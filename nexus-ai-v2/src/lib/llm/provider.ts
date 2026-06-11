export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface LLMProvider {
  query(systemPrompt: string, userMessage: string, options?: LLMOptions): Promise<string>;
}
