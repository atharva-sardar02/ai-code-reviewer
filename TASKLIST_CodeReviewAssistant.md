# Task List: AI-Powered Code Review Assistant
## Organized by Pull Requests

**Project Repository Structure:**
```
code-review-assistant/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── CodeEditor/
│   │   │   ├── CodeEditor.tsx
│   │   │   ├── useSelection.ts
│   │   │   └── index.ts
│   │   ├── ThreadPanel/
│   │   │   ├── ThreadPanel.tsx
│   │   │   ├── ThreadPanel.test.tsx        # Added: Integration tests
│   │   │   ├── Thread.tsx
│   │   │   ├── Thread.test.tsx             # Added: Integration tests
│   │   │   ├── Message.tsx
│   │   │   └── index.ts
│   │   ├── PromptInput/
│   │   │   ├── PromptInput.tsx
│   │   │   ├── PromptInput.test.tsx        # Added: Integration tests
│   │   │   └── index.ts
│   │   ├── ApiKeyInput/
│   │   │   ├── ApiKeyInput.tsx
│   │   │   └── index.ts
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── ai/
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── anthropic.ts
│   │   │   ├── anthropic.test.ts           # Added: Unit tests
│   │   │   ├── mock.ts
│   │   │   ├── mock.test.ts                # Added: Unit tests
│   │   │   ├── promptBuilder.ts
│   │   │   └── promptBuilder.test.ts       # Added: Unit tests
│   │   └── index.ts
│   ├── store/
│   │   ├── ThreadContext.tsx
│   │   ├── threadReducer.ts
│   │   ├── threadReducer.test.ts           # Added: Unit tests
│   │   ├── types.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useThreads.ts
│   │   ├── useThreads.test.tsx             # Added: Hook tests
│   │   └── index.ts
│   ├── utils/
│   │   ├── lineUtils.ts
│   │   ├── lineUtils.test.ts               # Added: Unit tests
│   │   ├── validation.ts                   # Added: Validation utilities
│   │   ├── validation.test.ts              # Added: Unit tests
│   │   └── index.ts
│   ├── test/
│   │   ├── setup.ts                        # Added: Test setup file
│   │   ├── testUtils.tsx                   # Added: Custom render, mocks
│   │   └── mocks/
│   │       └── handlers.ts                 # Added: MSW handlers (optional)
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── .env.example
├── .gitignore
├── .firebaserc
├── firebase.json
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts                        # Added: Vitest configuration
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## PR #1: Project Scaffolding & Configuration

**Branch Name:** `feat/project-setup`

**Description:** Initialize the project with Vite, React, TypeScript, Tailwind CSS, and configure the base project structure. Set up testing framework, linting, git ignore, and placeholder files.

**Estimated Time:** 45-60 minutes

### Tasks

- [ ] **1.1 Initialize Vite Project**
  - Run `npm create vite@latest code-review-assistant -- --template react-ts`
  - Verify project runs with `npm run dev`
  - **Files Created:**
    - `package.json`
    - `tsconfig.json`
    - `tsconfig.node.json`
    - `vite.config.ts`
    - `index.html`
    - `src/main.tsx`
    - `src/App.tsx`
    - `src/App.css`
    - `src/index.css`
    - `.gitignore`

- [ ] **1.2 Install Core Dependencies**
  - Run: `npm install @monaco-editor/react`
  - Run: `npm install -D tailwindcss postcss autoprefixer`
  - Run: `npx tailwindcss init -p`
  - **Files Edited:**
    - `package.json` (dependencies added)
  - **Files Created:**
    - `tailwind.config.js`
    - `postcss.config.js`

- [ ] **1.3 Install Testing Dependencies**
  - Run: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8`
  - **Files Edited:**
    - `package.json` (dev dependencies added)

- [ ] **1.4 Configure Vitest**
  - Create `vitest.config.ts` with React plugin and jsdom environment
  - Add test scripts to `package.json`: `"test"`, `"test:watch"`, `"test:coverage"`
  - **Files Created:**
    - `vitest.config.ts`
  - **Files Edited:**
    - `package.json` (scripts added)

- [ ] **1.5 Create Test Setup File**
  - Create `src/test/setup.ts` with testing-library/jest-dom imports
  - Create `src/test/testUtils.tsx` with custom render function
  - **Files Created:**
    - `src/test/setup.ts`
    - `src/test/testUtils.tsx`

- [ ] **1.6 Configure Tailwind CSS**
  - Update `tailwind.config.js` with content paths
  - Add Tailwind directives to `src/index.css`
  - **Files Edited:**
    - `tailwind.config.js`
    - `src/index.css`

- [ ] **1.7 Create Folder Structure**
  - Create empty directories and index files for organization
  - **Files Created:**
    - `src/components/index.ts`
    - `src/services/index.ts`
    - `src/store/index.ts`
    - `src/hooks/index.ts`
    - `src/utils/index.ts`
    - `src/test/mocks/` (directory)

- [ ] **1.8 Set Up Environment Configuration**
  - Create `.env.example` with placeholder for API key
  - Ensure `.env` is in `.gitignore`
  - **Files Created:**
    - `.env.example`
  - **Files Edited:**
    - `.gitignore`

- [ ] **1.9 Clean Up Boilerplate**
  - Remove default Vite content from `App.tsx`
  - Replace with minimal placeholder layout
  - Clear `App.css` of default styles
  - **Files Edited:**
    - `src/App.tsx`
    - `src/App.css`

- [ ] **1.10 Verify Test Setup**
  - Create a simple smoke test to verify Vitest works
  - Run `npm test` to confirm setup
  - **Files Created:**
    - `src/App.test.tsx` (simple smoke test, can be deleted later)

- [ ] **1.11 Initial Commit & PR**
  - Commit all files
  - Push to GitHub
  - Create PR with description

**PR Checklist:**
- [ ] Project runs locally with `npm run dev`
- [ ] Tailwind styles working (test with a colored div)
- [ ] `npm test` runs successfully
- [ ] No TypeScript errors
- [ ] Clean file structure in place

---

