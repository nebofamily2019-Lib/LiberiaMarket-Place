/**
 * Liberian Locations Data
 * Complete list of Liberia's 15 counties with their major cities, towns, and districts
 */

export interface City {
  name: string
  type: 'city' | 'town' | 'district' | 'village'
  isCapital?: boolean
  population?: string // Approximate population category
}

export interface County {
  id: string
  name: string
  capital: string
  region: 'North Central' | 'North Western' | 'South Central' | 'South Eastern' | 'Greater Monrovia'
  cities: City[]
}

export const liberianCounties: County[] = [
  {
    id: 'montserrado',
    name: 'Montserrado',
    capital: 'Bensonville',
    region: 'Greater Monrovia',
    cities: [
      { name: 'Monrovia', type: 'city', isCapital: false, population: 'large' }, // National capital
      { name: 'Bensonville', type: 'city', isCapital: true, population: 'medium' },
      { name: 'Paynesville', type: 'city', population: 'large' },
      { name: 'New Kru Town', type: 'town', population: 'large' },
      { name: 'West Point', type: 'district', population: 'large' },
      { name: 'Congo Town', type: 'town', population: 'medium' },
      { name: 'Caldwell', type: 'town', population: 'medium' },
      { name: 'Virginia', type: 'town', population: 'medium' },
      { name: 'Brewerville', type: 'town', population: 'medium' },
      { name: 'Careysburg', type: 'town', population: 'small' },
      { name: 'Todee', type: 'district', population: 'small' },
      { name: 'St. Paul River', type: 'district', population: 'small' },
      { name: 'Greater Monrovia', type: 'district', population: 'large' }
    ]
  },
  {
    id: 'bomi',
    name: 'Bomi',
    capital: 'Tubmanburg',
    region: 'North Western',
    cities: [
      { name: 'Tubmanburg', type: 'city', isCapital: true, population: 'medium' },
      { name: 'Senjeh', type: 'town', population: 'small' },
      { name: 'Klay', type: 'town', population: 'small' },
      { name: 'Suehn Mecca', type: 'town', population: 'small' },
      { name: 'Dewein', type: 'district', population: 'small' },
      { name: 'Klay District', type: 'district', population: 'small' },
      { name: 'Mecca District', type: 'district', population: 'small' },
      { name: 'Senjeh District', type: 'district', population: 'small' }
    ]
  },
  {
    id: 'bong',
    name: 'Bong',
    capital: 'Gbarnga',
    region: 'North Central',
    cities: [
      { name: 'Gbarnga', type: 'city', isCapital: true, population: 'large' },
      { name: 'Totota', type: 'town', population: 'medium' },
      { name: 'Salala', type: 'town', population: 'medium' },
      { name: 'Phebe', type: 'town', population: 'small' },
      { name: 'Suakoko', type: 'town', population: 'small' },
      { name: 'Bong Mines', type: 'town', population: 'medium' },
      { name: 'Sanoyea', type: 'town', population: 'small' },
      { name: 'Belefanai', type: 'town', population: 'small' },
      { name: 'Jorquelleh District', type: 'district', population: 'medium' },
      { name: 'Kokoyah District', type: 'district', population: 'small' },
      { name: 'Panta District', type: 'district', population: 'small' },
      { name: 'Salala District', type: 'district', population: 'small' }
    ]
  },
  {
    id: 'gbarpolu',
    name: 'Gbarpolu',
    capital: 'Bopolu',
    region: 'North Western',
    cities: [
      { name: 'Bopolu', type: 'city', isCapital: true, population: 'small' },
      { name: 'Gbarma', type: 'town', population: 'small' },
      { name: 'Kongba', type: 'town', population: 'small' },
      { name: 'Belleh', type: 'town', population: 'small' },
      { name: 'Bokomu District', type: 'district', population: 'small' },
      { name: 'Gounwolaila District', type: 'district', population: 'small' },
      { name: 'Kong-Ba District', type: 'district', population: 'small' },
      { name: 'Bopolu District', type: 'district', population: 'small' }
    ]
  },
  {
    id: 'grand-bassa',
    name: 'Grand Bassa',
    capital: 'Buchanan',
    region: 'South Central',
    cities: [
      { name: 'Buchanan', type: 'city', isCapital: true, population: 'large' },
      { name: 'Compound #3', type: 'town', population: 'small' },
      { name: 'Owensgrove', type: 'town', population: 'small' },
      { name: 'St. John River', type: 'town', population: 'small' },
      { name: 'Edina', type: 'town', population: 'small' },
      { name: 'Benson Town', type: 'town', population: 'small' },
      { name: 'District #1', type: 'district', population: 'medium' },
      { name: 'District #2', type: 'district', population: 'medium' },
      { name: 'District #3', type: 'district', population: 'small' },
      { name: 'District #4', type: 'district', population: 'small' }
    ]
  },
  {
    id: 'grand-cape-mount',
    name: 'Grand Cape Mount',
    capital: 'Robertsport',
    region: 'North Western',
    cities: [
      { name: 'Robertsport', type: 'city', isCapital: true, population: 'medium' },
      { name: 'Sinje', type: 'town', population: 'small' },
      { name: 'Garwula', type: 'town', population: 'small' },
      { name: 'Tewor', type: 'town', population: 'small' },
      { name: 'Gola Konneh', type: 'district', population: 'small' },
      { name: 'Porkpa District', type: 'district', population: 'small' },
      { name: 'Garwula District', type: 'district', population: 'small' },
      { name: 'Commonwealth District', type: 'district', population: 'small' },
      { name: 'Tewor District', type: 'district', population: 'small' }
    ]
  },
  {
    id: 'grand-gedeh',
    name: 'Grand Gedeh',
    capital: 'Zwedru',
    region: 'South Eastern',
    cities: [
      { name: 'Zwedru', type: 'city', isCapital: true, population: 'medium' },
      { name: 'Tchien', type: 'town', population: 'small' },
      { name: 'Putu', type: 'town', population: 'small' },
      { name: 'Konobo', type: 'town', population: 'small' },
      { name: 'Cavalla', type: 'town', population: 'small' },
      { name: 'Gbeapo', type: 'town', population: 'small' },
      { name: 'Tchien District', type: 'district', population: 'small' },
      { name: 'Konobo District', type: 'district', population: 'small' },
      { name: 'Gbeapo District', type: 'district', population: 'small' }
    ]
  },
  {
    id: 'grand-kru',
    name: 'Grand Kru',
    capital: 'Barclayville',
    region: 'South Eastern',
    cities: [
      { name: 'Barclayville', type: 'city', isCapital: true, population: 'small' },
      { name: 'Sasstown', type: 'town', population: 'small' },
      { name: 'Picnicess', type: 'town', population: 'small' },
      { name: 'Wedabo', type: 'town', population: 'small' },
      { name: 'Jloh', type: 'town', population: 'small' },
      { name: 'Buah District', type: 'district', population: 'small' },
      { name: 'Forpoh District', type: 'district', population: 'small' },
      { name: 'Sasstown District', type: 'district', population: 'small' }
    ]
  },
  {
    id: 'lofa',
    name: 'Lofa',
    capital: 'Voinjama',
    region: 'North Western',
    cities: [
      { name: 'Voinjama', type: 'city', isCapital: true, population: 'medium' },
      { name: 'Foya', type: 'town', population: 'medium' },
      { name: 'Kolahun', type: 'town', population: 'small' },
      { name: 'Zorzor', type: 'town', population: 'small' },
      { name: 'Salayea', type: 'town', population: 'small' },
      { name: 'Bolahun', type: 'town', population: 'small' },
      { name: 'Vahun', type: 'town', population: 'small' },
      { name: 'Foya District', type: 'district', population: 'medium' },
      { name: 'Kolahun District', type: 'district', population: 'small' },
      { name: 'Salayea District', type: 'district', population: 'small' },
      { name: 'Voinjama District', type: 'district', population: 'medium' },
      { name: 'Zorzor District', type: 'district', population: 'small' }
    ]
  },
  {
    id: 'margibi',
    name: 'Margibi',
    capital: 'Kakata',
    region: 'South Central',
    cities: [
      { name: 'Kakata', type: 'city', isCapital: true, population: 'large' },
      { name: 'Harbel', type: 'town', population: 'large' }, // Firestone Plantation
      { name: 'Gibi', type: 'town', population: 'small' },
      { name: 'Gboyah', type: 'town', population: 'small' },
      { name: 'Mambah-Kaba', type: 'district', population: 'medium' },
      { name: 'Gibi District', type: 'district', population: 'small' },
      { name: 'Kakata District', type: 'district', population: 'large' },
      { name: 'Firestone District', type: 'district', population: 'large' }
    ]
  },
  {
    id: 'maryland',
    name: 'Maryland',
    capital: 'Harper',
    region: 'South Eastern',
    cities: [
      { name: 'Harper', type: 'city', isCapital: true, population: 'medium' },
      { name: 'Pleebo', type: 'town', population: 'medium' },
      { name: 'Karloken', type: 'town', population: 'small' },
      { name: 'Gbeapo', type: 'town', population: 'small' },
      { name: 'Nyaake', type: 'town', population: 'small' },
      { name: 'Barrobo', type: 'town', population: 'small' },
      { name: 'Pleebo/Sodeken District', type: 'district', population: 'medium' },
      { name: 'Harper District', type: 'district', population: 'medium' },
      { name: 'Barrobo District', type: 'district', population: 'small' }
    ]
  },
  {
    id: 'nimba',
    name: 'Nimba',
    capital: 'Sanniquellie',
    region: 'North Central',
    cities: [
      { name: 'Sanniquellie', type: 'city', isCapital: true, population: 'medium' },
      { name: 'Ganta', type: 'city', population: 'large' },
      { name: 'Saclepea', type: 'town', population: 'medium' },
      { name: 'Tappita', type: 'town', population: 'medium' },
      { name: 'Yekepa', type: 'town', population: 'medium' }, // Mining town
      { name: 'Karnplay', type: 'town', population: 'small' },
      { name: 'Bahn', type: 'town', population: 'small' },
      { name: 'Gbehlay-Geh', type: 'town', population: 'small' },
      { name: 'Ganta District', type: 'district', population: 'large' },
      { name: 'Saclepea District', type: 'district', population: 'medium' },
      { name: 'Tappita District', type: 'district', population: 'medium' },
      { name: 'Sanniquellie-Mahn District', type: 'district', population: 'medium' },
      { name: 'Yarwin District', type: 'district', population: 'small' }
    ]
  },
  {
    id: 'rivercess',
    name: 'River Cess',
    capital: 'Cestos City',
    region: 'South Central',
    cities: [
      { name: 'Cestos City', type: 'city', isCapital: true, population: 'small' },
      { name: 'Yarpah Town', type: 'town', population: 'small' },
      { name: 'Timbo', type: 'town', population: 'small' },
      { name: 'Dorbor Town', type: 'town', population: 'small' },
      { name: 'Sam Gbalor District', type: 'district', population: 'small' },
      { name: 'Yarpah Town District', type: 'district', population: 'small' },
      { name: 'Jo River District', type: 'district', population: 'small' },
      { name: 'Norwein District', type: 'district', population: 'small' }
    ]
  },
  {
    id: 'river-gee',
    name: 'River Gee',
    capital: 'Fish Town',
    region: 'South Eastern',
    cities: [
      { name: 'Fish Town', type: 'city', isCapital: true, population: 'small' },
      { name: 'Tugbakeh', type: 'town', population: 'small' },
      { name: 'Glaro', type: 'town', population: 'small' },
      { name: 'Karforh', type: 'town', population: 'small' },
      { name: 'Nyenawliken', type: 'town', population: 'small' },
      { name: 'Glaro District', type: 'district', population: 'small' },
      { name: 'Gbeapo District', type: 'district', population: 'small' },
      { name: 'Karforh District', type: 'district', population: 'small' },
      { name: 'Nyenawliken District', type: 'district', population: 'small' }
    ]
  },
  {
    id: 'sinoe',
    name: 'Sinoe',
    capital: 'Greenville',
    region: 'South Eastern',
    cities: [
      { name: 'Greenville', type: 'city', isCapital: true, population: 'medium' },
      { name: 'Tarjuwon', type: 'town', population: 'small' },
      { name: 'Juarzon', type: 'town', population: 'small' },
      { name: 'Dugbe River District', type: 'district', population: 'small' },
      { name: 'Greenville District', type: 'district', population: 'medium' },
      { name: 'Jaedae District', type: 'district', population: 'small' },
      { name: 'Juarzon District', type: 'district', population: 'small' },
      { name: 'Kpayan District', type: 'district', population: 'small' },
      { name: 'Plahn Nyarbo District', type: 'district', population: 'small' },
      { name: 'Pynes Town District', type: 'district', population: 'small' },
      { name: 'Sanquin District', type: 'district', population: 'small' },
      { name: 'Seekon District', type: 'district', population: 'small' },
      { name: 'Tarjuwon District', type: 'district', population: 'small' },
      { name: 'Wedjah District', type: 'district', population: 'small' }
    ]
  }
]

