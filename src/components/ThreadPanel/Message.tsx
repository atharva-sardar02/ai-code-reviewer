import type { Message as MessageType } from '../../store/types'

interface MessageProps {
  message: MessageType
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={isUser ? 'flex justify-end' : 'flex justify-start'}
      style={{ marginBottom: '0.75rem' }}
    >
      <div
        style={{
          maxWidth: '80%',
          borderRadius: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: isUser ? '#2563eb' : '#374151',
          color: isUser ? '#ffffff' : '#f3f4f6',
        }}
      >
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '0.25rem',
            opacity: 0.8,
          }}
        >
          {isUser ? 'You' : 'Assistant'}
        </div>
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </div>
  )
}
