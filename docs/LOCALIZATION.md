# Localization & Cultural Adaptation for LibMarket

This document describes the localization features implemented for the Liberian e-commerce marketplace.

## Table of Contents

1. [Liberian Locations Data](#liberian-locations-data)
2. [Phone Number Validation](#phone-number-validation)
3. [Payment Methods](#payment-methods)
4. [Price Negotiation](#price-negotiation)
5. [Usage Examples](#usage-examples)
6. [API Integration](#api-integration)

---

## Liberian Locations Data

### Overview

Complete data for all 15 counties of Liberia with their major cities, towns, and districts.

**File:** `frontend/src/data/liberianLocations.ts`

### Counties Included

All 15 counties organized by region:

#### Greater Monrovia Region
- **Montserrado** (Capital: Bensonville)
  - Major cities: Monrovia (national capital), Paynesville, New Kru Town

#### North Central Region
- **Bong** (Capital: Gbarnga)
  - Major cities: Gbarnga, Totota, Salala
- **Nimba** (Capital: Sanniquellie)
  - Major cities: Ganta, Sanniquellie, Saclepea, Tappita, Yekepa

#### North Western Region
- **Bomi** (Capital: Tubmanburg)
- **Gbarpolu** (Capital: Bopolu)
- **Grand Cape Mount** (Capital: Robertsport)
- **Lofa** (Capital: Voinjama)
  - Major cities: Voinjama, Foya, Kolahun, Zorzor

#### South Central Region
- **Grand Bassa** (Capital: Buchanan)
  - Major cities: Buchanan
- **Margibi** (Capital: Kakata)
  - Major cities: Kakata, Harbel (Firestone)
- **River Cess** (Capital: Cestos City)

#### South Eastern Region
- **Grand Gedeh** (Capital: Zwedru)
- **Grand Kru** (Capital: Barclayville)
- **Maryland** (Capital: Harper)
  - Major cities: Harper, Pleebo
- **River Gee** (Capital: Fish Town)
- **Sinoe** (Capital: Greenville)

### Data Structure

```typescript
interface City {
  name: string
  type: 'city' | 'town' | 'district' | 'village'
  isCapital?: boolean
  population?: 'large' | 'medium' | 'small'
}

interface County {
  id: string
  name: string
  capital: string
  region: 'North Central' | 'North Western' | 'South Central' | 'South Eastern' | 'Greater Monrovia'
  cities: City[]
}
```

### Available Functions

```typescript
// Get all counties
getCounties(): County[]

// Get county by ID
getCountyById(id: string): County | undefined

// Get county by name
getCountyByName(name: string): County | undefined

// Get all cities in a county
getCitiesByCounty(countyId: string): City[]

// Get counties by region
getCountiesByRegion(region: string): County[]

// Get all regions
getRegions(): string[]

// Search cities across all counties
searchCities(searchTerm: string): { county: string; city: City }[]

// Get formatted options for dropdowns
getLocationOptions(): LocationOption[]
```

### Usage Example

```typescript
import { getCounties, getCitiesByCounty } from '../data/liberianLocations'

// Get all counties
const counties = getCounties()

// Get cities in Montserrado
const cities = getCitiesByCounty('montserrado')

// Search for cities
const results = searchCities('Gbarnga')
```

---

## Phone Number Validation

### Overview

Comprehensive validation for Liberian phone numbers supporting all major network operators.

**File:** `frontend/src/utils/phoneValidation.ts`

### Supported Network Operators

| Operator | Prefixes | Example |
|----------|----------|---------|
| MTN | 88, 77, 76 | +231 88 123 4567 |
| Orange | 86, 87 | +231 86 123 4567 |
| Lonestar Cell | 55, 44, 33 | +231 55 123 4567 |
| Comium | 22 | +231 22 123 4567 |

### Phone Number Format

- **International Format:** `+231 XX XXX XXXX`
- **Local Format:** `0XX XXX XXXX`
- **Digits:** 9 digits after country code (or 10 with leading 0)

### Validation Functions

#### Main Validation

```typescript
validateLiberianPhone(phoneNumber: string): PhoneValidationResult

// Returns:
{
  isValid: boolean
  formatted: string
  carrier?: string
  errorMessage?: string
}
```

#### Quick Validation

```typescript
isValidLiberianPhone(phoneNumber: string): boolean
```

#### Formatting Functions

```typescript
// Format to standard display format
formatPhoneNumber(phoneNumber: string): string
// "88123456" → "+231 88 123 456"

// Format with carrier info
formatPhoneWithCarrier(phoneNumber: string): string
// "88123456" → "+231 88 123 456 (MTN)"

// Convert to international format
toInternationalFormat(phoneNumber: string): string
// "088123456" → "+23188123456"

// Convert to local format
toLocalFormat(phoneNumber: string): string
// "+23188123456" → "088123456"
```

#### Carrier Detection

```typescript
getCarrier(phoneNumber: string): string | null
// "88123456" → "MTN"
```

#### Parse Input

```typescript
parsePhoneInput(input: string): {
  cleaned: string
  hasCountryCode: boolean
  hasLeadingZero: boolean
  digitCount: number
  suggestions: string[]
}
```

### Validation Examples

#### Valid Numbers

```typescript
// All these formats are valid:
validateLiberianPhone('88123456')         // ✓ Basic format
validateLiberianPhone('088123456')        // ✓ With leading 0
validateLiberianPhone('+23188123456')     // ✓ International
validateLiberianPhone('231 88 123 456')   // ✓ With spaces
validateLiberianPhone('231-88-123-456')   // ✓ With dashes
```

#### Invalid Numbers

```typescript
validateLiberianPhone('123')              // ✗ Too short
validateLiberianPhone('99123456')         // ✗ Invalid prefix
validateLiberianPhone('12345678901234')   // ✗ Too long
```

---

## Payment Methods

### Overview

LibMarket supports popular Liberian payment methods to make transactions convenient for both buyers and sellers.

**File:** `frontend/src/data/paymentMethods.ts`

### Supported Payment Methods

#### Mobile Money (Most Popular)
- **MTN Mobile Money** 📱
  - Most widely used mobile money service in Liberia
  - Linked to MTN network (88, 77, 76 prefixes)

- **Orange Money** 📱
  - Popular alternative mobile money service
  - Linked to Orange network (86, 87 prefixes)

- **Lonestar Money** 📱
  - Lonestar Cell MTN mobile money service
  - Linked to Lonestar network (55, 44, 33 prefixes)

#### Cash Payments
- **Cash on Delivery (COD)** 💵
  - Pay with cash when item is delivered
  - Most trusted method for buyers

- **Cash on Pickup** 💵
  - Pay with cash when picking up item
  - Convenient for local transactions

#### Bank Transfer
- **Bank Transfer** 🏦
  - Direct transfer via LBR, LBDI, UBA, GTBank, etc.
  - Used for larger transactions

#### Other Methods
- **Negotiable/Flexible** 🤝
  - Payment method to be discussed with buyer
  - Provides maximum flexibility

### Data Structure

```typescript
interface PaymentMethod {
  id: string
  name: string
  type: 'mobile_money' | 'cash' | 'bank' | 'other'
  description: string
  isPopular: boolean
  icon?: string
  provider?: string
}
```

### Available Functions

```typescript
// Get all payment methods
getPaymentMethods(): PaymentMethod[]

// Get popular payment methods only
getPopularPaymentMethods(): PaymentMethod[]

// Get methods by type
getPaymentMethodsByType(type: string): PaymentMethod[]

// Get method by ID
getPaymentMethodById(id: string): PaymentMethod | undefined

// Get mobile money providers
getMobileMoneyProviders(): PaymentMethod[]

// Get cash payment methods
getCashPaymentMethods(): PaymentMethod[]

// Format for dropdown options
getPaymentMethodOptions(): PaymentMethodOption[]

// Format method name with icon
formatPaymentMethodName(methodId: string): string
```

### Components

#### PaymentMethodSelector Component

**File:** `frontend/src/components/PaymentMethodSelector.tsx`

Reusable component for selecting payment methods with visual grouping by type.

```typescript
<PaymentMethodSelector
  selectedMethods={paymentMethods}
  onChange={setPaymentMethods}
  showDescriptions={true}
/>
```

**Features:**
- Groups methods by type (Mobile Money, Cash, Bank, Other)
- Shows popular badges
- Multi-select checkboxes
- Visual feedback on selection
- Optional descriptions

#### PaymentMethodBadge Component

**File:** `frontend/src/components/PaymentMethodBadge.tsx`

Display payment methods as badges on product listings.

```typescript
<PaymentMethodBadge
  methodIds={product.paymentMethods}
  maxDisplay={3}
  size="medium"
  showIcons={true}
/>
```

**Features:**
- Compact badge display
- Shows icons
- Limits displayed methods (shows "+X more")
- Tooltip with description
- Size variants (small, medium, large)

---

## Price Negotiation

### Overview

LibMarket supports price negotiation, which is a common practice in Liberian commerce.

### Features

- **Negotiable Toggle**: Sellers can mark prices as negotiable
- **Visual Indicator**: Products show "🤝 Negotiable" badge
- **Default Behavior**: Defaults to negotiable (true) to encourage communication

### Implementation

#### In Forms

```typescript
const [isNegotiable, setIsNegotiable] = useState(true)

<label>
  <input
    type="checkbox"
    checked={isNegotiable}
    onChange={(e) => setIsNegotiable(e.target.checked)}
  />
  Price is Negotiable
</label>
```

#### Display Badge

```typescript
import { NegotiableBadge } from '../components/PaymentMethodBadge'

<NegotiableBadge
  isNegotiable={product.isNegotiable}
  size="medium"
/>
```

**Badge Styling:**
- Green background (#d4edda)
- Green text (#155724)
- Handshake icon (🤝)
- Only shows when negotiable is true

### Cultural Context

Price negotiation is deeply embedded in Liberian commerce culture:
- Market vendors expect haggling
- Shows respect for both parties
- Builds relationship between buyer and seller
- Common for all product types
- Not considered offensive

### Best Practices

**For Sellers:**
1. Set realistic initial price
2. Know your minimum acceptable price
3. Be open to reasonable offers
4. Respond promptly to inquiries
5. Mark as negotiable to attract buyers

**For Buyers:**
1. Make respectful offers
2. Consider item condition and market value
3. Be prepared to justify your offer
4. Communicate clearly and politely

---

## Usage Examples

### Location Selector Component

```typescript
import LocationSelector from '../components/LocationSelector'

function MyForm() {
  const [county, setCounty] = useState('')
  const [city, setCity] = useState('')

  return (
    <LocationSelector
      selectedCounty={county}
      selectedCity={city}
      onCountyChange={setCounty}
      onCityChange={setCity}
      required
      showCityType
    />
  )
}
```

### Phone Input Component

```typescript
import PhoneInput from '../components/PhoneInput'

function UserForm() {
  const [phone, setPhone] = useState('')
  const [isPhoneValid, setIsPhoneValid] = useState(false)

  const handlePhoneChange = (value: string, isValid: boolean) => {
    setPhone(value)
    setIsPhoneValid(isValid)
  }

  return (
    <PhoneInput
      value={phone}
      onChange={handlePhoneChange}
      required
      showValidation
      showCarrier
      label="Your Phone Number"
    />
  )
}
```

### Payment Method Selector

```typescript
import PaymentMethodSelector from '../components/PaymentMethodSelector'

function ProductForm() {
  const [paymentMethods, setPaymentMethods] = useState(['cash-on-delivery', 'cash-on-pickup'])

  return (
    <PaymentMethodSelector
      selectedMethods={paymentMethods}
      onChange={setPaymentMethods}
      showDescriptions={true}
    />
  )
}
```

### Payment Method Badges (Display)

```typescript
import PaymentMethodBadge, { NegotiableBadge } from '../components/PaymentMethodBadge'

function ProductCard({ product }) {
  return (
    <div>
      <h3>{product.title}</h3>
      <p>${product.price}</p>

      <NegotiableBadge
        isNegotiable={product.isNegotiable}
        size="medium"
      />

      <PaymentMethodBadge
        methodIds={product.paymentMethods}
        maxDisplay={3}
        size="small"
        showIcons={true}
      />
    </div>
  )
}
```

### Complete Product Form Example

```typescript
import { useState } from 'react'
import LocationSelector from '../components/LocationSelector'
import PhoneInput from '../components/PhoneInput'
import { validateLiberianPhone } from '../utils/phoneValidation'
import { getPaymentMethods } from '../data/paymentMethods'

function AddProductForm() {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    county: '',
    city: '',
    phone: '',
    isNegotiable: true,
    paymentMethods: ['cash-on-delivery', 'cash-on-pickup']
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate phone number
    const phoneValidation = validateLiberianPhone(formData.phone)

    if (!phoneValidation.isValid) {
      alert(phoneValidation.errorMessage)
      return
    }

    // Prepare submission data
    const submissionData = {
      ...formData,
      phone: phoneValidation.formatted,
      location: `${formData.city}, ${formData.county}`,
      carrier: phoneValidation.carrier
    }

    // Submit to API
    submitProduct(submissionData)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Basic Fields */}
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        placeholder="Product Title"
      />

      <input
        type="number"
        value={formData.price}
        onChange={(e) => setFormData({...formData, price: e.target.value})}
        placeholder="Price (LRD)"
      />

      {/* Location Selector */}
      <LocationSelector
        selectedCounty={formData.county}
        selectedCity={formData.city}
        onCountyChange={(county) => setFormData({...formData, county})}
        onCityChange={(city) => setFormData({...formData, city})}
        required
        showCityType
      />

      {/* Phone Input */}
      <PhoneInput
        value={formData.phone}
        onChange={(phone) => setFormData({...formData, phone})}
        required
        showValidation
        showCarrier
      />

      {/* Price Negotiable Toggle */}
      <label>
        <input
          type="checkbox"
          checked={formData.isNegotiable}
          onChange={(e) => setFormData({...formData, isNegotiable: e.target.checked})}
        />
        Price is Negotiable
      </label>

      {/* Payment Methods */}
      <div>
        <h4>Accepted Payment Methods</h4>
        {getPaymentMethods().map(method => (
          <label key={method.id}>
            <input
              type="checkbox"
              checked={formData.paymentMethods.includes(method.id)}
              onChange={(e) => {
                const newMethods = e.target.checked
                  ? [...formData.paymentMethods, method.id]
                  : formData.paymentMethods.filter(m => m !== method.id)
                setFormData({...formData, paymentMethods: newMethods})
              }}
            />
            {method.icon} {method.name}
          </label>
        ))}
      </div>

      <button type="submit">Add Product</button>
    </form>
  )
}
```

---

## API Integration

### Storing Location Data

When submitting forms with location data:

```typescript
const userData = {
  name: 'John Doe',
  county: 'montserrado',      // County ID
  city: 'Paynesville',         // City name
  phone: '+231 88 123 4567'    // Formatted phone
}
```

### Backend Validation

The backend should also validate Liberian phone numbers:

**Example Node.js/Express validation:**

```javascript
// backend/utils/phoneValidation.js
const validateLiberianPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  let digits = cleaned

  if (digits.startsWith('231')) {
    digits = digits.substring(3)
  } else if (digits.startsWith('0')) {
    digits = digits.substring(1)
  }

  if (digits.length !== 9) {
    return { valid: false, message: 'Invalid phone number length' }
  }

  const validPrefixes = ['88', '77', '76', '86', '87', '55', '44', '33', '22']
  const prefix = digits.substring(0, 2)

  if (!validPrefixes.includes(prefix)) {
    return { valid: false, message: 'Invalid network operator prefix' }
  }

  return { valid: true, formatted: `+231${digits}` }
}
```

### Search and Filtering

Use location data for filtering products:

```typescript
// Filter products by county
const productsInCounty = products.filter(p => p.county === 'montserrado')

// Filter products by city
const productsInCity = products.filter(p => p.city === 'Gbarnga')

// Filter products by region
const countiesInRegion = getCountiesByRegion('North Central')
const countyIds = countiesInRegion.map(c => c.id)
const productsInRegion = products.filter(p => countyIds.includes(p.county))
```

---

## Testing

### Phone Validation Tests

Run tests with:

```bash
npm test phoneValidation.test.ts
```

Test coverage includes:
- ✓ All network operators (MTN, Orange, Lonestar, Comium)
- ✓ Multiple input formats
- ✓ Invalid numbers detection
- ✓ Formatting functions
- ✓ Carrier detection
- ✓ Format conversions

### Manual Testing Checklist

#### Location Selector
- [ ] Can select all 15 counties
- [ ] Cities update when county changes
- [ ] County capitals marked correctly
- [ ] Required validation works
- [ ] Disabled state works

#### Phone Input
- [ ] Accepts valid numbers from all carriers
- [ ] Rejects invalid prefixes
- [ ] Shows carrier name
- [ ] Auto-formats on blur
- [ ] Shows validation messages
- [ ] Required validation works

---

## Future Enhancements

### Potential Additions

1. **Payment Integration** ✅ Partially Implemented
   - ✅ Payment method preferences (MTN, Orange, Lonestar, Cash, Bank)
   - ⏳ Live Mobile Money API integration
   - ⏳ Payment processing and confirmation
   - ⏳ Escrow service for secure transactions

2. **Currency**
   - Liberian Dollar (LRD)
   - US Dollar (USD)
   - Currency conversion

3. **Language Support**
   - English (primary)
   - Liberian Pidgin English
   - Local languages (Kpelle, Bassa, etc.)

4. **Delivery Zones**
   - County-based delivery fees
   - City-specific delivery times
   - Rural vs urban delivery options

5. **Address Format**
   - Liberian address standards
   - Community/neighborhood data
   - Landmark-based addressing

---

## Resources

### Official Data Sources
- National Elections Commission of Liberia (county data)
- Liberia Telecommunications Authority (phone regulations)
- National Statistics Office (population data)

### Network Operator Websites
- MTN Liberia: www.mtn.com.lr
- Orange Liberia: www.orange.lr
- Lonestar Cell MTN: www.lonestarcell.com

---

## Support

For questions or issues with localization features:

1. Check this documentation
2. Review test cases in `phoneValidation.test.ts`
3. Check component props in TypeScript definitions
4. Report issues to the development team

---

**Last Updated:** 2025-10-17
**Version:** 1.1.0

### Changelog

**v1.1.0** (2025-10-17)
- ✅ Added Payment Methods data and components
- ✅ Added Price Negotiable toggle functionality
- ✅ Created PaymentMethodSelector component
- ✅ Created PaymentMethodBadge component
- ✅ Updated AddProduct form with payment preferences
- ✅ Added comprehensive payment documentation

**v1.0.0** (2025-10-17)
- ✅ Initial release
- ✅ Liberian locations data (15 counties, 200+ cities)
- ✅ Phone number validation for all carriers
- ✅ LocationSelector component
- ✅ PhoneInput component
- ✅ Complete documentation
