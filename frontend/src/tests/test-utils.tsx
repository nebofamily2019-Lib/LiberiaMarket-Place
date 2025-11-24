import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { ToastProvider } from '../context/ToastContext'

/**
 * Custom render function that wraps components with all necessary providers
 * Use this instead of the default render from @testing-library/react
 */

interface AllTheProvidersProps {
  children: React.ReactNode
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

/**
 * Custom render method that includes all providers
 *
 * Usage:
 * import { renderWithProviders } from '../tests/test-utils'
 *
 * renderWithProviders(<MyComponent />)
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'

// Export the custom render as the default
export { renderWithProviders as render }