/**
 * Get all counties
 */
export const getCounties = (): County[] => {
  return liberianCounties
}

/**
 * Get county by ID
 */
export const getCountyById = (id: string): County | undefined => {
  return liberianCounties.find(county => county.id === id)
}

/**
 * Get county by name
 */
export const getCountyByName = (name: string): County | undefined => {
  return liberianCounties.find(
    county => county.name.toLowerCase() === name.toLowerCase()
  )
}

/**
 * Get all cities in a county
 */
export const getCitiesByCounty = (countyId: string): City[] => {
  const county = getCountyById(countyId)
  return county ? county.cities : []
}

/**
 * Get counties by region
 */
export const getCountiesByRegion = (region: County['region']): County[] => {
  return liberianCounties.filter(county => county.region === region)
}

/**
 * Get all regions
 */
export const getRegions = (): County['region'][] => {
  return ['Greater Monrovia', 'North Central', 'North Western', 'South Central', 'South Eastern']
}

/**
 * Search cities across all counties
 */
export const searchCities = (searchTerm: string): { county: string; city: City }[] => {
  const results: { county: string; city: City }[] = []

  liberianCounties.forEach(county => {
    county.cities.forEach(city => {
      if (city.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({ county: county.name, city })
      }
    })
  })

  return results
}

/**
 * Get formatted location options for dropdowns
 */
export const getLocationOptions = () => {
  return liberianCounties.map(county => ({
    value: county.id,
    label: county.name,
    capital: county.capital,
    region: county.region,
    cities: county.cities.map(city => ({
      value: city.name,
      label: city.name,
      type: city.type
    }))
  }))
}

export default {
  counties: liberianCounties,
  getCounties,
  getCountyById,
  getCountyByName,
  getCitiesByCounty,
  getCountiesByRegion,
  getRegions,
  searchCities,
  getLocationOptions
}