## PR #2: Core Layout & Monaco Editor Integration

**Branch Name:** `feat/monaco-editor`

**Description:** Create the main application layout with a split-pane design (editor on left, thread panel on right). Integrate Monaco Editor with basic configuration and syntax highlighting.

**Estimated Time:** 45-60 minutes

### Tasks

- [ ] **2.1 Create Header Component**
  - Simple header with app title
  - Settings icon placeholder (for API key modal later)
  - **Files Created:**
    - `src/components/Header/Header.tsx`
    - `src/components/Header/index.ts`
  - **Files Edited:**
    - `src/components/index.ts`

- [ ] **2.2 Create Main Layout in App.tsx**
  - Split layout: Header, Main (Editor + Panel)
  - Use CSS Grid or Flexbox for responsive split
  - Left pane: 60% width for editor
  - Right pane: 40% width for threads
  - **Files Edited:**
    - `src/App.tsx`
    - `src/App.css` (or use Tailwind only)

- [ ] **2.3 Create CodeEditor Component Shell**
  - Create component file with basic structure
  - Accept props: `code`, `onChange`, `onSelectionChange`
  - **Files Created:**
    - `src/components/CodeEditor/CodeEditor.tsx`
    - `src/components/CodeEditor/index.ts`
  - **Files Edited:**
    - `src/components/index.ts`

- [ ] **2.4 Integrate Monaco Editor**
  - Import and configure `@monaco-editor/react`
  - Set default language to "javascript" (changeable later)
  - Configure theme (vs-dark recommended)
  - Set editor options (minimap, line numbers, word wrap)
  - **Files Edited:**
    - `src/components/CodeEditor/CodeEditor.tsx`

- [ ] **2.5 Implement Selection Handling Hook**
  - Create `useSelection` hook to capture Monaco selection events
  - Extract: startLine, endLine, selectedText
  - Handle edge case: no selection (cursor only)
  - **Files Created:**
    - `src/components/CodeEditor/useSelection.ts`
  - **Files Edited:**
    - `src/components/CodeEditor/index.ts`

- [ ] **2.6 Wire Selection to CodeEditor**
  - Use `onDidChangeCursorSelection` Monaco event
  - Expose selection state to parent component
  - **Files Edited:**
    - `src/components/CodeEditor/CodeEditor.tsx`

- [ ] **2.7 Create ThreadPanel Placeholder**
  - Empty right panel with placeholder text
  - Will be built out in PR #4
  - **Files Created:**
    - `src/components/ThreadPanel/ThreadPanel.tsx`
    - `src/components/ThreadPanel/index.ts`
  - **Files Edited:**
    - `src/components/index.ts`

- [ ] **2.8 Add Sample Code for Testing**
  - Hardcode a sample code snippet in App.tsx for development
  - **Files Edited:**
    - `src/App.tsx`

**PR Checklist:**
- [ ] Monaco Editor renders correctly
- [ ] Syntax highlighting works
- [ ] Selection events fire and log to console
- [ ] Layout is responsive and doesn't overflow
- [ ] No TypeScript errors

---

## PR #3: State Management & Type Definitions

**Branch Name:** `feat/state-management`

**Description:** Implement the core state management using React Context and useReducer. Define all TypeScript types for threads, messages, and application state. Include comprehensive unit tests for reducer and utilities.

**Estimated Time:** 60-75 minutes

**🧪 Testing Focus:** Unit tests for pure functions (reducer, utilities)

### Tasks

- [ ] **3.1 Define Core Types**
  - Create types for: Thread, Message, Selection, AppState
  - Define action types for reducer
  - **Files Created:**
    - `src/store/types.ts`

- [ ] **3.2 Create Thread Reducer**
  - Implement reducer with actions:
    - `CREATE_THREAD`
    - `ADD_MESSAGE`
    - `SET_ACTIVE_THREAD`
    - `TOGGLE_THREAD_EXPANDED`
    - `DELETE_THREAD`
    - `SET_CODE`
    - `SET_THREAD_LOADING`
  - **Files Created:**
    - `src/store/threadReducer.ts`

- [ ] **3.3 Write Unit Tests for Thread Reducer** 🧪
  - Test each action type independently
  - Test initial state
  - Test state immutability
  - Test edge cases (delete non-existent thread, add message to non-existent thread)
  - **Test Cases:**
    - `CREATE_THREAD`: creates new thread with correct line range and empty messages
    - `ADD_MESSAGE`: appends message to correct thread
    - `SET_ACTIVE_THREAD`: updates activeThreadId
    - `TOGGLE_THREAD_EXPANDED`: toggles isExpanded boolean
    - `DELETE_THREAD`: removes thread and clears activeThreadId if deleted thread was active
    - `SET_CODE`: updates code string
    - `SET_THREAD_LOADING`: sets loading state on correct thread
  - **Files Created:**
    - `src/store/threadReducer.test.ts`

- [ ] **3.4 Create Thread Context**
  - Create context with state and dispatch
  - Create provider component
  - Create custom hook `useThreadContext`
  - **Files Created:**
    - `src/store/ThreadContext.tsx`
  - **Files Edited:**
    - `src/store/index.ts`

- [ ] **3.5 Create useThreads Hook**
  - Abstract common thread operations
  - Methods: `createThread`, `addMessage`, `deleteThread`, `setActiveThread`
  - **Files Created:**
    - `src/hooks/useThreads.ts`
  - **Files Edited:**
    - `src/hooks/index.ts`

- [ ] **3.6 Write Tests for useThreads Hook** 🧪
  - Test hook within ThreadProvider context
  - Verify each method dispatches correct action
  - **Test Cases:**
    - `createThread`: creates thread with selection data
    - `addMessage`: adds user/assistant messages
    - `deleteThread`: removes thread by ID
    - `setActiveThread`: sets active thread ID
  - **Files Created:**
    - `src/hooks/useThreads.test.tsx`

- [ ] **3.7 Create Line Utility Functions**
  - Helper to convert Monaco selection to line range
  - Helper to extract selected text from code string
  - Helper to generate thread ID
  - **Files Created:**
    - `src/utils/lineUtils.ts`
  - **Files Edited:**
    - `src/utils/index.ts`

