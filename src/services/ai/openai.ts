import type { AIProvider, AICompletionRequest, AIProviderConfig } from './types'
import { buildConversationMessages } from './promptBuilder'

/**
 * OpenAI API endpoint for chat completions
 */
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

/**
 * OpenAI model to use (gpt-4o-mini is cost-effective and capable)
 */
const DEFAULT_MODEL = 'gpt-4o-mini'

/**
 * OpenAI provider that makes API calls to OpenAI's chat completions endpoint
 */
export class OpenAIProvider implements AIProvider {
  private apiKey: string

  constructor(config: AIProviderConfig) {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required')
    }
    this.apiKey = config.apiKey
  }

  /**
   * Calls OpenAI API to get a completion
   */
  async complete(request: AICompletionRequest): Promise<string> {
    const messages = buildConversationMessages(request)

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    // Handle different error cases
    if (!response.ok) {
      await this.handleError(response)
    }

    const data = await response.json()

    // Extract the assistant's message from the response
    const assistantMessage = data.choices?.[0]?.message?.content

    if (!assistantMessage) {
      throw new Error('Invalid response format from OpenAI API')
    }

    return assistantMessage
  }

  /**
   * Handles API errors with specific messages
   */
  private async handleError(response: Response): Promise<never> {
    const status = response.status
    let errorMessage: string

    switch (status) {
      case 401:
        errorMessage = 'Invalid API key. Please check your OpenAI API key.'
        break
      case 429:
        errorMessage = 'Rate limit exceeded. Please try again later.'
        break
      case 500:
      case 502:
      case 503:
        errorMessage = 'OpenAI service is temporarily unavailable. Please try again later.'
        break
      default:
        try {
          const errorData = await response.json()
          errorMessage = errorData.error?.message || `API error: ${response.statusText}`
        } catch {
          errorMessage = `Network error: ${response.statusText}`
        }
    }

    throw new Error(errorMessage)
  }
}

/**
 * Creates a new OpenAI provider instance
 */
export function createOpenAIProvider(config: AIProviderConfig): AIProvider {
  return new OpenAIProvider(config)
}







