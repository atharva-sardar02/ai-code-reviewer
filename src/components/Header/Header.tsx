import * as Select from '@radix-ui/react-select'

interface HeaderProps {
  onSettingsClick?: () => void
  language?: string
  onLanguageChange?: (language: string) => void
}

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
]

export function Header({
  onSettingsClick,
  language = 'javascript',
  onLanguageChange,
}: HeaderProps) {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.98) 0%, rgba(10, 14, 23, 0.95) 100%)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div
        style={{
          width: '100%',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
          }}
        >
          {/* Logo with glow effect */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '48px',
                height: '48px',
                background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(8px)',
              }}
            />
            <img
              src="/CodeReviewerAI-logo.png"
              alt="CodeReviewer AI"
              style={{
                width: '36px',
                height: '36px',
                objectFit: 'contain',
                flexShrink: 0,
                position: 'relative',
                zIndex: 1,
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <h1
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                margin: 0,
                background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.025em',
              }}
            >
              CodeReviewer AI
            </h1>
            <span
              style={{
                fontSize: '0.625rem',
                color: '#64748b',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              Intelligent Code Analysis
            </span>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          {onLanguageChange && (
            <Select.Root value={language} onValueChange={onLanguageChange}>
              <Select.Trigger
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(26, 34, 52, 0.8)',
                  color: '#94a3b8',
                  fontSize: '0.8125rem',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.875rem',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  cursor: 'pointer',
                  minWidth: '130px',
                  gap: '0.5rem',
                  transition: 'all 150ms ease',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)'
                  e.currentTarget.style.color = '#f1f5f9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)'
                  e.currentTarget.style.color = '#94a3b8'
                }}
              >
                <Select.Value />
                <Select.Icon
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: '#64748b',
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 4.5L6 7.5L9 4.5" />
                  </svg>
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content
                  style={{
                    background: 'rgba(26, 34, 52, 0.95)',
                    backdropFilter: 'blur(12px)',
                    color: '#f1f5f9',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                    zIndex: 200,
                    minWidth: '140px',
                    overflow: 'hidden',
                  }}
                >
                  <Select.Viewport style={{ padding: '0.25rem' }}>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <Select.Item
                        key={lang.value}
                        value={lang.value}
                        style={{
                          padding: '0.625rem 0.875rem',
                          cursor: 'pointer',
                          outline: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.8125rem',
                          color: '#94a3b8',
                          transition: 'all 150ms ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'
                          e.currentTarget.style.color = '#06b6d4'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = '#94a3b8'
                        }}
                      >
                        <Select.ItemText>{lang.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          )}
          <button
            onClick={onSettingsClick}
            style={{
              padding: '0.5rem',
              background: 'transparent',
              border: '1px solid transparent',
              color: '#64748b',
              cursor: 'pointer',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(26, 34, 52, 0.8)'
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)'
              e.currentTarget.style.color = '#f1f5f9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'transparent'
              e.currentTarget.style.color = '#64748b'
            }}
            aria-label="Settings"
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
