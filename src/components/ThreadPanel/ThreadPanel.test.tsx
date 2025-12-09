import { describe, it, expect } from 'vitest'
import { useEffect } from 'react'
import { render, screen } from '../../test/testUtils'
import { ThreadProvider } from '../../store/ThreadContext'
import { useThreads } from '../../hooks/useThreads'
import { ThreadPanel } from './ThreadPanel'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThreadProvider>{children}</ThreadProvider>
)

describe('ThreadPanel', () => {
  it('should show empty state message when no threads', () => {
    render(<ThreadPanel />, { wrapper })

    expect(
      screen.getByText(/No threads yet/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Select code in the editor/i),
    ).toBeInTheDocument()
  })

  it('should render correct number of Thread components', () => {
    const TestComponent = () => {
      const { createThread } = useThreads()
      useEffect(() => {
        createThread('thread-1', 1, 5)
        createThread('thread-2', 10, 15)
      }, [createThread])
      return <ThreadPanel />
    }

    render(<TestComponent />, { wrapper })

    // Should show thread count
    expect(screen.getByText(/2 threads/i)).toBeInTheDocument()
  })

  it('should display thread count in header', () => {
    const TestComponent = () => {
      const { createThread } = useThreads()
      useEffect(() => {
        createThread('thread-1', 1, 5)
      }, [createThread])
      return <ThreadPanel />
    }

    render(<TestComponent />, { wrapper })

    expect(screen.getByText(/1 thread/i)).toBeInTheDocument()
  })
})

