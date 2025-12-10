import { Editor } from '@monaco-editor/react'
import { useRef, useEffect, useState } from 'react'
import type { editor } from 'monaco-editor'
import * as monaco from 'monaco-editor'
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
  onCreateFile?: () => void
  onUploadFile?: () => void
  highlightLines?: { startLine: number; endLine: number } | null
}

export function CodeEditor({
  file,
  onChange,
  onSelectionChange,
  onAskAI,
  onCreateFile,
  onUploadFile,
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
        const model = editor.getModel()
        if (model) {
          const decorations: editor.IModelDeltaDecoration[] = [
            {
              range: new monaco.Range(
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

  // Show landing page if no file open
  if (!file) {
    return (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #0a0e17 0%, #0d1117 100%)',
          color: '#64748b',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background elements */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.03) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.03) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
        />

        <div
          style={{
            textAlign: 'center',
            maxWidth: '400px',
            padding: '2rem',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              marginBottom: '2rem',
              width: '100px',
              height: '100px',
              margin: '0 auto 2rem',
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'glow 3s ease-in-out infinite',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              style={{ color: '#06b6d4' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </div>

          {/* Welcome text */}
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
              color: '#f1f5f9',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Welcome to Code Review
          </h2>
          <p
            style={{
              fontSize: '0.9375rem',
              color: '#94a3b8',
              marginBottom: '2rem',
              lineHeight: '1.7',
            }}
          >
            Get AI-powered feedback on your code. Select any code snippet and ask questions.
          </p>

          {/* Getting started steps */}
          <div
            style={{
              fontSize: '0.8125rem',
              color: '#64748b',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              padding: '1.25rem',
              background: 'rgba(148, 163, 184, 0.03)',
              borderRadius: '1rem',
              border: '1px solid rgba(148, 163, 184, 0.08)',
              textAlign: 'left',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.25rem',
              }}
            >
              Getting Started
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(6, 182, 212, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#06b6d4',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                1
              </div>
              <span>Click a file in the sidebar to open it</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(6, 182, 212, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#06b6d4',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                2
              </div>
              <span>Select code and click "Ask AI"</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(6, 182, 212, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#06b6d4',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                3
              </div>
              <span>Get intelligent code feedback</span>
            </div>
          </div>

          {/* Action Buttons */}
          {(onCreateFile || onUploadFile) && (
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                marginTop: '1.5rem',
                justifyContent: 'center',
              }}
            >
              {onCreateFile && (
                <button
                  onClick={onCreateFile}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    color: '#ffffff',
                    borderRadius: '0.625rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(6, 182, 212, 0.3)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(6, 182, 212, 0.3)'
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
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6M12 11v6M9 14h6" />
                  </svg>
                  Create New
                </button>
              )}
              {onUploadFile && (
                <button
                  onClick={onUploadFile}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'transparent',
                    color: '#94a3b8',
                    borderRadius: '0.625rem',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)'
                    e.currentTarget.style.color = '#f1f5f9'
                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#94a3b8'
                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)'
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  Upload File
                </button>
              )}
            </div>
          )}
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
            right: '1.5rem',
            padding: '0.625rem 1.25rem',
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            color: '#ffffff',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(6, 182, 212, 0.3)',
            zIndex: 10,
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 150ms ease',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(6, 182, 212, 0.3)'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2M7.5 13A1.5 1.5 0 0 0 6 14.5 1.5 1.5 0 0 0 7.5 16 1.5 1.5 0 0 0 9 14.5 1.5 1.5 0 0 0 7.5 13m9 0a1.5 1.5 0 0 0-1.5 1.5 1.5 1.5 0 0 0 1.5 1.5 1.5 1.5 0 0 0 1.5-1.5 1.5 1.5 0 0 0-1.5-1.5" />
          </svg>
          Ask AI
        </button>
      )}
    </div>
  )
}
