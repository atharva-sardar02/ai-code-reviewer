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
  code: string,
  language: string = 'javascript',
  selection?: { startLine: number; endLine: number }
): string {
  // Use context-aware truncation if selection is provided
  const truncatedCode = selection
    ? truncateCodeWithContext(code, selection.startLine, selection.endLine)
    : truncateCodeIfNeeded(code)
  
  return `You are an expert code reviewer helping a developer understand and improve their code.

The developer has shared ${language} code and selected specific lines to discuss. Your role is to:
1. Provide clear, helpful explanations about the selected code
2. Suggest improvements when appropriate
3. Answer questions about how the code works
4. Point out potential bugs or issues
5. Explain best practices relevant to the code

Here is the full code context:

\`\`\`${language}
${truncatedCode}
\`\`\`

When providing initial feedback on a code selection, structure your response using these categories (in this order):
- **ERRORS**: Actual bugs, syntax errors, or critical issues. MUST include corrected code in code blocks. If NO errors exist, DO NOT include this section.
- **SUGGESTIONS**: General suggestions for improvement (optional, only if relevant)
- **IMPROVEMENTS**: Specific code improvements or optimizations with code examples (optional, only if relevant)
- **EXPLANATIONS**: Brief explanations of how the code works (optional, only if needed)

CRITICAL RULES - READ CAREFULLY:
1. Each category must contain UNIQUE content - NEVER duplicate content from other categories
2. ERRORS category - BE THOROUGH IN ERROR DETECTION:
   - CAREFULLY check for missing closing tags (</div>, }, ), ], etc.)
   - Check for syntax errors, typos, incorrect syntax
   - Check for logical errors that would cause runtime failures
   - Check for type errors if applicable
   - If you find ANY error, you MUST include an ERRORS section with:
     * A clear description of the error
     * The corrected code in a code block showing the fix
   - DO NOT say "no errors" or "there are no errors" - simply omit the ERRORS section entirely if there are none
3. If there are no actual errors, DO NOT create an ERRORS section at all (not even to say "no errors")
4. Each category is independent - do not repeat information from one category in another
5. Be thorough: carefully examine the code line by line for syntax errors, missing elements, and bugs

Format your response with clear category headers using ### markdown syntax (e.g., ### SUGGESTIONS, ### IMPROVEMENTS, ### EXPLANATIONS, ### ERRORS).`
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
  
  // Check if this is an initial feedback request (no conversation history)
  const isInitialFeedback = request.conversationHistory.length === 0
  
  if (isInitialFeedback) {
    return `The developer has selected lines ${selection.startLine + 1}-${selection.endLine + 1} and wants feedback on this code:

Selected code:
\`\`\`
${selectedCode}
\`\`\`

Please provide comprehensive feedback structured into these categories (in this order):
- **ERRORS**: Actual bugs, syntax errors, or critical issues. MUST include corrected code in code blocks. If NO errors exist, DO NOT include this section.
- **SUGGESTIONS**: General suggestions for improvement (only if relevant)
- **IMPROVEMENTS**: Specific code improvements with examples (only if relevant)
- **EXPLANATIONS**: Brief explanations of how the code works (only if needed)

CRITICAL REQUIREMENTS - FOLLOW STRICTLY:
1. NEVER duplicate content across categories - each category must have unique content
2. ERRORS section - BE THOROUGH AND CAREFUL:
   - Carefully check for missing closing tags (</div>, }, ), etc.)
   - Check for syntax errors, typos, incorrect syntax
   - Check for logical errors that would cause failures
   - If you find ANY error, you MUST include an ERRORS section with:
     * A clear description of the error
     * The corrected code in a code block showing the fix
   - DO NOT say "no errors" or "there are no errors" - simply omit the ERRORS section entirely if there are none
3. If there are no actual errors, DO NOT create an ERRORS section at all
4. Each category is independent - do not copy content from one category to another
5. Be thorough in your error detection - examine the code carefully for all types of errors

Format your response using ### markdown headers (e.g., ### SUGGESTIONS, ### IMPROVEMENTS, ### EXPLANATIONS, ### ERRORS).`
  }
  
  return `The developer has selected lines ${selection.startLine + 1}-${selection.endLine + 1} and asks:

"${userMessage}"

Selected code:
\`\`\`
${selectedCode}
\`\`\`

Please provide a helpful response about this code selection.`
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
 * Extracts the selected code lines from the full code
 */
function extractSelectedCode(
  code: string,
  startLine: number,
  endLine: number
): string {
  const lines = code.split('\n')
  const selectedLines = lines.slice(startLine, endLine + 1)
  
  // Add line numbers for clarity
  return selectedLines
    .map((line, index) => {
      const lineNum = startLine + index + 1
      return `${lineNum.toString().padStart(4, ' ')} | ${line}`
    })
    .join('\n')
}

/**
 * Truncates code if it's too long, keeping context around selection
 */
function truncateCodeIfNeeded(code: string): string {
  const lines = code.split('\n')
  
  // If code is short enough, return as-is
  if (lines.length <= MAX_CONTEXT_LINES) {
    return code
  }
  
  // For long files, we'd need to know the selection to keep context
  // For now, just truncate to first MAX_CONTEXT_LINES
  // In a real implementation, we'd pass selection and keep context around it
  const truncated = lines.slice(0, MAX_CONTEXT_LINES).join('\n')
  return `${truncated}\n\n... (code truncated, showing first ${MAX_CONTEXT_LINES} lines) ...`
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

