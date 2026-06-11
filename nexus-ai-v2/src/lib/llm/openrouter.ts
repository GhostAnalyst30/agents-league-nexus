import type { LLMProvider, LLMOptions } from "./provider";

const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

const FREE_MODELS = [
  "google/gemma-4-31b-it:free",
  "openai/gpt-oss-120b:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
];

export class OpenRouterProvider implements LLMProvider {
  private apiKey: string;
  private failedModels = new Set<string>();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async query(systemPrompt: string, userMessage: string, options?: LLMOptions): Promise<string> {
    const models = options?.model ? [options.model] : FREE_MODELS;

    for (const model of models) {
      if (this.failedModels.has(model)) continue;

      try {
        const res = await fetch(BASE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Nexus AI",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens ?? 1024,
          }),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "unknown");
          console.warn(`[OpenRouter] ${model} failed: ${res.status} ${errText.slice(0, 200)}`);
          this.failedModels.add(model);
          continue;
        }

        const data = await res.json();
        return data.choices?.[0]?.message?.content || "";
      } catch {
        this.failedModels.add(model);
      }
    }

    throw new Error(
      "All LLM models failed. Check OPENROUTER_API_KEY in .env or try different models."
    );
  }
}

let provider: OpenRouterProvider | null = null;

export function getLLMProvider(): OpenRouterProvider {
  if (!provider) {
    provider = new OpenRouterProvider(
      process.env.OPENROUTER_API_KEY || ""
    );
  }
  return provider;
}
