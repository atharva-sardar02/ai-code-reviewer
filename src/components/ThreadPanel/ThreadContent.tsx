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
        background: 'transparent',
      }}
    >
      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem',
        }}
      >
        {thread.messages.length === 0 ? (
          <div
            style={{
              fontSize: '0.875rem',
              color: '#64748b',
              textAlign: 'center',
              padding: '3rem 1rem',
            }}
          >
            {thread.isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#06b6d4"
                    style={{
                      animation: 'spin 1s linear infinite',
                    }}
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      strokeWidth="2"
                      opacity="0.2"
                    />
                    <path
                      d="M12 2a10 10 0 0 1 10 10"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span style={{ color: '#94a3b8' }}>Analyzing your code...</span>
              </div>
            ) : (
              'No messages yet. Start the conversation below.'
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {thread.messages.map((message, index) => {
              // Show feedback blocks for the first assistant message (initial feedback)
              // Check if this is the first assistant message and there's a user message before it
              const isInitialFeedback = 
                message.role === 'assistant' && 
                index === 1 && // Second message (first should be user's auto-request)
                thread.messages.length >= 2 &&
                thread.messages[0]?.role === 'user' &&
                thread.messages[0]?.content === 'Please provide feedback on this code selection.'
              
              return (
                <div key={index} style={{ animation: 'fadeIn 0.3s ease-out' }}>
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
                          return !parsed || parsed.length === 0
                        } catch {
                          return true // Show fallback message on error
                        }
                      })() && (
                        <Message message={message} threadId={thread.id} fileId={thread.fileId} />
                      )}
                    </>
                  ) : (
                    <Message message={message} threadId={thread.id} fileId={thread.fileId} />
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
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ color: '#fca5a5', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {thread.error}
            </div>
            <button
              onClick={handleRetry}
              style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                borderRadius: '0.5rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
              Retry
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {thread.isLoading && thread.messages.length > 0 && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              color: '#67e8f9',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <svg
              width="18"
              height="18"
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
                strokeWidth="2"
                opacity="0.2"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>AI is thinking<span className="loading-dots"><span>.</span><span>.</span><span>.</span></span></span>
          </div>
        )}
      </div>

      {/* Prompt Input */}
      <div
        style={{
          borderTop: '1px solid rgba(148, 163, 184, 0.08)',
          padding: '1rem 1.25rem',
          background: 'rgba(17, 24, 39, 0.5)',
        }}
      >
        <PromptInput threadId={thread.id} disabled={thread.isLoading} />
      </div>
    </div>
  )
}
