# Active Context: CodeReviewer AI

## Current Status

**Phase**: Production Deployed - Live and Operational  
**Date**: December 2025  
**App Name**: CodeReviewer AI  
**Status**: ✅ Successfully deployed to Firebase Hosting

## Current Work Focus

The project is now feature-complete with:
- Full Vite + React + TypeScript setup with Radix UI + Custom CSS
- Monaco Editor integrated with selection handling and line highlighting
- Fixed header with logo and branding
- **Multi-file workspace** with FileExplorer and FileTabs
- Tab-based thread UI (Cursor-style) scoped to active file
- Split-pane layout (15% FileExplorer / 37% CodeEditor / 48% ThreadPanel)
- Complete state management with React Context + useReducer
- Firebase Firestore integration for data persistence
- Full UI for threads: ThreadPanel with tabs, ThreadContent, Message, and PromptInput components
- "Ask AI" button (only visible on selection)
- Thread creation flow fully wired
- Line highlighting for active threads
- Delete thread functionality
- **OpenAI-only AI service** (mock mode removed)
- Real-time data sync with Firestore
- **Monaco Editor configured** to prevent false error indicators

## Recent Major Changes

### AI Code Auto-Fix System (December 2025)
- ✅ **Code Extraction Utilities**: `codeExtractor.ts` for parsing AI responses
  - Strip line numbers from AI-generated code (multiple formats supported)
  - Strip explanatory comments (e.g., "// fixed", "// changed X to Y")
  - Extract line references from AI explanations
  - Extract code blocks with associated line info
- ✅ **Code Replacement Utilities**: `codeReplacer.ts` for applying changes
  - Replace specific line ranges in file content
  - Apply multiple replacements with overlap handling
  - Prepare and filter code fixes
  - Detect when AI returns entire file instead of selection
- ✅ **Code Fix Preview Dialog**: `CodeFixPreviewDialog.tsx`
  - GitHub-style unified diff view with line numbers
  - Shows removed lines (−) and added lines (+) with syntax highlighting
  - Summary section showing number of changes and lines affected
  - Apply All / Cancel actions
- ✅ **Auto Fix Buttons**: Integrated into FeedbackBlocks and Message components
  - "Auto Fix" button for error categories (red)
  - "Apply Code" button for suggestions/improvements and follow-up responses (cyan)
  - Works for both initial code review and follow-up conversations
- ✅ **Custom Toast Notifications**: Replaced all browser `alert()` dialogs
  - `Toast.tsx` component with success/error/warning/info types
  - Glass-morphism styled notifications
  - Auto-dismiss with smooth animations
  - Stacking support for multiple toasts

### Scoped AI Review System (December 2025)
- ✅ **Selection-Only Review**: AI now ONLY reviews the selected code portion
  - Initial feedback sends ONLY selected code (no full file context)
  - Fixed line number indexing (Monaco 1-indexed → array 0-indexed)
  - Fixed initial feedback detection (`conversationHistory.length <= 1`)
- ✅ **Prompt Simplification**: Streamlined prompts to prevent AI distraction
  - System prompt: Just role and format instructions, no code
  - User prompt: Only selected code for initial review
  - Follow-up prompts: Full file for context when needed
- ✅ **Comment Stripping**: Auto-remove AI explanatory comments
  - `stripExplanatoryComments()` removes "// fixed", "// changed", etc.
  - Applied to all extracted code blocks before applying fixes

### Custom Dialog Components (December 2025)
- ✅ **NewFileDialog**: Custom styled dialog replacing browser's native `prompt()`
  - Matches app's glass-morphism aesthetic
  - Integrated into FileExplorer and App landing page

### Multi-File Workspace (PR #9)
- ✅ **File System**: Replaced single `code` string with `files` array
- ✅ **FileExplorer Component**: Left sidebar (15%) with file list, create/delete buttons, open file indicators
- ✅ **FileTabs Component**: Tab bar above editor showing OPEN files only with close buttons
- ✅ **Tab Management**: Separate `openFileIds` state - closing tabs doesn't delete files
- ✅ **Session-based Tabs**: openFileIds not persisted - all tabs closed on reload
- ✅ **File Management**: Create, edit, delete, rename, open, close files
- ✅ **Thread Scoping**: Threads now associated with `fileId` - only show threads for active file
- ✅ **Firestore Migration**: Updated to store files array, with migration from old format
- ✅ **Sample Code Removed**: No more auto-loading sample code, starts with landing page