- [ ] **3.8 Write Unit Tests for Line Utilities** 🧪
  - Test pure utility functions
  - **Test Cases:**
    - `monacoSelectionToRange`: converts Monaco ISelection to {startLine, endLine}
    - `extractSelectedText`: extracts correct lines from code string
    - `generateThreadId`: returns unique IDs
    - Edge cases: single line selection, full file selection, empty selection
  - **Files Created:**
    - `src/utils/lineUtils.test.ts`

- [ ] **3.9 Wrap App with ThreadProvider**
  - Add provider to component tree
  - Verify context is accessible
  - **Files Edited:**
    - `src/App.tsx`

- [ ] **3.10 Connect CodeEditor to State**
  - Use `setCode` action when editor content changes
  - Store code in global state
  - **Files Edited:**
    - `src/App.tsx`
    - `src/components/CodeEditor/CodeEditor.tsx`

- [ ] **3.11 Run Tests & Verify Coverage**
  - Run `npm test` and ensure all tests pass
  - Run `npm run test:coverage` and verify >80% coverage for tested files
  - **Files Edited:**
    - (No files, verification step)

**PR Checklist:**
- [ ] All types compile without errors
- [ ] Reducer handles all actions correctly
- [ ] Context provides state throughout app
- [ ] useThreads hook works
- [ ] Code changes persist in state
- [ ] ✅ All unit tests pass (`npm test`)
- [ ] ✅ Test coverage >80% for `threadReducer.ts` and `lineUtils.ts`

---

## PR #4: Thread UI Components

**Branch Name:** `feat/thread-ui`

**Description:** Build out the thread panel UI including the list of threads, individual thread component with message history, and visual indicators connecting threads to code lines. Include integration tests for key user interactions.

**Estimated Time:** 75-90 minutes

**🧪 Testing Focus:** Integration tests with React Testing Library (user interactions)

### Tasks

- [ ] **4.1 Build ThreadPanel Component**
  - Display list of threads
  - Show empty state when no threads
  - Add button/prompt to create first thread
  - **Files Edited:**
    - `src/components/ThreadPanel/ThreadPanel.tsx`

- [ ] **4.2 Build Thread Component**
  - Display thread header (line range, collapse toggle)
  - Show thread messages
  - Expandable/collapsible
  - Highlight when active
  - **Files Created:**
    - `src/components/ThreadPanel/Thread.tsx`
  - **Files Edited:**
    - `src/components/ThreadPanel/index.ts`

- [ ] **4.3 Build Message Component**
  - Display user and assistant messages differently
  - Style user messages (right-aligned or distinct bg)
  - Style AI messages (left-aligned, different bg)
  - Support markdown rendering (optional, or plain text)
  - **Files Created:**
    - `src/components/ThreadPanel/Message.tsx`
  - **Files Edited:**
    - `src/components/ThreadPanel/index.ts`

- [ ] **4.4 Build PromptInput Component**
  - Text input for user messages
  - Submit button
  - Handle enter key to submit
  - Disable while loading
  - **Files Created:**
    - `src/components/PromptInput/PromptInput.tsx`
    - `src/components/PromptInput/index.ts`
  - **Files Edited:**
    - `src/components/index.ts`

- [ ] **4.5 Write Integration Tests for Thread Component** 🧪
  - Test component renders thread data correctly
  - Test expand/collapse toggle behavior
  - Test click to set active thread
  - Test delete button functionality
  - **Test Cases:**
    - Renders line range in header (e.g., "Lines 5-10")
    - Renders all messages in thread
    - Clicking header toggles expanded state
    - Clicking delete button calls delete handler
    - Active thread has visual distinction
  - **Files Created:**
    - `src/components/ThreadPanel/Thread.test.tsx`

- [ ] **4.6 Write Integration Tests for ThreadPanel** 🧪
  - Test empty state rendering
  - Test list of multiple threads
  - **Test Cases:**
    - Shows empty state message when no threads
    - Renders correct number of Thread components
    - Threads are in correct order (newest first or by line number)
  - **Files Created:**
    - `src/components/ThreadPanel/ThreadPanel.test.tsx`

- [ ] **4.7 Write Integration Tests for PromptInput** 🧪
  - Test input field and submission
  - **Test Cases:**
    - Renders input field and submit button
    - Typing updates input value
    - Clicking submit calls onSubmit with input value
    - Pressing Enter submits the form
    - Input is cleared after submission
    - Submit button is disabled when input is empty
    - Submit button is disabled when loading prop is true
  - **Files Created:**
    - `src/components/PromptInput/PromptInput.test.tsx`

- [ ] **4.8 Add "Ask AI" Button to Editor**
  - Floating button appears when text is selected
  - Or: static button in toolbar that's enabled when selection exists
  - Clicking creates new thread with selection
  - **Files Edited:**
    - `src/components/CodeEditor/CodeEditor.tsx`
    - `src/App.tsx`

- [ ] **4.9 Implement Line Highlighting in Editor**
  - When thread is active, highlight its line range in Monaco
  - Use Monaco decorations API
  - Different colors for different threads (optional)
  - **Files Edited:**
    - `src/components/CodeEditor/CodeEditor.tsx`

- [ ] **4.10 Wire Thread Creation Flow**
  - Select code → Click "Ask AI" → Thread created → PromptInput focused
  - **Files Edited:**
    - `src/App.tsx`
    - `src/components/ThreadPanel/ThreadPanel.tsx`

- [ ] **4.11 Add Delete Thread Functionality**
  - Delete button on each thread
  - Confirm deletion (optional for V1)
  - **Files Edited:**
    - `src/components/ThreadPanel/Thread.tsx`

- [ ] **4.12 Run Tests & Verify**
  - Run `npm test` and ensure all tests pass
  - Verify components render correctly in browser
  - **Files Edited:**
    - (No files, verification step)

