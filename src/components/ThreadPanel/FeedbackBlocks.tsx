import { parseFeedback, getCategoryColor, getCategoryBgColor, getCategoryBorderColor, getCategoryLabel } from '../../utils/feedbackParser'
import type { FeedbackCategory } from '../../utils/feedbackParser'
import { useThreads } from '../../hooks/useThreads'

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

function FeedbackBlock({ category, threadId: _threadId, fileId }: FeedbackBlockProps) {
  const { files, updateFile } = useThreads()
  const color = getCategoryColor(category.type)
  const bgColor = getCategoryBgColor(category.type)
  const borderColor = getCategoryBorderColor(category.type)
  const label = getCategoryLabel(category.type)
  
  const handleAutoFix = () => {
    const file = files.find(f => f.id === fileId)
    if (!file) return
    
    // Extract code fixes from the error content
    // Look for code blocks with fixes
    const codeBlockRegex = /```(?:typescript|javascript|tsx|jsx|ts|js)?\n([\s\S]*?)```/g
    const matches = [...category.content.matchAll(codeBlockRegex)]
    
    if (matches.length > 0) {
      // Use the last code block (usually the corrected version)
      const fixedCode = matches[matches.length - 1][1].trim()
      
      // Update the file with the fixed code
      updateFile(fileId, fixedCode)
      
      // Show success message
      alert('Code has been updated with the fixes!')
    } else {
      // If no code block found, try to extract fixes from the text
      // Look for patterns like "should be", "should look like", etc.
      const fixPattern = /(?:should be|should look like|corrected|fixed)[:\s]*\n?```(?:typescript|javascript|tsx|jsx|ts|js)?\n([\s\S]*?)```/i
      const fixMatch = category.content.match(fixPattern)
      
      if (fixMatch && fixMatch[1]) {
        const fixedCode = fixMatch[1].trim()
        updateFile(fileId, fixedCode)
        alert('Code has been updated with the fixes!')
      } else {
        alert('Unable to extract code fixes automatically. Please apply the fixes manually.')
      }
    }
  }
  
  return (
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
        {category.type === 'errors' && (
          <button
            onClick={handleAutoFix}
            style={{
              padding: '0.375rem 0.75rem',
              backgroundColor: color,
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
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Auto Fix
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
  )
}

