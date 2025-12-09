import { useThreads } from '../../hooks/useThreads'
import { ThreadContent } from './ThreadContent'

export function ThreadPanel() {
  const { threads, activeThreadId, activeFileId, setActiveThread, deleteThread } = useThreads()

  // Filter threads by active file
  const fileThreads = threads.filter((thread) => thread.fileId === activeFileId)

  if (fileThreads.length === 0) {
    return (
      <div
        style={{
          height: '100%',
          backgroundColor: '#111827',
          borderLeft: '1px solid #1f2937',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            textAlign: 'center',
            color: '#9ca3af',
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <svg
              width="64"
              height="64"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: '#4b5563' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p
            style={{
              fontSize: '1.125rem',
              fontWeight: 500,
              marginBottom: '0.5rem',
              color: '#d1d5db',
            }}
          >
            {activeFileId ? 'No threads for this file' : 'No file open'}
          </p>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '1rem',
              maxWidth: '24rem',
            }}
          >
            {activeFileId
              ? 'Select code in the editor and click "Ask AI" to start a conversation'
              : 'Open a file to start creating threads'}
          </p>
          <div
            style={{
              fontSize: '0.75rem',
              color: '#4b5563',
              maxWidth: '24rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
            }}
          >
            <p>• Select specific lines of code</p>
            <p>• Click "Ask AI" button in the editor</p>
            <p>• Ask questions or request code reviews</p>
          </div>
        </div>
      </div>
    )
  }

  const activeThread = fileThreads.find((t) => t.id === activeThreadId) || fileThreads[0]

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: '#111827',
        borderLeft: '1px solid #1f2937',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Tabs Bar */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #1f2937',
          backgroundColor: '#111827',
          overflowX: 'auto',
          minHeight: '40px',
        }}
      >
        {fileThreads.map((thread) => {
          const isActive = activeThreadId === thread.id
          return (
            <div
              key={thread.id}
              onClick={() => setActiveThread(thread.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                backgroundColor: isActive ? '#1f2937' : 'transparent',
                borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                color: isActive ? '#ffffff' : '#9ca3af',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                position: 'relative',
                minWidth: '120px',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#1a1f2e'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <span style={{ fontSize: '0.75rem' }}>
                Lines {thread.startLine}-{thread.endLine}
              </span>
              {thread.isLoading && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  style={{
                    animation: 'spin 1s linear infinite',
                  }}
                >
                  <circle
                    cx="6"
                    cy="6"
                    r="4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                  <circle
                    cx="6"
                    cy="6"
                    r="4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="2 10"
                    strokeLinecap="round"
                    opacity="1"
                  />
                </svg>
              )}
              {thread.error && (
                <span style={{ color: '#f87171', fontSize: '0.75rem' }}>⚠</span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm('Are you sure you want to close this thread?')) {
                    deleteThread(thread.id)
                    // If closing active thread, switch to another
                    if (isActive && fileThreads.length > 1) {
                      const nextThread = fileThreads.find((t) => t.id !== thread.id)
                      if (nextThread) {
                        setActiveThread(nextThread.id)
                      } else {
                        setActiveThread(null)
                      }
                    }
                  }
                }}
                style={{
                  marginLeft: 'auto',
                  padding: '0.125rem 0.25rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  borderRadius: '0.125rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151'
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#9ca3af'
                }}
                aria-label="Close thread"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor">
                  <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>

      {/* Thread Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <ThreadContent thread={activeThread} />
      </div>
    </div>
  )
}
