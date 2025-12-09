import { useThreads } from '../../hooks/useThreads'
import { useConversation } from '../../hooks/useConversation'
import { Message } from './Message'
import { PromptInput } from '../PromptInput'
import { FeedbackBlocks } from './FeedbackBlocks'
import { parseFeedback } from '../../utils/feedbackParser'
import type { Thread as ThreadType } from '../../store/types'

interface ThreadContentProps {
  thread: ThreadType
}

export function ThreadContent({ thread }: ThreadContentProps) {
  const { setThreadError } = useThreads()
  const { sendMessage } = useConversation()

  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation()

    // Find the last user message
    const lastUserMessage = [...thread.messages]
      .reverse()
      .find((msg) => msg.role === 'user')

    if (lastUserMessage) {
      // Clear error and retry
      setThreadError(thread.id, null)
      await sendMessage(thread.id, lastUserMessage.content)
    }
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#111827',
      }}
    >
      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
        }}
      >
        {thread.messages.length === 0 ? (
          <div
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              textAlign: 'center',
              padding: '2rem 1rem',
            }}
          >
            {thread.isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  style={{
                    animation: 'spin 1s linear infinite',
                  }}
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    opacity="0.25"
                  />
                  <path
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    fill="currentColor"
                    opacity="0.75"
                  />
                </svg>
                <span>AI is analyzing your code...</span>
              </div>
            ) : (
              'No messages yet. Start the conversation below.'
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {thread.messages.map((message, index) => {
              // Show feedback blocks for the first assistant message (initial feedback)
              // Check if this is the first assistant message and there's a user message before it
              const isInitialFeedback = 
                message.role === 'assistant' && 
                index === 1 && // Second message (first should be user's auto-request)
                thread.messages.length >= 2 &&
                thread.messages[0]?.role === 'user' &&
                thread.messages[0]?.content === 'Please provide feedback on this code selection.'
              
              console.log(`Message ${index}: role=${message.role}, isInitialFeedback=${isInitialFeedback}, totalMessages=${thread.messages.length}`)
              
              return (
                <div key={index}>
                  {isInitialFeedback ? (
                    <>
                      <FeedbackBlocks 
                        content={message.content} 
                        threadId={thread.id}
                        fileId={thread.fileId}
                      />
                      {/* Fallback: if no blocks parsed, show as regular message */}
                      {(() => {
                        try {
                          const parsed = parseFeedback(message.content)
                          console.log(`Parsed ${parsed?.length || 0} categories for initial feedback`)
                          return !parsed || parsed.length === 0
                        } catch (error) {
                          console.error('Error parsing feedback:', error)
                          return true // Show fallback message on error
                        }
                      })() && (
                        <Message message={message} />
                      )}
                    </>
                  ) : (
                    <Message message={message} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Error Display */}
        {thread.error && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: 'rgba(127, 29, 29, 0.2)',
              border: '1px solid #b91c1c',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ color: '#fca5a5', marginBottom: '0.5rem' }}>
              {thread.error}
            </div>
            <button
              onClick={handleRetry}
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: '#b91c1c',
                color: '#ffffff',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#b91c1c'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {thread.isLoading && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: 'rgba(30, 58, 138, 0.2)',
              border: '1px solid #1d4ed8',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              color: '#93c5fd',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              style={{
                animation: 'spin 1s linear infinite',
              }}
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                opacity="0.25"
              />
              <path
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                fill="currentColor"
                opacity="0.75"
              />
            </svg>
            <span>AI is thinking...</span>
          </div>
        )}
      </div>

      {/* Prompt Input */}
      <div
        style={{
          borderTop: '1px solid #1f2937',
          padding: '1rem',
        }}
      >
        <PromptInput threadId={thread.id} disabled={thread.isLoading} />
      </div>
    </div>
  )
}

