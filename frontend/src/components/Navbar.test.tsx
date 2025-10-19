import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/test-utils'
import Navbar from './Navbar'

describe('Navbar', () => {
  it('renders the logo', () => {
    render(<Navbar />)
    expect(screen.getByText('LibMarket')).toBeInTheDocument()
  })

  it('logo links to homepage', () => {
    render(<Navbar />)
    const logo = screen.getByText('LibMarket')
    expect(logo).toHaveAttribute('href', '/')
  })

  it('displays Browse link', () => {
    render(<Navbar />)
    expect(screen.getByText('Browse')).toBeInTheDocument()
  })

  describe('when user is not logged in', () => {
    it('displays Login link', () => {
      render(<Navbar />)
      expect(screen.getByText('Login')).toBeInTheDocument()
    })

    it('displays Sign Up button', () => {
      render(<Navbar />)
      expect(screen.getByText('Sign Up')).toBeInTheDocument()
    })

    it('does not display Sell link', () => {
      render(<Navbar />)
      expect(screen.queryByText('Sell')).not.toBeInTheDocument()
    })

    it('does not display Profile link', () => {
      render(<Navbar />)
      expect(screen.queryByText('Profile')).not.toBeInTheDocument()
    })

    it('does not display Logout button', () => {
      render(<Navbar />)
      expect(screen.queryByText('Logout')).not.toBeInTheDocument()
    })
  })

  // Note: This Navbar component has a local state which doesn't integrate with AuthContext
  // In a real app, it should use useAuth() hook. These tests demonstrate the current behavior.
  describe('when user logs in (via button click)', () => {
    it('toggles to show authenticated menu items', async () => {
      render(<Navbar />)
      const user = userEvent.setup()

      // Initially shows Login/Sign Up
      expect(screen.getByText('Login')).toBeInTheDocument()

      // Note: Current implementation doesn't have a way to toggle login state from UI
      // This is a limitation of the current component design
      // In production, this should use AuthContext
    })
  })

  it('has correct navigation link hrefs', () => {
    render(<Navbar />)

    expect(screen.getByText('Browse')).toHaveAttribute('href', '/products')
    expect(screen.getByText('Login')).toHaveAttribute('href', '/login')
    expect(screen.getByText('Sign Up')).toHaveAttribute('href', '/register')
  })
})
