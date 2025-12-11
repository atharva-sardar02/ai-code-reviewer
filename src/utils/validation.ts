/**
 * Validation utility functions for code review assistant
 */

/**
 * Checks if a selection is valid (has at least 1 line with content)
 * @param startLine - Starting line number (0-indexed)
 * @param endLine - Ending line number (0-indexed)
 * @param selectedText - The selected text content
 * @returns true if selection is valid, false otherwise
 */
export function isValidSelection(
  startLine: number,
  endLine: number,
  selectedText: string
): boolean {
  // Must have at least one line selected
  if (startLine < 0 || endLine < 0 || startLine > endLine) {
    return false
  }

  // Must have at least one line difference
  if (startLine === endLine && !selectedText.trim()) {
    return false
  }

  // Must have some non-whitespace content
  return selectedText.trim().length > 0
}

/**
 * Checks if a message is valid (non-empty after trimming)
 * @param message - The message to validate
 * @returns true if message is valid, false otherwise
 */
export function isValidMessage(message: string): boolean {
  return message.trim().length > 0
}

/**
 * Maximum number of lines before truncation is recommended
 */
const MAX_LINES_BEFORE_TRUNCATE = 500

/**
 * Maximum characters before truncation is recommended
 */
const MAX_CHARS_BEFORE_TRUNCATE = 50000

/**
 * Determines if code should be truncated based on size
 * @param code - The code to check
 * @returns true if code should be truncated, false otherwise
 */
export function shouldTruncateCode(code: string): boolean {
  const lines = code.split('\n')
  const lineCount = lines.length
  const charCount = code.length

  return (
    lineCount > MAX_LINES_BEFORE_TRUNCATE ||
    charCount > MAX_CHARS_BEFORE_TRUNCATE
  )
}

/**
 * Number of lines to include before and after selection for context
 */
const CONTEXT_PADDING = 50

/**
 * Maximum number of lines to include in truncated code
 */
const MAX_TRUNCATED_LINES = 500

/**
 * Truncates code while keeping context around a selection
 * @param code - The full code
 * @param startLine - Starting line of selection (0-indexed)
 * @param endLine - Ending line of selection (0-indexed)
 * @returns Truncated code with context markers
 */
export function truncateCodeWithContext(
  code: string,
  startLine: number,
  endLine: number
): string {
  const lines = code.split('\n')
  const totalLines = lines.length

  // If code is short enough, return as-is
  if (totalLines <= MAX_TRUNCATED_LINES) {
    return code
  }

  // Calculate context window
  const contextStart = Math.max(0, startLine - CONTEXT_PADDING)
  const contextEnd = Math.min(totalLines - 1, endLine + CONTEXT_PADDING)

  // If context window fits, return it
  if (contextEnd - contextStart <= MAX_TRUNCATED_LINES) {
    const contextLines = lines.slice(contextStart, contextEnd + 1)
    const result: string[] = []

    if (contextStart > 0) {
      result.push(
        `... (showing lines ${contextStart + 1}-${contextEnd + 1} of ${totalLines}) ...`
      )
    }

    result.push(...contextLines)

    if (contextEnd < totalLines - 1) {
      result.push(`... (${totalLines - contextEnd - 1} more lines) ...`)
    }

    return result.join('\n')
  }

  // If selection itself is too large, just show selection with minimal context
  const selectionSize = endLine - startLine + 1
  if (selectionSize > MAX_TRUNCATED_LINES) {
    // Just show the selection, truncated
    const selectedLines = lines.slice(startLine, startLine + MAX_TRUNCATED_LINES)
    return (
      selectedLines.join('\n') +
      `\n... (${selectionSize - MAX_TRUNCATED_LINES} more lines in selection) ...`
    )
  }

  // Show selection with equal padding before/after
  const padding = Math.floor((MAX_TRUNCATED_LINES - selectionSize) / 2)
  const showStart = Math.max(0, startLine - padding)
  const showEnd = Math.min(totalLines - 1, endLine + padding)
  const showLines = lines.slice(showStart, showEnd + 1)

  const result: string[] = []
  if (showStart > 0) {
    result.push(`... (${showStart} lines before) ...`)
  }
  result.push(...showLines)
  if (showEnd < totalLines - 1) {
    result.push(`... (${totalLines - showEnd - 1} lines after) ...`)
  }

  return result.join('\n')
}








