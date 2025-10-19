import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithoutProviders } from '../test/test-utils'
import PhoneInput from './PhoneInput'

describe('PhoneInput', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('renders with label', () => {
    renderWithoutProviders(
      <PhoneInput value="" onChange={mockOnChange} label="Phone Number" />
    )
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument()
  })

  it('shows required indicator when required prop is true', () => {
    renderWithoutProviders(
      <PhoneInput value="" onChange={mockOnChange} required />
    )
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('displays placeholder text', () => {
    renderWithoutProviders(
      <PhoneInput
        value=""
        onChange={mockOnChange}
        placeholder="+231 XX XXX XXXX"
      />
    )
    expect(screen.getByPlaceholderText('+231 XX XXX XXXX')).toBeInTheDocument()
  })

  it('calls onChange when user types', async () => {
    const user = userEvent.setup()
    renderWithoutProviders(<PhoneInput value="" onChange={mockOnChange} />)

    const input = screen.getByRole('textbox')
    await user.type(input, '88123456')

    expect(mockOnChange).toHaveBeenCalled()
  })

  it('validates Liberian phone number format', async () => {
    const user = userEvent.setup()
    renderWithoutProviders(<PhoneInput value="" onChange={mockOnChange} />)

    const input = screen.getByRole('textbox')
    await user.type(input, '88123456')
    await user.tab() // Blur to trigger validation

    // Should show valid state (checkmark)
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('shows error for invalid phone number', async () => {
    const user = userEvent.setup()
    renderWithoutProviders(<PhoneInput value="" onChange={mockOnChange} />)

    const input = screen.getByRole('textbox')
    await user.type(input, '123')
    await user.tab() // Blur

    // Should show error (X mark)
    expect(screen.getByText('✗')).toBeInTheDocument()
  })

  it('shows carrier name for valid number', async () => {
    const user = userEvent.setup()
    renderWithoutProviders(
      <PhoneInput value="" onChange={mockOnChange} showCarrier={true} />
    )

    const input = screen.getByRole('textbox')
    await user.type(input, '88123456')
    await user.tab()

    expect(screen.getByText(/MTN Network/i)).toBeInTheDocument()
  })

  it('does not show carrier when showCarrier is false', async () => {
    const user = userEvent.setup()
    renderWithoutProviders(
      <PhoneInput value="" onChange={mockOnChange} showCarrier={false} />
    )

    const input = screen.getByRole('textbox')
    await user.type(input, '88123456')
    await user.tab()

    expect(screen.queryByText(/Network/i)).not.toBeInTheDocument()
  })

  it('formats phone number on blur', async () => {
    const user = userEvent.setup()
    renderWithoutProviders(<PhoneInput value="" onChange={mockOnChange} />)

    const input = screen.getByRole('textbox')
    await user.type(input, '88123456')
    await user.tab() // Blur should format

    // After formatting, onChange should be called with formatted value
    expect(mockOnChange).toHaveBeenCalledWith(expect.stringContaining('+231'), true)
  })

  it('removes formatting on focus for easier editing', async () => {
    const user = userEvent.setup()
    renderWithoutProviders(
      <PhoneInput value="+231 88 123 456" onChange={mockOnChange} />
    )

    const input = screen.getByRole('textbox') as HTMLInputElement
    await user.click(input) // Focus

    // Should strip formatting
    expect(input.value).not.toContain('+231')
  })

  it('disables input when disabled prop is true', () => {
    renderWithoutProviders(
      <PhoneInput value="" onChange={mockOnChange} disabled />
    )

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('shows help text when input is empty', () => {
    renderWithoutProviders(<PhoneInput value="" onChange={mockOnChange} />)

    expect(
      screen.getByText(/Format: \+231 XX XXX XXXX or 0XX XXX XXXX/)
    ).toBeInTheDocument()
  })

  it('calls onChange with validity status', async () => {
    const user = userEvent.setup()
    renderWithoutProviders(<PhoneInput value="" onChange={mockOnChange} />)

    const input = screen.getByRole('textbox')

    // Valid number
    await user.type(input, '88123456')
    expect(mockOnChange).toHaveBeenCalledWith('88123456', true)

    mockOnChange.mockClear()

    // Invalid number
    await user.clear(input)
    await user.type(input, '123')
    expect(mockOnChange).toHaveBeenCalledWith('123', false)
  })

  it('handles different carrier prefixes correctly', async () => {
    const user = userEvent.setup()

    // Test MTN
    const { unmount } = renderWithoutProviders(
      <PhoneInput value="" onChange={mockOnChange} showCarrier />
    )
    let input = screen.getByRole('textbox')
    await user.type(input, '77123456')
    await user.tab()
    expect(screen.getByText(/MTN Network/i)).toBeInTheDocument()
    unmount()

    // Test Orange
    renderWithoutProviders(
      <PhoneInput value="" onChange={mockOnChange} showCarrier />
    )
    input = screen.getByRole('textbox')
    await user.type(input, '86123456')
    await user.tab()
    expect(screen.getByText(/Orange Network/i)).toBeInTheDocument()
  })
})