**PR Checklist:**
- [ ] Can create a new thread from selection
- [ ] Thread displays in panel with correct line numbers
- [ ] Can expand/collapse threads
- [ ] Message input appears for active thread
- [ ] Line highlighting works in editor
- [ ] Can delete threads
- [ ] Empty state displays when no threads
- [ ] ✅ All integration tests pass (`npm test`)
- [ ] ✅ Thread, ThreadPanel, and PromptInput components have test coverage

---

## PR #5: AI Service Layer

**Branch Name:** `feat/ai-service`

**Description:** Create the abstraction layer for AI providers. Implement both mock responses and Anthropic Claude integration. Build the prompt construction logic that provides code context. Include comprehensive unit tests for prompt builder and mock provider.

**Estimated Time:** 75-90 minutes

**🧪 Testing Focus:** Unit tests for pure functions (promptBuilder) and mock provider behavior

### Tasks

- [ ] **5.1 Define AI Service Types**
  - Interface for AI provider
  - Request/response types
  - Configuration types
  - **Files Created:**
    - `src/services/ai/types.ts`

- [ ] **5.2 Build Prompt Builder**
  - Function to construct system prompt
  - Include: full code, selected lines, line numbers, language
  - Handle long files (truncation strategy)
  - **Files Created:**
    - `src/services/ai/promptBuilder.ts`

- [ ] **5.3 Write Unit Tests for Prompt Builder** 🧪
  - Test prompt construction with various inputs
  - This is critical: ensures AI receives correct context
  - **Test Cases:**
    - `buildSystemPrompt`: includes language, full code, and instructions
    - `buildUserPrompt`: includes selected code with line numbers
    - `buildConversationMessages`: formats message history correctly
    - Truncation: long files are truncated with context around selection
    - Edge cases: single line selection, empty code, very long selection
    - Line numbers are accurate in prompt
  - **Files Created:**
    - `src/services/ai/promptBuilder.test.ts`

- [ ] **5.4 Implement Mock AI Provider**
  - Return canned responses based on simple patterns
  - Simulate delay (500-1500ms)
  - Cover common cases: "Is this correct?", "How can I improve?", etc.
  - **Files Created:**
    - `src/services/ai/mock.ts`

