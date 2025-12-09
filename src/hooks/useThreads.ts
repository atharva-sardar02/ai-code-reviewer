import { useThreadContext } from '../store/ThreadContext'
import type { Message, File } from '../store/types'
import { generateThreadId } from '../utils/lineUtils'

export function useThreads() {
  const { state, dispatch } = useThreadContext()

  const createFile = (name: string, language: string = 'javascript') => {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const newFile: File = {
      id: fileId,
      name,
      path: name,
      content: '',
      language,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    dispatch({
      type: 'CREATE_FILE',
      payload: newFile,
    })
    return fileId
  }

  const updateFile = (fileId: string, content: string) => {
    dispatch({
      type: 'UPDATE_FILE',
      payload: { fileId, content },
    })
  }

  const deleteFile = (fileId: string) => {
    if (confirm('Are you sure you want to delete this file? All threads associated with it will also be deleted.')) {
      dispatch({
        type: 'DELETE_FILE',
        payload: fileId,
      })
    }
  }

  const setActiveFile = (fileId: string | null) => {
    dispatch({
      type: 'SET_ACTIVE_FILE',
      payload: fileId,
    })
  }

  const renameFile = (fileId: string, name: string) => {
    dispatch({
      type: 'RENAME_FILE',
      payload: { fileId, name, path: name },
    })
  }

  const createThread = (fileId: string, startLine: number, endLine: number) => {
    const threadId = generateThreadId()
    dispatch({
      type: 'CREATE_THREAD',
      payload: { id: threadId, fileId, startLine, endLine },
    })
    return threadId
  }

  const addMessage = (threadId: string, message: Message) => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: { threadId, message },
    })
  }

  const deleteThread = (threadId: string) => {
    dispatch({
      type: 'DELETE_THREAD',
      payload: threadId,
    })
  }

  const setActiveThread = (threadId: string | null) => {
    dispatch({
      type: 'SET_ACTIVE_THREAD',
      payload: threadId,
    })
  }

  const toggleThreadExpanded = (threadId: string) => {
    dispatch({
      type: 'TOGGLE_THREAD_EXPANDED',
      payload: threadId,
    })
  }

  const setThreadLoading = (threadId: string, isLoading: boolean) => {
    dispatch({
      type: 'SET_THREAD_LOADING',
      payload: { threadId, isLoading },
    })
  }

  const setThreadError = (threadId: string, error: string | null) => {
    dispatch({
      type: 'SET_THREAD_ERROR',
      payload: { threadId, error },
    })
  }

  const setApiKey = (apiKey: string | null) => {
    dispatch({
      type: 'SET_API_KEY',
      payload: apiKey,
    })
  }

  const activeFile = state.files.find((f) => f.id === state.activeFileId) || null

  return {
    state,
    files: state.files,
    activeFile,
    activeFileId: state.activeFileId,
    threads: state.threads,
    activeThreadId: state.activeThreadId,
    apiKey: state.apiKey,
    createFile,
    updateFile,
    deleteFile,
    setActiveFile,
    renameFile,
    createThread,
    addMessage,
    deleteThread,
    setActiveThread,
    toggleThreadExpanded,
    setThreadLoading,
    setThreadError,
    setApiKey,
  }
}
