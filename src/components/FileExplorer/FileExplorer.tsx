import { useRef } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useThreads } from '../../hooks/useThreads'

export function FileExplorer() {
  const { files, activeFileId, openFileIds, openFile, createFile, createFileFromContent, deleteFile } = useThreads()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || 'javascript'
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'rb': 'ruby',
      'php': 'php',
      'swift': 'swift',
      'kt': 'kotlin',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'xml': 'xml',
      'md': 'markdown',
      'yaml': 'yaml',
      'yml': 'yaml',
    }
    return languageMap[ext] || 'javascript'
  }

  const handleCreateFile = () => {
    const name = prompt('Enter file name (e.g., App.tsx):')
    if (name && name.trim()) {
      const language = getLanguageFromExtension(name)
      createFile(name.trim(), language)
    }
  }

  const handleUploadFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const language = getLanguageFromExtension(file.name)
      createFileFromContent(file.name, content, language)
    }
    reader.readAsText(file)

    // Reset input so same file can be uploaded again
    e.target.value = ''
  }

  const handleFileClick = (fileId: string) => {
    openFile(fileId)  // Open file in tabs and set as active
  }

  const handleDeleteFile = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation()
    deleteFile(fileId)
  }

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const iconColors: Record<string, string> = {
      'ts': '#3178c6',
      'tsx': '#3178c6',
      'js': '#f7df1e',
      'jsx': '#61dafb',
      'py': '#3776ab',
      'java': '#007396',
      'go': '#00add8',
      'rs': '#dea584',
      'rb': '#cc342d',
      'php': '#777bb4',
      'swift': '#fa7343',
      'kt': '#7f52ff',
      'html': '#e34f26',
      'css': '#1572b6',
      'scss': '#cc6699',
      'json': '#292929',
      'md': '#083fa1',
    }
    const color = iconColors[ext || ''] || '#64748b'

    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        style={{ flexShrink: 0, opacity: 0.9 }}
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
    )
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #111827 0%, #0a0e17 100%)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem',
          borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h2
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: '#64748b',
            margin: 0,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Explorer
        </h2>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
          accept=".ts,.tsx,.js,.jsx,.py,.java,.cpp,.c,.cs,.go,.rs,.rb,.php,.swift,.kt,.html,.css,.scss,.json,.xml,.md,.yaml,.yml,.txt"
        />
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              style={{
                padding: '0.375rem 0.625rem',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                color: '#ffffff',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.6875rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
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
              title="New File"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              New
              <svg
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 4.5L6 7.5L9 4.5" />
              </svg>
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              style={{
                background: 'rgba(26, 34, 52, 0.95)',
                backdropFilter: 'blur(12px)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                zIndex: 200,
                minWidth: '180px',
                padding: '0.375rem',
                animation: 'fadeIn 0.15s ease-out',
              }}
              sideOffset={5}
            >
              <DropdownMenu.Item
                onClick={handleCreateFile}
                style={{
                  padding: '0.625rem 0.75rem',
                  cursor: 'pointer',
                  borderRadius: '0.375rem',
                  outline: 'none',
                  color: '#94a3b8',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
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
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M12 11v6M9 14h6" />
                </svg>
                Create New File
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onClick={handleUploadFile}
                style={{
                  padding: '0.625rem 0.75rem',
                  cursor: 'pointer',
                  borderRadius: '0.375rem',
                  outline: 'none',
                  color: '#94a3b8',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
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
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Upload File
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* File List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.5rem',
        }}
      >
        {files.length === 0 ? (
          <div
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              color: '#475569',
              fontSize: '0.8125rem',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 1rem',
                background: 'rgba(148, 163, 184, 0.05)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ color: '#64748b' }}
              >
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <p style={{ marginBottom: '0.25rem', color: '#64748b' }}>No files yet</p>
            <p style={{ fontSize: '0.75rem' }}>Click "New" to get started</p>
          </div>
        ) : (
          files.map((file) => {
            const isOpen = openFileIds.includes(file.id)
            const isActive = activeFileId === file.id
            return (
            <div
              key={file.id}
              onClick={() => handleFileClick(file.id)}
              style={{
                padding: '0.625rem 0.75rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)'
                  : 'transparent',
                borderLeft: isActive 
                  ? '2px solid #06b6d4'
                  : '2px solid transparent',
                color: isActive ? '#f1f5f9' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.25rem',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(148, 163, 184, 0.05)'
                  e.currentTarget.style.color = '#f1f5f9'
                }
                const deleteBtn = e.currentTarget.querySelector('[data-delete-btn]') as HTMLElement
                if (deleteBtn) deleteBtn.style.opacity = '1'
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#94a3b8'
                }
                const deleteBtn = e.currentTarget.querySelector('[data-delete-btn]') as HTMLElement
                if (deleteBtn) deleteBtn.style.opacity = '0'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {/* Open indicator dot */}
                {isOpen && (
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#06b6d4',
                      flexShrink: 0,
                      marginLeft: '-0.25rem',
                    }}
                  />
                )}
                {getFileIcon(file.name)}
                <span
                  style={{
                    fontSize: '0.8125rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {file.name}
                </span>
              </div>
              <button
                data-delete-btn
                onClick={(e) => handleDeleteFile(e, file.id)}
                style={{
                  padding: '0.25rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  borderRadius: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ef4444'
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#64748b'
                  e.currentTarget.style.background = 'transparent'
                }}
                title="Delete file"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
            )
          })
        )}
      </div>
    </div>
  )
}
