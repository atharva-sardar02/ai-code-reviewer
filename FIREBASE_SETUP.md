# Firebase/Firestore Setup Guide

This application uses Firebase Firestore to persist data (code, threads, and settings).

## Setup Steps

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### 2. Enable Firestore

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Start in **test mode** (for development) or **production mode** (for production)
4. Choose a location for your database

### 3. Get Your Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app and copy the configuration object

### 4. Set Environment Variables

Create a `.env` file in the root directory with your Firebase configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 5. Firestore Security Rules (Development)

For development, you can use these permissive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /workspaces/{workspaceId} {
      allow read, write: if true; // Allow all for development
    }
  }
}
```

**⚠️ Important:** For production, implement proper security rules based on your authentication needs.

### 6. Data Structure

The application stores data in a `workspaces` collection with the following structure:

```
workspaces/
  └── default/
      ├── code: string
      ├── threads: Array<ThreadDocument>
      ├── activeThreadId: string | null
      ├── providerMode: 'mock' | 'openai'
      ├── createdAt: number (timestamp)
      └── updatedAt: number (timestamp)
```

### 7. Testing

After setting up Firebase:

1. Start the development server: `npm run dev`
2. The app will automatically:
   - Initialize Firebase on load
   - Load existing data from Firestore
   - Save changes to Firestore (debounced by 1 second)

### Troubleshooting

- **"Firebase configuration is missing"**: Check that all `VITE_FIREBASE_*` environment variables are set
- **Permission denied**: Check your Firestore security rules
- **Data not saving**: Check browser console for errors and verify Firestore is enabled

### Notes

- The API key is **NOT** persisted to Firestore for security reasons
- Data is saved automatically with a 1-second debounce to avoid excessive writes
- The app uses a single "default" workspace - this can be extended to support multiple workspaces or user-specific workspaces in the future




