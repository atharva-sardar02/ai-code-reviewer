import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ThreadProvider } from '../store/ThreadContext'
import { useThreads } from './useThreads'
import type { Message } from '../store/types'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThreadProvider>{children}</ThreadProvider>
)

describe('useThreads', () => {
  describe('createThread', () => {
    it('should create thread with selection data', () => {
      const { result } = renderHook(() => useThreads(), { wrapper })

      act(() => {
        result.current.createThread('thread-1', 5, 10)
      })

      expect(result.current.threads).toHaveLength(1)
      expect(result.current.threads[0]).toMatchObject({
        id: 'thread-1',
        startLine: 5,
        endLine: 10,
        messages: [],
      })
      expect(result.current.activeThreadId).toBe('thread-1')
    })
  })

  describe('addMessage', () => {
    it('should add user message to thread', () => {
      const { result } = renderHook(() => useThreads(), { wrapper })

      act(() => {
        result.current.createThread('thread-1', 1, 5)
      })

      const userMessage: Message = {
        role: 'user',
        content: 'What does this do?',
      }

      act(() => {
        result.current.addMessage('thread-1', userMessage)
      })

      expect(result.current.threads[0].messages).toHaveLength(1)
      expect(result.current.threads[0].messages[0]).toEqual(userMessage)
    })

    it('should add assistant message to thread', () => {
      const { result } = renderHook(() => useThreads(), { wrapper })

      act(() => {
        result.current.createThread('thread-1', 1, 5)
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: 'This code does X',
      }

      act(() => {
        result.current.addMessage('thread-1', assistantMessage)
      })

      expect(result.current.threads[0].messages).toHaveLength(1)
      expect(result.current.threads[0].messages[0]).toEqual(assistantMessage)
    })
  })

  describe('deleteThread', () => {
    it('should remove thread by ID', () => {
      const { result } = renderHook(() => useThreads(), { wrapper })

      act(() => {
        result.current.createThread('thread-1', 1, 5)
        result.current.createThread('thread-2', 10, 15)
      })

      expect(result.current.threads).toHaveLength(2)

      act(() => {
        result.current.deleteThread('thread-1')
      })

      expect(result.current.threads).toHaveLength(1)
      expect(result.current.threads[0].id).toBe('thread-2')
    })
  })

  describe('setActiveThread', () => {
    it('should set active thread ID', () => {
      const { result } = renderHook(() => useThreads(), { wrapper })

      act(() => {
        result.current.createThread('thread-1', 1, 5)
        result.current.createThread('thread-2', 10, 15)
      })

      expect(result.current.activeThreadId).toBe('thread-2')

      act(() => {
        result.current.setActiveThread('thread-1')
      })

      expect(result.current.activeThreadId).toBe('thread-1')
    })

    it('should allow setting active thread to null', () => {
      const { result } = renderHook(() => useThreads(), { wrapper })

      act(() => {
        result.current.createThread('thread-1', 1, 5)
      })

      expect(result.current.activeThreadId).toBe('thread-1')

      act(() => {
        result.current.setActiveThread(null)
      })

      expect(result.current.activeThreadId).toBeNull()
    })
  })

  describe('file management', () => {
    it('should create a new file', () => {
      const { result } = renderHook(() => useThreads(), { wrapper })

      act(() => {
        result.current.createFile('test.js', 'javascript')
      })

      expect(result.current.files).toHaveLength(1)
      expect(result.current.files[0].name).toBe('test.js')
      expect(result.current.activeFileId).toBe(result.current.files[0].id)
    })
  })
})

