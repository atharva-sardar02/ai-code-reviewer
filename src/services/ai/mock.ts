import type { AIProvider, AICompletionRequest } from './types'

/**
 * Mock AI provider that returns canned responses with simulated delay
 * Useful for demos and testing without requiring an API key
 */
export class MockProvider implements AIProvider {
  /**
   * Simulates an AI response with realistic delay
   */
  async complete(request: AICompletionRequest): Promise<string> {
    // Simulate network delay (500-1500ms)
    const delay = 500 + Math.random() * 1000
    await new Promise((resolve) => setTimeout(resolve, delay))

    // Generate response based on user message patterns
    const response = this.generateResponse(request)

    return response
  }

  /**
   * Generates a canned response based on the user's message
   */
  private generateResponse(request: AICompletionRequest): string {
    const { userMessage, selection, code } = request
    const message = userMessage.toLowerCase()

    // Extract selected code for context
    const lines = code.split('\n')
    const selectedLines = lines.slice(selection.startLine, selection.endLine + 1)
    const selectedCode = selectedLines.join('\n')

    // Pattern matching for common questions
    if (message.includes('correct') || message.includes('right') || message.includes('wrong')) {
      return `Looking at lines ${selection.startLine + 1}-${selection.endLine + 1}, the code appears to be functionally correct. However, here are some considerations:

1. **Code Quality**: The implementation follows standard patterns for ${this.detectLanguage(code)}.

2. **Potential Improvements**: 
   - Consider adding error handling if the input could be invalid
   - You might want to add input validation

3. **Best Practices**: The code is readable and follows good naming conventions.

Would you like me to suggest specific improvements or explain any part in more detail?`
    }

    if (message.includes('improve') || message.includes('better') || message.includes('optimize')) {
      return `Here are some ways to improve the selected code (lines ${selection.startLine + 1}-${selection.endLine + 1}):

**Suggested Improvements:**

1. **Performance**: Consider using more efficient data structures if working with large datasets.

2. **Readability**: The code is already quite readable, but you could add comments for complex logic.

3. **Error Handling**: Add try-catch blocks or validation where appropriate.

4. **Modern Syntax**: If using ${this.detectLanguage(code)}, consider using modern language features like arrow functions or optional chaining where applicable.

Would you like me to provide a refactored version of this code?`
    }

    if (message.includes('explain') || message.includes('how') || message.includes('what')) {
      return `Let me explain what this code does (lines ${selection.startLine + 1}-${selection.endLine + 1}):

**Code Explanation:**

\`\`\`
${selectedCode}
\`\`\`

This code snippet:
1. Processes the selected lines of code
2. Performs the operations as defined
3. Returns or modifies data according to the logic

**Key Points:**
- The code follows standard ${this.detectLanguage(code)} patterns
- It handles the expected use case
- Consider edge cases and error scenarios

Is there a specific part you'd like me to explain in more detail?`
    }

    if (message.includes('bug') || message.includes('error') || message.includes('issue')) {
      return `I've reviewed the code on lines ${selection.startLine + 1}-${selection.endLine + 1}. Here's my analysis:

**Potential Issues:**

1. **Edge Cases**: Make sure to handle edge cases like empty inputs or null values.

2. **Type Safety**: Verify that all variables have the expected types.

3. **Logic**: The logic appears sound, but double-check boundary conditions.

**Recommendations:**
- Add unit tests to verify behavior
- Consider adding logging for debugging
- Validate inputs before processing

If you're experiencing a specific error, please share the error message and I can help debug it.`
    }

    // Default response for any other question
    return `I've reviewed the code you selected (lines ${selection.startLine + 1}-${selection.endLine + 1}).

**Analysis:**

The selected code appears to be well-structured ${this.detectLanguage(code)} code. Here are my observations:

1. **Structure**: The code follows good programming practices
2. **Readability**: The code is clear and easy to understand
3. **Functionality**: The implementation looks correct for its intended purpose

**Questions to Consider:**
- Are there any specific concerns you have about this code?
- Would you like suggestions for improvement?
- Do you need help understanding how it works?

Feel free to ask more specific questions, and I'll provide detailed feedback!`
  }

  /**
   * Attempts to detect the programming language from code
   */
  private detectLanguage(code: string): string {
    if (code.includes('function') && code.includes('=>')) {
      return 'JavaScript/TypeScript'
    }
    if (code.includes('def ') || code.includes('import ')) {
      return 'Python'
    }
    if (code.includes('public class') || code.includes('private ')) {
      return 'Java'
    }
    if (code.includes('fn ') || code.includes('let mut')) {
      return 'Rust'
    }
    if (code.includes('func ') && code.includes('package ')) {
      return 'Go'
    }
    return 'code'
  }
}

/**
 * Creates a new instance of the mock provider
 */
export function createMockProvider(): AIProvider {
  return new MockProvider()
}






