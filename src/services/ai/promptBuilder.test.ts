import { describe, it, expect } from 'vitest'
import {
  buildSystemPrompt,
  buildUserPrompt,
  buildConversationMessages,
  truncateCodeWithContext,
} from './promptBuilder'
import type { AICompletionRequest } from './types'

describe('promptBuilder', () => {
  const sampleCode = `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}`

  describe('buildSystemPrompt', () => {
    it('should include language and code in system prompt', () => {
      const prompt = buildSystemPrompt(sampleCode, 'javascript')
      
      expect(prompt).toContain('javascript')
      expect(prompt).toContain('calculateTotal')
      expect(prompt).toContain('code reviewer')
    })

    it('should default to javascript if language not provided', () => {
      const prompt = buildSystemPrompt(sampleCode)
      
      expect(prompt).toContain('javascript')
    })

    it('should include instructions for the AI', () => {
      const prompt = buildSystemPrompt(sampleCode, 'typescript')
      
      expect(prompt).toContain('expert code reviewer')
      expect(prompt).toContain('explanations')
      expect(prompt).toContain('improvements')
    })

    it('should use context-aware truncation when selection provided', () => {
      const longCode = Array.from({ length: 600 }, (_, i) => `line ${i + 1}`).join('\n')
      const prompt = buildSystemPrompt(longCode, 'javascript', { startLine: 300, endLine: 310 })
      
      // Should include context around selection
      expect(prompt).toContain('line 300')
      expect(prompt).toContain('line 310')
    })

    it('should handle empty code', () => {
      const prompt = buildSystemPrompt('', 'javascript')
      
      expect(prompt).toContain('javascript')
      expect(prompt).toContain('```javascript')
    })
  })

  describe('buildUserPrompt', () => {
    it('should include user message and selected code', () => {
      const request: AICompletionRequest = {
        code: sampleCode,
        selection: { startLine: 0, endLine: 2 },
        userMessage: 'Is this correct?',
        conversationHistory: [],
      }
      
      const prompt = buildUserPrompt(request)
      
      expect(prompt).toContain('Is this correct?')
      expect(prompt).toContain('lines 1-3')
      expect(prompt).toContain('function calculateTotal')
    })

    it('should include line numbers in selected code', () => {
      const request: AICompletionRequest = {
        code: sampleCode,
        selection: { startLine: 1, endLine: 3 },
        userMessage: 'Explain this',
        conversationHistory: [],
      }
      
      const prompt = buildUserPrompt(request)
      
      // Should have line numbers
      expect(prompt).toContain('2 |')
      expect(prompt).toContain('3 |')
      expect(prompt).toContain('4 |')
    })

    it('should handle single line selection', () => {
      const request: AICompletionRequest = {
        code: sampleCode,
        selection: { startLine: 0, endLine: 0 },
        userMessage: 'What does this do?',
        conversationHistory: [],
      }
      
      const prompt = buildUserPrompt(request)
      
      expect(prompt).toContain('lines 1-1')
      expect(prompt).toContain('1 |')
    })

    it('should handle empty user message', () => {
      const request: AICompletionRequest = {
        code: sampleCode,
        selection: { startLine: 0, endLine: 1 },
        userMessage: '',
        conversationHistory: [],
      }
      
      const prompt = buildUserPrompt(request)
      
      expect(prompt).toContain('""')
      expect(prompt).toContain('Selected code')
    })
  })

  describe('buildConversationMessages', () => {
    it('should include system prompt, history, and current message', () => {
      const request: AICompletionRequest = {
        code: sampleCode,
        selection: { startLine: 0, endLine: 1 },
        userMessage: 'Is this correct?',
        conversationHistory: [],
        language: 'javascript',
      }
      
      const messages = buildConversationMessages(request)
      
      expect(messages).toHaveLength(2) // system + user
      expect(messages[0].role).toBe('system')
      expect(messages[1].role).toBe('user')
      expect(messages[1].content).toContain('Is this correct?')
    })

    it('should include conversation history', () => {
      const request: AICompletionRequest = {
        code: sampleCode,
        selection: { startLine: 0, endLine: 1 },
        userMessage: 'Follow up question',
        conversationHistory: [
          { role: 'user', content: 'First question' },
          { role: 'assistant', content: 'First answer' },
        ],
        language: 'javascript',
      }
      
      const messages = buildConversationMessages(request)
      
      expect(messages).toHaveLength(4) // system + 2 history + current
      expect(messages[0].role).toBe('system')
      expect(messages[1].role).toBe('user')
      expect(messages[1].content).toBe('First question')
      expect(messages[2].role).toBe('assistant')
      expect(messages[2].content).toBe('First answer')
      expect(messages[3].role).toBe('user')
      expect(messages[3].content).toContain('Follow up question')
    })

    it('should handle multi-turn conversation', () => {
      const request: AICompletionRequest = {
        code: sampleCode,
        selection: { startLine: 0, endLine: 1 },
        userMessage: 'Third question',
        conversationHistory: [
          { role: 'user', content: 'Q1' },
          { role: 'assistant', content: 'A1' },
          { role: 'user', content: 'Q2' },
          { role: 'assistant', content: 'A2' },
        ],
        language: 'typescript',
      }
      
      const messages = buildConversationMessages(request)
      
      expect(messages).toHaveLength(6) // system + 4 history + current
      expect(messages[0].role).toBe('system')
      expect(messages[1].content).toBe('Q1')
      expect(messages[2].content).toBe('A1')
      expect(messages[3].content).toBe('Q2')
      expect(messages[4].content).toBe('A2')
      expect(messages[5].content).toContain('Third question')
    })

    it('should default to javascript if language not provided', () => {
      const request: AICompletionRequest = {
        code: sampleCode,
        selection: { startLine: 0, endLine: 1 },
        userMessage: 'Question',
        conversationHistory: [],
      }
      
      const messages = buildConversationMessages(request)
      
      expect(messages[0].content).toContain('javascript')
    })

    it('should include selected code context in user message', () => {
      const request: AICompletionRequest = {
        code: sampleCode,
        selection: { startLine: 0, endLine: 0 },
        userMessage: 'Explain this',
        conversationHistory: [],
      }
      
      const messages = buildConversationMessages(request)
      const userMessage = messages[messages.length - 1]
      
      expect(userMessage.content).toContain('lines 1-1')
      expect(userMessage.content).toContain('function calculateTotal')
    })
  })

  describe('truncateCodeWithContext', () => {
    it('should return code as-is if short enough', () => {
      const code = 'line 1\nline 2\nline 3'
      const result = truncateCodeWithContext(code, 1, 1)
      
      expect(result).toBe(code)
    })

    it('should truncate long code while keeping selection context', () => {
      const lines = Array.from({ length: 1000 }, (_, i) => `line ${i + 1}`)
      const code = lines.join('\n')
      const result = truncateCodeWithContext(code, 500, 510)
      
      // Should include selection
      expect(result).toContain('line 501')
      expect(result).toContain('line 511')
      
      // Should not include all lines
      expect(result).not.toContain('line 1')
      expect(result).not.toContain('line 1000')
    })

    it('should add truncation markers', () => {
      const lines = Array.from({ length: 1000 }, (_, i) => `line ${i + 1}`)
      const code = lines.join('\n')
      const result = truncateCodeWithContext(code, 500, 510)
      
      // Should have markers indicating truncation
      expect(result).toMatch(/\.\.\./)
    })

    it('should handle selection at start of file', () => {
      const lines = Array.from({ length: 600 }, (_, i) => `line ${i + 1}`)
      const code = lines.join('\n')
      const result = truncateCodeWithContext(code, 0, 10)
      
      expect(result).toContain('line 1')
      expect(result).toContain('line 11')
    })

    it('should handle selection at end of file', () => {
      const lines = Array.from({ length: 600 }, (_, i) => `line ${i + 1}`)
      const code = lines.join('\n')
      const result = truncateCodeWithContext(code, 590, 599)
      
      expect(result).toContain('line 591')
      expect(result).toContain('line 600')
    })

    it('should handle very large selection', () => {
      const lines = Array.from({ length: 1000 }, (_, i) => `line ${i + 1}`)
      const code = lines.join('\n')
      // Selection larger than MAX_CONTEXT_LINES
      const result = truncateCodeWithContext(code, 0, 600)
      
      // Should truncate the selection itself
      expect(result).toContain('more lines in selection')
    })

    it('should handle single line selection in long file', () => {
      const lines = Array.from({ length: 600 }, (_, i) => `line ${i + 1}`)
      const code = lines.join('\n')
      const result = truncateCodeWithContext(code, 300, 300)
      
      expect(result).toContain('line 301')
      // Should have context before and after
      expect(result.split('\n').length).toBeLessThan(600)
    })
  })
})







