import { Editor } from '@monaco-editor/react'
import { useRef, useEffect, useState } from 'react'
import type { editor } from 'monaco-editor'
import { useSelection } from './useSelection'
import { isValidSelection } from '../../utils/validation'
import type { File } from '../../store/types'
import { configureMonaco } from './monacoConfig'

interface CodeEditorProps {
  file: File | null
  onChange?: (value: string | undefined) => void
  onSelectionChange?: (selection: {
    startLine: number
    endLine: number
    selectedText: string
  } | null) => void
  onAskAI?: (selection: {
    startLine: number
    endLine: number
    selectedText: string
  }) => void
  highlightLines?: { startLine: number; endLine: number } | null
}

export function CodeEditor({
  file,
  onChange,
  onSelectionChange,
  onAskAI,
  highlightLines,
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const decorationRef = useRef<string[]>([])
  const [hasSelection, setHasSelection] = useState(false)
  const [isEditorMounted, setIsEditorMounted] = useState(false)

  const code = file?.content || ''
  const language = file?.language || 'javascript'

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
    setIsEditorMounted(true)
    // Configure Monaco to reduce false positive errors
    configureMonaco()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear decorations before unmounting
      if (editorRef.current && decorationRef.current.length > 0) {
        try {
          editorRef.current.deltaDecorations(decorationRef.current, [])
        } catch (error) {
          // Suppress cancellation errors during cleanup
          if (error instanceof Error && error.message.includes('Canceled')) {
            return
          }
          console.error('Error cleaning up editor decorations:', error)
        }
      }
    }
  }, [])

  // Track selection changes
  const handleSelectionChange = (selection: {
    startLine: number
    endLine: number
    selectedText: string
  } | null) => {
    setHasSelection(selection !== null)
    if (onSelectionChange) {
      onSelectionChange(selection)
    }
  }

  useSelection(editorRef, code, handleSelectionChange)

  // Also track selection directly from editor for button visibility
  // This runs when the editor is mounted
  useEffect(() => {
    const editor = editorRef.current
    if (!editor || !isEditorMounted) return

    const disposable = editor.onDidChangeCursorSelection(() => {
      const selection = editor.getSelection()
      const hasValidSelection =
        selection !== null &&
        !selection.isEmpty() &&
        !(
          selection.startLineNumber === selection.endLineNumber &&
          selection.startColumn === selection.endColumn
        )

      setHasSelection(hasValidSelection || false)
    })

    // Also check initial selection state
    const initialSelection = editor.getSelection()
    if (initialSelection) {
      const hasValidSelection =
        !initialSelection.isEmpty() &&
        !(
          initialSelection.startLineNumber === initialSelection.endLineNumber &&
          initialSelection.startColumn === initialSelection.endColumn
        )
      setHasSelection(hasValidSelection || false)
    }

    return () => {
      try {
        disposable.dispose()
      } catch (error) {
        // Suppress harmless Monaco cancellation errors
        if (error instanceof Error && error.name === 'Canceled') {
          console.warn('Monaco Editor dispose canceled:', error.message)
        } else {
          throw error
        }
      }
    }
  }, [isEditorMounted]) // Re-run when editor mounts

  // Handle line highlighting
  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    try {
      // Clear existing decorations
      if (decorationRef.current.length > 0) {
        editor.deltaDecorations(decorationRef.current, [])
        decorationRef.current = []
      }

      // Add new decorations if highlightLines is provided
      if (highlightLines) {
        const decorations: editor.IModelDeltaDecoration[] = [
          {
            range: new (window as any).monaco.Range(
              highlightLines.startLine,
              1,
              highlightLines.endLine,
              1,
            ),
            options: {
              isWholeLine: true,
              className: 'bg-yellow-500/20',
              marginClassName: 'bg-yellow-500/30',
            },
          },
        ]

        const model = editor.getModel()
        if (model) {
          decorationRef.current = editor.deltaDecorations([], decorations)
        }
      }
    } catch (error) {
      // Suppress cancellation errors - these are harmless
      if (error instanceof Error && error.message.includes('Canceled')) {
        return
      }
      console.error('Error updating editor decorations:', error)
    }
  }, [highlightLines])

  const handleAskAIClick = () => {
    const editor = editorRef.current
    if (!editor || !onAskAI || !file) return

    const selection = editor.getSelection()
    if (!selection || selection.isEmpty()) return

    const selectedText = editor.getModel()?.getValueInRange(selection) || ''

    // Validate selection using validation utility
    // Monaco uses 1-indexed line numbers, convert to 0-indexed for validation
    const startLine = selection.startLineNumber - 1
    const endLine = selection.endLineNumber - 1

    if (!isValidSelection(startLine, endLine, selectedText)) {
      return
    }

    onAskAI({
      startLine: selection.startLineNumber,
      endLine: selection.endLineNumber,
      selectedText,
    })
  }

  // Show empty state if no file
  if (!file) {
    return (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111827',
          color: '#9ca3af',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            maxWidth: '24rem',
            padding: '1rem',
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              style={{ margin: '0 auto', color: '#4b5563' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </div>
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: 500,
              marginBottom: '0.5rem',
              color: '#d1d5db',
            }}
          >
            No file open
          </h3>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '1rem',
            }}
          >
            Create a new file or open an existing one to get started
          </p>
          <div
            style={{
              fontSize: '0.75rem',
              color: '#4b5563',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
            }}
          >
            <p>• Click "New" in the file explorer to create a file</p>
            <p>• Select code and click "Ask AI" to start a conversation</p>
            <p>• Ask questions or request code reviews</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: true },
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          fontSize: 14,
          padding: { top: 12 },
          // Disable error squiggles - we'll rely on AI for code review instead
          renderValidationDecorations: 'off',
        }}
      />
      {onAskAI && hasSelection && (
        <button
          onClick={handleAskAIClick}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1d4ed8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb'
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow =
              '0 0 0 2px rgba(59, 130, 246, 0.5)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow =
              '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
          }}
        >
          Ask AI
        </button>
      )}
    </div>
  )
}
