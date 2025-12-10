# Technical Context: CodeReviewer AI

## Technology Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Framework** | React 19 | Latest React version, excellent for component-based UI |
| **Code Editor** | Monaco Editor | VS Code's editor, excellent selection APIs, built-in syntax highlighting |
| **Styling** | Radix UI + Custom CSS Design System | Accessible components, elegant dark theme, CSS variables |
| **Typography** | Plus Jakarta Sans + JetBrains Mono | Modern UI font + code-optimized monospace (Google Fonts) |
| **State Management** | React Context + useReducer | Sufficient for prototype complexity, no extra dependencies |
| **Database** | Firebase Firestore | Real-time sync, easy setup, free tier sufficient |
| **AI API** | OpenAI API | Strong code understanding, good context windows |
| **Build Tool** | Vite | Fast HMR, simple setup, modern defaults |
| **Testing** | Vitest + React Testing Library | Fast, modern testing stack |
| **Deployment** | Firebase Hosting | Free tier sufficient, simple CLI deployment, good CDN |

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore enabled
- Firebase CLI (for deployment)
- OpenAI API key

### Initial Setup
```bash
# Create Vite project
npm create vite@latest code-review-assistant -- --template react-ts

# Install dependencies
npm install @monaco-editor/react
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-dropdown-menu
npm install firebase
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8
```

### Fonts (loaded via Google Fonts in CSS)
- **Plus Jakarta Sans**: Modern sans-serif for UI (weights: 400, 500, 600, 700)
- **JetBrains Mono**: Code-optimized monospace for code blocks (weights: 400, 500, 600)

### Environment Variables
- `.env` file for local development (not committed)
- `.env.example` with placeholders:
  - `VITE_OPENAI_API_KEY` - OpenAI API key (required)
  - `VITE_FIREBASE_API_KEY` - Firebase API key
  - `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
  - `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
  - `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
  - `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
  - `VITE_FIREBASE_APP_ID` - Firebase app ID
- API key can also be entered via UI (overrides .env)

### Development Commands
```bash
npm run dev          # Start dev server
npm test             # Run tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
npm run build        # Production build
npm run preview      # Preview production build
```

## Technical Constraints

### Monaco Editor
- **Size**: ~2MB bundle (acceptable for prototype)
- **Load time**: May be noticeable on slower connections
- **Learning curve**: Selection API requires understanding `ISelection` and `IRange`
- **Benefits**: Automatic line numbers, excellent selection APIs
- **Configuration**: Semantic validation disabled to prevent false errors

### Firebase Firestore
- **Free tier**: 1GB storage, 50K reads/day, 20K writes/day (sufficient for prototype)
- **Real-time**: Optional subscription for multi-device sync
- **Security**: Rules must be configured (test mode for development)
- **Limitations**: Single workspace currently (can be extended)
- **Data Structure**: Files array, threads with fileId

### Firebase Hosting
- **Static only**: No server-side code
- **API calls**: Must go directly to OpenAI from client
- **API key exposure**: Visible in network requests (user must provide their own key)
- **Free tier**: 10GB hosting, 360MB/day transfer (sufficient for prototype)

### AI API
- **Provider**: OpenAI only (mock mode removed)
- **Model**: gpt-4o-mini
- **Context limits**: Very long files may exceed limits
- **Cost**: Per-token pricing (manageable for prototype)
- **Rate limits**: 429 errors possible
- **API Key**: Required (from .env or user input)

## Dependencies

### Production Dependencies
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "@monaco-editor/react": "^4.7.0",
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-select": "^2.2.6",
  "@radix-ui/react-separator": "^1.1.8",
  "@radix-ui/react-dropdown-menu": "^2.1.16",
  "firebase": "^12.6.0"
}
```

### Development Dependencies
```json
{
  "@types/react": "^19.2.5",
  "@types/react-dom": "^19.2.3",
  "@vitejs/plugin-react": "^5.1.1",
  "typescript": "~5.9.3",
  "vite": "^7.2.4",
  "vitest": "^4.0.14",
  "@testing-library/react": "^16.3.0",
  "@testing-library/jest-dom": "^6.9.1",
  "@testing-library/user-event": "^14.6.1",
  "jsdom": "^27.2.0",
  "@vitest/coverage-v8": "^4.0.14"
}
```

## Build Configuration

### Vite Config
- React plugin enabled
- TypeScript support
- Path aliases (if needed)

### TypeScript Config
- Strict mode enabled
- React JSX support
- ES2020 target
- Verbatim module syntax enabled

### Vitest Config
- React plugin
- jsdom environment
- Coverage provider: v8
- Test setup file: `src/test/setup.ts`

## Deployment Configuration

### Firebase Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting
```

