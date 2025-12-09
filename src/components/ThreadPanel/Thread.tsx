import { useThreads } from '../../hooks/useThreads'
import { useConversation } from '../../hooks/useConversation'
import { Message } from './Message'
import { PromptInput } from '../PromptInput'
import type { Thread as ThreadType } from '../../store/types'

interface ThreadProps {
  thread: ThreadType
}

export function Thread({ thread }: ThreadProps) {
  const {
    activeThreadId,
    setActiveThread,
    toggleThreadExpanded,
    deleteThread,
    setThreadError,
  } = useThreads()
  const { sendMessage } = useConversation()

  const isActive = activeThreadId === thread.id
  const isExpanded = thread.isExpanded

  const handleHeaderClick = () => {
    setActiveThread(thread.id)
    toggleThreadExpanded(thread.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this thread?')) {
      deleteThread(thread.id)
    }
  }

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
      className="border-b border-gray-800"
      style={{
        backgroundColor: isActive ? '#1f2937' : '#111827',
      }}
    >
      {/* Thread Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-800 transition-colors"
        onClick={handleHeaderClick}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            Lines {thread.startLine}-{thread.endLine}
          </span>
          {thread.isLoading && (
            <span className="text-xs text-blue-400">Loading...</span>
          )}
          {thread.error && (
            <span className="text-xs text-red-400">Error</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400 transition-colors"
            aria-label="Delete thread"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Thread Content */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-800">
          {/* Messages */}
          <div style={{ marginBottom: '1rem' }}>
            {thread.messages.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">
                No messages yet. Start the conversation below.
              </div>
            ) : (
              thread.messages.map((message, index) => (
                <Message key={index} message={message} />
              ))
            )}
          </div>

          {/* Error Display */}
          {thread.error && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: 'rgba(127, 29, 29, 0.2)',
                border: '1px solid #b91c1c',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
              }}
            >
              <div className="text-red-300 mb-2">{thread.error}</div>
              <button
                onClick={handleRetry}
                className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded text-xs transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {thread.isLoading && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: 'rgba(30, 58, 138, 0.2)',
                border: '1px solid #1d4ed8',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
                color: '#93c5fd',
              }}
              className="flex items-center gap-2"
            >
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>AI is thinking...</span>
            </div>
          )}

          {/* Prompt Input (only for active thread) */}
          {isActive && (
            <PromptInput
              threadId={thread.id}
              disabled={thread.isLoading}
            />
          )}
        </div>
      )}
    </div>
  )
}
