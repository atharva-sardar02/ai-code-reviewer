import type { Message as MessageType } from '../../store/types'

interface MessageProps {
  message: MessageType
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user'

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '0.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '85%',
          borderRadius: isUser ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
          padding: '0.875rem 1rem',
          background: isUser 
            ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
            : 'rgba(26, 34, 52, 0.8)',
          color: isUser ? '#ffffff' : '#e2e8f0',
          border: isUser 
            ? 'none'
            : '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: isUser 
            ? '0 2px 8px rgba(6, 182, 212, 0.2)'
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.6875rem',
            fontWeight: 600,
            marginBottom: '0.375rem',
            opacity: isUser ? 0.9 : 0.7,
            letterSpacing: '0.025em',
            textTransform: 'uppercase',
          }}
        >
          {isUser ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              You
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2M7.5 13A1.5 1.5 0 0 0 6 14.5 1.5 1.5 0 0 0 7.5 16 1.5 1.5 0 0 0 9 14.5 1.5 1.5 0 0 0 7.5 13m9 0a1.5 1.5 0 0 0-1.5 1.5 1.5 1.5 0 0 0 1.5 1.5 1.5 1.5 0 0 0 1.5-1.5 1.5 1.5 0 0 0-1.5-1.5" />
              </svg>
              AI Assistant
            </>
          )}
        </div>
        <div
          style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            fontSize: '0.875rem',
            lineHeight: '1.6',
          }}
        >
          {message.content}
        </div>
      </div>
    </div>
  )
}
