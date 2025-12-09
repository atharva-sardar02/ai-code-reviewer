/**
 * Converts Monaco Selection to a simple line range
 * Accepts any object with startLineNumber and endLineNumber properties
 */
export function monacoSelectionToRange(
  selection: { startLineNumber: number; endLineNumber: number } | null,
): { startLine: number; endLine: number } | null {
  if (!selection) {
    return null
  }

  return {
    startLine: selection.startLineNumber,
    endLine: selection.endLineNumber,
  }
}

/**
 * Extracts selected text from code string based on line numbers
 * Line numbers are 1-indexed and inclusive (Monaco Editor format)
 */
export function extractSelectedText(
  code: string,
  startLine: number,
  endLine: number,
): string {
  const lines = code.split('\n')
  // slice is exclusive of end, so we use endLine (not endLine - 1) since it's 1-indexed
  // For lines 1-6, we want indices 0-5, so slice(0, 6) is correct
  const selectedLines = lines.slice(startLine - 1, endLine)
  return selectedLines.join('\n')
}

/**
 * Generates a unique thread ID
 */
export function generateThreadId(): string {
  return `thread-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

