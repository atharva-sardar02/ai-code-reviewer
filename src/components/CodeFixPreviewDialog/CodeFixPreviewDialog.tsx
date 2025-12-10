import * as Dialog from '@radix-ui/react-dialog'
import type { CodeFix } from '../../utils/codeReplacer'

interface CodeFixPreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  fixes: CodeFix[]
  fileName: string
}

export function CodeFixPreviewDialog({
  isOpen,
  onClose,
  onConfirm,
  fixes,
  fileName,
}: CodeFixPreviewDialogProps) {
  // Filter out any remaining empty or identical fixes
  const validFixes = fixes.filter(fix => {
    const hasContent = fix.originalCode.trim().length > 0 || fix.newCode.trim().length > 0
    const isDifferent = fix.originalCode.trim() !== fix.newCode.trim()
    return hasContent && isDifferent
  })

  if (validFixes.length === 0) {
    return null
  }

  const totalLinesChanged = validFixes.reduce(
    (sum, fix) => sum + (fix.endLine - fix.startLine + 1),
    0
  )

  const isSingleFix = validFixes.length === 1

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
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
            background: 'linear-gradient(180deg, #1a2234 0%, #111827 100%)',
            borderRadius: '1rem',
            padding: '0',
            width: '100%',
            maxWidth: isSingleFix ? '700px' : '850px',
            maxHeight: '85vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            boxShadow: '0 0 0 1px rgba(6, 182, 212, 0.1), 0 24px 64px rgba(0, 0, 0, 0.5)',
            zIndex: 101,
            animation: 'fadeIn 0.2s ease-out',
          }}
          onEscapeKeyDown={onClose}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
              background: 'rgba(6, 182, 212, 0.03)',
            }}
          >
            <Dialog.Title
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#f1f5f9',
                marginBottom: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              Apply Code Changes
            </Dialog.Title>
            <Dialog.Description
              style={{
                fontSize: '0.8125rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>Replacing code in</span>
              <code
                style={{
                  padding: '0.125rem 0.375rem',
                  background: 'rgba(6, 182, 212, 0.1)',
                  color: '#06b6d4',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              >
                {fileName}
              </code>
              <span style={{ color: '#475569' }}>•</span>
              <span>
                Lines {validFixes[0].startLine}
                {validFixes[0].endLine !== validFixes[0].startLine && `-${validFixes[0].endLine}`}
              </span>
            </Dialog.Description>
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.25rem 1.5rem',
            }}
          >
            {validFixes.map((fix, index) => (
              <FixPreview 
                key={index} 
                fix={fix} 
                index={index} 
                showHeader={!isSingleFix}
              />
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.5rem',
              borderTop: '1px solid rgba(148, 163, 184, 0.1)',
              background: 'rgba(0, 0, 0, 0.2)',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: '#ef4444',
                  opacity: 0.7,
                }} />
                {totalLinesChanged} line{totalLinesChanged !== 1 ? 's' : ''} removed
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: '#10b981',
                  opacity: 0.7,
                }} />
                {validFixes.reduce((sum, f) => sum + f.newCode.split('\n').length, 0)} line{validFixes.reduce((sum, f) => sum + f.newCode.split('\n').length, 0) !== 1 ? 's' : ''} added
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  color: '#94a3b8',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)'
                  e.currentTarget.style.color = '#f1f5f9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#94a3b8'
                }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                style={{
                  padding: '0.5rem 1.25rem',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  color: '#ffffff',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  transition: 'all 150ms ease',
                  boxShadow: '0 2px 8px rgba(6, 182, 212, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(6, 182, 212, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(6, 182, 212, 0.3)'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Apply Changes
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

interface FixPreviewProps {
  fix: CodeFix
  index: number
  showHeader: boolean
}

function FixPreview({ fix, index, showHeader }: FixPreviewProps) {
  const originalLines = fix.originalCode.split('\n')
  const newLines = fix.newCode.split('\n')

  return (
    <div
      style={{
        marginBottom: showHeader ? '1.5rem' : 0,
      }}
    >
      {/* Header for multiple fixes */}
      {showHeader && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}
        >
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Change #{index + 1}
          </span>
          <span
            style={{
              padding: '0.1875rem 0.5rem',
              background: 'rgba(6, 182, 212, 0.1)',
              color: '#06b6d4',
              borderRadius: '1rem',
              fontSize: '0.6875rem',
              fontWeight: 500,
            }}
          >
            Lines {fix.startLine}-{fix.endLine}
          </span>
        </div>
      )}

      {/* Unified diff view */}
      <div
        style={{
          borderRadius: '0.625rem',
          overflow: 'hidden',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          background: '#0d1117',
        }}
      >
        {/* Removed lines */}
        {originalLines.map((line, i) => (
          <div
            key={`del-${i}`}
            style={{
              display: 'flex',
              background: 'rgba(248, 81, 73, 0.1)',
              borderLeft: '3px solid #f85149',
            }}
          >
            <span
              style={{
                width: '40px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.6875rem',
                fontFamily: '"JetBrains Mono", monospace',
                color: '#f85149',
                textAlign: 'right',
                userSelect: 'none',
                opacity: 0.7,
              }}
            >
              {fix.startLine + i}
            </span>
            <span
              style={{
                width: '24px',
                padding: '0.25rem 0.375rem',
                fontSize: '0.75rem',
                fontFamily: '"JetBrains Mono", monospace',
                color: '#f85149',
                fontWeight: 600,
                userSelect: 'none',
              }}
            >
              −
            </span>
            <pre
              style={{
                flex: 1,
                margin: 0,
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                fontFamily: '"JetBrains Mono", monospace',
                color: '#ffa198',
                whiteSpace: 'pre',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {line || ' '}
            </pre>
          </div>
        ))}

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: 'rgba(148, 163, 184, 0.1)',
          }}
        />

        {/* Added lines */}
        {newLines.map((line, i) => (
          <div
            key={`add-${i}`}
            style={{
              display: 'flex',
              background: 'rgba(63, 185, 80, 0.1)',
              borderLeft: '3px solid #3fb950',
            }}
          >
            <span
              style={{
                width: '40px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.6875rem',
                fontFamily: '"JetBrains Mono", monospace',
                color: '#3fb950',
                textAlign: 'right',
                userSelect: 'none',
                opacity: 0.7,
              }}
            >
              {fix.startLine + i}
            </span>
            <span
              style={{
                width: '24px',
                padding: '0.25rem 0.375rem',
                fontSize: '0.75rem',
                fontFamily: '"JetBrains Mono", monospace',
                color: '#3fb950',
                fontWeight: 600,
                userSelect: 'none',
              }}
            >
              +
            </span>
            <pre
              style={{
                flex: 1,
                margin: 0,
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                fontFamily: '"JetBrains Mono", monospace',
                color: '#7ee787',
                whiteSpace: 'pre',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {line || ' '}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}
