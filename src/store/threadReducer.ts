import type { AppState, Thread, ThreadAction, File } from './types'

export const initialState: AppState = {
  files: [],
  openFileIds: [],  // Start with no open tabs
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
        openFileIds: [...state.openFileIds, action.payload.id],  // Also open the file
        activeFileId: action.payload.id,
      }
    }

    case 'LOAD_FILE': {
      // Load file without opening it (used for restoring from Firestore)
      // Check if file already exists (avoid duplicates)
      if (state.files.some((f) => f.id === action.payload.id)) {
        return state
      }
      return {
        ...state,
        files: [...state.files, action.payload],
        // Don't add to openFileIds - user needs to click to open
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

      // Remove from open files
      const newOpenFileIds = state.openFileIds.filter((id) => id !== fileId)

      // If deleting active file, switch to another open file or null
      const newActiveFileId =
        state.activeFileId === fileId
          ? newOpenFileIds[newOpenFileIds.length - 1] || null
          : state.activeFileId

      return {
        ...state,
        files: state.files.filter((file) => file.id !== fileId),
        openFileIds: newOpenFileIds,
        activeFileId: newActiveFileId,
        threads: newThreads,
        activeThreadId: newActiveThreadId,
      }
    }

    case 'OPEN_FILE': {
      const fileId = action.payload
      // Check if file exists
      const fileExists = state.files.some((f) => f.id === fileId)
      if (!fileExists) return state

      // Check if already open
      if (state.openFileIds.includes(fileId)) {
        // Just set as active
        return {
          ...state,
          activeFileId: fileId,
          activeThreadId: null,
        }
      }

      return {
        ...state,
        openFileIds: [...state.openFileIds, fileId],
        activeFileId: fileId,
        activeThreadId: null,
      }
    }

    case 'CLOSE_FILE': {
      const fileId = action.payload
      const newOpenFileIds = state.openFileIds.filter((id) => id !== fileId)

      // If closing active file, switch to another open file or null
      const newActiveFileId =
        state.activeFileId === fileId
          ? newOpenFileIds[newOpenFileIds.length - 1] || null
          : state.activeFileId

      return {
        ...state,
        openFileIds: newOpenFileIds,
        activeFileId: newActiveFileId,
        activeThreadId: state.activeFileId === fileId ? null : state.activeThreadId,
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
