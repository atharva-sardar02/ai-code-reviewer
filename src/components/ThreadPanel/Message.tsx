import { useState } from 'react'
import type { Message as MessageType } from '../../store/types'
import { useThreads } from '../../hooks/useThreads'
import { extractCodeBlocksWithLineInfo } from '../../utils/codeExtractor'
import { applyMultipleReplacements, prepareCodeFixes } from '../../utils/codeReplacer'
import type { CodeReplacement, CodeFix } from '../../utils/codeReplacer'
import { CodeFixPreviewDialog } from '../CodeFixPreviewDialog'
import { showToast } from '../Toast'

interface MessageProps {
  message: MessageType
  threadId?: string
  fileId?: string
}

export function Message({ message, threadId, fileId }: MessageProps) {
  const isUser = message.role === 'user'
  const { files, threads, updateFile } = useThreads()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [pendingFixes, setPendingFixes] = useState<CodeFix[]>([])
  const [pendingReplacements, setPendingReplacements] = useState<CodeReplacement[]>([])
  
  // Check if this assistant message has code blocks
  const hasCodeBlocks = !isUser && /```[\s\S]*?```/.test(message.content)
  
  const file = fileId ? files.find(f => f.id === fileId) : null
  const thread = threadId ? threads.find(t => t.id === threadId) : null
  
  const handleApplyCode = () => {
    if (!file || !thread) {
      showToast('Unable to find file or thread information.', 'error')
      return
    }
    
    // Get fallback range from thread selection
    const fallbackRange = {
      startLine: thread.startLine,
      endLine: thread.endLine,
    }
    
    // Extract all code blocks from the message with line info
    const codeBlocks = extractCodeBlocksWithLineInfo(message.content, fallbackRange)
    
    if (codeBlocks.length === 0) {
      showToast('Unable to extract code from this message.', 'warning')
      return
    }
    
    // Build replacements from code blocks
    const replacements: CodeReplacement[] = codeBlocks
      .filter(block => block.lineRange)
      .map(block => ({
        startLine: block.lineRange!.startLine,
        endLine: block.lineRange!.endLine,
        newCode: block.code,
      }))
    
    if (replacements.length === 0 && codeBlocks.length > 0) {
      // Fallback: use the first code block with the thread's selection range
      const codeBlock = codeBlocks[0]
      const selectionLineCount = fallbackRange.endLine - fallbackRange.startLine + 1
      const codeBlockLineCount = codeBlock.code.split('\n').length
      
      // Warn if AI returned way more code than selected
      if (codeBlockLineCount > selectionLineCount * 3) {
        showToast('AI returned more code than expected. The fix may not apply correctly. Please review carefully or apply manually.', 'warning')
      }
      
      replacements.push({
        startLine: fallbackRange.startLine,
        endLine: fallbackRange.endLine,
        newCode: codeBlock.code,
      })
    }
    
    // Prepare fixes for preview
    const fixes = prepareCodeFixes(file.content, replacements)
    
    // Check if there are any valid fixes after filtering
    if (fixes.length === 0) {
      showToast('No changes to apply. The code is already up to date.', 'info')
      return
    }
    
    // Show preview dialog
    setPendingFixes(fixes)
    setPendingReplacements(replacements)
    setIsPreviewOpen(true)
  }
  
  const handleConfirmFix = () => {
    if (!file || pendingReplacements.length === 0) {
      setIsPreviewOpen(false)
      return
    }
    
    try {
      // Apply all replacements
      const newContent = applyMultipleReplacements(file.content, pendingReplacements)
      
      // Update the file
      updateFile(fileId!, newContent)
      
      // Close dialog and reset state
      setIsPreviewOpen(false)
      setPendingFixes([])
      setPendingReplacements([])
      
      // Show success message
      const fixCount = pendingReplacements.length
      showToast(`Successfully applied ${fixCount} change${fixCount > 1 ? 's' : ''}!`, 'success')
    } catch (error) {
      console.error('Error applying code:', error)
      showToast('An error occurred while applying the code. Please try again or apply manually.', 'error')
      setIsPreviewOpen(false)
    }
  }
  
  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    setPendingFixes([])
    setPendingReplacements([])
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          marginBottom: '0.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '85%',
            borderRadius: isUser ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
            padding: '0.875rem 1rem',
            background: isUser 
              ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
              : 'rgba(26, 34, 52, 0.8)',
            color: isUser ? '#ffffff' : '#e2e8f0',
            border: isUser 
              ? 'none'
              : '1px solid rgba(148, 163, 184, 0.1)',
            boxShadow: isUser 
              ? '0 2px 8px rgba(6, 182, 212, 0.2)'
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              fontSize: '0.6875rem',
              fontWeight: 600,
              marginBottom: '0.375rem',
              opacity: isUser ? 0.9 : 0.7,
              letterSpacing: '0.025em',
              textTransform: 'uppercase',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isUser ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  You
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2M7.5 13A1.5 1.5 0 0 0 6 14.5 1.5 1.5 0 0 0 7.5 16 1.5 1.5 0 0 0 9 14.5 1.5 1.5 0 0 0 7.5 13m9 0a1.5 1.5 0 0 0-1.5 1.5 1.5 1.5 0 0 0 1.5 1.5 1.5 1.5 0 0 0 1.5-1.5 1.5 1.5 0 0 0-1.5-1.5" />
                  </svg>
                  AI Assistant
                </>
              )}
            </div>
            
            {/* Apply Code button for assistant messages with code blocks */}
            {hasCodeBlocks && threadId && fileId && (
              <button
                onClick={handleApplyCode}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#06b6d4',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  textTransform: 'none',
                  letterSpacing: 'normal',
                  opacity: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0891b2'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#06b6d4'
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
                Apply Code
              </button>
            )}
          </div>
          <div
            style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              fontSize: '0.875rem',
              lineHeight: '1.6',
            }}
          >
            {message.content}
          </div>
        </div>
      </div>
      
      {/* Code Fix Preview Dialog */}
      {hasCodeBlocks && file && (
        <CodeFixPreviewDialog
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
          onConfirm={handleConfirmFix}
          fixes={pendingFixes}
          fileName={file.name}
        />
      )}
    </>
  )
}
