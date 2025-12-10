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
          background: 'linear-gradient(180deg, #0a0e17 0%, #0d1117 100%)',
          padding: '2rem',
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
          }}
        >
          {/* Illustration */}
          <div
            style={{
              marginBottom: '1.5rem',
              width: '80px',
              height: '80px',
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="40"
              height="40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: '#06b6d4', opacity: 0.8 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              color: '#f1f5f9',
            }}
          >
            {activeFileId ? 'No threads for this file' : 'No file selected'}
          </h3>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#64748b',
              marginBottom: '1.5rem',
              maxWidth: '280px',
              lineHeight: '1.6',
            }}
          >
            {activeFileId
              ? 'Select code in the editor and click "Ask AI" to start a conversation'
              : 'Open a file to begin creating threads'}
          </p>
          <div
            style={{
              fontSize: '0.75rem',
              color: '#475569',
              maxWidth: '280px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              padding: '1rem',
              background: 'rgba(148, 163, 184, 0.03)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(148, 163, 184, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#06b6d4' }}>1.</span>
              <span>Select lines of code</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#06b6d4' }}>2.</span>
              <span>Click "Ask AI" button</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#06b6d4' }}>3.</span>
              <span>Get intelligent feedback</span>
            </div>
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
        background: 'linear-gradient(180deg, #0a0e17 0%, #0d1117 100%)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Tabs Bar */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
          background: 'rgba(17, 24, 39, 0.5)',
          overflowX: 'auto',
          minHeight: '44px',
          padding: '0 0.5rem',
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
                padding: '0.625rem 0.875rem',
                cursor: 'pointer',
                background: isActive 
                  ? 'linear-gradient(180deg, rgba(6, 182, 212, 0.1) 0%, transparent 100%)'
                  : 'transparent',
                borderBottom: isActive ? '2px solid #06b6d4' : '2px solid transparent',
                color: isActive ? '#f1f5f9' : '#64748b',
                fontSize: '0.8125rem',
                whiteSpace: 'nowrap',
                position: 'relative',
                minWidth: '100px',
                borderRadius: '0.5rem 0.5rem 0 0',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(148, 163, 184, 0.05)'
                  e.currentTarget.style.color = '#94a3b8'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#64748b'
                }
              }}
            >
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  background: isActive 
                    ? 'rgba(6, 182, 212, 0.15)'
                    : 'rgba(148, 163, 184, 0.1)',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem',
                  color: isActive ? '#06b6d4' : '#64748b',
                }}
              >
                L{thread.startLine}-{thread.endLine}
              </span>
              {thread.isLoading && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  style={{
                    animation: 'spin 1s linear infinite',
                    color: '#06b6d4',
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
                    opacity="0.3"
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
                <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>⚠</span>
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
                  padding: '0.25rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#475569',
                  cursor: 'pointer',
                  borderRadius: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                  e.currentTarget.style.color = '#ef4444'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#475569'
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
