import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'

// Firebase configuration
// These should be set via environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

let app: FirebaseApp | null = null
let db: Firestore | null = null

export function initializeFirebase(): { app: FirebaseApp; db: Firestore } {
  if (app && db) {
    return { app, db }
  }

  // Check if Firebase is configured
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error(
      'Firebase configuration is missing. Please set VITE_FIREBASE_* environment variables.',
    )
  }

  app = initializeApp(firebaseConfig)
  db = getFirestore(app)

  return { app, db }
}

export function getFirestoreInstance(): Firestore {
  if (!db) {
    const { db: firestoreDb } = initializeFirebase()
    return firestoreDb
  }
  return db
}



