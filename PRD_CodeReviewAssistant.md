# Product Requirements Document
## AI-Powered Code Review Assistant

**Version:** 1.0 Final  
**Last Updated:** November 2025  
**Status:** Approved

---

## 1. Executive Summary

Build a standalone web application that enables developers to get AI-powered, contextual feedback on specific sections of their code. Unlike generic AI chat interfaces, this tool ties conversations directly to code selections, creating an "inline comments meets AI assistant" experience.

**Primary Goal:** Demonstrate a working prototype that shows how AI can enhance the code review workflow through block-level, contextual interactions.

**Time Constraint:** ~5-6 hours total development time.

---

## 2. User Stories

### Primary User: Individual Developer (Solo Review)

| ID | Story | Priority |
|----|-------|----------|
| U1 | As a developer, I want to paste my code into an editor so I can get AI feedback without switching tools | Must Have |
| U2 | As a developer, I want to select specific lines of code so that I can ask targeted questions about that section | Must Have |
| U3 | As a developer, I want the AI to understand the surrounding code context, not just my selection, so I get relevant suggestions | Must Have |
| U4 | As a developer, I want to have a conversation thread about a code section so I can ask follow-up questions | Must Have |
| U5 | As a developer, I want to start multiple independent discussions about different parts of my code so I can review various concerns separately | Must Have |
| U6 | As a developer, I want to see visual indicators showing which code sections have comments so I can track my review progress | Should Have |
| U7 | As a developer, I want syntax highlighting so I can read code more easily | Should Have |
| U8 | As a developer, I want the AI to suggest specific code changes, not just explanations, so I can implement fixes faster | Nice to Have |

### Secondary User: Evaluator/Reviewer

| ID | Story | Priority |
|----|-------|----------|
| E1 | As an evaluator, I want to see clean, well-organized code so I can assess the candidate's technical skills | Must Have |
| E2 | As an evaluator, I want to understand the architectural decisions through documentation so I can assess product thinking | Must Have |
| E3 | As an evaluator, I want to see how the application handles edge cases so I can assess robustness | Should Have |

---

## 3. Key Features for V1

### 3.1 Code Editor Interface
- Text input area with syntax highlighting
- Line numbers displayed
- Support for pasting/writing code
- Language-agnostic (works with any text)

### 3.2 Selection-Based Interaction
- User can highlight/select any range of lines
- Selection triggers an action (button or keyboard shortcut) to "Ask AI"
- Selected range is visually distinct
- Selection captures: start line, end line, selected text

### 3.3 Contextual AI Integration
- AI receives:
  - The selected code block
  - Surrounding code context (full file or windowed)
  - Line numbers of selection
  - Detected or specified language (if feasible)
- User can type a specific question/prompt
- AI responses are displayed inline with the code

### 3.4 Inline Conversation Threads
- Each thread is anchored to a specific line range
- Thread displays:
  - The original selection (or reference to it)
  - User's question
  - AI's response
  - Ability to add follow-up messages
- Visual connection between thread and code (e.g., line highlight, margin indicator)

### 3.5 Multiple Independent Threads
- Users can create multiple threads on different code sections
- Threads are independent (separate conversation histories)
- Threads can be collapsed/expanded
- Clear visual distinction between different threads

---

## 4. Tech Stack (Finalized)

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Framework** | React 18+ | Familiar, excellent for component-based UI, strong state management options |
| **Code Editor** | Monaco Editor | VS Code's editor, excellent selection APIs, built-in syntax highlighting for 50+ languages |
| **Styling** | Tailwind CSS | Fast prototyping, utility-first, no fighting with CSS specificity |
| **State Management** | React Context + useReducer | Sufficient for prototype complexity, no extra dependencies |
| **AI API** | Anthropic Claude API | Strong code understanding, good context windows |
| **Build Tool** | Vite | Fast HMR, simple setup, modern defaults |
| **Deployment** | Firebase Hosting | Free tier sufficient, simple CLI deployment, good CDN |

### Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Thread UI Placement** | Right-side panel (GitHub PR style) | Familiar to developers, easier to implement than inline popups |
| **Code Editing Post-Thread** | Allow edits, accept stale line references | Locking edits too restrictive; documented as V1 limitation |
| **API Key Handling** | Both `.env` and UI input field | Flexible for both dev setup and live demos |
| **Mock Mode** | Simple toggle with canned responses | Demonstrates flow without requiring API key |

### Pitfalls & Considerations

**Monaco Editor:**
- Powerful but heavy (~2MB). Acceptable for prototype, but load time may be noticeable.
- Selection API is well-documented but has a learning curve. Budget 30-45 min to understand `ISelection` and `IRange`.
- Handles line numbers automatically, which saves significant time.

**Firebase Hosting:**
- Static hosting only—no server-side code. API calls must go directly to Anthropic from the client.
- API key exposure risk: If using client-side API calls, the key is visible in network requests. Mitigations:
  - For demo: Accept the risk, use a low-limit API key.
  - For production: Would need Firebase Functions or a separate backend (out of scope for V1).
- Free tier includes 10GB hosting, 360MB/day transfer—more than sufficient for prototype.
- Custom domain support available if needed.

**AI API:**
- Using Anthropic Claude API with mock fallback for demos without API key.
- Structured for easy provider swap (dependency injection pattern).

---

## 5. Out of Scope for V1

The following features are explicitly excluded from the first version to stay within time constraints:

| Feature | Reason for Exclusion |
|---------|---------------------|
| **File upload/multi-file support** | Adds complexity; single code block is sufficient for prototype |
| **Persistent storage/database** | Not required; in-memory state is fine for demo |
| **User authentication** | Standalone app, no users to authenticate |
| **Team collaboration/real-time sync** | Significantly increases complexity; note in README as future consideration |
| **Code execution/sandboxing** | Security concerns, out of scope |
| **Diff view for AI suggestions** | Nice to have but time-intensive; can be noted as future work |
| **Export/report generation** | Low priority for core demo |
| **Undo/redo for code edits** | Monaco/CodeMirror handle this; no custom implementation needed |
| **Mobile responsive design** | Developer tool, desktop-first is acceptable |
| **Accessibility (full WCAG compliance)** | Important but time-constrained; note as future work |
| **Conversation history persistence** | Threads exist in session only |
| **Automatic language detection** | Can hardcode or use simple heuristics; full detection is bonus |

---

## 6. Technical Considerations & Risks

### State Management Complexity
**Challenge:** Multiple threads, each with their own message history, anchored to potentially overlapping line ranges.

**Proposed Structure:**
```
{
  code: string,
  threads: [
    {
      id: string,
      startLine: number,
      endLine: number,
      messages: [{ role: 'user' | 'assistant', content: string }],
      isExpanded: boolean
    }
  ],
  activeThreadId: string | null
}
```

**Risk:** If user edits code after creating threads, line numbers may become stale.  
**Mitigation for V1:** Either disable code editing after first thread is created, or accept stale references with a note in README.

### Context Window Management
**Challenge:** Very long files may exceed AI context limits or become expensive.

**Mitigation:** 
- Send full file if under 500 lines
- For longer files, send selection + 50 lines before/after as context
- Document this limitation

### Selection Edge Cases
**Challenge:** What happens with:
- Zero-length selections (cursor only)?
- Selections spanning entire file?
- Overlapping thread ranges?

