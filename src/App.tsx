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
    updateFile,
    threads,
    activeThreadId,
    setActiveThread,
  } = useThreads()
  const { sendMessage } = useConversation()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [language, setLanguage] = useState('javascript')
  const initialMessageSentRef = useRef<Set<string>>(new Set())

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

    window.addEventListener('keydown', handleKeyDown as any)
    return () => {
      window.removeEventListener('keydown', handleKeyDown as any)
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
        backgroundColor: '#111827',
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
            borderRight: '1px solid #374151',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <FileExplorer />
        </div>

        {/* Middle: Code Editor (45%) */}
        <div
          style={{
            width: '45%',
            borderRight: '1px solid #374151',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <FileTabs />
          <CodeEditor
            file={activeFile}
            onChange={handleCodeChange}
            onSelectionChange={handleSelectionChange}
            onAskAI={handleAskAI}
            highlightLines={highlightLines}
          />
        </div>

        {/* Right: Thread Panel (40%) */}
        <div
          style={{
            width: '40%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <ThreadPanel />
        </div>
      </div>
      <ApiKeyInput
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
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
