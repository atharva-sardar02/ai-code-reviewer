# Multi-File Workspace Feature Plan

## Overview

Transform CodeReviewer AI from a single-file editor to a multi-file workspace where users can:
- Create, save, edit, and delete files
- Switch between files
- See only threads related to the currently open file
- Organize files in a file tree structure

## Current State

- Single `code: string` in state
- All threads visible regardless of file context
- Sample code auto-loads on first use
- Firestore stores single code string

## Target State

- Multiple files with file tree/explorer
- File tabs for quick switching
- Threads scoped to specific files
- File management (create, save, delete, rename)
- Firestore stores files array

## Architecture Changes

### 1. State Structure Changes

**Current:**
```typescript
{
  code: string,
  threads: Thread[],
  activeThreadId: string | null,
  ...
}
```

**New:**
```typescript
{
  files: File[],
  activeFileId: string | null,
  threads: Thread[],  // Each thread has fileId
  activeThreadId: string | null,
  ...
}

interface File {
  id: string
  name: string
  path: string  // e.g., "src/components/App.tsx"
  content: string
  language: string
  createdAt: number
  updatedAt: number
}

interface Thread {
  id: string
  fileId: string  // NEW: Associate thread with file
  startLine: number
  endLine: number
  messages: Message[]
  ...
}
```

### 2. Firestore Structure Changes

**Current:**
```
workspaces/default/
  ├── code: string
  ├── threads: ThreadDocument[]
  └── ...
```

**New:**
```
workspaces/default/
  ├── files: FileDocument[]
  ├── activeFileId: string | null
  ├── threads: ThreadDocument[]  // Each has fileId
  └── ...
```

### 3. UI Layout Changes

**Current:**
```
[Header]
[CodeEditor (60%)] [ThreadPanel (40%)]
```

**New:**
```
[Header]
[FileExplorer (15%)] [CodeEditor (45%)] [ThreadPanel (40%)]
```

Or with tabs:
```
[Header]
[FileTabs]
[FileExplorer (15%)] [CodeEditor (45%)] [ThreadPanel (40%)]
```

## Component Architecture

### New Components Needed

1. **FileExplorer** - Left sidebar with file tree
   - Folder/file structure
   - Create file/folder
   - Delete file/folder
   - Rename file/folder
   - Click to open file

2. **FileTabs** - Tab bar above editor
   - Shows open files
   - Active tab highlighted
   - Close button on each tab
   - Click to switch files

3. **FileContextMenu** - Right-click menu for files
   - New File
   - New Folder
   - Rename
   - Delete
   - Copy Path

### Modified Components

1. **CodeEditor** - Show active file content
   - Props: `file: File | null`
   - Update file content on change
   - Language from file.language

2. **ThreadPanel** - Filter threads by active file
   - Only show threads where `thread.fileId === activeFileId`
   - Empty state when no threads for current file

3. **App** - Manage file state
   - File creation/deletion
   - File switching
   - Active file management

## Reducer Changes

### New Actions
- `CREATE_FILE`: Create new file
- `UPDATE_FILE`: Update file content
- `DELETE_FILE`: Delete file
- `SET_ACTIVE_FILE`: Switch active file
- `RENAME_FILE`: Rename file
- `CREATE_FOLDER`: Create folder (optional)
- `DELETE_FOLDER`: Delete folder (optional)

### Modified Actions
- `CREATE_THREAD`: Now includes `fileId`
- `SET_CODE`: Replaced by `UPDATE_FILE`

## Firestore Service Changes

### New Functions
- `loadFiles()`: Load files array
- `saveFile(file)`: Save single file
- `deleteFile(fileId)`: Delete file
- `createFile(file)`: Create new file

### Modified Functions
- `loadWorkspace()`: Load files instead of code
- `saveWorkspace()`: Save files array

## File Tree Structure

### Simple Flat Structure (V1)
- All files at root level
- No folders initially
- Files have names like "App.tsx", "utils.ts"

### Future: Hierarchical Structure
- Folders with nested files
- Path-based organization
- Drag-and-drop support

## Implementation Phases

### Phase 1: Basic Multi-File (PR #9)
- Remove sample code
- Add File type to state
- Create FileExplorer component (flat list)
- Create FileTabs component
- Update CodeEditor to use active file
- Update ThreadPanel to filter by file
- Update Firestore to store files array
- Basic file operations (create, delete, switch)

### Phase 2: File Management (PR #10)
- File renaming
- File saving (auto-save + manual save)
- File creation dialog
- File deletion confirmation
- File tree with folders (optional)

### Phase 3: Advanced Features (Future)
- File search
- File tree expansion/collapse
- Drag-and-drop file organization
- File templates
- Recent files list

## Migration Strategy

### Data Migration
- On first load after update:
  - If old format (single `code`): Convert to files array with single "untitled.js" file
  - If new format: Load normally
- Preserve existing threads by assigning them to migrated file

## Testing Considerations

### New Test Cases
- File creation/deletion
- File switching
- Thread filtering by file
- File content updates
- Firestore file persistence
- Migration from old format

## UI/UX Considerations

### File Explorer
- Collapsible tree structure
- Icons for file types
- Active file highlighted
- Keyboard shortcuts (Cmd/Ctrl+N for new file)

### File Tabs
- Maximum tabs before scrolling
- Unsaved indicator (*)
- Close all except active
- Right-click context menu

### Thread Panel
- Clear indication of which file threads belong to
- Empty state: "No threads for this file"
- Thread count: "3 threads in App.tsx"

## Estimated Time

- **PR #9: Basic Multi-File Support**: 90-120 minutes
- **PR #10: File Management Polish**: 60-75 minutes
- **Total**: 2.5-3.25 hours

## Dependencies

- Requires Firestore integration (already done)
- Requires state management refactoring
- Requires UI layout changes




