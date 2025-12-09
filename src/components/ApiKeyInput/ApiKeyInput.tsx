import * as Dialog from '@radix-ui/react-dialog'
import { useState, useEffect } from 'react'
import { useThreads } from '../../hooks/useThreads'

interface ApiKeyInputProps {
  isOpen: boolean
  onClose: () => void
}

export function ApiKeyInput({ isOpen, onClose }: ApiKeyInputProps) {
  const { apiKey, setApiKey } = useThreads()
  const [localApiKey, setLocalApiKey] = useState(apiKey || '')

  // Sync with state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalApiKey(apiKey || '')
    }
  }, [isOpen, apiKey])

  const handleSave = () => {
    setApiKey(localApiKey.trim() || null)
    onClose()
  }

  const handleCancel = () => {
    setLocalApiKey(apiKey || '')
    onClose()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 50,
          }}
        />
        <Dialog.Content
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#1f2937',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '28rem',
            border: '1px solid #374151',
            zIndex: 50,
          }}
        >
          <Dialog.Title
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '1rem',
            }}
          >
            Settings
          </Dialog.Title>

          {/* API Key Input */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="apiKey"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#d1d5db',
                marginBottom: '0.5rem',
              }}
            >
              OpenAI API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder="sk-... (or leave empty to use VITE_OPENAI_API_KEY from .env)"
              style={{
                width: '100%',
                backgroundColor: '#374151',
                color: '#ffffff',
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem',
                border: '1px solid #4b5563',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)'
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none'
              }}
            />
            <p
              style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                marginTop: '0.5rem',
              }}
            >
              Your API key is stored in memory only. If not provided, the app will use{' '}
              <code style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                VITE_OPENAI_API_KEY
              </code>{' '}
              from your .env file.
            </p>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end',
            }}
          >
            <button
              onClick={handleCancel}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#374151',
                color: '#ffffff',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease-in-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4b5563'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#374151'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease-in-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1d4ed8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb'
              }}
            >
              Save
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
