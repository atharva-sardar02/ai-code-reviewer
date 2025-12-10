import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { threadReducer, initialState } from './threadReducer'
import type { AppState, ThreadAction } from './types'
import {
  initializeFirebase,
  loadWorkspace,
  saveWorkspace,
} from '../services/firestore'

interface ThreadContextValue {
  state: AppState
  dispatch: React.Dispatch<ThreadAction>
  isInitialized: boolean
}

const ThreadContext = createContext<ThreadContextValue | undefined>(undefined)

interface ThreadProviderProps {
  children: ReactNode
}

export function ThreadProvider({ children }: ThreadProviderProps) {
  const [state, dispatch] = useReducer(threadReducer, initialState)
  const [isInitialized, setIsInitialized] = useState(false)
  const isInitializingRef = useRef(false)
  const saveTimeoutRef = useRef<number | null>(null)

  // Initialize Firebase and load workspace data
  useEffect(() => {
    if (isInitializingRef.current) return
    isInitializingRef.current = true

    const initialize = async () => {
      try {
        initializeFirebase()
        const workspaceData = await loadWorkspace()

        // Initialize API key from .env if available and not already set
        const envApiKey = import.meta.env.VITE_OPENAI_API_KEY
        if (envApiKey && !state.apiKey) {
          dispatch({
            type: 'SET_API_KEY',
            payload: envApiKey,
          })
        }

        // Load files without opening them (start with landing page)
        workspaceData.files.forEach((file) => {
          dispatch({
            type: 'LOAD_FILE',
            payload: file,
          })
        })

        // Don't restore activeFileId - start with no files open (landing page)

        // Temporarily set activeThreadId to null to prevent CREATE_THREAD from setting it
        dispatch({ type: 'SET_ACTIVE_THREAD', payload: null })

        // Create threads and add messages
        workspaceData.threads.forEach((thread) => {
          dispatch({
            type: 'CREATE_THREAD',
            payload: {
              id: thread.id,
              fileId: thread.fileId,
              startLine: thread.startLine,
              endLine: thread.endLine,
            },
          })
          thread.messages.forEach((message) => {
            dispatch({
              type: 'ADD_MESSAGE',
              payload: {
                threadId: thread.id,
                message,
              },
            })
          })
        })

        // Set the active thread from loaded data
        if (workspaceData.activeThreadId) {
          dispatch({
            type: 'SET_ACTIVE_THREAD',
            payload: workspaceData.activeThreadId,
          })
        }
      } catch (error) {
        console.error('Failed to load workspace:', error)
        // Fallback to initial state if loading fails
      } finally {
        setIsInitialized(true)
      }
    }

    initialize()
  }, [])

  // Initialize API key from .env on mount
  useEffect(() => {
    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (envApiKey && !state.apiKey) {
      dispatch({
        type: 'SET_API_KEY',
        payload: envApiKey,
      })
    }
  }, [])

  // Save workspace data on state changes (debounced)
  useEffect(() => {
    if (!isInitialized) return // Only save after initial load

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      saveWorkspace({
        files: state.files,
        activeFileId: state.activeFileId,
        threads: state.threads,
        activeThreadId: state.activeThreadId,
        // apiKey is not saved for security reasons
      })
    }, 1000) // Debounce for 1 second

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [state, isInitialized])

  return (
    <ThreadContext.Provider value={{ state, dispatch, isInitialized }}>
      {children}
    </ThreadContext.Provider>
  )
}

export function useThreadContext() {
  const context = useContext(ThreadContext)
  if (context === undefined) {
    throw new Error('useThreadContext must be used within a ThreadProvider')
  }
  return context
}
