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
        backgroundColor: '#1f2937',
        color: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid #374151',
      }}
    >
      <div
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          {/* Logo */}
          <img
            src="/CodeReviewerAI-logo.png"
            alt="CodeReviewer AI"
            style={{
              width: '38px',
              height: '38px',
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            CodeReviewer AI
          </h1>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          {onLanguageChange && (
            <Select.Root value={language} onValueChange={onLanguageChange}>
              <Select.Trigger
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#374151',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  borderRadius: '0.25rem',
                  padding: '0.375rem 0.75rem',
                  border: '1px solid #4b5563',
                  cursor: 'pointer',
                  minWidth: '120px',
                  gap: '0.5rem',
                }}
              >
                <Select.Value />
                <Select.Icon
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
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
                    backgroundColor: '#374151',
                    color: '#ffffff',
                    borderRadius: '0.25rem',
                    border: '1px solid #4b5563',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                    zIndex: 50,
                    minWidth: '120px',
                  }}
                >
                  <Select.Viewport>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <Select.Item
                        key={lang.value}
                        value={lang.value}
                        style={{
                          padding: '0.5rem 1rem',
                          cursor: 'pointer',
                          outline: 'none',
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
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              borderRadius: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#374151'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            aria-label="Settings"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
