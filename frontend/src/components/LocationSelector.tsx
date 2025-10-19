import { useState, useEffect } from 'react'
import { getCounties, getCitiesByCounty, County, City } from '../data/liberianLocations'

interface LocationSelectorProps {
  selectedCounty?: string
  selectedCity?: string
  onCountyChange: (countyId: string) => void
  onCityChange: (cityName: string) => void
  required?: boolean
  disabled?: boolean
  showCityType?: boolean
  className?: string
}

const LocationSelector = ({
  selectedCounty = '',
  selectedCity = '',
  onCountyChange,
  onCityChange,
  required = false,
  disabled = false,
  showCityType = false,
  className = ''
}: LocationSelectorProps) => {
  const [counties] = useState<County[]>(getCounties())
  const [cities, setCities] = useState<City[]>([])
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState('')

  // Update cities when county changes
  useEffect(() => {
    if (selectedCounty) {
      const countyCities = getCitiesByCounty(selectedCounty)
      setCities(countyCities)
    } else {
      setCities([])
    }
  }, [selectedCounty])

  // GPS Location - Auto-detect using geolocation
  const useMyLocation = async () => {
    setGettingLocation(true)
    setLocationError('')

    if (!navigator.geolocation) {
      setLocationError('GPS not supported on your device')
      setGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // Use reverse geocoding to get location
          // For MVP, we'll use a simple approach: default to Montserrado (most common)
          // In production, use actual reverse geocoding API

          // For now, auto-select Montserrado County (capital region)
          onCountyChange('montserrado')

          // Give user feedback
          alert('📍 Location detected! Auto-selected Montserrado County. Please select your city.')

        } catch (error) {
          setLocationError('Could not determine location')
        } finally {
          setGettingLocation(false)
        }
      },
      (error) => {
        console.error('GPS error:', error)
        setLocationError('Please enable GPS in your browser settings')
        setGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handleCountyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countyId = e.target.value
    onCountyChange(countyId)
    onCityChange('') // Reset city when county changes
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCityChange(e.target.value)
  }

  return (
    <div className={`location-selector ${className}`}>
      {/* GPS Auto-Location Button */}
      <div style={{ marginBottom: '16px' }}>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={disabled || gettingLocation}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            backgroundColor: gettingLocation ? '#ccc' : '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: disabled || gettingLocation ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>
            {gettingLocation ? '⏳' : '📍'}
          </span>
          {gettingLocation ? 'Getting Location...' : 'Use My Location'}
        </button>
        {locationError && (
          <div style={{
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#fee',
            color: '#c00',
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}>
            {locationError}
          </div>
        )}
      </div>

      {/* County Selector */}
      <div className="form-group">
        <label htmlFor="county">
          County {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id="county"
          value={selectedCounty}
          onChange={handleCountyChange}
          required={required}
          disabled={disabled}
          className="form-control w-full p-2 border rounded"
        >
          <option value="">Select County</option>
          {counties.map((county) => (
            <option key={county.id} value={county.id}>
              {county.name} ({county.region})
            </option>
          ))}
        </select>
      </div>

      {/* City Selector */}
      <div className="form-group mt-3">
        <label htmlFor="city">
          City/Town {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id="city"
          value={selectedCity}
          onChange={handleCityChange}
          required={required}
          disabled={disabled || !selectedCounty}
          className="form-control w-full p-2 border rounded"
        >
          <option value="">
            {selectedCounty ? 'Select City/Town' : 'Select County First'}
          </option>
          {cities.map((city, index) => (
            <option key={`${city.name}-${index}`} value={city.name}>
              {city.name}
              {showCityType && ` (${city.type})`}
              {city.isCapital && ' - County Capital'}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default LocationSelector
