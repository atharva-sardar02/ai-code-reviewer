# System Patterns: CodeReviewer AI

## Architecture Overview

The application follows a **component-based React architecture** with:
- **Monaco Editor** for code editing (center pane)
- **FileExplorer** for file management (left sidebar, 15%)
- **FileTabs** for open file tabs (above editor, session-based)
- **Thread Panel** with tab-based UI for conversations (right pane, 48%)
- **Landing Page** when no files open (welcome message, create file button)
- **React Context + useReducer** for state management
- **Firebase Firestore** for data persistence (files, threads - not open tabs)
- **Service layer** for AI integration (OpenAI-only)
- **Radix UI** for accessible component primitives

## Key Technical Decisions

### Multi-File Workspace
- **Choice**: Files array instead of single code string
- **Rationale**: Enables working with multiple files, better organization, threads scoped to files
- **Implementation**: FileExplorer (15%) + CodeEditor (45%) + ThreadPanel (40%) layout

### Thread UI Placement
- **Choice**: Right-side panel with tab-based interface (Cursor IDE style)
- **Rationale**: Familiar to developers, easier to manage multiple threads, better UX

### Thread Scoping
- **Choice**: Threads associated with files via `fileId`
- **Rationale**: Only show threads relevant to active file, cleaner organization
- **Implementation**: ThreadPanel filters threads by `activeFileId`

### Code Editing Post-Thread
- **Choice**: Allow edits, accept stale line references
- **Rationale**: Locking edits too restrictive; documented as V1 limitation

### API Key Handling
- **Choice**: `.env` file (VITE_OPENAI_API_KEY) only (UI input removed for security)
- **Rationale**: Prevents API key exposure in deployed applications
- **Implementation**: API key must be set at build time via environment variable
- **Settings UI**: Shows read-only status of API key configuration

### AI Provider
- **Choice**: OpenAI-only (removed mock mode)
- **Rationale**: Simplified implementation, requires API key
- **Model**: gpt-4o-mini

### Data Persistence
- **Choice**: Firebase Firestore
- **Rationale**: Real-time sync, easy setup, free tier sufficient for prototype

### Styling Approach
- **Choice**: Radix UI + Custom CSS
- **Rationale**: Accessible components, no utility framework overhead, full control

### Monaco Editor Configuration
- **Choice**: Disable semantic validation, keep syntax validation
- **Rationale**: Prevents false error indicators on valid code
- **Implementation**: `monacoConfig.ts` with diagnostics options

## State Management Structure

### State Shape
```typescript
{
  files: File[],              // All files (persisted to Firestore)
  openFileIds: string[],      // Files currently open in tabs (NOT persisted)
  activeFileId: string | null,
  threads: [
    {
      id: string,
      fileId: string,  // Associates thread with file
      startLine: number,
      endLine: number,
      messages: [{ role: 'user' | 'assistant', content: string }],
      isExpanded: boolean,
      isLoading: boolean,
      error: string | null
    }
  ],
  activeThreadId: string | null,
  apiKey: string | null
}
```

### File Structure
```typescript
{
  id: string,
  name: string,
  path: string,
  content: string,
  language: string,
  createdAt: number,
  updatedAt: number
}
```

### Reducer Actions
- `CREATE_FILE`: Creates new file (empty or with content) AND opens it in tabs
- `LOAD_FILE`: Loads file from Firestore WITHOUT opening in tabs (for session restore)
- `UPDATE_FILE`: Updates file content
- `DELETE_FILE`: Deletes file, removes from open tabs, and deletes associated threads
- `SET_ACTIVE_FILE`: Switches active file
- `RENAME_FILE`: Renames file
- `OPEN_FILE`: Opens file in tabs and sets as active (if not already open)
- `CLOSE_FILE`: Closes file tab WITHOUT deleting file
- `CREATE_THREAD`: Creates new thread (includes `fileId`)
- `ADD_MESSAGE`: Adds message to thread
- `SET_ACTIVE_THREAD`: Sets active thread ID
- `TOGGLE_THREAD_EXPANDED`: Expands/collapses thread
- `DELETE_THREAD`: Removes thread
- `SET_THREAD_LOADING`: Sets loading state
- `SET_THREAD_ERROR`: Sets error state
- `SET_API_KEY`: Stores API key (in memory only)
- `SET_CODE`: Legacy action for migration (converts to file)

