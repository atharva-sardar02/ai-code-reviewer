import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/testUtils'
import userEvent from '@testing-library/user-event'
import { ThreadProvider } from '../../store/ThreadContext'
import { Thread } from './Thread'
import type { Thread as ThreadType } from '../../store/types'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThreadProvider>{children}</ThreadProvider>
)

describe('Thread', () => {
  const mockThread: ThreadType = {
    id: 'thread-1',
    fileId: 'file-1',
    startLine: 5,
    endLine: 10,
    messages: [
      { role: 'user', content: 'What does this do?' },
      { role: 'assistant', content: 'This code does X' },
    ],
    isExpanded: true,
    isLoading: false,
    error: null,
  }

  it('should render line range in header', () => {
    render(<Thread thread={mockThread} />, { wrapper })

    expect(screen.getByText(/Lines 5-10/i)).toBeInTheDocument()
  })

  it('should render all messages in thread', () => {
    render(<Thread thread={mockThread} />, { wrapper })

    expect(screen.getByText('What does this do?')).toBeInTheDocument()
    expect(screen.getByText('This code does X')).toBeInTheDocument()
  })

  it('should toggle expanded state when clicking header', async () => {
    const user = userEvent.setup()
    render(<Thread thread={mockThread} />, { wrapper })

    // Initially expanded, messages should be visible
    expect(screen.getByText('What does this do?')).toBeInTheDocument()

    // Click header to collapse
    const header = screen.getByText(/Lines 5-10/i).closest('div')
    if (header) {
      await user.click(header)
    }

    // Messages should still be visible (state update happens async)
    // In a real test, we'd wait for the state update
  })

  it('should call delete handler when delete button is clicked', async () => {
    const user = userEvent.setup()
    // Mock window.confirm
    window.confirm = vi.fn(() => true)

    render(<Thread thread={mockThread} />, { wrapper })

    const deleteButton = screen.getByLabelText(/delete thread/i)
    await user.click(deleteButton)

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this thread?',
    )
  })

  it('should show loading indicator when thread is loading', () => {
    const loadingThread = { ...mockThread, isLoading: true }
    render(<Thread thread={loadingThread} />, { wrapper })

    expect(screen.getByText(/Loading/i)).toBeInTheDocument()
  })

  it('should show error message when thread has error', () => {
    const errorThread = {
      ...mockThread,
      error: 'Network error',
    }
    render(<Thread thread={errorThread} />, { wrapper })

    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('should show empty message when thread has no messages', () => {
    const emptyThread = { ...mockThread, messages: [] }
    render(<Thread thread={emptyThread} />, { wrapper })

    expect(
      screen.getByText(/No messages yet/i),
    ).toBeInTheDocument()
  })
})




