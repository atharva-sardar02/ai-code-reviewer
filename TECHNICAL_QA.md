# Technical Q&A: CodeReviewer AI

## Architecture & Design

**Q: Why React Context + useReducer instead of Redux or Zustand?**  
A: The prototype's complexity doesn't warrant external state management. Context + useReducer provides predictable state updates, reduces dependencies, and keeps the bundle size smaller. The state shape (files, threads, messages) is straightforward enough for this pattern.

**Q: Why Monaco Editor instead of CodeMirror or a simpler editor?**  
A: Monaco provides excellent selection APIs (`onDidChangeCursorSelection`), built-in syntax highlighting for 12+ languages, and familiar VS Code UX. The ~2MB bundle size is acceptable for a desktop-first developer tool. CodeMirror would require more custom integration work.

**Q: Why Radix UI instead of Tailwind CSS or Material UI?**  
A: Radix provides accessible, unstyled component primitives. We use custom CSS utilities for styling, giving full control without framework overhead. This avoids Tailwind's utility class bloat and Material UI's opinionated design system.

**Q: Why Firebase Firestore instead of localStorage or IndexedDB?**  
A: Firestore enables real-time sync across devices, automatic persistence, and future multi-user collaboration. The free tier (1GB storage, 50K reads/day) is sufficient for the prototype. localStorage would limit to single-device usage.

**Q: Why client-side API calls instead of a backend proxy?**  
A: Simplifies architecture (no server to maintain), reduces costs, and enables Firebase Hosting deployment. Trade-off: API keys are visible in network requests, so users must provide their own keys. This is acceptable for a prototype.

## State Management

**Q: How is state structured?**  
A: State includes `files[]` (multi-file workspace), `activeFileId`, `threads[]` (each with `fileId` for scoping), `activeThreadId`, and `apiKey`. Threads are scoped to files via `fileId`, so switching files shows only relevant threads.

**Q: How does thread scoping work?**  
A: Each thread has a `fileId` property. When a file becomes active, `ThreadPanel` filters threads by `activeFileId`. This ensures threads only appear for their associated file, preventing confusion in multi-file workspaces.

**Q: How is data persisted?**  
A: Firestore auto-saves workspace data (files, threads, messages) with 1-second debounce on state changes. Auto-loads on app initialization. Uses a single "default" workspace document, extensible to multi-user later.

## AI Integration

**Q: Why OpenAI-only? What happened to mock mode?**  
A: Mock mode was removed to simplify the codebase. The app now exclusively uses OpenAI API (gpt-4o-mini). Users must provide an API key via `.env` (`VITE_OPENAI_API_KEY`) or UI input. Priority: user input > .env file.

**Q: How does context window management work?**  
A: For files <500 lines, sends full file. For longer files, sends selection + 50 lines before/after. Very long selections are truncated with context markers. This balances context with token limits.

**Q: How are prompts built?**  
A: `promptBuilder.ts` constructs system + user messages. System message explains the code review assistant role. User message includes: selected code, surrounding context, line numbers, detected language, and user's question.

## Code Editor

**Q: Why disable Monaco's semantic validation?**  
A: Monaco's TypeScript language service shows false error indicators (red squiggles) on valid code, especially in JSX/TSX. We disabled semantic validation (`noSemanticValidation: true`) while keeping syntax validation. Configuration in `monacoConfig.ts`.

**Q: How does selection capture work?**  
A: Monaco's `onDidChangeCursorSelection` event fires on selection changes. `useSelection` hook converts Monaco's `ISelection` to `{ startLine, endLine, selectedText }`. "Ask AI" button only appears when selection exists.

**Q: How is line highlighting implemented?**  
A: Uses Monaco Decorations API. When a thread is active, adds yellow highlight decoration to its line range. Clears decorations when thread becomes inactive or is deleted. Decorations are file-specific.

## Multi-File Workspace

**Q: How was the migration from single-file to multi-file handled?**  
A: Replaced `code: string` with `files: File[]` in state. Firestore migration logic detects old format (`code` field) and converts to files array with a single file. File structure: `{ id, name, path, content, language, createdAt, updatedAt }`.

**Q: How do FileExplorer and FileTabs work together?**  
A: FileExplorer (15% left sidebar) shows all files with create/delete. FileTabs (above editor) shows open files as tabs with close buttons. Both update `activeFileId` on click. Threads filter by `activeFileId`.

**Q: What happens to threads when a file is deleted?**  
A: `DELETE_FILE` reducer action also deletes all threads with matching `fileId`. This prevents orphaned threads. Firestore service handles cascading deletes.

## Testing

**Q: What's the test coverage strategy?**  
A: Unit tests for pure functions (reducer, utilities, prompt builder) target >90% coverage. Integration tests for component interactions. Current coverage: reducer 95%, utilities 100%, hooks 83%, overall ~80%. 60+ tests passing.

**Q: How are AI services tested?**  
A: OpenAI provider is mocked in tests using Vitest. Tests verify prompt construction, error handling, and response parsing. No actual API calls in test suite.

## Performance

**Q: What's the bundle size breakdown?**  
A: Monaco Editor ~2MB, React + deps ~200KB, Radix UI ~50KB, Firebase ~200KB. Total ~2.5MB. Acceptable for desktop-first developer tool. Code splitting could be added if needed.

**Q: How is Firestore write optimization handled?**  
A: 1-second debounce on state changes prevents excessive writes. Only saves when state actually changes. Real-time subscription is optional (not enabled by default to reduce reads).

## Deployment

**Q: Why Firebase Hosting?**  
A: Free tier (10GB hosting, 360MB/day transfer) sufficient for prototype. Simple CLI deployment. Good CDN. SPA routing configured. No server required.

**Q: How are environment variables handled in production?**  
A: `.env` file is not committed. Users must provide `VITE_OPENAI_API_KEY` via `.env` or UI input. Firebase config also from `.env`. For production, users enter API key via settings modal.

## Security

**Q: How are API keys secured?**  
A: API keys stored in memory only (React state), never persisted to Firestore. Visible in browser network requests (unavoidable with client-side calls). Users must provide their own keys. For production, consider backend proxy.

**Q: What are Firestore security rules?**  
A: Currently in test mode (allow all reads/writes) for development. Production should implement authentication-based rules. Single workspace model limits exposure, but proper auth needed for multi-user.

## Known Limitations

**Q: What happens if code is edited after thread creation?**  
A: Line references may become stale. This is a documented V1 limitation. Future: could track edits and update line numbers, or lock editing while threads are active (too restrictive).

**Q: Why no mobile responsive design?**  
A: Desktop-first is acceptable for a developer tool. Mobile responsive is out of scope for V1. Monaco Editor works best on desktop anyway.

**Q: Why single workspace?**  
A: Uses "default" workspace for simplicity. Multi-workspace support can be added later by adding `workspaceId` to Firestore document path and user authentication.

---

**Summary**: This is a well-architected prototype using modern React patterns, prioritizing developer experience and maintainability. The tech stack choices balance functionality, bundle size, and development speed. Ready for production deployment with Firebase Hosting.


