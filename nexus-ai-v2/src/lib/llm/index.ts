import type { LLMProvider, LLMOptions } from "./provider";
import { getLLMProvider as getOpenRouter } from "./openrouter";
import { getFoundryProvider } from "./foundry";

export type { LLMProvider, LLMOptions };

export function getLLM(): LLMProvider {
  const provider = process.env.LLM_PROVIDER || "openrouter";

  switch (provider) {
    case "foundry":
      return getFoundryProvider();
    case "openrouter":
    default:
      return getOpenRouter();
  }
}