- [ ] **5.5 Write Unit Tests for Mock Provider** 🧪
  - Test mock responses and delay behavior
  - **Test Cases:**
    - Returns a response (not empty)
    - Response is a string
    - Simulates delay (async behavior)
    - Different inputs produce responses (doesn't crash)
    - Handles conversation history parameter
  - **Files Created:**
    - `src/services/ai/mock.test.ts`

- [ ] **5.6 Implement Anthropic AI Provider**
  - Use fetch to call Anthropic API directly
  - Handle API key from parameter
  - Proper error handling (rate limits, auth errors)
  - Parse response correctly
  - **Files Created:**
    - `src/services/ai/anthropic.ts`

- [ ] **5.7 Write Unit Tests for Anthropic Provider** 🧪
  - Test error handling (mock fetch)
  - **Test Cases:**
    - Throws error when API key is missing
    - Formats request body correctly
    - Parses successful response correctly
    - Handles 401 error (invalid API key)
    - Handles 429 error (rate limit)
    - Handles network errors
  - **Note:** Use `vi.mock` to mock fetch, don't make real API calls
  - **Files Created:**
    - `src/services/ai/anthropic.test.ts`

- [ ] **5.8 Create AI Service Factory**
  - Export function to get appropriate provider
  - Based on: API key presence, user preference
  - Default to mock if no key
  - **Files Created:**
    - `src/services/ai/index.ts`
  - **Files Edited:**
    - `src/services/index.ts`

- [ ] **5.9 Add Conversation History to Prompts**
  - Include previous messages in thread when calling AI
  - Maintain context across multi-turn conversations
  - **Files Edited:**
    - `src/services/ai/promptBuilder.ts`

- [ ] **5.10 Run Tests & Verify Coverage**
  - Run `npm test` and ensure all tests pass
  - Verify >80% coverage for promptBuilder.ts
  - **Files Edited:**
    - (No files, verification step)

**PR Checklist:**
- [ ] Mock provider returns sensible responses
- [ ] Mock provider simulates realistic delay
- [ ] Anthropic provider works with valid API key
- [ ] Prompt includes full code context
- [ ] Prompt includes conversation history
- [ ] Errors are handled gracefully
- [ ] ✅ All unit tests pass (`npm test`)
- [ ] ✅ promptBuilder.ts has >80% test coverage
- [ ] ✅ Error scenarios are tested for Anthropic provider

---

## PR #6: AI Integration & Conversation Flow

**Branch Name:** `feat/ai-integration`

**Description:** Wire up the AI service to the thread UI. Implement the API key input modal. Add loading states and error handling throughout the conversation flow. Include integration tests to verify the complete flow works correctly.

**Estimated Time:** 60-75 minutes

**🧪 Testing Focus:** Integration tests for conversation flow with mocked AI service

### Tasks

- [ ] **6.1 Build API Key Input Component**
  - Modal or settings panel
  - Input field for API key
  - Toggle between mock/live mode
  - Store key in memory (not localStorage for security demo)
  - **Files Created:**
    - `src/components/ApiKeyInput/ApiKeyInput.tsx`
    - `src/components/ApiKeyInput/index.ts`
  - **Files Edited:**
    - `src/components/index.ts`

- [ ] **6.2 Add API Key State to Context**
  - Store API key in app state
  - Store provider mode (mock/anthropic)
  - **Files Edited:**
    - `src/store/types.ts`
    - `src/store/threadReducer.ts`
    - `src/store/ThreadContext.tsx`

- [ ] **6.3 Update Reducer Tests for New Actions** 🧪
  - Add tests for new API key related actions
  - **Test Cases:**
    - `SET_API_KEY`: stores API key in state
    - `SET_PROVIDER_MODE`: switches between mock/anthropic
    - `SET_THREAD_ERROR`: stores error message on thread
  - **Files Edited:**
    - `src/store/threadReducer.test.ts`

- [ ] **6.4 Connect Settings Button in Header**
  - Open API key modal from header
  - Show current mode indicator (Mock/Live)
  - **Files Edited:**
    - `src/components/Header/Header.tsx`
    - `src/App.tsx`

- [ ] **6.5 Wire AI Service to Thread Submission**
  - When user submits message in thread:
    1. Add user message to thread
    2. Set loading state
    3. Call AI service
    4. Add AI response to thread
    5. Clear loading state
  - **Files Edited:**
    - `src/hooks/useThreads.ts` (or create new hook)
    - `src/components/ThreadPanel/Thread.tsx`

- [ ] **6.6 Create useConversation Hook (or extend useThreads)**
  - Encapsulate the AI call logic
  - Handle loading, error states
  - Easy to mock for testing
  - **Files Created:**
    - `src/hooks/useConversation.ts` (optional, can be in useThreads)
  - **Files Edited:**
    - `src/hooks/index.ts`

- [ ] **6.7 Write Integration Tests for Conversation Flow** 🧪
  - Test full user journey with mocked AI service
  - **Test Cases:**
    - User submits message → loading state appears → AI response appears
    - Multi-turn conversation maintains context
    - Error state displays when AI call fails
    - Retry button clears error and retries
    - Loading state disables input
  - **Test Setup:**
    - Mock the AI service module using `vi.mock`
    - Use fake timers for delay simulation
  - **Files Created:**
    - `src/hooks/useConversation.test.tsx` (or `useThreads.test.tsx` if extended)

- [ ] **6.8 Add Loading State UI**
  - Show loading indicator while AI is responding
  - Disable input during loading
  - Typing indicator or spinner in message area
  - **Files Edited:**
    - `src/components/ThreadPanel/Thread.tsx`
    - `src/components/PromptInput/PromptInput.tsx`

- [ ] **6.9 Add Error Handling UI**
  - Display error message if AI call fails
  - Allow retry
  - Specific messages for: no API key, rate limit, network error
  - **Files Edited:**
    - `src/components/ThreadPanel/Thread.tsx`
    - `src/store/types.ts`
    - `src/store/threadReducer.ts`

- [ ] **6.10 Write Integration Test for Error Scenarios** 🧪
  - Test error handling UI
  - **Test Cases:**
    - Network error shows "Network error" message
    - Rate limit error shows appropriate message
    - Invalid API key error prompts user to check key
    - Error message has retry button
    - Clicking retry clears error and attempts again
  - **Files Created:**
    - (Can be in same test file as 6.7)

- [ ] **6.11 Manual End-to-End Verification**
  - Create thread → Ask question → Get response → Follow up → Get response
  - Verify context is maintained
  - Test with mock mode
  - Test with real API key (if available)
  - **Files Edited:**
    - (Manual testing, no file changes)

**PR Checklist:**
- [ ] Can enter API key via UI
- [ ] Mode indicator shows Mock vs Live
- [ ] Messages sent to AI service correctly
- [ ] AI responses appear in thread
- [ ] Loading state displays during API call
- [ ] Errors display gracefully
- [ ] Multi-turn conversation works
- [ ] ✅ All integration tests pass (`npm test`)
- [ ] ✅ Conversation flow tests cover happy path and error scenarios

---

## PR #7: Polish, Edge Cases & Documentation

**Branch Name:** `feat/polish`

**Description:** Handle edge cases, improve UX with better visual feedback, add keyboard shortcuts, and write comprehensive documentation. Add unit tests for validation utilities.

**Estimated Time:** 60-75 minutes

**🧪 Testing Focus:** Unit tests for validation functions

### Tasks

- [ ] **7.1 Create Validation Utility Functions**
  - Extract validation logic into pure, testable functions
  - `isValidSelection`: checks if selection has at least 1 line
  - `isValidMessage`: checks if message is non-empty after trim
  - `shouldTruncateCode`: determines if code exceeds limit
  - `truncateCodeWithContext`: truncates while keeping selection context
  - **Files Created:**
    - `src/utils/validation.ts`
  - **Files Edited:**
    - `src/utils/index.ts`

- [ ] **7.2 Write Unit Tests for Validation Utilities** 🧪
  - Test edge case handling logic
  - **Test Cases:**
    - `isValidSelection`: returns false for empty selection, true for 1+ lines
    - `isValidSelection`: returns false for cursor-only (start === end, no text)
    - `isValidMessage`: returns false for empty string, whitespace-only
    - `isValidMessage`: returns true for non-empty trimmed string
    - `shouldTruncateCode`: returns true when code exceeds line/char limit
    - `truncateCodeWithContext`: keeps N lines before/after selection
    - `truncateCodeWithContext`: adds truncation markers (...) 
  - **Files Created:**
    - `src/utils/validation.test.ts`

- [ ] **7.3 Apply Validation in Components**
  - Use validation functions in components
  - Empty selection (require at least 1 line)
  - Very long code (show warning, truncate context)
  - Empty message submission (prevent)
  - Rapid submissions (debounce)
  - **Files Edited:**
    - `src/components/CodeEditor/CodeEditor.tsx`
    - `src/components/PromptInput/PromptInput.tsx`
    - `src/services/ai/promptBuilder.ts`

- [ ] **7.4 Add Keyboard Shortcuts**
  - `Cmd/Ctrl + Enter` to submit message
  - `Escape` to close active thread
  - `Cmd/Ctrl + Shift + A` to open "Ask AI" (optional)
  - **Files Edited:**
    - `src/components/PromptInput/PromptInput.tsx`
    - `src/App.tsx`

- [ ] **7.5 Improve Visual Feedback**
  - Smooth animations for thread expand/collapse
  - Hover states on interactive elements
  - Better focus states for accessibility
  - **Files Edited:**
    - `src/index.css` (or Tailwind classes in components)
    - Various component files

- [ ] **7.6 Add Code Language Selector**
  - Dropdown to select language for syntax highlighting
  - Default to auto-detect or JavaScript
  - **Files Edited:**
    - `src/components/CodeEditor/CodeEditor.tsx`
    - `src/components/Header/Header.tsx`

- [ ] **7.7 Add Empty State Illustrations**
  - Helpful message when no code is entered
  - Instructions for how to use the tool
  - **Files Edited:**
    - `src/components/CodeEditor/CodeEditor.tsx`
    - `src/components/ThreadPanel/ThreadPanel.tsx`

- [ ] **7.8 Write README Documentation**
  - Project overview
  - How to run locally
  - How to deploy
  - Architecture decisions
  - Trade-offs made
  - Future improvements
  - AI tools used in development
  - **Files Created/Edited:**
    - `README.md`

- [ ] **7.9 Add Code Comments**
  - Document complex logic
  - Explain non-obvious decisions
  - Add JSDoc to exported functions
  - **Files Edited:**
    - Various files throughout codebase

- [ ] **7.10 Run Full Test Suite**
  - Run `npm test` and ensure ALL tests pass
  - Run `npm run test:coverage` for final coverage report
  - **Files Edited:**
    - (No files, verification step)

- [ ] **7.11 Final Manual Testing & Bug Fixes**
  - Test all user flows
  - Fix any discovered bugs
  - Cross-browser testing (Chrome, Firefox, Safari)
  - **Files Edited:**
    - Various files as needed

**PR Checklist:**
- [ ] Edge cases handled gracefully
- [ ] Keyboard shortcuts work
- [ ] UI feels polished and responsive
- [ ] README is comprehensive
- [ ] Code is well-commented
- [ ] No console errors
- [ ] Works in major browsers
- [ ] ✅ All validation unit tests pass
- [ ] ✅ Full test suite passes (`npm test`)
- [ ] ✅ Test coverage report generated

---

## PR #8: Firebase Deployment

**Branch Name:** `feat/firebase-deploy`

**Description:** Set up Firebase hosting, configure deployment, and deploy the production build. Ensure mock mode works correctly for the deployed version.

**Estimated Time:** 30-45 minutes

### Tasks

- [ ] **8.1 Install Firebase CLI**
  - Run: `npm install -g firebase-tools`
  - Run: `firebase login`
  - **Files Edited:**
    - (Local environment, no file changes)

- [ ] **8.2 Initialize Firebase Project**
  - Create project in Firebase Console
  - Run: `firebase init hosting`
  - Select `dist` as public directory
  - Configure as single-page app (yes)
  - **Files Created:**
    - `firebase.json`
    - `.firebaserc`

- [ ] **8.3 Configure Firebase for SPA**
  - Ensure rewrites are set for client-side routing
  - **Files Edited:**
    - `firebase.json`

- [ ] **8.4 Update .gitignore for Firebase**
  - Add Firebase cache and logs
  - **Files Edited:**
    - `.gitignore`

- [ ] **8.5 Test Production Build Locally**
  - Run: `npm run build`
  - Run: `npm run preview`
  - Verify all functionality works
  - **Files Edited:**
    - (Testing, no file changes)

- [ ] **8.6 Verify Mock Mode for Deployment**
  - Ensure app defaults to mock mode without API key
  - Test deployed experience without key
  - **Files Edited:**
    - `src/services/ai/index.ts` (if needed)

- [ ] **8.7 Deploy to Firebase**
  - Run: `firebase deploy --only hosting`
  - Verify live URL works
  - **Files Edited:**
    - (Deployment, no file changes)

- [ ] **8.8 Update README with Live URL**
  - Add deployed URL to README
  - Add deployment instructions
  - **Files Edited:**
    - `README.md`

- [ ] **8.9 Final Verification**
  - Test live deployment
  - Verify mock mode works
  - Verify API key input works
  - Test full flow on deployed version
  - **Files Edited:**
    - (Testing, no file changes)

**PR Checklist:**
- [ ] Firebase project created
- [ ] `firebase.json` configured correctly
- [ ] Production build works locally
- [ ] Mock mode works without API key
- [ ] Successfully deployed to Firebase
- [ ] Live URL is accessible
- [ ] README updated with deployment info

---

## PR #9: Multi-File Workspace Support

**Branch Name:** `feat/multi-file-workspace`

**Description:** Transform the application from single-file to multi-file workspace. Add file explorer, file tabs, and associate threads with specific files. Remove sample code initialization.

**Estimated Time:** 90-120 minutes

**🧪 Testing Focus:** Integration tests for file operations and thread filtering

### Tasks

- [ ] **9.1 Update Type Definitions**
  - Add `File` interface to types
  - Add `fileId` to `Thread` interface
  - Update `AppState` to use `files` array instead of `code` string
  - Add `activeFileId` to state
  - **Files Edited:**
    - `src/store/types.ts`

- [ ] **9.2 Update Reducer for Files**
  - Add actions: `CREATE_FILE`, `UPDATE_FILE`, `DELETE_FILE`, `SET_ACTIVE_FILE`, `RENAME_FILE`
  - Modify `CREATE_THREAD` to include `fileId`
  - Remove or deprecate `SET_CODE` action
  - **Files Edited:**
    - `src/store/threadReducer.ts`
    - `src/store/types.ts`

- [ ] **9.3 Update Reducer Tests** 🧪
  - Test new file-related actions
  - Test thread creation with fileId
  - **Files Edited:**
    - `src/store/threadReducer.test.ts`

- [ ] **9.4 Create FileExplorer Component**
  - Left sidebar with file list
  - Create file button
  - Delete file button
  - Click file to open
  - Active file highlighted
  - **Files Created:**
    - `src/components/FileExplorer/FileExplorer.tsx`
    - `src/components/FileExplorer/index.ts`
  - **Files Edited:**
    - `src/components/index.ts`

- [ ] **9.5 Create FileTabs Component**
  - Tab bar above editor
  - Shows open files (or all files)
  - Active tab highlighted
  - Close button on tabs
  - Click to switch files
  - **Files Created:**
    - `src/components/FileTabs/FileTabs.tsx`
    - `src/components/FileTabs/index.ts`
  - **Files Edited:**
    - `src/components/index.ts`

- [ ] **9.6 Update CodeEditor Component**
  - Accept `file: File | null` prop instead of `code: string`
  - Show active file content
  - Update file content on change
  - Use file.language for syntax highlighting
  - **Files Edited:**
    - `src/components/CodeEditor/CodeEditor.tsx`

- [ ] **9.7 Update ThreadPanel Component**
  - Filter threads by `activeFileId`
  - Only show threads where `thread.fileId === activeFileId`
  - Update empty state message
  - **Files Edited:**
    - `src/components/ThreadPanel/ThreadPanel.tsx`

- [ ] **9.8 Update App Layout**
  - Add FileExplorer to left side
  - Adjust layout: FileExplorer (15%), CodeEditor (45%), ThreadPanel (40%)
  - Add FileTabs above editor
  - Remove sample code initialization
  - **Files Edited:**
    - `src/App.tsx`

- [ ] **9.9 Update Firestore Types**
  - Add `FileDocument` interface
  - Update `WorkspaceDocument` to include `files` array
  - Update `ThreadDocument` to include `fileId`
  - **Files Edited:**
    - `src/services/firestore/types.ts`

- [ ] **9.10 Update Firestore Service**
  - Modify `loadWorkspace()` to load files array
  - Modify `saveWorkspace()` to save files array
  - Add data migration: convert old `code` to files array on first load
  - **Files Edited:**
    - `src/services/firestore/workspaceService.ts`

- [ ] **9.11 Update useThreads Hook**
  - Add file management methods: `createFile`, `updateFile`, `deleteFile`, `setActiveFile`, `renameFile`
  - Update `createThread` to require `fileId`
  - **Files Edited:**
    - `src/hooks/useThreads.ts`

- [ ] **9.12 Update ThreadContext**
  - Handle file state in context
  - Load files from Firestore
  - Save files to Firestore
  - **Files Edited:**
    - `src/store/ThreadContext.tsx`

- [ ] **9.13 Write Integration Tests** 🧪
  - Test file creation
  - Test file switching
  - Test thread filtering by file
  - Test file deletion
  - **Files Created:**
    - `src/components/FileExplorer/FileExplorer.test.tsx`
    - `src/components/FileTabs/FileTabs.test.tsx`

- [ ] **9.14 Remove Sample Code**
  - Remove SAMPLE_CODE constant
  - Remove sample code initialization logic
  - Start with empty workspace
  - **Files Edited:**
    - `src/App.tsx`

- [ ] **9.15 Update Header Component**
  - Add "New File" button (optional)
  - Show active file name
  - **Files Edited:**
    - `src/components/Header/Header.tsx`

**PR Checklist:**
- [ ] Can create new files
- [ ] Can switch between files
- [ ] Can delete files
- [ ] File content persists in Firestore
- [ ] Threads are scoped to files
- [ ] Only threads for active file are visible
- [ ] No sample code appears
- [ ] Data migration works (old format → new format)
- [ ] ✅ All tests pass (`npm test`)
- [ ] ✅ File operations tested

---

## PR #10: File Management Polish

**Branch Name:** `feat/file-management`

**Description:** Add file renaming, better file creation UI, file saving indicators, and improve file explorer UX.

**Estimated Time:** 60-75 minutes

### Tasks

- [ ] **10.1 Add File Renaming**
  - Double-click or right-click → rename
  - Inline editing
  - Validate file names
  - **Files Edited:**
    - `src/components/FileExplorer/FileExplorer.tsx`
    - `src/store/threadReducer.ts`

- [ ] **10.2 Improve File Creation**
  - Dialog/modal for new file
  - File name input
  - Language selector
  - Template options (optional)
  - **Files Created:**
    - `src/components/NewFileDialog/NewFileDialog.tsx`
  - **Files Edited:**
    - `src/components/FileExplorer/FileExplorer.tsx`

- [ ] **10.3 Add File Saving Indicators**
  - Show unsaved indicator (*) on tabs
  - Auto-save status
  - Manual save button (optional)
  - **Files Edited:**
    - `src/components/FileTabs/FileTabs.tsx`
    - `src/store/types.ts` (add `isDirty` to File)

- [ ] **10.4 Add File Context Menu**
  - Right-click menu on files
  - Options: Rename, Delete, Duplicate, Copy Path
  - **Files Created:**
    - `src/components/FileContextMenu/FileContextMenu.tsx`
  - **Files Edited:**
    - `src/components/FileExplorer/FileExplorer.tsx`

- [ ] **10.5 Add Keyboard Shortcuts**
  - `Cmd/Ctrl + N`: New file
  - `Cmd/Ctrl + S`: Save file
  - `Cmd/Ctrl + W`: Close file
  - `Cmd/Ctrl + Tab`: Switch files
  - **Files Edited:**
    - `src/App.tsx`

- [ ] **10.6 Improve File Explorer UX**
  - File type icons
  - Better empty state
  - Search/filter files (optional)
  - **Files Edited:**
    - `src/components/FileExplorer/FileExplorer.tsx`

**PR Checklist:**
- [ ] Can rename files
- [ ] File creation dialog works
- [ ] Unsaved indicators work
- [ ] Context menu works
- [ ] Keyboard shortcuts work
- [ ] File explorer looks polished

---

## Summary: PR Order & Dependencies

```
PR #1: Project Scaffolding ──────────────────────┐
                                                 │
PR #2: Monaco Editor ────────────────────────────┼──┐
                                                 │  │
PR #3: State Management ─────────────────────────┘  │
         │                                          │
         ▼                                          │
PR #4: Thread UI ───────────────────────────────────┘
         │
         ▼
PR #5: AI Service Layer
         │
         ▼
PR #6: AI Integration
         │
         ▼
PR #7: Polish & Documentation
         │
         ▼
PR #8: Firebase Deployment
         │
         ▼
PR #9: Multi-File Workspace Support
         │
         ▼
PR #10: File Management Polish
```

**Critical Path:** PR #1 → #2 → #3 → #4 → #5 → #6 → #7 → #8 → #9 → #10

**Parallel Work Possible:**
- PR #5 (AI Service) can be started while PR #4 (Thread UI) is in progress
- Documentation in PR #7 can be started anytime

---

## Time Estimates (Updated with Testing)

| PR | Description | Estimated Time | Tests Included |
|----|-------------|----------------|----------------|
| #1 | Project Scaffolding | 45-60 min | Setup only |
| #2 | Monaco Editor | 45-60 min | ❌ None |
| #3 | State Management | 60-75 min | ✅ Unit tests |
| #4 | Thread UI | 75-90 min | ✅ Integration tests |
| #5 | AI Service | 75-90 min | ✅ Unit tests |
| #6 | AI Integration | 60-75 min | ✅ Integration tests |
| #7 | Polish & Docs | 60-75 min | ✅ Unit tests |
| #8 | Firebase Deploy | 30-45 min | ❌ None |
| #9 | Multi-File Workspace | 90-120 min | ✅ Integration tests |
| #10 | File Management Polish | 60-75 min | ❌ None |
| **Total** | | **10-12.5 hours** | |

---

## Testing Summary

### Test Files by PR

| PR | Test Files Created | Test Type |
|----|-------------------|-----------|
| #1 | `src/test/setup.ts`, `src/test/testUtils.tsx` | Setup |
| #3 | `threadReducer.test.ts`, `lineUtils.test.ts`, `useThreads.test.tsx` | Unit |
| #4 | `Thread.test.tsx`, `ThreadPanel.test.tsx`, `PromptInput.test.tsx` | Integration |
| #5 | `promptBuilder.test.ts`, `mock.test.ts`, `anthropic.test.ts` | Unit |
| #6 | `useConversation.test.tsx` (conversation flow tests) | Integration |
| #7 | `validation.test.ts` | Unit |

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- threadReducer.test.ts
```

### Coverage Goals

| File/Module | Target Coverage |
|-------------|----------------|
| `threadReducer.ts` | >90% |
| `lineUtils.ts` | >90% |
| `promptBuilder.ts` | >80% |
| `validation.ts` | >90% |
| UI Components | >70% |

---

## Quick Reference: Files by Category

### Configuration Files
- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `vitest.config.ts`
- `tailwind.config.js`
- `postcss.config.js`
- `firebase.json`
- `.firebaserc`
- `.env.example`
- `.gitignore`

### Test Setup (src/test/)
- `setup.ts`
- `testUtils.tsx`
- `mocks/handlers.ts`

### Components (src/components/)
- `Header/Header.tsx`
- `CodeEditor/CodeEditor.tsx`
- `CodeEditor/useSelection.ts`
- `ThreadPanel/ThreadPanel.tsx`
- `ThreadPanel/ThreadPanel.test.tsx` 🧪
- `ThreadPanel/Thread.tsx`
- `ThreadPanel/Thread.test.tsx` 🧪
- `ThreadPanel/Message.tsx`
- `PromptInput/PromptInput.tsx`
- `PromptInput/PromptInput.test.tsx` 🧪
- `ApiKeyInput/ApiKeyInput.tsx`

### State Management (src/store/)
- `types.ts`
- `threadReducer.ts`
- `threadReducer.test.ts` 🧪
- `ThreadContext.tsx`

### Services (src/services/)
- `ai/types.ts`
- `ai/promptBuilder.ts`
- `ai/promptBuilder.test.ts` 🧪
- `ai/mock.ts`
- `ai/mock.test.ts` 🧪
- `ai/anthropic.ts`
- `ai/anthropic.test.ts` 🧪
- `ai/index.ts`

### Hooks (src/hooks/)
- `useThreads.ts`
- `useThreads.test.tsx` 🧪
- `useConversation.ts`
- `useConversation.test.tsx` 🧪

### Utilities (src/utils/)
- `lineUtils.ts`
- `lineUtils.test.ts` 🧪
- `validation.ts`
- `validation.test.ts` 🧪

### Root Files (src/)
- `main.tsx`
- `App.tsx`
- `App.css`
- `index.css`

---

## Testing Strategy

### Why These Tests?

The tests are strategically placed to provide **maximum confidence with minimum time investment**:

| Test Type | Purpose | Where Applied |
|-----------|---------|---------------|
| **Unit Tests** | Verify pure functions work correctly in isolation | Reducer, utilities, promptBuilder |
| **Integration Tests** | Verify components work together correctly | Thread UI, conversation flow |

### What We're NOT Testing (and Why)

| Skipped | Reason |
|---------|--------|
| Monaco Editor internals | Third-party library, well-tested |
| Visual styling | Manual verification more effective |
| Firebase deployment | Infrastructure, not code |
| E2E tests | Time-intensive; manual testing sufficient for prototype |

### Testing Principles for This Project

1. **Test behavior, not implementation** — Tests should verify what the code does, not how it does it
2. **Pure functions first** — Reducers and utilities are easiest to test and most valuable
3. **Mock external dependencies** — AI service is mocked in tests to ensure deterministic results
4. **Integration over E2E** — React Testing Library tests give high confidence without browser automation

### Example Test Patterns

**Reducer Test (Pure Function):**
```typescript
it('should add a message to the correct thread', () => {
  const initialState = { threads: [{ id: '1', messages: [] }] };
  const action = { type: 'ADD_MESSAGE', payload: { threadId: '1', message: {...} } };
  const newState = threadReducer(initialState, action);
  expect(newState.threads[0].messages).toHaveLength(1);
});
```

**Component Integration Test:**
```typescript
it('should submit message when clicking submit button', async () => {
  const onSubmit = vi.fn();
  render(<PromptInput onSubmit={onSubmit} />);
  await userEvent.type(screen.getByRole('textbox'), 'Hello');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  expect(onSubmit).toHaveBeenCalledWith('Hello');
});
```

**AI Service Test (Mocked Fetch):**
```typescript
it('should handle rate limit errors', async () => {
  vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 429 });
  await expect(anthropicProvider.complete(...)).rejects.toThrow('Rate limit');
});
```

---

## Verification Checklist (For Coding Agent)

Before marking each PR complete, the coding agent should verify:

- [ ] `npm run build` completes without errors
- [ ] `npm test` passes all tests
- [ ] `npm run lint` has no errors (if configured)
- [ ] Manual smoke test of new functionality works
- [ ] No TypeScript errors in IDE
- [ ] No console errors in browser
