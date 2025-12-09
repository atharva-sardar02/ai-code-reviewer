import { useThreads } from '../../hooks/useThreads'

export function FileTabs() {
  const { files, activeFileId, setActiveFile, deleteFile } = useThreads()
  
  const handleDownloadFile = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation()
    const file = files.find(f => f.id === fileId)
    if (!file) return
    
    // Create a blob with the file content
    const blob = new Blob([file.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleTabClick = (fileId: string) => {
    setActiveFile(fileId)
  }

  const handleCloseTab = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation()
    deleteFile(fileId)
  }

  if (files.length === 0) {
    return null
  }

  return (
    <div
      style={{
        display: 'flex',
        borderBottom: '1px solid #374151',
        backgroundColor: '#1f2937',
        overflowX: 'auto',
        flexShrink: 0,
      }}
    >
      {files.map((file) => (
        <div
          key={file.id}
          onClick={() => handleTabClick(file.id)}
          style={{
            padding: '0.5rem 1rem',
            borderRight: '1px solid #374151',
            cursor: 'pointer',
            backgroundColor:
              activeFileId === file.id ? '#111827' : 'transparent',
            color: activeFileId === file.id ? '#ffffff' : '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap',
            minWidth: '120px',
            position: 'relative',
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
          <span
            style={{
              fontSize: '0.875rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {file.name}
          </span>
          <button
            onClick={(e) => handleDownloadFile(e, file.id)}
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
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#3b82f6'
              e.currentTarget.style.backgroundColor = '#374151'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            title="Download file"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          <button
            onClick={(e) => handleCloseTab(e, file.id)}
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
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ef4444'
              e.currentTarget.style.backgroundColor = '#374151'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            title="Close file"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

