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
  const [isFocused, setIsFocused] = useState(false)
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
          background: 'rgba(26, 34, 52, 0.6)',
          borderRadius: '0.75rem',
          border: isFocused 
            ? '1px solid rgba(6, 182, 212, 0.3)'
            : '1px solid rgba(148, 163, 184, 0.1)',
          padding: '0.25rem',
          transition: 'all 150ms ease',
          boxShadow: isFocused ? '0 0 0 3px rgba(6, 182, 212, 0.1)' : 'none',
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask about your code..."
          disabled={disabled}
          style={{
            flex: 1,
            background: 'transparent',
            color: '#f1f5f9',
            borderRadius: '0.5rem',
            padding: '0.625rem 0.75rem',
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
            background: isSubmitDisabled 
              ? 'rgba(148, 163, 184, 0.1)'
              : 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            color: isSubmitDisabled ? '#64748b' : '#ffffff',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
            fontSize: '0.8125rem',
            fontWeight: 600,
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
            whiteSpace: 'nowrap',
            transition: 'all 150ms ease',
            boxShadow: isSubmitDisabled ? 'none' : '0 2px 8px rgba(6, 182, 212, 0.25)',
          }}
          onMouseEnter={(e) => {
            if (!isSubmitDisabled) {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 182, 212, 0.35)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitDisabled) {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(6, 182, 212, 0.25)'
            }
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Send
        </button>
      </div>
      <p
        style={{
          fontSize: '0.6875rem',
          color: '#475569',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        <kbd
          style={{
            padding: '0.125rem 0.375rem',
            background: 'rgba(148, 163, 184, 0.1)',
            borderRadius: '0.25rem',
            fontSize: '0.625rem',
            fontFamily: 'inherit',
          }}
        >
          ⌘
        </kbd>
        +
        <kbd
          style={{
            padding: '0.125rem 0.375rem',
            background: 'rgba(148, 163, 184, 0.1)',
            borderRadius: '0.25rem',
            fontSize: '0.625rem',
            fontFamily: 'inherit',
          }}
        >
          Enter
        </kbd>
        <span style={{ marginLeft: '0.25rem' }}>to submit</span>
      </p>
    </div>
  )
}
