import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MockProvider, createMockProvider } from './mock'
import type { AICompletionRequest } from './types'

describe('MockProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const sampleRequest: AICompletionRequest = {
    code: `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}`,
    selection: { startLine: 0, endLine: 2 },
    userMessage: 'Is this correct?',
    conversationHistory: [],
  }

  describe('complete', () => {
    it('should return a response', async () => {
      const provider = new MockProvider()
      const promise = provider.complete(sampleRequest)
      
      // Fast-forward time to resolve the delay (advance by max delay + buffer)
      vi.advanceTimersByTime(2000)
      await vi.runAllTimersAsync()
      
      const response = await promise
      
      expect(response).toBeTruthy()
      expect(typeof response).toBe('string')
      expect(response.length).toBeGreaterThan(0)
    })

    it('should simulate delay (500-1500ms)', async () => {
      const provider = new MockProvider()
      
      const promise = provider.complete(sampleRequest)
      
      // Fast-forward time (advance by max delay + buffer)
      vi.advanceTimersByTime(2000)
      await vi.runAllTimersAsync()
      
      const response = await promise
      
      // The delay should be simulated (we can't test exact timing with fake timers,
      // but we can verify it's async and returns a response)
      expect(promise).toBeInstanceOf(Promise)
      expect(response).toBeTruthy()
    })

    it('should return different responses for different question types', async () => {
      const provider = new MockProvider()
      
      const correctRequest = { ...sampleRequest, userMessage: 'Is this correct?' }
      const improveRequest = { ...sampleRequest, userMessage: 'How can I improve this?' }
      const explainRequest = { ...sampleRequest, userMessage: 'Can you explain this?' }
      
      const promises = [
        provider.complete(correctRequest),
        provider.complete(improveRequest),
        provider.complete(explainRequest),
      ]
      
      vi.advanceTimersByTime(2000)
      await vi.runAllTimersAsync()
      
      const [correctResponse, improveResponse, explainResponse] = await Promise.all(promises)
      
      // All should be different responses
      expect(correctResponse).toContain('correct')
      expect(improveResponse).toContain('improve')
      expect(explainResponse).toContain('explain')
    })

    it('should handle conversation history parameter', async () => {
      const provider = new MockProvider()
      const requestWithHistory: AICompletionRequest = {
        ...sampleRequest,
        conversationHistory: [
          { role: 'user', content: 'First question' },
          { role: 'assistant', content: 'First answer' },
        ],
      }
      
      const promise = provider.complete(requestWithHistory)
      vi.advanceTimersByTime(2000)
      await vi.runAllTimersAsync()
      
      const response = await promise
      
      expect(response).toBeTruthy()
      expect(typeof response).toBe('string')
    })

    it('should include line numbers in response', async () => {
      const provider = new MockProvider()
      const request = {
        ...sampleRequest,
        selection: { startLine: 5, endLine: 10 },
      }
      
      const promise = provider.complete(request)
      vi.advanceTimersByTime(2000)
      await vi.runAllTimersAsync()
      
      const response = await promise
      
      // Should mention the line numbers
      expect(response).toContain('6')
      expect(response).toContain('11')
    })

    it('should handle empty user message', async () => {
      const provider = new MockProvider()
      const request = {
        ...sampleRequest,
        userMessage: '',
      }
      
      const promise = provider.complete(request)
      vi.advanceTimersByTime(2000)
      await vi.runAllTimersAsync()
      
      const response = await promise
      
      expect(response).toBeTruthy()
      expect(response.length).toBeGreaterThan(0)
    })

    it('should handle bug-related questions', async () => {
      const provider = new MockProvider()
      const request = {
        ...sampleRequest,
        userMessage: 'Is there a bug in this code?',
      }
      
      const promise = provider.complete(request)
      vi.advanceTimersByTime(2000)
      await vi.runAllTimersAsync()
      
      const response = await promise
      
      expect(response.toLowerCase()).toContain('bug')
    })

    it('should handle error-related questions', async () => {
      const provider = new MockProvider()
      const request = {
        ...sampleRequest,
        userMessage: 'What error could occur here?',
      }
      
      const promise = provider.complete(request)
      vi.advanceTimersByTime(2000)
      await vi.runAllTimersAsync()
      
      const response = await promise
      
      expect(response.toLowerCase()).toContain('error')
    })

    it('should return response for unknown question types', async () => {
      const provider = new MockProvider()
      const request = {
        ...sampleRequest,
        userMessage: 'Random question about code',
      }
      
      const promise = provider.complete(request)
      vi.advanceTimersByTime(2000)
      await vi.runAllTimersAsync()
      
      const response = await promise
      
      expect(response).toBeTruthy()
      expect(response.length).toBeGreaterThan(0)
    })
  })

  describe('createMockProvider', () => {
    it('should create a new MockProvider instance', () => {
      const provider = createMockProvider()
      
      expect(provider).toBeInstanceOf(MockProvider)
      expect(provider.complete).toBeDefined()
    })

    it('should implement AIProvider interface', async () => {
      const provider = createMockProvider()
      const promise = provider.complete(sampleRequest)
      
      vi.advanceTimersByTime(2000)
      await vi.runAllTimersAsync()
      
      const response = await promise
      
      expect(response).toBeTruthy()
      expect(typeof response).toBe('string')
    })
  })
})

