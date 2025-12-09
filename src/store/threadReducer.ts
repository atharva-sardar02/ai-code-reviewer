import type { AppState, Thread, ThreadAction, File } from './types'

export const initialState: AppState = {
  files: [],
  activeFileId: null,
  threads: [],
  activeThreadId: null,
  apiKey: null,
}

export function threadReducer(
  state: AppState,
  action: ThreadAction,
): AppState {
  switch (action.type) {
    case 'CREATE_FILE': {
      return {
        ...state,
        files: [...state.files, action.payload],
        activeFileId: action.payload.id,
      }
    }

    case 'UPDATE_FILE': {
      return {
        ...state,
        files: state.files.map((file) =>
          file.id === action.payload.fileId
            ? { ...file, content: action.payload.content, updatedAt: Date.now() }
            : file,
        ),
      }
    }

    case 'DELETE_FILE': {
      const fileId = action.payload
      // Delete all threads associated with this file
      const newThreads = state.threads.filter((thread) => thread.fileId !== fileId)
      const newActiveThreadId =
        state.activeThreadId && newThreads.find((t) => t.id === state.activeThreadId)
          ? state.activeThreadId
          : null

      // If deleting active file, switch to another file or null
      const newActiveFileId =
        state.activeFileId === fileId
          ? state.files.find((f) => f.id !== fileId)?.id || null
          : state.activeFileId

      return {
        ...state,
        files: state.files.filter((file) => file.id !== fileId),
        activeFileId: newActiveFileId,
        threads: newThreads,
        activeThreadId: newActiveThreadId,
      }
    }

    case 'SET_ACTIVE_FILE': {
      return {
        ...state,
        activeFileId: action.payload,
        // Clear active thread when switching files
        activeThreadId: null,
      }
    }

    case 'RENAME_FILE': {
      return {
        ...state,
        files: state.files.map((file) =>
          file.id === action.payload.fileId
            ? {
                ...file,
                name: action.payload.name,
                path: action.payload.path,
                updatedAt: Date.now(),
              }
            : file,
        ),
      }
    }

    case 'CREATE_THREAD': {
      // Check if thread already exists (for loading from Firestore)
      const existingThread = state.threads.find(
        (t) => t.id === action.payload.id,
      )
      if (existingThread) {
        // Thread already exists, don't create duplicate
        return {
          ...state,
          activeThreadId: action.payload.id,
        }
      }

      const newThread: Thread = {
        id: action.payload.id,
        fileId: action.payload.fileId,
        startLine: action.payload.startLine,
        endLine: action.payload.endLine,
        messages: [],
        isExpanded: true,
        isLoading: false,
        error: null,
      }
      return {
        ...state,
        threads: [...state.threads, newThread],
        activeThreadId: action.payload.id,
      }
    }

    case 'ADD_MESSAGE': {
      return {
        ...state,
        threads: state.threads.map((thread) =>
          thread.id === action.payload.threadId
            ? { ...thread, messages: [...thread.messages, action.payload.message] }
            : thread,
        ),
      }
    }

    case 'SET_ACTIVE_THREAD': {
      return {
        ...state,
        activeThreadId: action.payload,
      }
    }

    case 'TOGGLE_THREAD_EXPANDED': {
      return {
        ...state,
        threads: state.threads.map((thread) =>
          thread.id === action.payload
            ? { ...thread, isExpanded: !thread.isExpanded }
            : thread,
        ),
      }
    }

    case 'DELETE_THREAD': {
      const newActiveThreadId =
        state.activeThreadId === action.payload ? null : state.activeThreadId
      return {
        ...state,
        threads: state.threads.filter((thread) => thread.id !== action.payload),
        activeThreadId: newActiveThreadId,
      }
    }

    case 'SET_CODE': {
      // Legacy action for migration - convert to file if no files exist
      if (state.files.length === 0 && action.payload) {
        const defaultFile: File = {
          id: 'default-file',
          name: 'untitled.js',
          path: 'untitled.js',
          content: action.payload,
          language: 'javascript',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        return {
          ...state,
          files: [defaultFile],
          activeFileId: defaultFile.id,
        }
      }
      return state
    }

    case 'SET_THREAD_LOADING': {
      return {
        ...state,
        threads: state.threads.map((thread) =>
          thread.id === action.payload.threadId
            ? { ...thread, isLoading: action.payload.isLoading }
            : thread,
        ),
      }
    }

    case 'SET_THREAD_ERROR': {
      return {
        ...state,
        threads: state.threads.map((thread) =>
          thread.id === action.payload.threadId
            ? { ...thread, error: action.payload.error }
            : thread,
        ),
      }
    }

    case 'SET_API_KEY': {
      return {
        ...state,
        apiKey: action.payload,
      }
    }

    default: {
      return state
    }
  }
}