**Mitigation:**
- Require minimum 1 line selected
- Allow full-file selection (it's valid use case)
- Allow overlapping ranges (threads are independent)

### API Key Handling
**Challenge:** User needs to provide their own API key for AI integration.

**Options:**
1. Environment variable (`.env` file) — developer-friendly
2. UI input field — user-friendly for demo
3. Mock mode toggle — for evaluation without API key

**Recommendation:** Support both `.env` and UI input, with clear mock mode fallback.

---

## 7. Success Criteria

The prototype is successful if:

1. ✅ A user can paste code and see it with syntax highlighting
2. ✅ A user can select lines and initiate an AI conversation about that selection
3. ✅ The AI response demonstrates awareness of surrounding context
4. ✅ A user can have a multi-turn conversation within a thread
5. ✅ A user can create multiple independent threads
6. ✅ Threads are visually connected to their code ranges
7. ✅ Code is clean, well-organized, and documented
8. ✅ README explains setup, decisions, and trade-offs
9. ✅ Application is deployed and accessible via Firebase Hosting URL

---

## 8. Deployment (Firebase Hosting)

### Setup Requirements
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created in Firebase Console
- Firebase initialized in project (`firebase init`)

### Deployment Process
```bash
# 1. Build the production bundle
npm run build

# 2. Deploy to Firebase
firebase deploy --only hosting
```

### Firebase Configuration

**firebase.json:**
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

### Environment Variables for Deployment

Since Firebase Hosting is static-only, API keys must be handled client-side:

| Approach | Pros | Cons |
|----------|------|------|
| **Build-time injection** | Key not in source code | Key still visible in built JS |
| **Runtime UI input** | User provides own key | Friction for demo |
| **Mock mode default** | No key needed for demo | Limited functionality |

**Recommendation for V1:** Default to mock mode on deployed version. Allow users to input their own API key via UI for full functionality. This avoids exposing a shared API key while still demonstrating the complete flow.

### Security Considerations
- No sensitive API keys committed to repository
- `.env` file in `.gitignore`
- Deployed version uses mock mode by default
- Users can optionally provide their own API key (stored in memory only, not persisted)

### Deployment Checklist
- [ ] Firebase project created
- [ ] `firebase.json` configured
- [ ] `.firebaserc` with project ID
- [ ] Production build tested locally (`npm run build && npm run preview`)
- [ ] Environment variables handled appropriately
- [ ] Mock mode working without API key
- [ ] Deploy and verify live URL

---

## 9. Proposed File Structure

```
code-review-assistant/
├── public/
├── src/
│   ├── components/
│   │   ├── CodeEditor/
│   │   │   ├── CodeEditor.tsx
│   │   │   └── useSelection.ts
│   │   ├── ThreadPanel/
│   │   │   ├── ThreadPanel.tsx
│   │   │   ├── Thread.tsx
│   │   │   └── Message.tsx
│   │   ├── PromptInput/
│   │   │   └── PromptInput.tsx
│   │   └── ApiKeyInput/
│   │       └── ApiKeyInput.tsx
│   ├── services/
│   │   ├── ai/
│   │   │   ├── index.ts
│   │   │   ├── anthropic.ts
│   │   │   └── mock.ts
│   │   └── context/
│   │       └── buildPrompt.ts
│   ├── store/
│   │   ├── ThreadContext.tsx
│   │   └── types.ts
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── .firebaserc
├── firebase.json
├── README.md
├── package.json
└── vite.config.ts
```

---

## 10. Implementation Plan

### Phase 1: Project Setup & Core UI (1-1.5 hours)
- [ ] Scaffold Vite + React + TypeScript project
- [ ] Install dependencies (Monaco, Tailwind)
- [ ] Configure Tailwind
- [ ] Create basic layout (editor left, panel right)
- [ ] Integrate Monaco Editor with basic config
- [ ] Implement selection capture hook

### Phase 2: State Management & Threads (1-1.5 hours)
- [ ] Define TypeScript types for state
- [ ] Create ThreadContext with useReducer
- [ ] Build Thread and Message components
- [ ] Implement thread creation from selection
- [ ] Add visual indicators for thread line ranges

### Phase 3: AI Integration (1.5-2 hours)
- [ ] Create AI service abstraction layer
- [ ] Implement mock provider
- [ ] Implement Anthropic provider
- [ ] Build context/prompt construction logic
- [ ] Create API key input UI
- [ ] Wire up conversation flow

### Phase 4: Polish & Deployment (1-1.5 hours)
- [ ] Handle loading states
- [ ] Add error handling
- [ ] Edge case handling (empty selection, very long code)
- [ ] Initialize Firebase project
- [ ] Configure firebase.json
- [ ] Build and deploy
- [ ] Write README documentation

### Total Estimated Time: 5-6.5 hours
