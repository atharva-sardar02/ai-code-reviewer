import { useEffect, type RefObject } from 'react'
import type { editor } from 'monaco-editor'

interface Selection {
  startLine: number
  endLine: number
  selectedText: string
}

export function useSelection(
  editorRef: RefObject<editor.IStandaloneCodeEditor | null>,
  code: string,
  onSelectionChange?: (selection: Selection | null) => void,
) {
  useEffect(() => {
    const editor = editorRef.current
    if (!editor || !onSelectionChange) return

    const disposable = editor.onDidChangeCursorSelection(() => {
      const selection = editor.getSelection()
      if (!selection) {
        onSelectionChange(null)
        return
      }

      const startLine = selection.startLineNumber
      const endLine = selection.endLineNumber

      // Check if there's actual text selected (not just cursor)
      const hasSelection =
        !selection.isEmpty() &&
        !(
          selection.startLineNumber === selection.endLineNumber &&
          selection.startColumn === selection.endColumn
        )

      if (!hasSelection) {
        onSelectionChange(null)
        return
      }

      // Extract selected text
      const selectedText = editor.getModel()?.getValueInRange(selection) || ''

      onSelectionChange({
        startLine,
        endLine,
        selectedText,
      })
    })

    return () => {
      disposable.dispose()
    }
  }, [editorRef, code, onSelectionChange])
}






