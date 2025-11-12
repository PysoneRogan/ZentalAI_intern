import OpenAI from 'openai'

// Initialize OpenAI client with configuration
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Token counting utility (approximate)
export function estimateTokenCount(text: string): number {
  // Rough estimate: 1 token ≈ 0.75 words
  const words = text.split(/\s+/).length
  return Math.ceil(words / 0.75)
}

// Cost calculation utility
export function estimateCost(inputTokens: number, outputTokens: number): number {
  // GPT-4 Turbo pricing (as of 2024)
  const inputCostPer1K = 0.01 // $0.01 per 1K input tokens
  const outputCostPer1K = 0.03 // $0.03 per 1K output tokens

  const inputCost = (inputTokens / 1000) * inputCostPer1K
  const outputCost = (outputTokens / 1000) * outputCostPer1K

  return inputCost + outputCost
}

// API call wrapper with error handling and retries
export async function callOpenAI(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options: {
    temperature?: number
    maxTokens?: number
    retries?: number
    timeout?: number
  } = {}
) {
  const {
    temperature = 0.3,
    maxTokens = 2000,
    retries = 3,
    timeout = 30000,
  } = options

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('OpenAI API timeout')), timeout)
      })

      // Make API call with timeout
      const completionPromise = openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: 0.9,
      })

      const completion = (await Promise.race([
        completionPromise,
        timeoutPromise,
      ])) as OpenAI.Chat.ChatCompletion

      // Log usage for monitoring
      console.log(`OpenAI API Call - Attempt ${attempt}:`, {
        tokens: completion.usage,
        model: completion.model,
        cost: estimateCost(
          completion.usage?.prompt_tokens || 0,
          completion.usage?.completion_tokens || 0
        ),
      })

      return completion
    } catch (error) {
      lastError = error as Error
      console.error(`OpenAI API Error - Attempt ${attempt}:`, error)

      // Don't retry on specific errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()

        // Don't retry authentication or quota errors
        if (
          errorMessage.includes('invalid api key') ||
          errorMessage.includes('quota exceeded') ||
          errorMessage.includes('model not found')
        ) {
          throw error
        }
      }

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('OpenAI API failed after retries')
}
