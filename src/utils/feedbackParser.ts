/**
 * Types for categorized feedback
 */
export interface FeedbackCategory {
  type: 'suggestions' | 'improvements' | 'explanations' | 'errors'
  content: string
}

/**
 * Parses AI response to extract categorized feedback blocks
 * 
 * Looks for category headers like:
 * - ### SUGGESTIONS: ...
 * - **SUGGESTIONS**: ...
 * - ### IMPROVEMENTS: ...
 * - **IMPROVEMENTS**: ...
 * - etc.
 * 
 * @param response - The AI response text
 * @returns Array of categorized feedback blocks
 */
export function parseFeedback(response: string): FeedbackCategory[] {
  const categories: FeedbackCategory[] = []
  
  // Patterns to match category headers (supports both markdown headers ### and bold **)
  // Handles with or without colons, and optional whitespace/newlines
  const patterns = [
    { type: 'errors' as const, regex: /###\s*ERRORS?:?\s*\n+/i }, // Errors first (priority)
    { type: 'suggestions' as const, regex: /###\s*SUGGESTIONS?:?\s*\n+/i },
    { type: 'improvements' as const, regex: /###\s*IMPROVEMENTS?:?\s*\n+/i },
    { type: 'explanations' as const, regex: /###\s*EXPLANATIONS?:?\s*\n+/i },
    { type: 'suggestions' as const, regex: /###\s*BEST\s+PRACTICES?:?\s*\n+/i }, // Best practices as suggestions
    // Also support bold format
    { type: 'errors' as const, regex: /\*\*ERRORS?\*\*:?\s*\n+/i },
    { type: 'suggestions' as const, regex: /\*\*SUGGESTIONS?\*\*:?\s*\n+/i },
    { type: 'improvements' as const, regex: /\*\*IMPROVEMENTS?\*\*:?\s*\n+/i },
    { type: 'explanations' as const, regex: /\*\*EXPLANATIONS?\*\*:?\s*\n+/i },
  ]
  
  // Debug: log the response to see what we're parsing
  console.log('🔍 Parsing feedback response (first 500 chars):', response.substring(0, 500))
  
  // Find all category positions first
  const categoryPositions: Array<{ type: FeedbackCategory['type']; index: number; headerLength: number }> = []
  
  for (const pattern of patterns) {
    const regex = new RegExp(pattern.regex.source, 'gi')
    let match: RegExpExecArray | null
    // Reset lastIndex to avoid issues with global regex
    regex.lastIndex = 0
    while ((match = regex.exec(response)) !== null) {
      // Avoid duplicates - check if we already have this position
      const existing = categoryPositions.find(p => p.index === match!.index)
      if (!existing) {
        categoryPositions.push({
          type: pattern.type,
          index: match.index,
          headerLength: match[0].length,
        })
        console.log(`✅ Found ${pattern.type} at index ${match.index}`)
      }
    }
  }
  
  console.log(`📊 Found ${categoryPositions.length} categories total`)
  
  // Sort by position, but prioritize errors first
  categoryPositions.sort((a, b) => {
    // Errors always come first
    if (a.type === 'errors' && b.type !== 'errors') return -1
    if (b.type === 'errors' && a.type !== 'errors') return 1
    // Otherwise sort by position
    return a.index - b.index
  })
  
  // Extract content for each category
  if (categoryPositions.length > 0) {
    for (let i = 0; i < categoryPositions.length; i++) {
      const pos = categoryPositions[i]
      const contentStart = pos.index + pos.headerLength
      const contentEnd = i < categoryPositions.length - 1 
        ? categoryPositions[i + 1].index 
        : response.length
      
      let content = response.substring(contentStart, contentEnd).trim()
      
      // Remove leading dashes/bullets and clean up
      // But preserve code blocks exactly as they are
      const lines = content.split('\n')
      const processedLines: string[] = []
      let inCodeBlock = false
      
      for (const line of lines) {
        // Check if we're entering or leaving a code block
        if (line.trim().startsWith('```')) {
          inCodeBlock = !inCodeBlock
          processedLines.push(line) // Keep code block markers as-is
          continue
        }
        
        // If inside a code block, preserve the line exactly (including empty lines)
        if (inCodeBlock) {
          processedLines.push(line)
          continue
        }
        
        // Outside code blocks, clean up
        let cleanedLine = line
        // Remove leading bullet points
        cleanedLine = cleanedLine.replace(/^[-*]\s+/, '').trim()
        // Remove leading numbers if present
        cleanedLine = cleanedLine.replace(/^\d+\.\s+/, '').trim()
        
        // Only add non-empty lines outside code blocks
        if (cleanedLine.length > 0) {
          processedLines.push(cleanedLine)
        }
      }
      
      const cleanedContent = processedLines.join('\n').trim()
      
      if (cleanedContent && cleanedContent.length > 0) {
        let finalContent = cleanedContent
        
        // Special handling for ERRORS category - remove duplicate sections
        if (pos.type === 'errors') {
          // Remove sections that look like they're from other categories
          const cleanedParagraphs = finalContent
            .split('\n\n')
            .filter(paragraph => {
              const trimmed = paragraph.trim()
              // Remove paragraphs that start with category headers
              const hasCategoryHeader = /^(###\s*)?(SUGGESTIONS|IMPROVEMENTS|EXPLANATIONS|BEST\s+PRACTICES)/i.test(trimmed)
              // Remove paragraphs that say "no errors" or similar
              const saysNoErrors = /(no\s+errors?|no\s+syntax\s+errors?|no\s+critical\s+issues?|there\s+are\s+no)/i.test(trimmed)
              // Remove paragraphs that are just repeating other sections (but keep if they contain actual error info)
              const isDuplicateSection = /^(Explanations|Suggestions|Improvements|Best\s+Practices)[:\s]/i.test(trimmed) && 
                                        !trimmed.toLowerCase().includes('error') &&
                                        !trimmed.toLowerCase().includes('bug') &&
                                        !trimmed.toLowerCase().includes('syntax')
              return !hasCategoryHeader && !saysNoErrors && !isDuplicateSection
            })
          
          finalContent = cleanedParagraphs.join('\n\n').trim()
          
          // Check if there's actual error content (code blocks, error keywords, etc.)
          const hasErrorContent = finalContent.includes('```') || 
                                 /(error|bug|syntax|missing|incorrect|wrong|fails?|closing|tag|bracket|parenthesis)/i.test(finalContent)
          
          // If after cleanup there's no meaningful error content, skip this category
          if (!finalContent || (!hasErrorContent && finalContent.length < 30)) {
            console.warn(`⚠️ Skipped ${pos.type} category - no valid error content after cleanup`)
            continue // Skip adding this category, but continue with next category
          }
        }
        
        // Check for duplicate content - if this category's content is very similar to another category, skip it
        const isDuplicate = categories.some(existing => {
          // If content is more than 80% similar to an existing category, consider it a duplicate
          const similarity = calculateSimilarity(finalContent, existing.content)
          return similarity > 0.8 && pos.type !== existing.type
        })
        
        if (!isDuplicate) {
          categories.push({
            type: pos.type,
            content: finalContent,
          })
          console.log(`📦 Added ${pos.type} category with ${finalContent.length} chars`)
        } else {
          console.warn(`⚠️ Skipped ${pos.type} category - appears to be duplicate`)
        }
      } else {
        console.warn(`⚠️ Empty content for ${pos.type} category`)
      }
    }
  }
  
  // Helper function to calculate similarity between two strings
  function calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    if (longer.length === 0) return 1.0
    
    // Simple word-based similarity
    const words1 = str1.toLowerCase().split(/\s+/)
    const words2 = str2.toLowerCase().split(/\s+/)
    const commonWords = words1.filter(w => words2.includes(w))
    
    return commonWords.length / Math.max(words1.length, words2.length)
  }
  
  // If no structured categories found, try to infer from content
  if (categoryPositions.length === 0 && categories.length === 0) {
    // Check for error indicators
    const errorKeywords = ['error', 'bug', 'issue', 'problem', 'wrong', 'incorrect', 'fails', 'broken']
    const hasErrors = errorKeywords.some(keyword => 
      response.toLowerCase().includes(keyword)
    )
    
    if (hasErrors) {
      categories.push({
        type: 'errors',
        content: response,
      })
    } else {
      // Default to suggestions if no clear category
      categories.push({
        type: 'suggestions',
        content: response,
      })
    }
  }
  
  // If still no categories, add the whole response as suggestions
  if (categories.length === 0) {
    categories.push({
      type: 'suggestions',
      content: response,
    })
  }
  
  // Ensure we always return an array
  return Array.isArray(categories) ? categories : []
}

/**
 * Gets the color for a feedback category
 */
export function getCategoryColor(type: FeedbackCategory['type']): string {
  switch (type) {
    case 'errors':
      return '#dc2626' // Red
    case 'suggestions':
      return '#3b82f6' // Blue
    case 'improvements':
      return '#10b981' // Green
    case 'explanations':
      return '#8b5cf6' // Purple
    default:
      return '#6b7280' // Gray
  }
}

/**
 * Gets the background color for a feedback category
 */
export function getCategoryBgColor(type: FeedbackCategory['type']): string {
  switch (type) {
    case 'errors':
      return 'rgba(220, 38, 38, 0.1)' // Light red
    case 'suggestions':
      return 'rgba(59, 130, 246, 0.1)' // Light blue
    case 'improvements':
      return 'rgba(16, 185, 129, 0.1)' // Light green
    case 'explanations':
      return 'rgba(139, 92, 246, 0.1)' // Light purple
    default:
      return 'rgba(107, 114, 128, 0.1)' // Light gray
  }
}

/**
 * Gets the border color for a feedback category
 */
export function getCategoryBorderColor(type: FeedbackCategory['type']): string {
  switch (type) {
    case 'errors':
      return '#dc2626' // Red
    case 'suggestions':
      return '#3b82f6' // Blue
    case 'improvements':
      return '#10b981' // Green
    case 'explanations':
      return '#8b5cf6' // Purple
    default:
      return '#6b7280' // Gray
  }
}

/**
 * Gets the display label for a feedback category
 */
export function getCategoryLabel(type: FeedbackCategory['type']): string {
  switch (type) {
    case 'errors':
      return 'Errors'
    case 'suggestions':
      return 'Suggestions'
    case 'improvements':
      return 'Improvements'
    case 'explanations':
      return 'Explanations'
    default:
      return 'Feedback'
  }
}

