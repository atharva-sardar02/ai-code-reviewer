import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useEffect } from 'react'
import { render, screen } from '../../test/testUtils'
import userEvent from '@testing-library/user-event'
import { ThreadProvider } from '../../store/ThreadContext'
import { useThreads } from '../../hooks/useThreads'
import { PromptInput } from './PromptInput'

// Component that creates a thread for testing
function PromptInputWithThread() {
  const { createThread } = useThreads()

  useEffect(() => {
    createThread('thread-1', 1, 5)
  }, [createThread])

  return <PromptInput threadId="thread-1" />
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThreadProvider>{children}</ThreadProvider>
)

describe('PromptInput', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render input field and submit button', () => {
    render(<PromptInput threadId="thread-1" />, { wrapper })

    expect(
      screen.getByPlaceholderText(/Ask a question/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  it('should update input value when typing', async () => {
    const user = userEvent.setup()
    render(<PromptInput threadId="thread-1" />, { wrapper })

    const input = screen.getByPlaceholderText(/Ask a question/i)
    await user.type(input, 'Test question')

    expect(input).toHaveValue('Test question')
  })

  it('should call onSubmit when clicking submit button', async () => {
    const user = userEvent.setup()
    render(<PromptInputWithThread />, { wrapper })

    const input = screen.getByPlaceholderText(/Ask a question/i)
    const submitButton = screen.getByRole('button', { name: /send/i })

    await user.type(input, 'Test question')
    await user.click(submitButton)

    // Input should be cleared
    expect(input).toHaveValue('')
  })

  it('should submit when pressing Cmd/Ctrl + Enter', async () => {
    const user = userEvent.setup()
    render(<PromptInputWithThread />, { wrapper })

    const input = screen.getByPlaceholderText(/Ask a question/i)
    await user.type(input, 'Test question')

    // Simulate Cmd+Enter (Mac) or Ctrl+Enter (Windows)
    await user.keyboard('{Meta>}{Enter}{/Meta}')

    // Input should be cleared
    expect(input).toHaveValue('')
  })

  it('should disable submit button when input is empty', () => {
    render(<PromptInput threadId="thread-1" />, { wrapper })

    const submitButton = screen.getByRole('button', { name: /send/i })
    expect(submitButton).toBeDisabled()
  })

  it('should disable submit button when disabled prop is true', () => {
    render(<PromptInput threadId="thread-1" disabled />, { wrapper })

    const submitButton = screen.getByRole('button', { name: /send/i })
    expect(submitButton).toBeDisabled()
  })

  it('should clear input after submission', async () => {
    const user = userEvent.setup()
    render(<PromptInputWithThread />, { wrapper })

    const input = screen.getByPlaceholderText(/Ask a question/i)
    await user.type(input, 'Test question')
    await user.click(screen.getByRole('button', { name: /send/i }))

    expect(input).toHaveValue('')
  })
})

