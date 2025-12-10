import { useEffect, useState, useRef } from 'react'
import { ThreadProvider } from './store/ThreadContext'
import { Header } from './components/Header'
import { CodeEditor } from './components/CodeEditor'
import { ThreadPanel } from './components/ThreadPanel'
import { ApiKeyInput } from './components/ApiKeyInput'
import { FileExplorer } from './components/FileExplorer'
import { FileTabs } from './components/FileTabs'
import { useThreads } from './hooks/useThreads'
import { useConversation } from './hooks/useConversation'

function AppContent() {
  const {
    activeFile,
    activeFileId,
    createThread,
    createFile,
    createFileFromContent,
    updateFile,
    threads,
    activeThreadId,
    setActiveThread,
  } = useThreads()
  const { sendMessage } = useConversation()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [language, setLanguage] = useState('javascript')
  const initialMessageSentRef = useRef<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update language when active file changes
  useEffect(() => {
    if (activeFile) {
      setLanguage(activeFile.language)
    }
  }, [activeFile])

  // Auto-send initial feedback request when a new thread is created
  useEffect(() => {
    // Find threads that were just created (no messages yet) and are for the active file
    const newThreads = threads.filter(
      (t) =>
        t.fileId === activeFileId &&
        t.messages.length === 0 &&
        !t.isLoading &&
        !t.error &&
        !initialMessageSentRef.current.has(t.id) // Only send once per thread
    )

    // Send initial feedback request for each new thread
    newThreads.forEach((thread) => {
      // Mark as sent to prevent duplicate sends
      initialMessageSentRef.current.add(thread.id)
      
      // Add a small delay to ensure thread is fully in state
      setTimeout(() => {
        sendMessage(thread.id, 'Please provide feedback on this code selection.')
      }, 100)
    })
  }, [threads, activeFileId, sendMessage])

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined && activeFileId) {
      updateFile(activeFileId, value)
    }
  }

  const handleSelectionChange = () => {
    // Selection tracking for "Ask AI" button visibility
  }

  const handleAskAI = async (selection: {
    startLine: number
    endLine: number
    selectedText: string
  }) => {
    if (!activeFileId) return
    
    // Create the thread and get the thread ID
    createThread(activeFileId, selection.startLine, selection.endLine)
    // The initial message will be sent via useEffect when thread appears in state
  }

  const handleSettingsClick = () => {
    setIsSettingsOpen(true)
  }

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
      const lang = getLanguageFromExtension(name)
      createFile(name.trim(), lang)
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
      const lang = getLanguageFromExtension(file.name)
      createFileFromContent(file.name, content, lang)
    }
    reader.readAsText(file)

    // Reset input so same file can be uploaded again
    e.target.value = ''
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape: Close active thread
      if (e.key === 'Escape' && activeThreadId) {
        setActiveThread(null)
      }

      // Cmd/Ctrl + Shift + A: Open settings
      if (e.key === 'a' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault()
        setIsSettingsOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown as EventListener)
    return () => {
      window.removeEventListener('keydown', handleKeyDown as EventListener)
    }
  }, [activeThreadId, setActiveThread])

  // Get highlight lines from active thread (filtered by active file)
  const activeThread = threads.find(
    (t) => t.id === activeThreadId && t.fileId === activeFileId,
  )
  const highlightLines = activeThread
    ? { startLine: activeThread.startLine, endLine: activeThread.endLine }
    : null

  const HEADER_HEIGHT = 60

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #0a0e17 0%, #0d1117 100%)',
      }}
    >
      <Header
        onSettingsClick={handleSettingsClick}
        language={language}
        onLanguageChange={setLanguage}
      />
      <div
        style={{
          marginTop: `${HEADER_HEIGHT}px`,
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Left: File Explorer (15%) */}
        <div
          style={{
            width: '15%',
            minWidth: '180px',
            maxWidth: '280px',
            borderRight: '1px solid rgba(148, 163, 184, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <FileExplorer />
        </div>

        {/* Middle: Code Editor - takes full width when no file open */}
        <div
          style={{
            flex: 1,
            borderRight: activeFile ? '1px solid rgba(148, 163, 184, 0.08)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            background: '#0a0e17',
          }}
        >
          <FileTabs />
          <CodeEditor
            file={activeFile}
            onChange={handleCodeChange}
            onSelectionChange={handleSelectionChange}
            onAskAI={handleAskAI}
            onCreateFile={handleCreateFile}
            onUploadFile={handleUploadFile}
            highlightLines={highlightLines}
          />
        </div>

        {/* Right: Thread Panel - only show when a file is open */}
        {activeFile && (
          <div
            style={{
              width: '48%',
              minWidth: '380px',
              maxWidth: '600px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <ThreadPanel />
          </div>
        )}
      </div>
      <ApiKeyInput
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      {/* Hidden file input for upload */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        accept=".ts,.tsx,.js,.jsx,.py,.java,.cpp,.c,.cs,.go,.rs,.rb,.php,.swift,.kt,.html,.css,.scss,.json,.xml,.md,.yaml,.yml,.txt"
      />
    </div>
  )
}

function App() {
  return (
    <ThreadProvider>
      <AppContent />
    </ThreadProvider>
  )
}

export default App
