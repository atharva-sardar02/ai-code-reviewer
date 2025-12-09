import { describe, it, expect } from 'vitest'
import { threadReducer, initialState } from './threadReducer'
import type { AppState, Message } from './types'

const TEST_FILE_ID = 'test-file-1'

describe('threadReducer', () => {
  describe('CREATE_THREAD', () => {
    it('should create a new thread with correct line range and empty messages', () => {
      const action = {
        type: 'CREATE_THREAD' as const,
        payload: { id: 'thread-1', fileId: TEST_FILE_ID, startLine: 5, endLine: 10 },
      }

      const newState = threadReducer(initialState, action)

      expect(newState.threads).toHaveLength(1)
      expect(newState.threads[0]).toMatchObject({
        id: 'thread-1',
        fileId: TEST_FILE_ID,
        startLine: 5,
        endLine: 10,
        messages: [],
        isExpanded: true,
        isLoading: false,
        error: null,
      })
      expect(newState.activeThreadId).toBe('thread-1')
    })

    it('should set the new thread as active', () => {
      const action = {
        type: 'CREATE_THREAD' as const,
        payload: { id: 'thread-2', fileId: TEST_FILE_ID, startLine: 1, endLine: 3 },
      }

      const newState = threadReducer(initialState, action)

      expect(newState.activeThreadId).toBe('thread-2')
    })
  })

  describe('ADD_MESSAGE', () => {
    it('should append message to correct thread', () => {
      const state: AppState = {
        ...initialState,
        threads: [
          {
            id: 'thread-1',
            fileId: TEST_FILE_ID,
            startLine: 1,
            endLine: 5,
            messages: [],
            isExpanded: true,
            isLoading: false,
            error: null,
          },
        ],
      }

      const message: Message = {
        role: 'user',
        content: 'What does this code do?',
      }

      const action = {
        type: 'ADD_MESSAGE' as const,
        payload: { threadId: 'thread-1', message },
      }

      const newState = threadReducer(state, action)

      expect(newState.threads[0].messages).toHaveLength(1)
      expect(newState.threads[0].messages[0]).toEqual(message)
    })

    it('should not modify other threads', () => {
      const state: AppState = {
        ...initialState,
        threads: [
          {
            id: 'thread-1',
            fileId: TEST_FILE_ID,
            startLine: 1,
            endLine: 5,
            messages: [],
            isExpanded: true,
            isLoading: false,
            error: null,
          },
          {
            id: 'thread-2',
            fileId: TEST_FILE_ID,
            startLine: 10,
            endLine: 15,
            messages: [],
            isExpanded: true,
            isLoading: false,
            error: null,
          },
        ],
      }

      const message: Message = {
        role: 'user',
        content: 'Test message',
      }

      const action = {
        type: 'ADD_MESSAGE' as const,
        payload: { threadId: 'thread-1', message },
      }

      const newState = threadReducer(state, action)

      expect(newState.threads[0].messages).toHaveLength(1)
      expect(newState.threads[1].messages).toHaveLength(0)
    })

    it('should handle adding message to non-existent thread gracefully', () => {
      const state: AppState = {
        ...initialState,
        threads: [
          {
            id: 'thread-1',
            fileId: TEST_FILE_ID,
            startLine: 1,
            endLine: 5,
            messages: [],
            isExpanded: true,
            isLoading: false,
            error: null,
          },
        ],
      }

      const message: Message = {
        role: 'user',
        content: 'Test message',
      }

      const action = {
        type: 'ADD_MESSAGE' as const,
        payload: { threadId: 'non-existent', message },
      }

      const newState = threadReducer(state, action)

      expect(newState.threads[0].messages).toHaveLength(0)
    })
  })

  describe('SET_ACTIVE_THREAD', () => {
    it('should update activeThreadId', () => {
      const state: AppState = {
        ...initialState,
        activeThreadId: 'thread-1',
      }

      const action = {
        type: 'SET_ACTIVE_THREAD' as const,
        payload: 'thread-2',
      }

      const newState = threadReducer(state, action)

      expect(newState.activeThreadId).toBe('thread-2')
    })

    it('should allow setting activeThreadId to null', () => {
      const state: AppState = {
        ...initialState,
        activeThreadId: 'thread-1',
      }

      const action = {
        type: 'SET_ACTIVE_THREAD' as const,
        payload: null,
      }

      const newState = threadReducer(state, action)

      expect(newState.activeThreadId).toBeNull()
    })
  })

  describe('TOGGLE_THREAD_EXPANDED', () => {
    it('should toggle isExpanded boolean', () => {
      const state: AppState = {
        ...initialState,
        threads: [
          {
            id: 'thread-1',
            fileId: TEST_FILE_ID,
            startLine: 1,
            endLine: 5,
            messages: [],
            isExpanded: true,
            isLoading: false,
            error: null,
          },
        ],
      }

      const action = {
        type: 'TOGGLE_THREAD_EXPANDED' as const,
        payload: 'thread-1',
      }

      const newState = threadReducer(state, action)

      expect(newState.threads[0].isExpanded).toBe(false)

      const newState2 = threadReducer(newState, action)

      expect(newState2.threads[0].isExpanded).toBe(true)
    })

    it('should not modify other threads', () => {
      const state: AppState = {
        ...initialState,
        threads: [
          {
            id: 'thread-1',
            fileId: TEST_FILE_ID,
            startLine: 1,
            endLine: 5,
            messages: [],
            isExpanded: true,
            isLoading: false,
            error: null,
          },
          {
            id: 'thread-2',
            fileId: TEST_FILE_ID,
            startLine: 10,
            endLine: 15,
            messages: [],
            isExpanded: false,
            isLoading: false,
            error: null,
          },
        ],
      }

      const action = {
        type: 'TOGGLE_THREAD_EXPANDED' as const,
        payload: 'thread-1',
      }

      const newState = threadReducer(state, action)

      expect(newState.threads[0].isExpanded).toBe(false)
      expect(newState.threads[1].isExpanded).toBe(false)
    })
  })

  describe('DELETE_THREAD', () => {
    it('should remove thread by id', () => {
      const state: AppState = {
        ...initialState,
        threads: [
          {
            id: 'thread-1',
            fileId: TEST_FILE_ID,
            startLine: 1,
            endLine: 5,
            messages: [],
            isExpanded: true,
            isLoading: false,
            error: null,
          },
          {
            id: 'thread-2',
            fileId: TEST_FILE_ID,
            startLine: 10,
            endLine: 15,
            messages: [],
            isExpanded: true,
            isLoading: false,
            error: null,
          },
        ],
      }

      const action = {
        type: 'DELETE_THREAD' as const,
        payload: 'thread-1',
      }

      const newState = threadReducer(state, action)

      expect(newState.threads).toHaveLength(1)
      expect(newState.threads[0].id).toBe('thread-2')
    })

    it('should clear activeThreadId if deleted thread was active', () => {
      const state: AppState = {
        ...initialState,
        activeThreadId: 'thread-1',
        threads: [
          {
            id: 'thread-1',
            fileId: TEST_FILE_ID,
            startLine: 1,
            endLine: 5,
            messages: [],
            isExpanded: true,
            isLoading: false,
            error: null,
          },
        ],
      }

      const action = {
        type: 'DELETE_THREAD' as const,
        payload: 'thread-1',
      }

      const newState = threadReducer(state, action)

      expect(newState.activeThreadId).toBeNull()
    })

    it('should not clear activeThreadId if deleted thread was not active', () => {
      const state: AppState = {
        ...initialState,
        activeThreadId: 'thread-2',
        threads: [
          {
            id: 'thread-1',
            fileId: TEST_FILE_ID,
            startLine: 1,
            endLine: 5,
            messages: [],
            isExpanded: true,
            isLoading: false,
            error: null,
          },
          {
            id: 'thread-2',
            fileId: TEST_FILE_ID,
            startLine: 10,
            endLine: 15,
            messages: [],
            isExpanded: true,
            isLoading: false,
            error: null,
          },
        ],
      }

      const action = {
        type: 'DELETE_THREAD' as const,
        payload: 'thread-1',
      }

      const newState = threadReducer(state, action)

      expect(newState.activeThreadId).toBe('thread-2')
    })
  })

  describe('SET_CODE', () => {
    it('should migrate code to file when no files exist', () => {
      const action = {
        type: 'SET_CODE' as const,
        payload: 'const x = 1;',
      }

      const newState = threadReducer(initialState, action)

      expect(newState.files).toHaveLength(1)
      expect(newState.files[0].content).toBe('const x = 1;')
      expect(newState.files[0].name).toBe('untitled.js')
      expect(newState.activeFileId).toBe('default-file')
    })

    it('should not migrate if files already exist', () => {
      const state: AppState = {
        ...initialState,
        files: [
          {
            id: 'file-1',
            name: 'test.js',
            path: 'test.js',
            content: 'existing',
            language: 'javascript',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      }

      const action = {
        type: 'SET_CODE' as const,
        payload: 'new code',
      }

      const newState = threadReducer(state, action)

      expect(newState.files).toHaveLength(1)
      expect(newState.files[0].content).toBe('existing')
    })
  })

  describe('SET_THREAD_LOADING', () => {
    it('should set loading state on correct thread', () => {
      const state: AppState = {
        ...initialState,
        threads: [
          {
            id: 'thread-1',
            fileId: TEST_FILE_ID,
            startLine: 1,
            endLine: 5,
            messages: [],
            isExpanded: true,
            isLoading: false,
            error: null,
          },
          {
            id: 'thread-2',
            fileId: TEST_FILE_ID,
            startLine: 10,
            endLine: 15,
            messages: [],
            isExpanded: true,
            isLoading: false,
            error: null,
          },
        ],
      }

      const action = {
        type: 'SET_THREAD_LOADING' as const,
        payload: { threadId: 'thread-1', isLoading: true },
      }

      const newState = threadReducer(state, action)

      expect(newState.threads[0].isLoading).toBe(true)
      expect(newState.threads[1].isLoading).toBe(false)
    })

    it('should allow setting loading to false', () => {
      const state: AppState = {
        ...initialState,
        threads: [
          {
            id: 'thread-1',
            fileId: TEST_FILE_ID,
            startLine: 1,
            endLine: 5,
            messages: [],
            isExpanded: true,
            isLoading: true,
            error: null,
          },
        ],
      }

      const action = {
        type: 'SET_THREAD_LOADING' as const,
        payload: { threadId: 'thread-1', isLoading: false },
      }

      const newState = threadReducer(state, action)

      expect(newState.threads[0].isLoading).toBe(false)
    })
  })

  describe('SET_THREAD_ERROR', () => {
    it('should set error on correct thread', () => {
      const state: AppState = {
        ...initialState,
        threads: [
          {
            id: 'thread-1',
            fileId: TEST_FILE_ID,
            startLine: 1,
            endLine: 5,
            messages: [],
            isExpanded: true,
            isLoading: false,
            error: null,
          },
        ],
      }

      const action = {
        type: 'SET_THREAD_ERROR' as const,
        payload: { threadId: 'thread-1', error: 'Network error' },
      }

      const newState = threadReducer(state, action)

      expect(newState.threads[0].error).toBe('Network error')
    })

    it('should allow clearing error', () => {
      const state: AppState = {
        ...initialState,
        threads: [
          {
            id: 'thread-1',
            fileId: TEST_FILE_ID,
            startLine: 1,
            endLine: 5,
            messages: [],
            isExpanded: true,
            isLoading: false,
            error: 'Network error',
          },
        ],
      }

      const action = {
        type: 'SET_THREAD_ERROR' as const,
        payload: { threadId: 'thread-1', error: null },
      }

      const newState = threadReducer(state, action)

      expect(newState.threads[0].error).toBeNull()
    })
  })

  describe('SET_API_KEY', () => {
    it('should update apiKey', () => {
      const action = {
        type: 'SET_API_KEY' as const,
        payload: 'sk-test-key',
      }

      const newState = threadReducer(initialState, action)

      expect(newState.apiKey).toBe('sk-test-key')
    })

    it('should allow setting apiKey to null', () => {
      const state: AppState = {
        ...initialState,
        apiKey: 'sk-test-key',
      }

      const action = {
        type: 'SET_API_KEY' as const,
        payload: null,
      }

      const newState = threadReducer(state, action)

      expect(newState.apiKey).toBeNull()
    })
  })


  describe('State immutability', () => {
    it('should not mutate original state', () => {
      const state: AppState = {
        ...initialState,
        threads: [
          {
            id: 'thread-1',
            fileId: TEST_FILE_ID,
            startLine: 1,
            endLine: 5,
            messages: [],
            isExpanded: true,
            isLoading: false,
            error: null,
          },
        ],
      }

      const originalThreads = state.threads
      const action = {
        type: 'ADD_MESSAGE' as const,
        payload: {
          threadId: 'thread-1',
          message: { role: 'user' as const, content: 'test' },
        },
      }

      threadReducer(state, action)

      expect(state.threads).toBe(originalThreads)
      expect(state.threads[0].messages).toHaveLength(0)
    })
  })
})
