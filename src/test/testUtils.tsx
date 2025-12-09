import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'

/**
 * Custom render function that wraps components with any providers
 * For now, this is a simple wrapper, but can be extended with Context providers
 * when needed (e.g., ThreadProvider in PR #3)
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { wrapper?: React.ComponentType<{ children: React.ReactNode }> },
) => {
  const { wrapper, ...restOptions } = options || {}
  if (wrapper) {
    return render(ui, { wrapper, ...restOptions })
  }
  return render(ui, { ...restOptions })
}

export * from '@testing-library/react'
export { customRender as render }