### Firebase Configuration
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Firestore Rules (Development)
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

### Deployment Process
```bash
# Build production bundle
npm run build

# Deploy
firebase deploy --only hosting
```

## API Integration

### OpenAI API
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Method**: POST
- **Headers**: 
  - `Authorization`: `Bearer {api_key}`
  - `content-type`: application/json
- **Request Body**: Messages array with system/user messages, model selection
- **Model**: gpt-4o-mini
- **API Key**: From `VITE_OPENAI_API_KEY` env var or user input

### Firestore API
- **Collection**: `workspaces`
- **Document**: `default` (single workspace)
- **Operations**: Load, save, subscribe
- **Auto-save**: Debounced (1 second)
- **Data**: Files array, threads with fileId, active file/thread

## Security Considerations

### API Key Handling
- **Development**: `.env` file (not committed)
- **Production**: UI input field (stored in memory only) or `.env`
- **Priority**: User input > .env file
- **Risk**: Client-side API calls expose key in network requests
- **Mitigation**: User must provide their own API key

### Firestore Security
- **Development**: Test mode (allow all)
- **Production**: Should implement authentication-based rules
- **Data**: Files, threads, messages stored (API key NOT stored)

### Best Practices
- Never commit `.env` files
- Use `.env.example` for documentation
- User must provide OpenAI API key
- Clear API key from memory when not needed
- Configure Firestore rules for production

## Performance Considerations

### Bundle Size
- Monaco Editor: ~2MB (largest dependency)
- React + dependencies: ~200KB
- Radix UI: ~50KB
- Firebase: ~200KB
- Total: ~2.5MB (acceptable for prototype)

### Optimization
- Code splitting (if needed)
- Lazy loading (if needed)
- Production build minification
- Firestore debounced saves (1 second)

### Context Window Management
- Truncate long files intelligently
- Send only necessary context
- Cache prompts if possible (future optimization)

## Browser Support

### Target Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Desktop-First
- Mobile responsive design is out of scope for V1
- Developer tool, desktop-first is acceptable

## Code Auto-Fix Utilities

### codeExtractor.ts
Utilities for parsing AI responses and extracting actionable code:
- `stripLineNumbers(code)`: Removes line number prefixes from AI-generated code
- `hasLineNumbers(code)`: Detects if code has line number prefixes
- `extractLineReferences(text)`: Finds line references (e.g., "line 5", "lines 10-15")
- `extractAllCodeBlocks(content)`: Extracts all code blocks from markdown
- `extractCodeBlocksWithLineInfo(content, fallbackRange)`: Extracts code with line info

### codeReplacer.ts
Utilities for applying code changes:
- `replaceLines(content, startLine, endLine, newCode)`: Replace specific lines
- `applyMultipleReplacements(content, replacements)`: Apply multiple changes
- `prepareCodeFixes(content, replacements)`: Prepare and filter fixes for preview
- `validateNoOverlaps(replacements)`: Check for overlapping ranges
- `mergeOverlappingReplacements(replacements)`: Merge overlapping changes

## Known Limitations

1. **Stale Line References**: If code is edited after thread creation, line numbers may become stale
2. **Single Workspace**: Currently uses "default" workspace (can be extended)
3. **Multi-File Support**: ✅ Implemented (PR #9)
4. **Client-Side Only**: No backend for API key security
5. **No Real-Time Collaboration**: Single-user only
6. **No Authentication**: Single workspace shared (can be added)
7. **OpenAI-Only**: No mock mode, requires API key
8. **Monaco False Errors**: Fixed by disabling semantic validation
