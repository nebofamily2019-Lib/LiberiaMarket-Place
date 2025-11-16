import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import { AuthProvider } from '../context/AuthContext'
import authService from '../services/authService'
import { fakeTestUsers, fakeRegisterData, fakeLoginCredentials, isValidLiberianPhone } from './fakeUsers'

// Mock the auth service
vi.mock('../services/authService')

// Mock react-router-dom navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/login' })
  }
})

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
)

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Login Flow', () => {
    it('successfully logs in a valid Liberian buyer', async () => {
      const user = userEvent.setup()
      const credentials = fakeLoginCredentials.validBuyer
      const expectedUser = fakeTestUsers.regularBuyer

      // Mock successful login
      vi.mocked(authService.login).mockResolvedValueOnce({
        success: true,
        message: 'Login successful',
        token: 'fake-jwt-token',
        user: expectedUser
      })

      render(<Login />, { wrapper: TestWrapper })

      // Fill in phone number
      const phoneInput = screen.getByLabelText(/phone/i)
      await user.type(phoneInput, credentials.phone)

      // Fill in password
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, credentials.password)

      // Submit form
      const loginButton = screen.getByRole('button', { name: /login|sign in/i })
      await user.click(loginButton)

      // Verify API call
      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          phone: credentials.phone,
          password: credentials.password
        })
      })

      // Verify navigation to dashboard
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('successfully logs in a rural seller with no email', async () => {
      const user = userEvent.setup()
      const ruralUser = fakeTestUsers.ruralFarmer

      vi.mocked(authService.login).mockResolvedValueOnce({
        success: true,
        message: 'Login successful',
        token: 'rural-user-token',
        user: ruralUser
      })

      render(<Login />, { wrapper: TestWrapper })

      const phoneInput = screen.getByLabelText(/phone/i)
      await user.type(phoneInput, ruralUser.phone)

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, 'RuralPass123!')

      const loginButton = screen.getByRole('button', { name: /login|sign in/i })
      await user.click(loginButton)

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          phone: ruralUser.phone,
          password: 'RuralPass123!'
        })
      })
    })

    it('handles login with invalid phone number', async () => {
      const user = userEvent.setup()
      const invalidCredentials = fakeLoginCredentials.invalidPhone

      vi.mocked(authService.login).mockRejectedValueOnce(
        new Error('User not found')
      )

      render(<Login />, { wrapper: TestWrapper })

      const phoneInput = screen.getByLabelText(/phone/i)
      await user.type(phoneInput, invalidCredentials.phone)

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, invalidCredentials.password)

      const loginButton = screen.getByRole('button', { name: /login|sign in/i })
      await user.click(loginButton)

      await waitFor(() => {
        expect(screen.getByText(/user not found|invalid credentials/i)).toBeInTheDocument()
      })

      // Should not navigate
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('handles login with wrong password', async () => {
      const user = userEvent.setup()
      const wrongCredentials = fakeLoginCredentials.wrongPassword

      vi.mocked(authService.login).mockRejectedValueOnce(
        new Error('Invalid credentials')
      )

      render(<Login />, { wrapper: TestWrapper })

      const phoneInput = screen.getByLabelText(/phone/i)
      await user.type(phoneInput, wrongCredentials.phone)

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, wrongCredentials.password)

      const loginButton = screen.getByRole('button', { name: /login|sign in/i })
      await user.click(loginButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })
    })

    it('prevents login for suspended user', async () => {
      const user = userEvent.setup()
      const suspendedCredentials = fakeLoginCredentials.suspendedUser

      vi.mocked(authService.login).mockRejectedValueOnce(
        new Error('Account suspended')
      )

      render(<Login />, { wrapper: TestWrapper })

      const phoneInput = screen.getByLabelText(/phone/i)
      await user.type(phoneInput, suspendedCredentials.phone)

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, suspendedCredentials.password)

      const loginButton = screen.getByRole('button', { name: /login|sign in/i })
      await user.click(loginButton)

      await waitFor(() => {
        expect(screen.getByText(/account suspended/i)).toBeInTheDocument()
      })
    })

    it('handles empty login form submission', async () => {
      const user = userEvent.setup()

      render(<Login />, { wrapper: TestWrapper })

      const loginButton = screen.getByRole('button', { name: /login|sign in/i })
      await user.click(loginButton)

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/phone.*required/i)).toBeInTheDocument()
        expect(screen.getByText(/password.*required/i)).toBeInTheDocument()
      })

      // Should not call API
      expect(authService.login).not.toHaveBeenCalled()
    })
  })

  describe('Registration Flow', () => {
    it('successfully registers a new buyer with email', async () => {
      const user = userEvent.setup()
      const registerData = fakeRegisterData.validBuyer
      const newUser = {
        ...fakeTestUsers.regularBuyer,
        id: 'new-user-123',
        name: registerData.name,
        email: registerData.email || '',
        phone: registerData.phone
      }

      vi.mocked(authService.register).mockResolvedValueOnce({
        success: true,
        message: 'Registration successful',
        token: 'new-user-token',
        user: newUser
      })

      render(<Register />, { wrapper: TestWrapper })

      // Fill in registration form
      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, registerData.name)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, registerData.email!)

      const phoneInput = screen.getByLabelText(/phone/i)
      await user.type(phoneInput, registerData.phone)

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, registerData.password)

      // Select role
      const roleSelect = screen.getByLabelText(/role|account type/i)
      await user.selectOptions(roleSelect, registerData.role!)

      // Submit form
      const registerButton = screen.getByRole('button', { name: /register|sign up/i })
      await user.click(registerButton)

      // Verify API call
      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith({
          name: registerData.name,
          email: registerData.email,
          phone: registerData.phone,
          password: registerData.password,
          role: registerData.role
        })
      })

      // Verify navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('successfully registers a rural seller without email', async () => {
      const user = userEvent.setup()
      const registerData = fakeRegisterData.noEmail
      const ruralUser = {
        ...fakeTestUsers.ruralFarmer,
        id: 'rural-user-new',
        name: registerData.name,
        phone: registerData.phone,
        email: ''
      }

      vi.mocked(authService.register).mockResolvedValueOnce({
        success: true,
        message: 'Registration successful',
        token: 'rural-user-token',
        user: ruralUser
      })

      render(<Register />, { wrapper: TestWrapper })

      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, registerData.name)

      const phoneInput = screen.getByLabelText(/phone/i)
      await user.type(phoneInput, registerData.phone)

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, registerData.password)

      const roleSelect = screen.getByLabelText(/role|account type/i)
      await user.selectOptions(roleSelect, registerData.role!)

      const registerButton = screen.getByRole('button', { name: /register|sign up/i })
      await user.click(registerButton)

      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith({
          name: registerData.name,
          phone: registerData.phone,
          password: registerData.password,
          role: registerData.role
        })
      })
    })

    it('handles registration with invalid Liberian phone number', async () => {
      const user = userEvent.setup()
      const invalidData = fakeRegisterData.invalidPhone

      render(<Register />, { wrapper: TestWrapper })

      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, invalidData.name)

      const phoneInput = screen.getByLabelText(/phone/i)
      await user.type(phoneInput, invalidData.phone)

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, invalidData.password)

      const registerButton = screen.getByRole('button', { name: /register|sign up/i })
      await user.click(registerButton)

      // Should show phone validation error
      await waitFor(() => {
        expect(screen.getByText(/invalid.*phone.*number/i)).toBeInTheDocument()
      })

      // Should not call API
      expect(authService.register).not.toHaveBeenCalled()
    })

    it('handles registration with weak password', async () => {
      const user = userEvent.setup()
      const weakPassData = fakeRegisterData.weakPassword

      render(<Register />, { wrapper: TestWrapper })

      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, weakPassData.name)

      const phoneInput = screen.getByLabelText(/phone/i)
      await user.type(phoneInput, weakPassData.phone)

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, weakPassData.password)

      const registerButton = screen.getByRole('button', { name: /register|sign up/i })
      await user.click(registerButton)

      // Should show password validation error
      await waitFor(() => {
        expect(screen.getByText(/password.*weak|password.*short/i)).toBeInTheDocument()
      })

      expect(authService.register).not.toHaveBeenCalled()
    })

    it('handles registration with duplicate phone number', async () => {
      const user = userEvent.setup()
      const duplicateData = fakeRegisterData.duplicatePhone

      vi.mocked(authService.register).mockRejectedValueOnce(
        new Error('Phone number already registered')
      )

      render(<Register />, { wrapper: TestWrapper })

      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, duplicateData.name)

      const phoneInput = screen.getByLabelText(/phone/i)
      await user.type(phoneInput, duplicateData.phone)

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, duplicateData.password)

      const registerButton = screen.getByRole('button', { name: /register|sign up/i })
      await user.click(registerButton)

      await waitFor(() => {
        expect(screen.getByText(/phone.*already.*registered/i)).toBeInTheDocument()
      })
    })
  })

  describe('Phone Number Validation', () => {
    it('validates Liberian mobile numbers correctly', () => {
      const validNumbers = [
        '770123456', // MTN
        '880456789', // Lonestar
        '555234567', // Orange
        '666789012', // Orange alt
        '777345678', // Cellcom
        '888567890'  // Novafone
      ]

      validNumbers.forEach(phone => {
        expect(isValidLiberianPhone(phone)).toBe(true)
      })
    })

    it('validates Liberian landline numbers correctly', () => {
      const validLandlines = [
        '221234567', // Monrovia landline
        '220987654'
      ]

      validLandlines.forEach(phone => {
        expect(isValidLiberianPhone(phone)).toBe(true)
      })
    })

    it('rejects invalid phone numbers', () => {
      const invalidNumbers = [
        '123456',     // Too short
        '1234567890', // Wrong format
        '990123456',  // Invalid prefix
        '77012345',   // Too short for mobile
        '2212345'     // Too short for landline
      ]

      invalidNumbers.forEach(phone => {
        expect(isValidLiberianPhone(phone)).toBe(false)
      })
    })
  })

  describe('User Role Management', () => {
    it('handles buyer role assignment correctly', async () => {
      const buyerData = fakeRegisterData.validBuyer
      const newBuyer = { ...fakeTestUsers.regularBuyer, role: 'buyer' }

      vi.mocked(authService.register).mockResolvedValueOnce({
        success: true,
        message: 'Registration successful',
        token: 'buyer-token',
        user: newBuyer
      })

      const user = userEvent.setup()
      render(<Register />, { wrapper: TestWrapper })

      // Fill form and select buyer role
      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, buyerData.name)

      const phoneInput = screen.getByLabelText(/phone/i)
      await user.type(phoneInput, buyerData.phone)

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, buyerData.password)

      const roleSelect = screen.getByLabelText(/role|account type/i)
      await user.selectOptions(roleSelect, 'buyer')

      const registerButton = screen.getByRole('button', { name: /register|sign up/i })
      await user.click(registerButton)

      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith(
          expect.objectContaining({ role: 'buyer' })
        )
      })
    })

    it('handles seller role assignment correctly', async () => {
      const sellerData = fakeRegisterData.validSeller
      const newSeller = { ...fakeTestUsers.regularSeller, role: 'seller' }

      vi.mocked(authService.register).mockResolvedValueOnce({
        success: true,
        message: 'Registration successful',
        token: 'seller-token',
        user: newSeller
      })

      const user = userEvent.setup()
      render(<Register />, { wrapper: TestWrapper })

      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, sellerData.name)

      const phoneInput = screen.getByLabelText(/phone/i)
      await user.type(phoneInput, sellerData.phone)

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, sellerData.password)

      const roleSelect = screen.getByLabelText(/role|account type/i)
      await user.selectOptions(roleSelect, 'seller')

      const registerButton = screen.getByRole('button', { name: /register|sign up/i })
      await user.click(registerButton)

      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith(
          expect.objectContaining({ role: 'seller' })
        )
      })
    })
  })

  describe('Network Error Handling', () => {
    it('handles network errors during login gracefully', async () => {
      const user = userEvent.setup()
      const credentials = fakeLoginCredentials.validBuyer

      vi.mocked(authService.login).mockRejectedValueOnce(
        new Error('Network error')
      )

      render(<Login />, { wrapper: TestWrapper })

      const phoneInput = screen.getByLabelText(/phone/i)
      await user.type(phoneInput, credentials.phone)

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, credentials.password)

      const loginButton = screen.getByRole('button', { name: /login|sign in/i })
      await user.click(loginButton)

      await waitFor(() => {
        expect(screen.getByText(/network.*error|connection.*failed/i)).toBeInTheDocument()
      })
    })

    it('handles network errors during registration gracefully', async () => {
      const user = userEvent.setup()
      const registerData = fakeRegisterData.validBuyer

      vi.mocked(authService.register).mockRejectedValueOnce(
        new Error('Network error')
      )

      render(<Register />, { wrapper: TestWrapper })

      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, registerData.name)

      const phoneInput = screen.getByLabelText(/phone/i)
      await user.type(phoneInput, registerData.phone)

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, registerData.password)

      const registerButton = screen.getByRole('button', { name: /register|sign up/i })
      await user.click(registerButton)

      await waitFor(() => {
        expect(screen.getByText(/network.*error|connection.*failed/i)).toBeInTheDocument()
      })
    })
  })
})