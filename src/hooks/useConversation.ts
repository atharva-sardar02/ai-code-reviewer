import { useCallback } from 'react'
import { getAIProvider } from '../services'
import type { AICompletionRequest } from '../services'
import { useThreads } from './useThreads'

/**
 * Hook for handling AI conversations
 * 
 * Encapsulates the logic for calling the AI service and managing conversation state.
 * Handles loading states, error states, and message flow.
 * 
 * @example
 * ```tsx
 * const { sendMessage } = useConversation()
 * await sendMessage(threadId, "What does this code do?")
 * ```
 */
export function useConversation() {
  const { state, addMessage, setThreadLoading, setThreadError } = useThreads()

  /**
   * Sends a message to the AI and handles the response
   * 
   * This function:
   * 1. Finds the thread and gets code/selection context
   * 2. Gets the OpenAI provider (uses API key from state or .env)
   * 3. Builds the completion request with context
   * 4. Calls the AI service
   * 5. Adds the response to the thread
   * 6. Handles errors gracefully
   * 
   * @param threadId - The ID of the thread to send the message to
   * @param userMessage - The user's message/question
   * @throws Will not throw, but sets error state on thread if AI call fails
   */
  const sendMessage = useCallback(
    async (threadId: string, userMessage: string) => {
      // Find the thread
      const thread = state.threads.find((t) => t.id === threadId)
      if (!thread) {
        console.error(`Thread ${threadId} not found`)
        return
      }

      // Get the file associated with this thread
      const file = state.files.find((f) => f.id === thread.fileId)
      if (!file) {
        console.error(`File ${thread.fileId} not found for thread ${threadId}`)
        setThreadError(threadId, 'File not found')
        return
      }

      // Get the code from file and selection from thread
      const { startLine, endLine, messages } = thread
      const code = file.content
      const language = file.language

      // Clear any previous error
      setThreadError(threadId, null)

      // Add the user message to the thread first
      addMessage(threadId, {
        role: 'user',
        content: userMessage,
      })

      // Set loading state
      setThreadLoading(threadId, true)

      try {
        // Get the OpenAI provider (uses API key from state or .env)
        const provider = getAIProvider(state.apiKey)

        // Build the request - include the user message we just added in conversation history
        const request: AICompletionRequest = {
          code,
          selection: {
            startLine,
            endLine,
          },
          userMessage,
          conversationHistory: [
            ...messages,
            { role: 'user', content: userMessage },
          ],
          language,
        }

        // Call the AI service
        const response = await provider.complete(request)

        // Add the AI response
        addMessage(threadId, {
          role: 'assistant',
          content: response,
        })
      } catch (error) {
        // Handle errors
        const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred'
        setThreadError(threadId, errorMessage)
      } finally {
        // Clear loading state
        setThreadLoading(threadId, false)
      }
    },
    [
      state.threads,
      state.files,
      state.apiKey,
      addMessage,
      setThreadLoading,
      setThreadError,
    ]
  )

  return {
    sendMessage,
  }
}
