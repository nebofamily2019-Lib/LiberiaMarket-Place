import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LocationSelector from './LocationSelector';

// Mock the location data
vi.mock('../data/liberianLocations', () => ({
  getCounties: () => [
    { id: 'montserrado', name: 'Montserrado', capital: 'Bensonville' },
    { id: 'nimba', name: 'Nimba', capital: 'Sanniquellie' }
  ],
  getCitiesByCounty: (countyId: string) => {
    if (countyId === 'montserrado') {
      return [
        { name: 'Monrovia', type: 'City', lat: 6.3, lon: -10.8 },
        { name: 'Paynesville', type: 'City', lat: 6.2, lon: -10.7 }
      ];
    }
    return [];
  }
}));

describe('LocationSelector', () => {
  const mockOnCountyChange = vi.fn();
  const mockOnCityChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders county and city selectors', () => {
    render(
      <LocationSelector
        onCountyChange={mockOnCountyChange}
        onCityChange={mockOnCityChange}
      />
    );

    expect(screen.getByLabelText(/^County$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^City\/Town$/i)).toBeInTheDocument();
  });

  it('calls onCountyChange when a county is selected', () => {
    render(
      <LocationSelector
        onCountyChange={mockOnCountyChange}
        onCityChange={mockOnCityChange}
      />
    );

    const countySelect = screen.getByLabelText(/^County$/i);
    fireEvent.change(countySelect, { target: { value: 'montserrado' } });

    expect(mockOnCountyChange).toHaveBeenCalledWith('montserrado');
  });

  it('populates cities when a county is selected', async () => {
    render(
      <LocationSelector
        selectedCounty="montserrado"
        onCountyChange={mockOnCountyChange}
        onCityChange={mockOnCityChange}
      />
    );

    // Cities should be populated based on the mock
    const citySelect = screen.getByLabelText(/^City\/Town$/i);
    expect(citySelect).not.toBeDisabled();
    
    // Check if options exist (might need to wait or check children)
    expect(screen.getByText('Monrovia')).toBeInTheDocument();
  });

  it('calls onCityChange when a city is selected', () => {
    render(
      <LocationSelector
        selectedCounty="montserrado"
        onCountyChange={mockOnCountyChange}
        onCityChange={mockOnCityChange}
      />
    );

    const citySelect = screen.getByLabelText(/^City\/Town$/i);
    fireEvent.change(citySelect, { target: { value: 'Monrovia' } });

    expect(mockOnCityChange).toHaveBeenCalledWith('Monrovia');
  });
});
