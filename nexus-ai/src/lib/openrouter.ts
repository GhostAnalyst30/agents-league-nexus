const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

const FREE_MODELS = [
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "openai/gpt-oss-120b:free",
  "google/gemma-4-31b-it:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
]

const USED_MODELS = new Set<string>()

async function tryModel(
  messages: { role: string; content: string }[],
  model: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables")
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Nexus AI",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    USED_MODELS.add(model)
    const errorText = await response.text()
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ""
}

export async function queryOpenRouter(
  messages: { role: string; content: string }[],
  options?: { model?: string; temperature?: number; maxTokens?: number }
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables")
  }

  const temperature = options?.temperature ?? 0.7
  const maxTokens = options?.maxTokens ?? 1024

  if (options?.model) {
    return tryModel(messages, options.model, temperature, maxTokens)
  }

  const availableModels = FREE_MODELS.filter((m) => !USED_MODELS.has(m))
  const modelsToTry = availableModels.length > 0 ? availableModels : FREE_MODELS

  let lastError: Error | null = null
  for (const model of modelsToTry) {
    try {
      return await tryModel(messages, model, temperature, maxTokens)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      console.warn(`Model ${model} failed, trying next one...`)
    }
  }

  throw lastError || new Error("All OpenRouter models failed")
}

export async function queryAgent(
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  return queryOpenRouter(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    options
  )
}

export async function queryStructuredAgent<T>(
  systemPrompt: string,
  userMessage: string,
  parser: (text: string) => T
): Promise<T> {
  const response = await queryAgent(systemPrompt, userMessage, {
    temperature: 0.3,
    maxTokens: 512,
  })
  return parser(response)
}
