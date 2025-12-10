import * as Dialog from '@radix-ui/react-dialog'

interface ApiKeyInputProps {
  isOpen: boolean
  onClose: () => void
}

export function ApiKeyInput({ isOpen, onClose }: ApiKeyInputProps) {
  const hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            animation: 'fadeIn 0.2s ease-out',
          }}
        />
        <Dialog.Content
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'linear-gradient(180deg, rgba(26, 34, 52, 0.98) 0%, rgba(17, 24, 39, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1rem',
            padding: '1.75rem',
            width: '100%',
            maxWidth: '420px',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
            zIndex: 101,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <Dialog.Title
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#f1f5f9',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#06b6d4' }}>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </Dialog.Title>
          <Dialog.Description
            style={{
              fontSize: '0.875rem',
              color: '#64748b',
              marginBottom: '1.5rem',
            }}
          >
            Configure your CodeReviewer AI experience
          </Dialog.Description>

          {/* API Key Status */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: '#64748b',
                marginBottom: '0.625rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              OpenAI API Key
            </div>
            <div
              style={{
                padding: '1rem',
                background: hasApiKey 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                borderRadius: '0.75rem',
                border: hasApiKey
                  ? '1px solid rgba(16, 185, 129, 0.2)'
                  : '1px solid rgba(239, 68, 68, 0.2)',
                fontSize: '0.875rem',
                color: hasApiKey ? '#34d399' : '#f87171',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              {hasApiKey ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>API key configured</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>API key not found</span>
                </>
              )}
            </div>
            <p
              style={{
                fontSize: '0.75rem',
                color: '#475569',
                marginTop: '0.75rem',
                lineHeight: '1.6',
              }}
            >
              For security, the API key is configured via the{' '}
              <code
                style={{
                  fontSize: '0.6875rem',
                  color: '#06b6d4',
                  background: 'rgba(6, 182, 212, 0.1)',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem',
                }}
              >
                VITE_OPENAI_API_KEY
              </code>{' '}
              environment variable at build time.
            </p>
          </div>

          {/* About Section */}
          <div
            style={{
              padding: '1rem',
              background: 'rgba(148, 163, 184, 0.03)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(148, 163, 184, 0.05)',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: '#64748b',
                marginBottom: '0.5rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              About
            </div>
            <p
              style={{
                fontSize: '0.8125rem',
                color: '#94a3b8',
                lineHeight: '1.6',
              }}
            >
              CodeReviewer AI provides intelligent, contextual feedback on your code selections. 
              Select code, click "Ask AI", and get instant analysis powered by OpenAI.
            </p>
          </div>

          {/* Close Button */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: '0.625rem 1.25rem',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                color: '#ffffff',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'all 150ms ease',
                boxShadow: '0 2px 8px rgba(6, 182, 212, 0.25)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 182, 212, 0.35)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(6, 182, 212, 0.25)'
              }}
            >
              Done
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
