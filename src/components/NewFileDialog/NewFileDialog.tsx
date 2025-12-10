import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'

interface NewFileDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateFile: (name: string) => void
}

export function NewFileDialog({ isOpen, onClose, onCreateFile }: NewFileDialogProps) {
  const [fileName, setFileName] = useState('')

  // Reset input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFileName('')
      // Focus input after a short delay to ensure dialog is rendered
      setTimeout(() => {
        const input = document.querySelector('[data-file-name-input]') as HTMLInputElement
        input?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (fileName.trim()) {
      onCreateFile(fileName.trim())
      setFileName('')
      onClose()
    }
  }

  const handleCancel = () => {
    setFileName('')
    onClose()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
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
          onEscapeKeyDown={handleCancel}
          onPointerDownOutside={handleCancel}
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ color: '#06b6d4' }}
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6M12 11v6M9 14h6" />
            </svg>
            Create New File
          </Dialog.Title>
          <Dialog.Description
            style={{
              fontSize: '0.875rem',
              color: '#64748b',
              marginBottom: '1.5rem',
            }}
          >
            Enter a file name with extension (e.g., App.tsx, index.js, utils.py)
          </Dialog.Description>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="file-name-input"
                style={{
                  display: 'block',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: '#64748b',
                  marginBottom: '0.625rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                File Name
              </label>
              <input
                id="file-name-input"
                data-file-name-input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="App.tsx"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'rgba(148, 163, 184, 0.05)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: '0.625rem',
                  color: '#f1f5f9',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 150ms ease',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#06b6d4'
                  e.target.style.boxShadow = '0 0 0 3px rgba(6, 182, 212, 0.1)'
                  e.target.style.background = 'rgba(148, 163, 184, 0.08)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(148, 163, 184, 0.1)'
                  e.target.style.boxShadow = 'none'
                  e.target.style.background = 'rgba(148, 163, 184, 0.05)'
                }}
                autoComplete="off"
              />
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#475569',
                  marginTop: '0.625rem',
                  lineHeight: '1.6',
                }}
              >
                The language will be automatically detected from the file extension.
              </p>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: 'rgba(148, 163, 184, 0.1)',
                  color: '#94a3b8',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(148, 163, 184, 0.15)'
                  e.currentTarget.style.color = '#f1f5f9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)'
                  e.currentTarget.style.color = '#94a3b8'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!fileName.trim()}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: fileName.trim()
                    ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
                    : 'rgba(148, 163, 184, 0.1)',
                  color: fileName.trim() ? '#ffffff' : '#64748b',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: fileName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'all 150ms ease',
                  boxShadow: fileName.trim() ? '0 2px 8px rgba(6, 182, 212, 0.25)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                onMouseEnter={(e) => {
                  if (fileName.trim()) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 182, 212, 0.35)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (fileName.trim()) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(6, 182, 212, 0.25)'
                  }
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

