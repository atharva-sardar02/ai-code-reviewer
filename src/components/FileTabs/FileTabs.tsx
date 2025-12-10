import { useThreads } from '../../hooks/useThreads'

export function FileTabs() {
  const { openFiles, activeFileId, openFile, closeFile } = useThreads()
  
  const handleDownloadFile = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation()
    const file = openFiles.find(f => f.id === fileId)
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
    openFile(fileId)  // This will set as active
  }

  const handleCloseTab = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation()
    closeFile(fileId)  // Just close the tab, don't delete
  }

  if (openFiles.length === 0) {
    return null
  }

  return (
    <div
      style={{
        display: 'flex',
        borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
        background: '#111827',
        overflowX: 'auto',
        flexShrink: 0,
      }}
    >
      {openFiles.map((file) => {
        const isActive = activeFileId === file.id
        return (
          <div
            key={file.id}
            onClick={() => handleTabClick(file.id)}
            style={{
              padding: '0.625rem 1rem',
              cursor: 'pointer',
              background: isActive 
                ? 'linear-gradient(180deg, rgba(6, 182, 212, 0.08) 0%, #0a0e17 100%)'
                : 'transparent',
              borderBottom: isActive ? '2px solid #06b6d4' : '2px solid transparent',
              color: isActive ? '#f1f5f9' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              minWidth: '120px',
              position: 'relative',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(148, 163, 184, 0.05)'
                e.currentTarget.style.color = '#94a3b8'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#64748b'
              }
            }}
          >
            <span
              style={{
                fontSize: '0.8125rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {file.name}
            </span>
            <button
              onClick={(e) => handleDownloadFile(e, file.id)}
              style={{
                padding: '0.25rem',
                background: 'transparent',
                border: 'none',
                color: '#475569',
                cursor: 'pointer',
                borderRadius: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#06b6d4'
                e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#475569'
                e.currentTarget.style.background = 'transparent'
              }}
              title="Download file"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
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
                background: 'transparent',
                border: 'none',
                color: '#475569',
                cursor: 'pointer',
                borderRadius: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444'
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#475569'
                e.currentTarget.style.background = 'transparent'
              }}
              title="Close file"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}
