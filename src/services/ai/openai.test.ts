import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OpenAIProvider, createOpenAIProvider } from './openai'
import type { AICompletionRequest } from './types'

// Mock fetch globally
vi.stubGlobal('fetch', vi.fn())

describe('OpenAIProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockConfig = {
    apiKey: 'test-api-key-12345',
  }

  const sampleRequest: AICompletionRequest = {
    code: `function calculateTotal(items) {
  let total = 0;
  return total;
}`,
    selection: { startLine: 0, endLine: 1 },
    userMessage: 'Is this correct?',
    conversationHistory: [],
    language: 'javascript',
  }

  describe('constructor', () => {
    it('should throw error when API key is missing', () => {
      expect(() => {
        new OpenAIProvider({})
      }).toThrow('OpenAI API key is required')
    })

    it('should create instance with valid API key', () => {
      const provider = new OpenAIProvider(mockConfig)
      expect(provider).toBeInstanceOf(OpenAIProvider)
    })
  })

  describe('complete', () => {
    it('should format request body correctly', async () => {
      const provider = new OpenAIProvider(mockConfig)
      
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'This code looks correct.',
              },
            },
          ],
        }),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any)

      await provider.complete(sampleRequest)

      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key-12345',
          },
          body: expect.stringContaining('"model":"gpt-4o-mini"'),
        })
      )

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1]?.body as string)
      
      expect(body.model).toBe('gpt-4o-mini')
      expect(body.messages).toBeDefined()
      expect(Array.isArray(body.messages)).toBe(true)
      expect(body.messages.length).toBeGreaterThan(0)
    })

    it('should parse successful response correctly', async () => {
      const provider = new OpenAIProvider(mockConfig)
      const expectedResponse = 'This code is correct and follows best practices.'

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: expectedResponse,
              },
            },
          ],
        }),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any)

      const result = await provider.complete(sampleRequest)

      expect(result).toBe(expectedResponse)
    })

    it('should include conversation history in request', async () => {
      const provider = new OpenAIProvider(mockConfig)
      
      const requestWithHistory: AICompletionRequest = {
        ...sampleRequest,
        conversationHistory: [
          { role: 'user', content: 'First question' },
          { role: 'assistant', content: 'First answer' },
        ],
      }

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Response',
              },
            },
          ],
        }),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any)

      await provider.complete(requestWithHistory)

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1]?.body as string)
      
      // Should have system + 2 history messages + current user message = 4 messages
      expect(body.messages.length).toBeGreaterThanOrEqual(4)
    })

    it('should throw error when API key is invalid (401)', async () => {
      const provider = new OpenAIProvider(mockConfig)

      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: vi.fn().mockResolvedValue({
          error: {
            message: 'Invalid API key',
          },
        }),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any)

      await expect(provider.complete(sampleRequest)).rejects.toThrow(
        'Invalid API key. Please check your OpenAI API key.'
      )
    })

    it('should throw error when rate limited (429)', async () => {
      const provider = new OpenAIProvider(mockConfig)

      const mockResponse = {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: vi.fn().mockResolvedValue({
          error: {
            message: 'Rate limit exceeded',
          },
        }),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any)

      await expect(provider.complete(sampleRequest)).rejects.toThrow(
        'Rate limit exceeded. Please try again later.'
      )
    })

    it('should throw error when service is unavailable (500)', async () => {
      const provider = new OpenAIProvider(mockConfig)

      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: vi.fn().mockResolvedValue({
          error: {
            message: 'Internal server error',
          },
        }),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any)

      await expect(provider.complete(sampleRequest)).rejects.toThrow(
        'OpenAI service is temporarily unavailable. Please try again later.'
      )
    })

    it('should throw error when response format is invalid', async () => {
      const provider = new OpenAIProvider(mockConfig)

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [],
        }),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any)

      await expect(provider.complete(sampleRequest)).rejects.toThrow(
        'Invalid response format from OpenAI API'
      )
    })

    it('should throw error when response has no content', async () => {
      const provider = new OpenAIProvider(mockConfig)

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {},
            },
          ],
        }),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any)

      await expect(provider.complete(sampleRequest)).rejects.toThrow(
        'Invalid response format from OpenAI API'
      )
    })

    it('should handle network errors', async () => {
      const provider = new OpenAIProvider(mockConfig)

      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      await expect(provider.complete(sampleRequest)).rejects.toThrow('Network error')
    })

    it('should handle generic API errors with error message', async () => {
      const provider = new OpenAIProvider(mockConfig)

      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: vi.fn().mockResolvedValue({
          error: {
            message: 'Invalid request parameters',
          },
        }),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any)

      await expect(provider.complete(sampleRequest)).rejects.toThrow(
        'Invalid request parameters'
      )
    })

    it('should handle API errors without error message', async () => {
      const provider = new OpenAIProvider(mockConfig)

      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: vi.fn().mockResolvedValue({}),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any)

      await expect(provider.complete(sampleRequest)).rejects.toThrow('Bad Request')
    })

    it('should handle JSON parse errors in error response', async () => {
      const provider = new OpenAIProvider(mockConfig)

      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any)

      await expect(provider.complete(sampleRequest)).rejects.toThrow('Bad Request')
    })
  })

  describe('createOpenAIProvider', () => {
    it('should create a new OpenAIProvider instance', () => {
      const provider = createOpenAIProvider(mockConfig)
      
      expect(provider).toBeInstanceOf(OpenAIProvider)
    })

    it('should throw error when API key is missing', () => {
      expect(() => {
        createOpenAIProvider({})
      }).toThrow('OpenAI API key is required')
    })
  })
})




