import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'

/**
 * Custom render function that wraps components with common providers
 * Use this instead of @testing-library/react's render for most tests
 */
interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  )
}

/**
 * Renders a component with all providers (Router, Auth, etc.)
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

/**
 * Renders a component without any providers
 * Use for isolated component tests
 */
const renderWithoutProviders = (ui: ReactElement, options?: RenderOptions) =>
  render(ui, options)

/**
 * Renders a component with only Router (no Auth)
 */
const renderWithRouter = (ui: ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: BrowserRouter, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render, renderWithoutProviders, renderWithRouter }
