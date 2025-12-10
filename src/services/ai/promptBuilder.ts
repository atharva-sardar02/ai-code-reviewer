import type { AICompletionRequest } from './types'

/**
 * Maximum number of lines to send in context for long files
 */
const MAX_CONTEXT_LINES = 500

/**
 * Number of lines to include before and after selection for context
 */
const CONTEXT_PADDING = 50

/**
 * Builds the system prompt that provides context to the AI
 * 
 * The system prompt includes:
 * - Full code context (truncated if necessary)
 * - Programming language
 * - Instructions for the AI's role
 * 
 * @param code - The full code content
 * @param language - Programming language (default: 'javascript')
 * @param selection - Optional selection range for context-aware truncation
 * @returns The formatted system prompt string
 */
export function buildSystemPrompt(
  _code: string,
  language: string = 'javascript',
  _selection?: { startLine: number; endLine: number }
): string {
  return `You are an expert ${language} code reviewer.

Review the code the user provides. Find errors, bugs, and suggest improvements.

RESPONSE FORMAT:
### ERRORS - List bugs/errors found. Provide COMPLETE corrected code. Skip if no errors.
### SUGGESTIONS - Optional tips
### IMPROVEMENTS - Optional optimizations
### EXPLANATIONS - Optional explanations

IMPORTANT: When providing corrected code, show ALL lines (complete snippet), not just changed lines.
No "// fixed" comments in code - explain in text before code block.`
}

/**
 * Builds the user prompt with the selected code and question
 * 
 * Includes:
 * - User's question/message
 * - Selected code with line numbers
 * - Line range information
 * 
 * @param request - The AI completion request containing code, selection, and message
 * @returns The formatted user prompt string
 */
export function buildUserPrompt(
  request: AICompletionRequest
): string {
  const { code, selection, userMessage } = request
  const selectedCode = extractSelectedCode(code, selection.startLine, selection.endLine)
  
  // DEBUG: Log what's being sent to AI
  console.log('=== AI PROMPT DEBUG ===')
  console.log('Selection range:', selection.startLine, '-', selection.endLine)
  console.log('Full code lines:', code.split('\n').length)
  console.log('Conversation history length:', request.conversationHistory.length)
  console.log('Selected code:')
  console.log(selectedCode)
  console.log('=== END DEBUG ===')
  
  // Check if this is an initial feedback request
  // conversationHistory includes the current user message, so length <= 1 means it's the first message
  const isInitialFeedback = request.conversationHistory.length <= 1
  
  if (isInitialFeedback) {
    return `Review this ${request.language || 'typescript'} code:

\`\`\`${request.language || 'typescript'}
${selectedCode}
\`\`\`

Find any errors, bugs, or issues. If you find errors, provide the complete corrected code.
No comments like "// fixed" in code - explain changes in text before the code block.`
  }
  
  // For follow-up messages, include the full current code since line numbers may have changed
  // after applying previous fixes
  return `The developer asks about their SELECTED CODE (originally lines ${selection.startLine + 1}-${selection.endLine + 1}):

"${userMessage}"

Here is the current full code for CONTEXT:
\`\`\`
${code}
\`\`\`

IMPORTANT REMINDERS:
- The developer originally selected lines ${selection.startLine + 1}-${selection.endLine + 1}
- The code may have been modified since the original selection
- Focus your response on the code that was originally selected
- Use the full file for context but keep suggestions focused on the relevant section
- If you suggest code changes, provide the corrected code in a code block with clear line references`
}

/**
 * Builds the conversation messages array for the AI API
 * 
 * Creates a properly formatted messages array for OpenAI's chat completions API:
 * 1. System message with code context
 * 2. Previous conversation history (user/assistant messages)
 * 3. Current user message with selected code
 * 
 * @param request - The AI completion request
 * @returns Array of message objects formatted for OpenAI API
 */
export function buildConversationMessages(
  request: AICompletionRequest
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const { language = 'javascript', code, selection, conversationHistory } = request
  
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = []
  
  // Add system prompt
  messages.push({
    role: 'system',
    content: buildSystemPrompt(code, language, selection),
  })
  
  // Add conversation history (excluding the system message)
  for (const msg of conversationHistory) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    })
  }
  
  // Add current user message with selected code context
  messages.push({
    role: 'user',
    content: buildUserPrompt(request),
  })
  
  return messages
}

/**
 * Extracts the selected code lines from the full code (clean, no line numbers)
 * Note: startLine and endLine are 1-indexed (from Monaco editor)
 */
function extractSelectedCode(
  code: string,
  startLine: number,
  endLine: number
): string {
  const lines = code.split('\n')
  // Convert from 1-indexed (Monaco) to 0-indexed (array)
  const startIdx = startLine - 1
  const endIdx = endLine - 1
  const selectedLines = lines.slice(startIdx, endIdx + 1)
  return selectedLines.join('\n')
}

/**
 * Truncates code while keeping context around a selection
 */
export function truncateCodeWithContext(
  code: string,
  startLine: number,
  endLine: number
): string {
  const lines = code.split('\n')
  
  // If code is short enough, return as-is
  if (lines.length <= MAX_CONTEXT_LINES) {
    return code
  }
  
  // Calculate context window
  const contextStart = Math.max(0, startLine - CONTEXT_PADDING)
  const contextEnd = Math.min(lines.length - 1, endLine + CONTEXT_PADDING)
  
  // If context window fits, return it
  if (contextEnd - contextStart <= MAX_CONTEXT_LINES) {
    const contextLines = lines.slice(contextStart, contextEnd + 1)
    const result: string[] = []
    
    if (contextStart > 0) {
      result.push(`... (showing lines ${contextStart + 1}-${contextEnd + 1} of ${lines.length}) ...`)
    }
    
    result.push(...contextLines)
    
    if (contextEnd < lines.length - 1) {
      result.push(`... (${lines.length - contextEnd - 1} more lines) ...`)
    }
    
    return result.join('\n')
  }
  
  // If selection itself is too large, just show selection with minimal context
  const selectionSize = endLine - startLine + 1
  if (selectionSize > MAX_CONTEXT_LINES) {
    // Just show the selection, truncated
    const selectedLines = lines.slice(startLine, startLine + MAX_CONTEXT_LINES)
    return selectedLines.join('\n') + `\n... (${selectionSize - MAX_CONTEXT_LINES} more lines in selection) ...`
  }
  
  // Show selection with equal padding before/after
  const padding = Math.floor((MAX_CONTEXT_LINES - selectionSize) / 2)
  const showStart = Math.max(0, startLine - padding)
  const showEnd = Math.min(lines.length - 1, endLine + padding)
  const showLines = lines.slice(showStart, showEnd + 1)
  
  const result: string[] = []
  if (showStart > 0) {
    result.push(`... (${showStart} lines before) ...`)
  }
  result.push(...showLines)
  if (showEnd < lines.length - 1) {
    result.push(`... (${lines.length - showEnd - 1} lines after) ...`)
  }
  
  return result.join('\n')
}

