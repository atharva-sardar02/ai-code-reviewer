import { useState } from 'react'
import { parseFeedback, getCategoryColor, getCategoryBgColor, getCategoryBorderColor, getCategoryLabel } from '../../utils/feedbackParser'
import type { FeedbackCategory } from '../../utils/feedbackParser'
import { useThreads } from '../../hooks/useThreads'
import { extractCodeBlocksWithLineInfo } from '../../utils/codeExtractor'
import { applyMultipleReplacements, prepareCodeFixes } from '../../utils/codeReplacer'
import type { CodeReplacement, CodeFix } from '../../utils/codeReplacer'
import { CodeFixPreviewDialog } from '../CodeFixPreviewDialog'
import { showToast } from '../Toast'

interface FeedbackBlocksProps {
  content: string
  threadId: string
  fileId: string
}

export function FeedbackBlocks({ content, threadId, fileId }: FeedbackBlocksProps) {
  console.log('🎨 FeedbackBlocks rendering with content length:', content.length)
  
  let categories: ReturnType<typeof parseFeedback>
  try {
    categories = parseFeedback(content)
  } catch (error) {
    console.error('Error parsing feedback:', error)
    categories = []
  }
  
  // Ensure categories is always an array
  if (!Array.isArray(categories)) {
    console.warn('⚠️ parseFeedback did not return an array, using empty array')
    categories = []
  }
  
  // Sort categories: errors first, then others
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.type === 'errors' && b.type !== 'errors') return -1
    if (b.type === 'errors' && a.type !== 'errors') return 1
    return 0
  })
  
  // Debug: log what we parsed
  console.log('📋 Parsed categories:', sortedCategories.length, sortedCategories)
  
  if (sortedCategories.length === 0) {
    // If no categories found, return null so fallback message shows
    console.warn('⚠️ No categories found, returning null')
    return null
  }
  
  console.log('✅ Rendering', sortedCategories.length, 'feedback blocks')
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginBottom: '1rem',
      }}
    >
      {sortedCategories.map((category, index) => (
        <FeedbackBlock 
          key={index} 
          category={category} 
          threadId={threadId}
          fileId={fileId}
        />
      ))}
    </div>
  )
}

interface FeedbackBlockProps {
  category: FeedbackCategory
  threadId: string
  fileId: string
}

function FeedbackBlock({ category, threadId, fileId }: FeedbackBlockProps) {
  const { files, threads, updateFile } = useThreads()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [pendingFixes, setPendingFixes] = useState<CodeFix[]>([])
  const [pendingReplacements, setPendingReplacements] = useState<CodeReplacement[]>([])
  
  const color = getCategoryColor(category.type)
  const bgColor = getCategoryBgColor(category.type)
  const borderColor = getCategoryBorderColor(category.type)
  const label = getCategoryLabel(category.type)
  
  const file = files.find(f => f.id === fileId)
  const thread = threads.find(t => t.id === threadId)
  
  // Check if this category has code blocks that can be applied
  const hasCodeBlocks = /```[\s\S]*?```/.test(category.content)
  
  const handleAutoFix = () => {
    if (!file || !thread) {
      showToast('Unable to find file or thread information.', 'error')
      return
    }
    
    // Get fallback range from thread selection
    const fallbackRange = {
      startLine: thread.startLine,
      endLine: thread.endLine,
    }
    
    // Extract all code blocks from the error content with line info
    const codeBlocks = extractCodeBlocksWithLineInfo(category.content, fallbackRange)
    
    if (codeBlocks.length === 0) {
      showToast('Unable to extract code fixes automatically. Please apply the fixes manually.', 'warning')
      return
    }
    
    // Build replacements from code blocks
    const replacements: CodeReplacement[] = codeBlocks
      .filter(block => block.lineRange) // Only blocks with line info
      .map(block => ({
        startLine: block.lineRange!.startLine,
        endLine: block.lineRange!.endLine,
        newCode: block.code,
      }))
    
    if (replacements.length === 0) {
      // Fallback: use the first code block with the thread's selection range
      if (codeBlocks.length > 0) {
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
      } else {
        showToast('Unable to extract code fixes automatically. Please apply the fixes manually.', 'warning')
        return
      }
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
      updateFile(fileId, newContent)
      
      // Close dialog and reset state
      setIsPreviewOpen(false)
      setPendingFixes([])
      setPendingReplacements([])
      
      // Show success message
      const fixCount = pendingReplacements.length
      showToast(`Successfully applied ${fixCount} fix${fixCount > 1 ? 'es' : ''}!`, 'success')
    } catch (error) {
      console.error('Error applying fixes:', error)
      showToast('An error occurred while applying fixes. Please try again or apply manually.', 'error')
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
          padding: '0.75rem',
          backgroundColor: bgColor,
          border: `1px solid ${borderColor}`,
          borderRadius: '0.5rem',
          borderLeft: `4px solid ${color}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: color,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {label}
          </div>
          {hasCodeBlocks && (
            <button
              onClick={handleAutoFix}
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: category.type === 'errors' ? color : '#06b6d4',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {category.type === 'errors' ? (
                  <path d="M20 6L9 17l-5-5" />
                ) : (
                  <>
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  </>
                )}
              </svg>
              {category.type === 'errors' ? 'Auto Fix' : 'Apply Code'}
            </button>
          )}
        </div>
        <div
          style={{
            fontSize: '0.875rem',
            color: '#e5e7eb',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap',
          }}
        >
          {category.content}
        </div>
      </div>
      
      {/* Code Fix Preview Dialog */}
      <CodeFixPreviewDialog
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onConfirm={handleConfirmFix}
        fixes={pendingFixes}
        fileName={file?.name || 'Unknown'}
      />
    </>
  )
}
