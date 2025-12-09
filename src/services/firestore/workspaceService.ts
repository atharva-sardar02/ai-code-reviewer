import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { getFirestoreInstance } from './config'
import type { WorkspaceDocument, ThreadDocument, FileDocument } from './types'
import type { Thread, File } from '../../store/types'
import { COLLECTIONS } from './types'

/**
 * Generate a workspace ID
 * For now, using a single default workspace
 * In the future, this could be user-specific
 */
const DEFAULT_WORKSPACE_ID = 'default'

/**
 * Convert File to FileDocument
 */
function fileToDocument(file: File): FileDocument {
  return {
    id: file.id,
    name: file.name,
    path: file.path,
    content: file.content,
    language: file.language,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
  }
}

/**
 * Convert FileDocument to File
 */
function documentToFile(doc: FileDocument): File {
  return {
    id: doc.id,
    name: doc.name,
    path: doc.path,
    content: doc.content,
    language: doc.language,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

/**
 * Convert Thread to ThreadDocument
 */
function threadToDocument(thread: Thread): ThreadDocument {
  return {
    id: thread.id,
    fileId: thread.fileId,
    startLine: thread.startLine,
    endLine: thread.endLine,
    messages: thread.messages,
    createdAt: Date.now(), // Will be updated if thread already exists
    updatedAt: Date.now(),
  }
}

/**
 * Convert ThreadDocument to Thread
 */
function documentToThread(doc: ThreadDocument): Thread {
  return {
    id: doc.id,
    fileId: doc.fileId,
    startLine: doc.startLine,
    endLine: doc.endLine,
    messages: doc.messages,
    isExpanded: true, // Default to expanded
    isLoading: false,
    error: null,
  }
}

/**
 * Load workspace data from Firestore
 */
export async function loadWorkspace(): Promise<{
  files: File[]
  activeFileId: string | null
  threads: Thread[]
  activeThreadId: string | null
}> {
  const db = getFirestoreInstance()
  const workspaceRef = doc(db, COLLECTIONS.WORKSPACES, DEFAULT_WORKSPACE_ID)

  try {
    const snapshot = await getDoc(workspaceRef)

    if (!snapshot.exists()) {
      // Return default values if workspace doesn't exist
      return {
        files: [],
        activeFileId: null,
        threads: [],
        activeThreadId: null,
      }
    }

    const data = snapshot.data() as WorkspaceDocument

    // Migration: If old format (has code but no files), convert to files array
    if (data.code && (!data.files || data.files.length === 0)) {
      const migratedFile: File = {
        id: 'migrated-file',
        name: 'untitled.js',
        path: 'untitled.js',
        content: data.code,
        language: 'javascript',
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || Date.now(),
      }

      // Migrate threads to have fileId
      const migratedThreads = (data.threads || []).map((thread) => ({
        ...thread,
        fileId: migratedFile.id,
      }))

      return {
        files: [migratedFile],
        activeFileId: migratedFile.id,
        threads: migratedThreads.map(documentToThread),
        activeThreadId: data.activeThreadId || null,
      }
    }

    return {
      files: (data.files || []).map(documentToFile),
      activeFileId: data.activeFileId || null,
      threads: (data.threads || []).map(documentToThread),
      activeThreadId: data.activeThreadId || null,
    }
  } catch (error) {
    console.error('Error loading workspace:', error)
    // Return default values on error
    return {
      files: [],
      activeFileId: null,
      threads: [],
      activeThreadId: null,
    }
  }
}

/**
 * Save workspace data to Firestore
 */
export async function saveWorkspace(data: {
  files: File[]
  activeFileId: string | null
  threads: Thread[]
  activeThreadId: string | null
}): Promise<void> {
  const db = getFirestoreInstance()
  const workspaceRef = doc(db, COLLECTIONS.WORKSPACES, DEFAULT_WORKSPACE_ID)

  const workspaceDoc: WorkspaceDocument = {
    files: data.files.map(fileToDocument),
    activeFileId: data.activeFileId,
    threads: data.threads.map(threadToDocument),
    activeThreadId: data.activeThreadId,
    updatedAt: Date.now(),
    createdAt: Date.now(), // Will be set on first create, ignored on update
  }

  try {
    // Use setDoc with merge to create or update
    await setDoc(workspaceRef, workspaceDoc, { merge: true })
  } catch (error) {
    console.error('Error saving workspace:', error)
    throw error
  }
}

/**
 * Subscribe to workspace changes in real-time
 */
export function subscribeToWorkspace(
  callback: (data: {
    files: File[]
    activeFileId: string | null
    threads: Thread[]
    activeThreadId: string | null
  }) => void,
): Unsubscribe {
  const db = getFirestoreInstance()
  const workspaceRef = doc(db, COLLECTIONS.WORKSPACES, DEFAULT_WORKSPACE_ID)

  return onSnapshot(
    workspaceRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback({
          files: [],
          activeFileId: null,
          threads: [],
          activeThreadId: null,
        })
        return
      }

      const data = snapshot.data() as WorkspaceDocument

      // Migration logic same as loadWorkspace
      if (data.code && (!data.files || data.files.length === 0)) {
        const migratedFile: File = {
          id: 'migrated-file',
          name: 'untitled.js',
          path: 'untitled.js',
          content: data.code,
          language: 'javascript',
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt || Date.now(),
        }

        const migratedThreads = (data.threads || []).map((thread) => ({
          ...thread,
          fileId: migratedFile.id,
        }))

        callback({
          files: [migratedFile],
          activeFileId: migratedFile.id,
          threads: migratedThreads.map(documentToThread),
          activeThreadId: data.activeThreadId || null,
        })
        return
      }

      callback({
        files: (data.files || []).map(documentToFile),
        activeFileId: data.activeFileId || null,
        threads: (data.threads || []).map(documentToThread),
        activeThreadId: data.activeThreadId || null,
      })
    },
    (error) => {
      console.error('Error subscribing to workspace:', error)
    },
  )
}
