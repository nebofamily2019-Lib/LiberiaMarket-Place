import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest'

// Mock speakPrompt
const speakPromptMock = vi.fn()
vi.mock('../../utils/voiceAssistant', () => {
  return {
    speakPrompt: (...args: any[]) => speakPromptMock(...args),
    setDefaultLang: () => {},
    getAvailablePrompts: () => ['fieldPrompt']
  }
})

// Mock categoryService.getCategories used by AddProduct
vi.mock('../../services/categoryService', () => {
  return {
    getCategories: vi.fn().mockResolvedValue([
      { id: 'cat1', name: 'Electronics' },
      { id: 'cat2', name: 'Fashion' }
    ])
  }
})

// Import after mocks
import AddProduct from '../AddProduct'

describe('AddProduct voice prompts on focus and help', () => {
  beforeEach(() => {
    speakPromptMock.mockClear()
  })

  afterEach(() => {
    speakPromptMock.mockClear()
  })

  it('calls speakPrompt for title, description, price, category, contact phone and image help', async () => {
    render(
      <MemoryRouter>
        <AddProduct />
      </MemoryRouter>
    )

    // Wait for categories to load
    await waitFor(() => expect(screen.getByLabelText('Category')).toBeInTheDocument())

    // Focus Product Title (VoiceInput provides aria-label)
    const titleInput = screen.getByLabelText('Product Title')
    titleInput.focus()
    expect(speakPromptMock).toHaveBeenCalledWith('fieldPrompt', { field: 'product title' })

    // Focus Description
    const desc = screen.getByLabelText('Description')
    desc.focus()
    expect(speakPromptMock).toHaveBeenCalledWith('fieldPrompt', { field: 'description' })

    // Focus Price (we rely on label "Price (L$)")
    const price = screen.getByLabelText('Price (L$)')
    price.focus()
    expect(speakPromptMock).toHaveBeenCalledWith('fieldPrompt', { field: 'price' })

    // Focus Category
    const category = screen.getByLabelText('Category')
    category.focus()
    expect(speakPromptMock).toHaveBeenCalledWith('fieldPrompt', { field: 'category' })

    // Focus Contact Phone
    const phone = screen.getByLabelText('Contact Phone Number')
    phone.focus()
    expect(speakPromptMock).toHaveBeenCalledWith('fieldPrompt', { field: 'contact phone number' })

    // Click Image help button
    const imgHelp = screen.getByRole('button', { name: /Image upload help|Image help/i })
    fireEvent.click(imgHelp)
    expect(speakPromptMock).toHaveBeenCalledWith('fieldPrompt', { field: 'image upload' })
  })

  it('calls speakPrompt for title, description, price, category, contact phone, image help, tags and negotiable', async () => {
    render(
      <MemoryRouter>
        <AddProduct />
      </MemoryRouter>
    )

    // Wait for categories to load
    await waitFor(() => expect(screen.getByLabelText('Category')).toBeInTheDocument())

    // Focus Product Title (VoiceInput provides aria-label)
    const titleInput = screen.getByLabelText('Product Title')
    titleInput.focus()
    expect(speakPromptMock).toHaveBeenCalledWith('fieldPrompt', { field: 'product title' })

    // Focus Description
    const desc = screen.getByLabelText('Description')
    desc.focus()
    expect(speakPromptMock).toHaveBeenCalledWith('fieldPrompt', { field: 'description' })

    // Focus Price (we rely on label "Price (L$)")
    const price = screen.getByLabelText('Price (L$)')
    price.focus()
    expect(speakPromptMock).toHaveBeenCalledWith('fieldPrompt', { field: 'price' })

    // Focus Category
    const category = screen.getByLabelText('Category')
    category.focus()
    expect(speakPromptMock).toHaveBeenCalledWith('fieldPrompt', { field: 'category' })

    // Focus Contact Phone
    const phone = screen.getByLabelText('Contact Phone Number')
    phone.focus()
    expect(speakPromptMock).toHaveBeenCalledWith('fieldPrompt', { field: 'contact phone number' })

    // Click Image help button
    const imgHelp = screen.getByRole('button', { name: /Image upload help|Image help/i })
    fireEvent.click(imgHelp)
    expect(speakPromptMock).toHaveBeenCalledWith('fieldPrompt', { field: 'image upload' })

    // Focus Tags
    const tagsInput = screen.getByLabelText('Tags')
    tagsInput.focus()
    expect(speakPromptMock).toHaveBeenCalledWith('fieldPrompt', { field: 'tags' })

    // Click Tags help
    const tagsHelp = screen.getByRole('button', { name: /Tags help/i })
    fireEvent.click(tagsHelp)
    expect(speakPromptMock).toHaveBeenCalledWith('fieldPrompt', { field: 'tags' })

    // Focus Negotiable checkbox
    const negotiable = screen.getByLabelText('Negotiable')
    negotiable.focus()
    expect(speakPromptMock).toHaveBeenCalledWith('fieldPrompt', { field: 'negotiable' })

    // Click Negotiable help
    const negotiableHelp = screen.getByRole('button', { name: /Negotiable help/i })
    fireEvent.click(negotiableHelp)
    expect(speakPromptMock).toHaveBeenCalledWith('fieldPrompt', { field: 'negotiable' })
  })
})