## Component Architecture

### Layout Structure
```
App
├── Header (fixed, logo, language selector, settings)
└── Main (split layout)
    ├── FileExplorer (15% width)
    │   ├── Header ("Files" + "New" dropdown menu)
    │   └── File List (click to open, delete button, open indicator dot)
    ├── CodeEditor Area (37% width when file open, full width on landing)
    │   ├── FileTabs (shows only open files, close tabs don't delete)
    │   └── CodeEditor
    │       ├── Monaco Editor (when file open)
    │       ├── Landing Page (when no files open)
    │       │   ├── Welcome text
    │       │   ├── Getting started steps
    │       │   └── Action buttons ("Create New" + "Upload File" side by side)
    │       └── "Ask AI" button (on selection only)
    └── ThreadPanel (48% width, hidden on landing page)
        ├── Tabs Bar (horizontal, line ranges for active file only)
        └── ThreadContent
            ├── Messages (user/assistant)
            └── PromptInput (auto-resizing)
```

### Component Responsibilities

**FileExplorer**
- Left sidebar (15% width)
- File list with active file highlighted
- "New" button with dropdown menu (Create New File / Upload File)
- File upload support via hidden file input
- Delete button on each file
- Click file to open
- Language auto-detection from file extension

**FileTabs**
- Tab bar above editor
- Shows only OPEN files as tabs (from `openFileIds`)
- Active tab highlighted with cyan accent
- Close button on each tab (closes tab, doesn't delete file)
- Click tab to switch active file
- Hidden when no files open (landing page)

**Header**
- Fixed at top
- Logo and app name
- Language selector (Radix Select)
- Settings button

**CodeEditor**
- Renders Monaco Editor when file is open
- Renders Landing Page when no files open (welcome message, dual action buttons)
- Landing page buttons: "Create New" (primary) and "Upload File" (secondary) side by side
- Accepts `file` prop (not `code` string)
- Captures selection events
- Highlights active thread lines
- Provides "Ask AI" action (only on selection)
- Provides `onCreateFile` and `onUploadFile` callbacks on landing page
- Configured to prevent false error indicators

**ThreadPanel**
- Tab bar for thread navigation (filtered by active file)
- ThreadContent for active thread
- Empty state when no threads for active file

**ThreadContent**
- Displays messages for active thread
- Shows loading/error states
- Contains PromptInput

**Message**
- Renders user/assistant messages
- Different styling for each role

**PromptInput**
- Auto-resizing textarea
- Submit button
- Keyboard shortcuts (Cmd/Ctrl + Enter)
- Disabled during loading

**ApiKeyInput**
- Radix Dialog modal
- OpenAI API key input field
- Note about .env fallback

**FeedbackBlocks**
- Parses AI responses into categorized sections (Errors, Suggestions, Improvements)
- Auto Fix / Apply Code buttons for sections with code blocks
- Integrates with CodeFixPreviewDialog for change preview

**Message**
- Renders user/assistant messages
- Apply Code button for assistant messages with code blocks
- Integrates with CodeFixPreviewDialog

**CodeFixPreviewDialog**
- GitHub-style unified diff view
- Shows removed lines (−) and added lines (+) with line numbers
- Summary section with change count
- Apply All / Cancel actions
- Glass-morphism styling

**NewFileDialog**
- Custom dialog replacing browser's native `prompt()`
- File name input with extension suggestions
- Glass-morphism styling matching app aesthetic

**Toast**
- Custom notification system replacing browser `alert()`
- Four types: success (green), error (red), warning (amber), info (cyan)
- Auto-dismiss with configurable duration
- Slide-in/out animations
- Close button for manual dismissal
- ToastContainer for stacking multiple toasts

## Service Layer Pattern

### AI Service Abstraction
```typescript
interface AIProvider {
  complete(request: AICompletionRequest): Promise<string>;
}
```

### Provider Implementation
- **OpenAI Provider**: Direct API calls to OpenAI
- **No Mock Provider**: Removed for simplicity

### Firestore Service
- **Workspace Service**: Load/save workspace data
- **Real-time Sync**: Optional subscription for multi-device
- **Debounced Saves**: 1-second debounce to reduce writes
- **Migration**: Converts old single-file format to files array

## Data Persistence

### Firestore Structure
```
workspaces/
  └── default/
      ├── files: Array<FileDocument>
      ├── activeFileId: string | null
      ├── threads: Array<ThreadDocument>  // Each has fileId
      ├── activeThreadId: string | null
      ├── createdAt: number
      └── updatedAt: number
      // Legacy fields (for migration):
      ├── code?: string
      └── providerMode?: 'mock' | 'openai'
```

### FileDocument Structure
```
{
  id: string,
  name: string,
  path: string,
  content: string,
  language: string,
  createdAt: number,
  updatedAt: number
}
```

### ThreadDocument Structure
```
{
  id: string,
  fileId: string,  // NEW: Associates thread with file
  startLine: number,
  endLine: number,
  messages: Message[],
  createdAt: number,
  updatedAt: number
}
```

### Persistence Strategy
- **Auto-save**: Debounced saves on state changes (1 second)
- **Auto-load**: Load on app initialization (files loaded with `LOAD_FILE`, not opened)
- **Session-based tabs**: `openFileIds` NOT persisted - always starts empty on reload
- **Real-time**: Optional subscription for sync
- **Migration**: Automatically converts old format to new format
- **What persists**: files, threads, messages, activeThreadId
- **What doesn't persist**: openFileIds, activeFileId (starts fresh each session)

## Context Window Management

### Strategy
- **Short files (<500 lines)**: Send full file
- **Long files (>500 lines)**: Send selection + 50 lines before/after
- **Very long selections**: Truncate with context markers

## Selection Handling

### Edge Cases
- **Zero-length selection**: Require minimum 1 line
- **Full-file selection**: Allow (valid use case)
- **Overlapping ranges**: Allow (threads are independent)

### Selection Capture
- Monaco `onDidChangeCursorSelection` event
- Extract: `startLine`, `endLine`, `selectedText`
- Convert Monaco `ISelection` to `{ startLine, endLine }`
- "Ask AI" button only visible when selection exists

## Line Highlighting

### Implementation
- Use Monaco Decorations API
- Highlight active thread's line range
- Clear highlights when thread is inactive
- Yellow highlight color

## Error Handling Strategy

### Error Types
1. **Network errors**: Show "Network error" message
2. **Rate limit (429)**: Show "Rate limit exceeded" message
3. **Auth errors (401)**: Show "Invalid API key" message
4. **Generic errors**: Show error message with retry option
5. **Missing API key**: Show clear error message

### Error State
- Errors stored on thread object
- Retry button clears error and retries
- Loading state prevents duplicate requests

## Monaco Editor Configuration

### Diagnostics Options
- `noSemanticValidation: true` - Disables type checking (prevents false errors)
- `noSyntaxValidation: false` - Keeps syntax validation
- `noSuggestionDiagnostics: true` - Disables suggestion diagnostics
- `renderValidationDecorations: 'off'` - Hides error squiggles

### Compiler Options
- JSX support enabled
- React namespace configured
- Allow JS files
- Latest TypeScript target

## Testing Patterns

### Unit Tests
- **Pure functions**: Reducer, utilities, prompt builder
- **Mocked dependencies**: AI service mocked in tests
- **Edge cases**: Empty selections, long code, file operations

### Integration Tests
- **Component interactions**: Thread creation, message submission, file operations
- **User flows**: Full conversation flow with mocked AI
- **Error scenarios**: Network failures, API errors

### Test Coverage Goals
- Reducer: >90% ✅
- Utilities: >90% ✅
- Prompt builder: >80% ✅
- UI Components: >70% ✅

## File Organization

```
src/
├── components/        # React components
│   ├── CodeEditor/   # Monaco Editor integration
│   │   ├── CodeEditor.tsx
│   │   ├── useSelection.ts
│   │   └── monacoConfig.ts  # Monaco configuration
│   ├── CodeFixPreviewDialog/ # Code change preview
│   │   ├── CodeFixPreviewDialog.tsx
│   │   └── index.ts
│   ├── FileExplorer/ # File management sidebar
│   │   ├── FileExplorer.tsx
│   │   └── index.ts
│   ├── FileTabs/     # File tabs above editor
│   │   ├── FileTabs.tsx
│   │   └── index.ts
│   ├── NewFileDialog/ # Custom file creation dialog
│   │   ├── NewFileDialog.tsx
│   │   └── index.ts
│   ├── Toast/        # Custom notification system
│   │   ├── Toast.tsx
│   │   └── index.ts
│   ├── ThreadPanel/   # Tab-based thread UI
│   │   ├── FeedbackBlocks.tsx  # Categorized AI feedback with Auto Fix
│   │   ├── Message.tsx         # Message display with Apply Code
│   │   └── ...
│   ├── Header/       # App header with logo
│   ├── PromptInput/  # Message input
│   └── ApiKeyInput/  # Settings modal
├── services/         # Service layer
│   ├── ai/           # AI providers (OpenAI only)
│   └── firestore/    # Firestore persistence
├── store/            # State management
├── hooks/            # Custom React hooks
├── utils/            # Pure utility functions
│   ├── codeExtractor.ts      # AI response code extraction
│   ├── codeExtractor.test.ts # 30 unit tests
│   ├── codeReplacer.ts       # Code replacement utilities
│   ├── codeReplacer.test.ts  # 29 unit tests
│   └── ...
└── test/             # Test setup and utilities
```

## Design Patterns in Use

1. **Provider Pattern**: AI service abstraction
2. **Context Pattern**: Global state management
3. **Hook Pattern**: Reusable logic (useThreads, useSelection, useConversation)
4. **Reducer Pattern**: Predictable state updates
5. **Factory Pattern**: AI provider selection
6. **Service Layer Pattern**: Firestore abstraction
7. **File System Pattern**: Multi-file workspace management
8. **File Upload Pattern**: FileReader API for client-side file reading
9. **Code Extraction Pattern**: Parse AI responses to extract actionable code blocks
10. **Toast Notification Pattern**: Portal-based notifications for user feedback

## AI Code Auto-Fix System

### Architecture
The auto-fix system allows users to apply AI-suggested code changes with one click:

```
AI Response → Code Extraction → Preview Dialog → User Confirmation → Code Replacement
```

### Code Extraction (`codeExtractor.ts`)
- **stripLineNumbers()**: Removes line number prefixes from AI-generated code
  - Supports multiple formats: `1| code`, `1. code`, `1: code`, `  1|code`
- **stripExplanatoryComments()**: Removes AI explanatory comments
  - Patterns: `// fixed`, `// changed X to Y`, `// corrected`, `// Line N`
- **extractLineReferences()**: Finds line references in AI explanations
  - Patterns: "line 5", "lines 10-15", "Line 42", etc.
- **extractCodeBlocksWithLineInfo()**: Extracts code blocks with associated line ranges
  - Parses markdown code fences
  - Associates code with nearby line references
  - Falls back to thread selection range if no specific lines found

### Prompt Builder (`promptBuilder.ts`)
- **Scoped Review**: AI only reviews selected code, not entire file
- **Initial Feedback Detection**: `conversationHistory.length <= 1` (includes current message)
- **Line Number Conversion**: Monaco 1-indexed → array 0-indexed in `extractSelectedCode()`
- **Simplified Prompts**:
  - System: Role + format instructions only (no code)
  - Initial User: Only selected code snippet
  - Follow-up: Full file for context when needed

### Code Replacement (`codeReplacer.ts`)
- **replaceLines()**: Replaces specific line range with new code
- **applyMultipleReplacements()**: Applies multiple non-overlapping replacements
- **prepareCodeFixes()**: Filters and prepares fixes for preview
  - Removes empty/invalid fixes
  - Removes duplicate fixes
  - Validates line ranges
- **mergeOverlappingReplacements()**: Handles overlapping code changes

### Preview Dialog (`CodeFixPreviewDialog.tsx`)
- GitHub-style unified diff view
- Removed lines shown with red background and `−` prefix
- Added lines shown with green background and `+` prefix
- Line numbers displayed for context
- Summary showing number of changes and lines affected

### Integration Points
- **FeedbackBlocks**: "Auto Fix" button for error categories, "Apply Code" for suggestions
- **Message**: "Apply Code" button for all assistant messages with code blocks
- **Toast**: Success/error notifications after applying changes

## File Upload Implementation

### File Upload Flow
1. User clicks "New" button → Dropdown menu appears
2. User selects "Upload File" → Hidden file input triggered
3. File picker opens → User selects file
4. FileReader reads file content as text
5. Language detected from file extension
6. `createFileFromContent` creates file with content
7. File automatically set as active file

### Supported File Types
- TypeScript/JavaScript: `.ts`, `.tsx`, `.js`, `.jsx`
- Python: `.py`
- Java: `.java`
- C/C++: `.c`, `.cpp`
- C#: `.cs`
- Go: `.go`
- Rust: `.rs`
- Ruby: `.rb`
- PHP: `.php`
- Swift: `.swift`
- Kotlin: `.kt`
- Web: `.html`, `.css`, `.scss`
- Data: `.json`, `.xml`, `.yaml`, `.yml`
- Markdown: `.md`
- Text: `.txt`

## Styling Architecture

### Design System (December 2025 Redesign)
The application uses a modern, elegant design system with:

**CSS Variables** (`src/index.css`):
- `--bg-primary: #0a0e17` - Main background
- `--bg-secondary: #111827` - Secondary surfaces
- `--bg-tertiary: #1a2234` - Elevated surfaces
- `--accent-primary: #06b6d4` - Cyan accent color
- `--accent-gradient: linear-gradient(135deg, #06b6d4, #0891b2)` - Gradient accent
- `--text-primary: #f1f5f9` - Primary text
- `--text-secondary: #94a3b8` - Secondary text
- `--border-default: rgba(148, 163, 184, 0.1)` - Subtle borders

**Typography**:
- UI Font: Plus Jakarta Sans (Google Fonts)
- Code Font: JetBrains Mono (Google Fonts)
- Font weights: 400, 500, 600, 700

**Visual Effects**:
- Glass-morphism: `backdrop-filter: blur(12px)` on headers, modals
- Gradients: Linear gradients for backgrounds and buttons
- Shadows: Layered shadows with accent glow
- Animations: fadeIn, slideIn, spin, pulse, glow

**Component Styling**:
- Buttons: Gradient backgrounds, hover lift effects
- Inputs: Border glow on focus
- Cards: Subtle borders with elevated backgrounds
- Empty states: Centered with icon, title, description, steps

### Radix UI Components
- Dialog: Settings modal with glass-morphism
- Select: Language selector with hover highlights
- Separator: Visual dividers
- DropdownMenu: File creation menu with animated items

### Custom CSS Classes
- `.btn-primary`, `.btn-secondary`, `.btn-ghost` - Button variants
- `.glass` - Glass-morphism effect
- `.gradient-text` - Gradient text effect
- `.animate-fadeIn`, `.animate-glow` - Animations
- Custom scrollbar styling
- Layout utilities (flex, grid, spacing)
- Color utilities (gray scale, blue, red)
- Typography utilities
- Animation utilities (spin)

### No CSS Framework
- Removed Tailwind CSS
- Removed PostCSS/Autoprefixer
- Full control over styling
