# Firebase Quick Start Guide

## Step 1: Enable Firestore Database

1. In your Firebase Console, go to **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development) - Click "Next"
4. Select a **location** for your database (choose the closest to you)
5. Click **"Enable"**

## Step 2: Get Your Firebase Configuration

1. In Firebase Console, click the **gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. If you don't have a web app yet:
   - Click the **web icon** (`</>`)
   - Register your app with a nickname (e.g., "CodeReviewer AI")
   - Click **"Register app"**
5. Copy the **firebaseConfig** object - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 3: Set Environment Variables

1. In your project root, create a `.env` file (if it doesn't exist)
2. Add your Firebase configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIza... (your apiKey)
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Important**: 
- Remove quotes from the values
- Copy the exact values from your firebaseConfig object

## Step 4: Set Firestore Security Rules (Development)

1. In Firebase Console, go to **"Firestore Database"**
2. Click on the **"Rules"** tab
3. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /workspaces/{workspaceId} {
      allow read, write: if true;
    }
  }
}
```

4. Click **"Publish"**

⚠️ **Note**: These rules allow anyone to read/write. For production, implement proper authentication.

## Step 5: Test the Connection

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser
3. Open browser DevTools (F12) and check the Console
4. You should see no Firebase errors
5. Try creating a thread - it should save to Firestore!

## Step 6: Verify Data is Saving

1. In Firebase Console, go to **"Firestore Database"**
2. Click on **"Data"** tab
3. You should see a `workspaces` collection
4. Click on it to see the `default` document with your saved data

## Troubleshooting

- **"Firebase configuration is missing"**: Check that all `VITE_FIREBASE_*` variables are set in `.env`
- **Permission denied**: Make sure you published the Firestore rules
- **Data not appearing**: Check browser console for errors
- **Still not working**: Make sure you restarted the dev server after adding `.env` variables



