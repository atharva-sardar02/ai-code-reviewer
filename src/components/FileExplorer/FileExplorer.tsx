import { useThreads } from '../../hooks/useThreads'

export function FileExplorer() {
  const { files, activeFileId, setActiveFile, createFile, deleteFile } = useThreads()

  const handleCreateFile = () => {
    const name = prompt('Enter file name (e.g., App.tsx):')
    if (name && name.trim()) {
      // Detect language from extension
      const ext = name.split('.').pop()?.toLowerCase() || 'javascript'
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
      const language = languageMap[ext] || 'javascript'
      createFile(name.trim(), language)
    }
  }

  const handleFileClick = (fileId: string) => {
    setActiveFile(fileId)
  }

  const handleDeleteFile = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation()
    deleteFile(fileId)
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#1f2937',
        borderRight: '1px solid #374151',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '0.75rem',
          borderBottom: '1px solid #374151',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h2
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#ffffff',
            margin: 0,
          }}
        >
          Files
        </h2>
        <button
          onClick={handleCreateFile}
          style={{
            padding: '0.25rem 0.5rem',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1d4ed8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb'
          }}
          title="New File"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New
        </button>
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
              padding: '1rem',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '0.875rem',
            }}
          >
            No files yet. Click "New" to create one.
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              onClick={() => handleFileClick(file.id)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                backgroundColor:
                  activeFileId === file.id ? '#374151' : 'transparent',
                color: activeFileId === file.id ? '#ffffff' : '#d1d5db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.25rem',
              }}
              onMouseEnter={(e) => {
                if (activeFileId !== file.id) {
                  e.currentTarget.style.backgroundColor = '#374151'
                }
              }}
              onMouseLeave={(e) => {
                if (activeFileId !== file.id) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
                <span
                  style={{
                    fontSize: '0.875rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {file.name}
                </span>
              </div>
              <button
                onClick={(e) => handleDeleteFile(e, file.id)}
                style={{
                  padding: '0.25rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  borderRadius: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ef4444'
                  e.currentTarget.style.opacity = '1'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9ca3af'
                  e.currentTarget.style.opacity = '0'
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
          ))
        )}
      </div>
    </div>
  )
}



