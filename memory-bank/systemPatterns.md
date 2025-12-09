# System Patterns: CodeReviewer AI

## Architecture Overview

The application follows a **component-based React architecture** with:
- **Monaco Editor** for code editing (center pane)
- **FileExplorer** for file management (left sidebar, 15%)
- **FileTabs** for quick file switching (above editor)
- **Thread Panel** with tab-based UI for conversations (right pane, 40%)
- **React Context + useReducer** for state management
- **Firebase Firestore** for data persistence
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
- **Choice**: `.env` file (VITE_OPENAI_API_KEY) or UI input field
- **Rationale**: Flexible for both dev setup and live demos
- **Priority**: User input > .env file

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
  files: File[],
  activeFileId: string | null,
  threads: [
    {
      id: string,
      fileId: string,  // NEW: Associates thread with file
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
- `CREATE_FILE`: Creates new file
- `UPDATE_FILE`: Updates file content
- `DELETE_FILE`: Deletes file and associated threads
- `SET_ACTIVE_FILE`: Switches active file
- `RENAME_FILE`: Renames file
- `CREATE_THREAD`: Creates new thread (now includes `fileId`)
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
    │   ├── Header ("Files" + "New" button)
    │   └── File List (click to open, delete button)
    ├── CodeEditor Area (45% width)
    │   ├── FileTabs (horizontal tabs with close buttons)
    │   └── CodeEditor
    │       ├── Monaco Editor
    │       └── "Ask AI" button (on selection only)
    └── ThreadPanel (40% width)
        ├── Tabs Bar (horizontal, line ranges for active file only)
        └── ThreadContent
            ├── Messages (user/assistant)
            └── PromptInput (auto-resizing)
```

### Component Responsibilities

**FileExplorer**
- Left sidebar (15% width)
- File list with active file highlighted
- "New" button to create files
- Delete button on each file
- Click file to open

**FileTabs**
- Tab bar above editor
- Shows all files as tabs
- Active tab highlighted
- Close button on each tab
- Click tab to switch files

**Header**
- Fixed at top
- Logo and app name
- Language selector (Radix Select)
- Settings button

**CodeEditor**
- Renders Monaco Editor
- Accepts `file` prop (not `code` string)
- Captures selection events
- Highlights active thread lines
- Provides "Ask AI" action (only on selection)
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
- **Auto-load**: Load on app initialization
- **Real-time**: Optional subscription for sync
- **Migration**: Automatically converts old format to new format

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
│   │   └── monacoConfig.ts  # NEW: Monaco configuration
│   ├── FileExplorer/ # NEW: File management sidebar
│   │   ├── FileExplorer.tsx
│   │   └── index.ts
│   ├── FileTabs/     # NEW: File tabs above editor
│   │   ├── FileTabs.tsx
│   │   └── index.ts
│   ├── ThreadPanel/   # Tab-based thread UI
│   ├── Header/       # App header with logo
│   ├── PromptInput/  # Message input
│   └── ApiKeyInput/  # Settings modal
├── services/         # Service layer
│   ├── ai/           # AI providers (OpenAI only)
│   └── firestore/    # Firestore persistence
├── store/            # State management
├── hooks/            # Custom React hooks
├── utils/            # Pure utility functions
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

## Styling Architecture

### Radix UI Components
- Dialog: Settings modal
- Select: Language selector
- Separator: Visual dividers
- DropdownMenu: (available for future use)

### Custom CSS
- Utility classes in `src/index.css`
- Layout utilities (flex, grid, spacing)
- Color utilities (gray scale, blue, red)
- Typography utilities
- Animation utilities (spin)

### No CSS Framework
- Removed Tailwind CSS
- Removed PostCSS/Autoprefixer
- Full control over styling
