import type { AIProvider } from './types'
import { createOpenAIProvider } from './openai'

/**
 * Gets the OpenAI provider using API key from environment or provided key
 * 
 * @param apiKey - Optional API key (if not provided, uses VITE_OPENAI_API_KEY from .env)
 * @returns An AI provider instance
 * @throws Error if API key is not available
 */
export function getAIProvider(apiKey?: string | null): AIProvider {
  // Try provided key first, then fall back to environment variable
  const key = apiKey || import.meta.env.VITE_OPENAI_API_KEY

  if (!key) {
    throw new Error(
      'OpenAI API key is required. Please set VITE_OPENAI_API_KEY in your .env file or provide it in settings.'
    )
  }

  return createOpenAIProvider({ apiKey: key })
}

// Re-export types for convenience
export type { AIProvider, AICompletionRequest, AIProviderConfig } from './types'

// Re-export OpenAI provider for direct use if needed
export { OpenAIProvider, createOpenAIProvider } from './openai'