### OpenAI-Only Implementation
- ✅ **Removed Mock Mode**: Completely removed mock provider and mode toggle
- ✅ **OpenAI Only**: Application now exclusively uses OpenAI API
- ✅ **API Key Security**: Removed API key input from UI for security (only uses `VITE_OPENAI_API_KEY` from `.env` at build time)
- ✅ **Auto-Initialize**: API key automatically loaded from `.env` on app start
- ✅ **Settings Modal**: Shows read-only API key status (configured/not configured)

### Monaco Editor Improvements
- ✅ **False Error Fix**: Disabled semantic validation to prevent red squiggles on valid code
- ✅ **Monaco Configuration**: Created `monacoConfig.ts` to configure TypeScript/JavaScript language service
- ✅ **Error Decorations**: Disabled validation decorations (`renderValidationDecorations: 'off'`)
- ✅ **JSX Support**: Properly configured for React/JSX/TSX files

### UI/UX Improvements (Previous)
- ✅ **Switched from Tailwind CSS to Radix UI + Custom CSS**: Removed Tailwind, installed Radix UI components
- ✅ **Fixed Header**: Made header fixed at top, fixed button overlap issues, added proper spacing
- ✅ **Tab-Based Thread UI**: Redesigned threads to use horizontal tabs (like Cursor IDE) instead of vertical list
- ✅ **Improved Prompt Input**: Made input more compact with auto-resizing textarea
- ✅ **Selection-Based "Ask AI" Button**: Button only appears when code is selected
- ✅ **App Rebranding**: Renamed to "CodeReviewer AI" and added logo support

### Data Persistence
- ✅ **Firebase Firestore Integration**: 
  - Installed Firebase SDK
  - Created Firestore service layer (`src/services/firestore/`)
  - Integrated with ThreadContext for automatic save/load
  - Data persists: files, threads, messages, active file, active thread
  - Real-time sync with 1-second debounce
  - Migration logic for old single-file format

### File Upload Feature
- ✅ **File Upload Support**: Added ability to upload files directly from FileExplorer
- ✅ **Dropdown Menu**: "New" button now shows dropdown with "Create New File" and "Upload File" options
- ✅ **File Reading**: Uses FileReader API to read uploaded file content
- ✅ **Language Detection**: Automatically detects language from file extension
- ✅ **Auto-Activation**: Uploaded files are automatically set as active file
- ✅ **Supported Formats**: Accepts common code file extensions (.ts, .tsx, .js, .jsx, .py, .java, .cpp, .go, .rs, etc.)

