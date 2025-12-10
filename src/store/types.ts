export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface File {
  id: string
  name: string
  path: string
  content: string
  language: string
  createdAt: number
  updatedAt: number
}

export interface Thread {
  id: string
  fileId: string
  startLine: number
  endLine: number
  messages: Message[]
  isExpanded: boolean
  isLoading: boolean
  error: string | null
}

export interface Selection {
  startLine: number
  endLine: number
  selectedText: string
}

export interface AppState {
  files: File[]
  openFileIds: string[]  // Files currently open in tabs
  activeFileId: string | null
  threads: Thread[]
  activeThreadId: string | null
  apiKey: string | null
}

// Action types
export type ThreadAction =
  | { type: 'CREATE_FILE'; payload: File }
  | { type: 'LOAD_FILE'; payload: File }  // Load file without opening in tab (for Firestore restore)
  | { type: 'UPDATE_FILE'; payload: { fileId: string; content: string } }
  | { type: 'DELETE_FILE'; payload: string }
  | { type: 'SET_ACTIVE_FILE'; payload: string | null }
  | { type: 'RENAME_FILE'; payload: { fileId: string; name: string; path: string } }
  | { type: 'OPEN_FILE'; payload: string }  // Open file in tab
  | { type: 'CLOSE_FILE'; payload: string }  // Close file tab (doesn't delete)
  | { type: 'CREATE_THREAD'; payload: { id: string; fileId: string; startLine: number; endLine: number } }
  | { type: 'ADD_MESSAGE'; payload: { threadId: string; message: Message } }
  | { type: 'SET_ACTIVE_THREAD'; payload: string | null }
  | { type: 'TOGGLE_THREAD_EXPANDED'; payload: string }
  | { type: 'DELETE_THREAD'; payload: string }
  | { type: 'SET_THREAD_LOADING'; payload: { threadId: string; isLoading: boolean } }
  | { type: 'SET_THREAD_ERROR'; payload: { threadId: string; error: string | null } }
  | { type: 'SET_API_KEY'; payload: string | null }
  // Legacy action for migration - will be removed
  | { type: 'SET_CODE'; payload: string }
