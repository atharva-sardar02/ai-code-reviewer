import type { Message } from '../../store/types'

/**
 * Request parameters for AI completion
 */
export interface AICompletionRequest {
  /** Full code content */
  code: string
  /** Selected code range */
  selection: {
    startLine: number
    endLine: number
  }
  /** User's message/question */
  userMessage: string
  /** Previous messages in the conversation thread */
  conversationHistory: Message[]
  /** Programming language (optional) */
  language?: string
}

/**
 * Configuration for AI providers
 */
export interface AIProviderConfig {
  /** API key for the provider (if required) */
  apiKey?: string
}

/**
 * Interface that all AI providers must implement
 */
export interface AIProvider {
  /**
   * Complete a conversation turn with the AI
   * @param request - The completion request with code, selection, and message
   * @returns Promise resolving to the AI's response text
   * @throws Error if the request fails (network, auth, rate limit, etc.)
   */
  complete(request: AICompletionRequest): Promise<string>
}