### Elegant UI Redesign (December 2025)
- ✅ **Design System**: Complete CSS variable-based design system with modern aesthetics
- ✅ **Typography**: Plus Jakarta Sans for UI, JetBrains Mono for code
- ✅ **Color Palette**: Cyan/Teal accent (#06b6d4) with dark theme gradients
- ✅ **Glass-morphism**: Backdrop blur effects on header, modals, dropdowns
- ✅ **Animations**: Smooth fadeIn, slideIn, glow animations throughout
- ✅ **Header**: Gradient background, logo glow effect, "Intelligent Code Analysis" subtitle
- ✅ **FileExplorer**: Color-coded file icons, elegant empty state, animated dropdown, open file indicators
- ✅ **FileTabs**: Cyan accent for active tab, smooth hover transitions
- ✅ **ThreadPanel**: Step-by-step instructions in empty state, line badges with accent styling
- ✅ **Messages**: User messages with cyan gradient bubbles, AI messages with dark background, role icons
- ✅ **PromptInput**: Elegant input container with border glow, gradient send button with icon
- ✅ **Ask AI Button**: Cyan gradient with shadow, robot icon, hover lift effect
- ✅ **Settings Modal**: Glass-morphism dialog, API key status indicator, About section
- ✅ **Custom Scrollbars**: Styled scrollbars matching the dark theme

### Tab Management System (December 2025)
- ✅ **Open File Tracking**: Separate `openFileIds` state to track which files are open in tabs
- ✅ **OPEN_FILE Action**: Opens file in tab and sets as active
- ✅ **CLOSE_FILE Action**: Closes tab without deleting file (file remains in FileExplorer)
- ✅ **LOAD_FILE Action**: Loads files from Firestore without opening in tabs
- ✅ **Session-based Tabs**: `openFileIds` not persisted - all tabs close on reload
- ✅ **File Persistence**: Files and conversations persist, but open tabs don't
- ✅ **FileExplorer Integration**: Click file to open in tab, cyan dot indicator for open files
- ✅ **FileTabs Update**: Shows only open files, close button removes from tabs not deletes

### Landing Page Improvements (December 2025)
- ✅ **Shows When No Files Open**: Landing page displays when `openFileIds` is empty (not when files array is empty)
- ✅ **Thread Panel Hidden**: Chat/thread section hidden on landing page for cleaner look
- ✅ **Dual Action Buttons**: Two buttons side by side on landing page:
  - "Create New" - Primary cyan gradient button to create new file
  - "Upload File" - Secondary outlined button to upload existing file
- ✅ **Enhanced Visual Design**: Decorative background elements, welcome text, getting started steps
- ✅ **Centered Layout**: Buttons properly centered with flexbox layout

### Layout Adjustments (December 2025)
- ✅ **Thread Panel Width**: Increased from 38% to 48% (+10% from editor)
- ✅ **Thread Panel Min Width**: Increased from 320px to 380px
- ✅ **Thread Panel Max Width**: Increased from 500px to 600px
- ✅ **Editor Width**: Reduced by 10% to accommodate larger thread panel

## Implementation Status

### Completed PRs
- ✅ **PR #1**: Project Scaffolding & Configuration
- ✅ **PR #2**: Core Layout & Monaco Editor Integration
- ✅ **PR #3**: State Management & Type Definitions
- ✅ **PR #4**: Thread UI Components
- ✅ **PR #5**: AI Service Layer (OpenAI provider)
- ✅ **PR #6**: AI Integration & Conversation Flow
- ✅ **PR #7**: Polish, Edge Cases & Documentation (partial)
- ✅ **PR #9**: Multi-File Workspace Support
- ✅ **Firestore Integration**: Data persistence layer
- ✅ **OpenAI-Only**: Removed mock mode

### Current Architecture

**Styling**: Radix UI components + Elegant Custom CSS Design System
- Removed: Tailwind CSS, PostCSS, Autoprefixer
- Added: @radix-ui/react-dialog, @radix-ui/react-select, @radix-ui/react-separator, @radix-ui/react-dropdown-menu
- Fonts: Plus Jakarta Sans (UI), JetBrains Mono (code) via Google Fonts
- Custom CSS: Complete design system in `src/index.css` with:
  - CSS variables for colors, shadows, transitions, spacing
  - Cyan/Teal accent color palette (#06b6d4)
  - Glass-morphism effects with backdrop blur
  - Smooth animations (fadeIn, slideIn, glow)
  - Button variants (primary, secondary, ghost)
  - Custom scrollbar styling

**AI Code Auto-Fix**: Intelligent code replacement system
- Code Extraction: `src/utils/codeExtractor.ts`
- Code Replacement: `src/utils/codeReplacer.ts`
- Preview Dialog: `src/components/CodeFixPreviewDialog/`
- Toast Notifications: `src/components/Toast/`

**Data Persistence**: Firebase Firestore
- Collection: `workspaces` with `default` document
- Auto-saves: files, threads, messages, active file, active thread
- Auto-loads: On app initialization
- Real-time: Optional subscription for multi-device sync
- Migration: Automatically converts old single-file format to new files array

**File System**: Multi-file workspace with tab management
- Files stored in `files` array in state (persisted to Firestore)
- `openFileIds` array tracks which files are open in tabs (not persisted)
- Each file has: `id`, `name`, `path`, `content`, `language`, `createdAt`, `updatedAt`
- FileExplorer: Left sidebar for file management, click to open files
- FileTabs: Tab bar showing open files, close tabs without deleting files
- Threads scoped to files via `fileId`
- On reload: Files persist, tabs are cleared (fresh session)

**Thread UI**: Tab-based interface scoped to active file
- Horizontal tabs at top showing line ranges for active file only
- Active tab highlighted with cyan accent border and glow
- Line badges with accent styling (L1-10)
- Close button on each tab with hover effects
- Content area below shows active thread messages and input
- Elegant empty state with step-by-step instructions

**AI Service**: OpenAI-only
- Uses OpenAI API exclusively
- API key from `.env` or user input
- No mock mode

## Active Decisions & Considerations

### Key Decisions Made
1. **Right-side panel** for threads (GitHub PR style) - ✅ Implemented
2. **Tab-based thread UI** (Cursor-style) - ✅ Implemented
3. **Radix UI for components** - ✅ Implemented (replaced Tailwind)
4. **Firebase Firestore for persistence** - ✅ Implemented
5. **Selection-based "Ask AI" button** - ✅ Implemented
6. **Fixed header** - ✅ Implemented
7. **OpenAI API** (removed Anthropic) - ✅ Implemented
8. **App name: CodeReviewer AI** - ✅ Implemented
9. **Multi-file workspace** - ✅ Implemented
10. **OpenAI-only** (removed mock mode) - ✅ Implemented
11. **Monaco Editor false error fix** - ✅ Implemented
12. **File upload support** - ✅ Implemented
13. **API key security** - ✅ Removed UI input, only uses environment variable
14. **Elegant UI redesign** - ✅ Modern design with cyan accents, glass-morphism, animations
15. **Session-based tabs** - ✅ openFileIds not persisted, tabs cleared on reload
16. **Close tab ≠ Delete file** - ✅ Closing tabs keeps files, cleaner UX
17. **Landing page on empty tabs** - ✅ Shows welcome when no files open, hides chat
18. **Wider thread panel** - ✅ 48% width for better AI conversation readability
19. **AI Auto-Fix** - ✅ One-click code application from AI suggestions
20. **Custom dialogs** - ✅ Replaced browser prompts/alerts with styled components
21. **Toast notifications** - ✅ Glass-morphism styled notifications replacing browser alerts
22. **Scoped AI review** - ✅ AI only reviews selected code, not entire file
23. **Line number fix** - ✅ Fixed 1-indexed (Monaco) to 0-indexed (array) conversion
24. **Initial feedback fix** - ✅ Fixed detection to use `<= 1` instead of `=== 0`

### Technical Decisions
- **Radix UI**: Accessible component primitives, no utility CSS framework
- **Custom CSS**: Utility classes for layout and styling
- **Firebase Firestore**: Real-time database for data persistence
- **Multi-File Workspace**: Files array instead of single code string
- **Thread Scoping**: Threads associated with files via `fileId`
- **Single Workspace**: Using "default" workspace (can be extended for multi-user)
- **Debounced Saves**: 1-second debounce to reduce Firestore writes
- **OpenAI-Only**: Simplified to single AI provider
- **Monaco Config**: Disabled semantic validation to prevent false errors

### Open Questions
- None - all major decisions documented and implemented

### Trade-offs Accepted
1. **Monaco Editor size** (~2MB) - acceptable for prototype ✅
2. **Client-side API calls** - API key visible in network (user must provide their own key)
3. **Firestore persistence** - Data saved automatically ✅
4. **Desktop-first** - mobile responsive out of scope
5. **Single workspace** - multi-user support can be added later
6. **No mock mode** - requires OpenAI API key to use

## Current Blockers

None - ready for production deployment.

## Testing Status

### Test Coverage
- ✅ **threadReducer.ts**: 95% coverage (updated for files and fileId)
- ✅ **lineUtils.ts**: 100% coverage
- ✅ **useThreads.ts**: 83% coverage (updated for file management)
- ✅ **AI Services**: OpenAI provider tested
- ✅ **UI Components**: Thread, ThreadPanel, PromptInput tested
- ⚠️ **File Components**: FileExplorer and FileTabs need tests (future work)

### Test Files
- ✅ All core functionality tested
- ✅ Integration tests for UI components
- ✅ Unit tests for services and utilities
- ⚠️ File management tests pending

## Next Steps

### Immediate Next Steps
1. Production deployment to Firebase Hosting
2. Final UI polish and testing
3. Documentation updates

### Future Enhancements
- Multi-workspace support
- User authentication
- Real-time collaboration
- Mobile responsive design
- File search and filtering
- File tree with folders
- File templates
