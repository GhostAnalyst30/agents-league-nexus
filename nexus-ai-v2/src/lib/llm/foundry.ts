import type { LLMProvider, LLMOptions } from "./provider";

/**
 * Microsoft Foundry (Azure OpenAI) provider.
 *
 * To switch from OpenRouter:
 * 1. Set LLM_PROVIDER=foundry in .env
 * 2. Set AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT
 *
 * No code changes needed — just env vars.
 */
export class FoundryProvider implements LLMProvider {
  private apiKey: string;
  private endpoint: string;
  private deployment: string;

  constructor() {
    this.apiKey = process.env.AZURE_OPENAI_API_KEY || "";
    this.endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
    this.deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "";
  }

  async query(
    systemPrompt: string,
    userMessage: string,
    options?: LLMOptions
  ): Promise<string> {
    const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=2024-02-15-preview`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": this.apiKey,
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1024,
      }),
    });

    if (!res.ok) {
      throw new Error(`Foundry API error: ${res.status}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }
}

export function getFoundryProvider(): FoundryProvider {
  return new FoundryProvider();
}
