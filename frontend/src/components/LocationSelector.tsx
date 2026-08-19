import { useState, useEffect } from 'react'
import { getCounties, getCitiesByCounty, County, City } from '../data/liberianLocations'

interface LocationSelectorProps {
  selectedCounty?: string
  selectedCity?: string
  onCountyChange: (countyId: string) => void
  onCityChange: (cityName: string) => void
  onLocationFound?: (lat: number, lon: number) => void
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
  onLocationFound,
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

  // GPS Location - Auto-detect using geolocation with improved accuracy
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
        
        // Pass coordinates back to parent if handler provided
        if (onLocationFound) {
          onLocationFound(latitude, longitude)
        }

        try {
          // Use OpenStreetMap Nominatim for reverse geocoding (free and reliable)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'LibMarket/1.0 (Community E-commerce for Liberia)'
              }
            }
          )

          if (response.ok) {
            const data = await response.json()
            const address = data.address

            // Try to match detected location with Liberian counties
            let detectedCounty = ''
            let detectedCity = ''

            // Look for Liberia in the country field
            if (address.country_code === 'lr' || address.country?.toLowerCase().includes('liberia')) {
              // Try to match county from detected address
              const detectedRegion = address.state || address.county || address.region || ''
              
              // Simple matching logic for common counties
              const countyMatches = {
                'montserrado': 'montserrado',
                'margibi': 'margibi', 
                'nimba': 'nimba',
                'bong': 'bong',
                'lofa': 'lofa',
                'grand bassa': 'grand-bassa',
                'cape mount': 'cape-mount',
                'grand cape mount': 'cape-mount'
              }

              for (const [keyword, countyId] of Object.entries(countyMatches)) {
                if (detectedRegion.toLowerCase().includes(keyword)) {
                  detectedCounty = countyId
                  break
                }
              }

              // Try to get city/town
              detectedCity = address.city || address.town || address.village || ''
            }

            // Auto-select detected county or default to Montserrado
            const finalCounty = detectedCounty || 'montserrado'
            onCountyChange(finalCounty)

            // If we detected a city, try to select it
            if (detectedCity) {
              // Wait for cities to load, then select
              setTimeout(() => {
                onCityChange(detectedCity)
              }, 100)
            }

            // User feedback with more details
            const locationName = detectedCity 
              ? `${detectedCity}, ${counties.find(c => c.id === finalCounty)?.name || 'Montserrado'}`
              : counties.find(c => c.id === finalCounty)?.name || 'Montserrado County'
            
            alert(`📍 Location detected: ${locationName}. Please verify and adjust if needed.`)

          } else {
            // Fallback to Montserrado if geocoding fails
            onCountyChange('montserrado')
            alert('📍 Location detected! Auto-selected Montserrado County. Please select your city.')
          }

        } catch (error) {
          console.error('Reverse geocoding error:', error)
          // Fallback to Montserrado
          onCountyChange('montserrado')
          alert('📍 Location detected! Auto-selected Montserrado County. Please select your city.')
        } finally {
          setGettingLocation(false)
        }
      },
      (error) => {
        console.error('GPS error:', error)
        let errorMessage = 'Could not get your location. '
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access in your browser.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable.'
            break
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.'
            break
          default:
            errorMessage += 'Unknown location error.'
            break
        }
        
        setLocationError(errorMessage)
        setGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout for better accuracy
        maximumAge: 300000 // Cache location for 5 minutes
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
