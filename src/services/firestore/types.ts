import type { Message } from '../../store/types'

/**
 * Firestore document structure for a user's workspace
 */
export interface WorkspaceDocument {
  files: FileDocument[]
  activeFileId: string | null
  threads: ThreadDocument[]
  activeThreadId: string | null
  updatedAt: number
  createdAt: number
  // Legacy fields for migration
  code?: string
  providerMode?: 'mock' | 'openai' // Legacy, no longer used
}

/**
 * Firestore document structure for a file
 */
export interface FileDocument {
  id: string
  name: string
  path: string
  content: string
  language: string
  createdAt: number
  updatedAt: number
}

/**
 * Firestore document structure for a thread
 */
export interface ThreadDocument {
  id: string
  fileId: string
  startLine: number
  endLine: number
  messages: Message[]
  createdAt: number
  updatedAt: number
}

/**
 * Collection names
 */
export const COLLECTIONS = {
  WORKSPACES: 'workspaces',
} as const
