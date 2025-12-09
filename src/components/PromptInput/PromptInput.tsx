import { useState, type KeyboardEvent } from 'react'
import { useThreads } from '../../hooks/useThreads'
import { useConversation } from '../../hooks/useConversation'
import { isValidMessage } from '../../utils/validation'

interface PromptInputProps {
  threadId: string
  disabled?: boolean
}

export function PromptInput({ threadId, disabled = false }: PromptInputProps) {
  const [input, setInput] = useState('')
  const { addMessage } = useThreads()
  const { sendMessage } = useConversation()

  const handleSubmit = async () => {
    const trimmedInput = input.trim()

    // Validate message using validation utility
    if (!isValidMessage(trimmedInput) || disabled) return

    // Add user message
    addMessage(threadId, {
      role: 'user',
      content: trimmedInput,
    })

    // Clear input
    setInput('')

    // Send message to AI
    await sendMessage(threadId, trimmedInput)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isSubmitDisabled = !input.trim() || disabled

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-end',
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question... (Cmd/Ctrl + Enter to submit)"
          disabled={disabled}
          style={{
            flex: 1,
            backgroundColor: '#1f2937',
            color: '#ffffff',
            borderRadius: '0.5rem',
            padding: '0.625rem 0.875rem',
            resize: 'none',
            border: 'none',
            outline: 'none',
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            minHeight: '40px',
            maxHeight: '120px',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => {
            if (!disabled) {
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)'
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none'
          }}
          rows={1}
          onInput={(e) => {
            const target = e.currentTarget
            target.style.height = 'auto'
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          style={{
            padding: '0.625rem 1rem',
            backgroundColor: isSubmitDisabled ? '#374151' : '#2563eb',
            color: '#ffffff',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            opacity: isSubmitDisabled ? 0.5 : 1,
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            if (!isSubmitDisabled) {
              e.currentTarget.style.backgroundColor = '#1d4ed8'
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitDisabled) {
              e.currentTarget.style.backgroundColor = '#2563eb'
            }
          }}
        >
          Send
        </button>
      </div>
      <p
        style={{
          fontSize: '0.75rem',
          color: '#6b7280',
          margin: 0,
        }}
      >
        Press Cmd/Ctrl + Enter to submit
      </p>
    </div>
  )
}
