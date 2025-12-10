# Product Context: AI-Powered Code Review Assistant

## Why This Project Exists

Developers often need quick, contextual feedback on specific code sections. Generic AI chat interfaces require copying code and losing context. This tool bridges that gap by creating an "inline comments meets AI assistant" experience where conversations are directly tied to code selections.

## Problems It Solves

1. **Context Loss**: Traditional AI chats require copying code snippets, losing surrounding context
2. **Inefficient Workflow**: Switching between code editor and AI chat breaks flow
3. **Generic Feedback**: AI responses don't understand which specific lines are being discussed
4. **No Conversation History**: Can't have follow-up discussions about the same code section

## How It Should Work

### User Flow
1. Developer creates a new file (via prompt) or uploads an existing file (via file picker)
2. Developer writes/pastes code into the file (or code is loaded from uploaded file)
3. Developer selects specific lines of code
4. Developer clicks "Ask AI" or uses keyboard shortcut
5. A conversation thread opens in the right panel, anchored to those lines
6. Developer asks a question about the selected code
7. AI responds with context-aware feedback (understanding surrounding code)
8. Developer can ask follow-up questions in the same thread
9. Developer can create multiple threads for different code sections (scoped to active file)
10. Developer can switch between files, seeing only threads for the active file
11. Visual indicators show which code sections have active threads

### Key Interactions

**Selection-Based Interaction:**
- User highlights any range of lines
- Selection triggers "Ask AI" action
- Selected range is visually distinct
- Selection captures: start line, end line, selected text

**Contextual AI:**
- AI receives selected code block
- AI receives surrounding code context (full file or windowed)
- AI receives line numbers of selection
- AI receives detected or specified language

**Inline Conversation Threads:**
- Each thread anchored to specific line range
- Thread displays original selection reference
- Thread shows user's question and AI's response
- Ability to add follow-up messages
- Visual connection between thread and code (line highlight, margin indicator)

**Multiple Independent Threads:**
- Users can create multiple threads on different code sections
- Threads are independent (separate conversation histories)
- Threads can be collapsed/expanded
- Clear visual distinction between different threads

## User Experience Goals

### Primary User: Individual Developer (Solo Review)
- **Goal**: Get quick, contextual feedback without leaving the code editor
- **Pain Point**: Switching tools breaks flow, losing context
- **Solution**: Inline threads that stay connected to code

### Secondary User: Evaluator/Reviewer
- **Goal**: Assess technical skills and product thinking
- **Pain Point**: Need to understand code quality and architectural decisions
- **Solution**: Clean, well-organized code with comprehensive documentation

## Design Principles

1. **Context is King**: AI must understand surrounding code, not just selection
2. **Visual Connection**: Threads must be clearly linked to their code sections
3. **Non-Blocking**: Multiple threads allow parallel discussions
4. **Developer-Friendly**: Familiar UI patterns (GitHub PR style)
5. **Fast & Responsive**: Quick feedback, minimal friction

## User Stories

### Must Have
- U1: Create and manage multiple files
- U2: Upload existing files or paste code into editor without switching tools
- U3: Select specific lines to ask targeted questions
- U4: AI understands surrounding code context
- U5: Have conversation thread about a code section
- U6: Start multiple independent discussions (scoped to file)
- U7: Switch between files and see only relevant threads

### Should Have
- U6: Visual indicators showing which sections have comments
- U7: Syntax highlighting for easier code reading

### Nice to Have
- U8: AI suggests specific code changes, not just explanations




