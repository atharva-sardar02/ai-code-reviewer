# AI-Powered Code Review Assistant

A standalone web application that enables developers to get AI-powered, contextual feedback on specific sections of their code. Unlike generic AI chat interfaces, this tool ties conversations directly to code selections, creating an "inline comments meets AI assistant" experience.

## 🎯 Overview

This application allows developers to:
- Paste code into a Monaco Editor with syntax highlighting
- Select specific lines of code to discuss
- Have contextual AI conversations about selected code sections
- Create multiple independent conversation threads
- Get visual indicators showing which code sections have active discussions

## ✨ Features

- **Code Editor**: Monaco Editor with syntax highlighting for 12+ languages
- **Selection-Based Interaction**: Select code lines and ask questions
- **Contextual AI**: AI understands surrounding code context, not just the selection
- **Conversation Threads**: Multiple independent threads anchored to code sections
- **Visual Indicators**: Line highlighting shows which sections have active threads
- **Mock Mode**: Test the application without an API key
- **OpenAI Integration**: Real AI responses using OpenAI API
- **Error Handling**: Graceful error handling with retry functionality
- **Keyboard Shortcuts**: Cmd/Ctrl + Enter to submit, Escape to close thread

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (optional, mock mode available)
- Firebase project with Firestore enabled (for data persistence)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-code-reviewer
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your configuration:
```bash
cp .env.example .env
# Add your OpenAI API key: VITE_OPENAI_API_KEY=sk-...
# Add your Firebase configuration (see FIREBASE_SETUP.md)
```

4. Set up Firebase Firestore (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions):
   - Create a Firebase project
   - Enable Firestore Database
   - Add your Firebase config to `.env`

### Running Locally

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5173`

## 🏗️ Architecture

### Technology Stack

- **Framework**: React 19 with TypeScript
- **Code Editor**: Monaco Editor (VS Code's editor)
- **Styling**: Radix UI + Custom CSS
- **State Management**: React Context + useReducer
- **AI API**: OpenAI API (with mock provider fallback)
- **Database**: Firebase Firestore (for data persistence)
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library

### Project Structure

```
src/
├── components/        # React components
│   ├── CodeEditor/   # Monaco Editor integration
│   ├── ThreadPanel/  # Thread UI components
│   ├── Header/       # App header with settings
│   ├── PromptInput/  # Message input component
│   └── ApiKeyInput/  # API key settings modal
├── services/         # Service layer
│   ├── ai/           # AI providers (mock, OpenAI)
│   └── firestore/    # Firestore persistence
├── store/            # State management
│   ├── ThreadContext.tsx
│   ├── threadReducer.ts
│   └── types.ts
├── hooks/            # Custom React hooks
│   ├── useThreads.ts
│   └── useConversation.ts
└── utils/            # Utility functions
    ├── lineUtils.ts
    └── validation.ts
```

### Key Design Decisions

1. **Right-Side Panel for Threads**: GitHub PR-style layout familiar to developers
2. **React Context + useReducer**: Sufficient for prototype complexity, no external dependencies
3. **Provider Pattern**: AI service abstraction allows easy switching between mock/OpenAI
4. **Monaco Editor**: Excellent selection APIs and built-in syntax highlighting
5. **Client-Side Only**: No backend required, API calls made directly from browser

## 🔧 Configuration

### API Key Setup

You can provide your OpenAI API key in two ways:

1. **Environment Variable**: Create a `.env` file with `VITE_OPENAI_API_KEY=sk-...`
2. **UI Input**: Click the settings icon in the header and enter your key

**Note**: API keys are stored in memory only and never persisted to Firestore or sent to any server except OpenAI.

### Mock Mode

The application defaults to mock mode, which provides canned responses without requiring an API key. This is useful for:
- Testing the UI and user flows
- Demonstrating the application
- Development without API costs

## 📝 Usage

1. **Paste Code**: Paste your code into the editor
2. **Select Lines**: Click and drag to select specific lines of code
3. **Ask AI**: Click the "Ask AI" button that appears
4. **Ask Questions**: Type your question in the thread panel
5. **Get Responses**: AI provides contextual feedback about your code
6. **Multiple Threads**: Create multiple threads for different code sections

### Keyboard Shortcuts

- `Cmd/Ctrl + Enter`: Submit message in thread
- `Escape`: Close active thread
- `Cmd/Ctrl + Shift + A`: Open settings

## 🧪 Testing

The project includes comprehensive test coverage:

- **Unit Tests**: Reducer, utilities, prompt builder (>80% coverage)
- **Integration Tests**: Component interactions, conversation flow
- **Test Commands**:
  ```bash
  npm test              # Run all tests
  npm run test:watch    # Watch mode
  npm run test:coverage  # Coverage report
  ```

## 🚢 Deployment

### Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase:
```bash
firebase init hosting
# Select dist as public directory
# Configure as single-page app
```

4. Build and deploy:
```bash
npm run build
firebase deploy --only hosting
```

### Environment Variables

For production deployment, ensure your `.env` file is configured or users can enter their API key via the UI.

## 🎨 Trade-offs & Limitations

### Accepted Trade-offs

1. **Monaco Editor Size**: ~2MB bundle (acceptable for prototype)
2. **Client-Side API Calls**: API key visible in network requests (mitigated with mock mode default)
3. **Firestore Persistence**: Code, threads, and settings are automatically saved to Firestore
4. **Single File**: No multi-file support
5. **Desktop-First**: Mobile responsive design out of scope for V1

### Known Limitations

1. **Stale Line References**: If code is edited after thread creation, line numbers may become stale
2. **No Real-Time**: No collaboration features
3. **Context Window**: Very long files may be truncated
4. **No Code Execution**: Cannot run or test code

## 🔮 Future Improvements

- Multi-file support
- User authentication (currently uses single default workspace)
- Multiple workspaces per user
- Team collaboration/real-time sync
- Code execution/sandboxing
- Diff view for AI suggestions
- Export/report generation
- Mobile responsive design
- Full WCAG accessibility compliance
- Conversation history persistence
- Automatic language detection

## 🤖 AI Tools Used in Development

This project was developed with assistance from AI coding assistants (Cursor AI) for:
- Code generation and refactoring
- Test writing
- Documentation
- Architecture decisions

## 📄 License

This project is a prototype/demonstration project.

## 🙏 Acknowledgments

- Monaco Editor team for the excellent code editor
- OpenAI for the API
- React and Vite teams for the amazing developer experience

---

**Note**: This is a prototype application. For production use, consider adding authentication, rate limiting, and proper API key management.
