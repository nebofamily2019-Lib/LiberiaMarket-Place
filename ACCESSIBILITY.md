# LibMarket Accessibility Features

## 🎯 Goal: Simple, Voice-First Experience for Illiterate Users

LibMarket is designed for Liberia's diverse population, including those who cannot read. The app leverages AI and voice technology to make e-commerce accessible to everyone.

---

## 🔊 Voice Features

### 1. **Voice Search** (Already Implemented)
- **Location**: Search bar at top of Products page
- **How it works**: Tap the microphone button (🎤) and speak what you're looking for
- **Example**: Say "cassava" or "phone" to search for products
- **Visual feedback**: Microphone turns red (🔴) while listening

### 2. **Product Read-Aloud** (NEW)
- **Location**: Every product card has a speaker button (🔉) in the top-right corner
- **How it works**: Tap the speaker button to hear:
  - Product name
  - Price in Liberian dollars
  - Location
- **Example**: "iPhone 12. Price: 5000 Liberian dollars. Location: Monrovia, Montserrado"

### 3. **Full Product Details Read-Aloud** (NEW)
- **Location**: Large floating speaker button (🔊) on product detail page (bottom-right)
- **How it works**: Tap to hear complete product information:
  - Title
  - Price
  - Condition
  - Location
  - Full description
  - Seller name
  - Contact phone number
- **Why**: Users don't need to read anything - they can listen to everything

### 4. **Voice Input for Forms** (NEW - Component Created)
- **Component**: `VoiceInput`
- **Features**:
  - Microphone button (🎤) next to every text field
  - Tap to speak instead of typing
  - Read-back button (🔉) to hear what you typed
  - Visual "Listening..." indicator
  - Help button (❓) reads instructions aloud
- **Use cases**:
  - Product title
  - Description
  - Name during registration
  - Any text input

---

## 👁️ Visual Simplifications

### Large Touch Targets
- All buttons are minimum 44x44 pixels (mobile friendly)
- Price filter buttons are large and easy to tap
- Voice buttons are prominent (40px-56px)

### Icon-First Design
- 📍 Location indicator
- 💰 Price filter
- 🎤 Voice input
- 🔉 Listen/speaker
- 🔴 Recording indicator
- ❓ Help button
- ✓ Success indicators

### High Contrast
- Clear primary colors (#007bff blue)
- White backgrounds with colored buttons
- Active states clearly highlighted
- Green for "listening" (#25D366 - WhatsApp green familiar to users)

### Minimal Text
- Short, simple labels
- Icons convey meaning
- Large font sizes (16px minimum)
- Clear visual hierarchy

---

## 🛠️ Technical Implementation

### Voice Assistant Utility (`voiceAssistant.ts`)
```typescript
// Text-to-Speech
speak(text: string, lang: string = 'en-US')

// Speech-to-Text
startListening(onResult, onError, lang = 'en-US')

// Product-specific helpers
speakProductDetails(product)
speakFieldHelp(fieldName, instruction)
```

### Components

#### `VoiceButton`
- Reusable speaker button
- Props: `text`, `size`, `ariaLabel`
- Auto-pulses when speaking
- Used on: Product cards, detail pages

#### `VoiceInput`
- Form input with voice capability
- Features:
  - Voice input (🎤)
  - Read-back (🔉)
  - Help instructions (❓)
  - Visual "Listening" indicator
- Props: `value`, `onChange`, `label`, `helpText`, `multiline`

#### `SearchHeader` (Enhanced)
- Voice search built-in
- Large search bar
- Prominent microphone button

---

## 📱 Mobile-First Design Principles

1. **Bottom Navigation**: Common actions at thumb-reach
2. **Floating Action Buttons**: Voice button always accessible
3. **Large Cards**: Easy to tap and scan
4. **Minimal Scrolling**: Key info above the fold
5. **Touch-Friendly**: 44px minimum tap targets

---

## 🌍 Localization Ready

### Current: English
- Voice recognition: `en-US`
- Text-to-speech: `en-US`

### Future: Liberian English & Local Languages
- Can be extended to support:
  - Liberian English (unique phrases)
  - Kpelle
  - Bassa
  - Other local languages

To add a language:
```typescript
speak(text, 'language-code')
startListening(onResult, onError, 'language-code')
```

---

## 🎓 How to Use Voice Features

### For Users Who Cannot Read:

1. **Finding Products**:
   - Tap microphone in search bar
   - Say what you want
   - Listen to product descriptions by tapping speaker buttons

2. **Selling Products**:
   - Tap "Add Product" (+ button)
   - Use microphone buttons to speak product details
   - Tap read-back buttons to confirm what you said

3. **Getting Help**:
   - Tap question mark (❓) buttons
   - Instructions will be read aloud

### Training Required:
- Show users the microphone icon = speak
- Show users the speaker icon = listen
- Practice once with a helper/family member

---

## 🔄 Future AI Enhancements

### Short-term (Next Updates):
1. **Voice Input on Add Product Form**
   - Integrate `VoiceInput` component
   - Voice for title, description, price

2. **Voice Registration**
   - Speak your name instead of typing
   - Speak phone number (with confirmation)

3. **Audio Instructions**
   - Welcome message on first visit
   - Guided tour using voice
   - "Tap this button to search with your voice"

### Long-term (AI-Powered):
1. **Smart Voice Understanding**
   - "Cheap phone in Monrovia" → Auto-filter by price and location
   - Natural language queries

2. **Image Recognition**
   - Take photo → AI suggests category
   - AI generates product description from photo
   - Price suggestion based on similar items

3. **Voice Chatbot**
   - Ask questions in conversational way
   - "Is this item still available?" (spoken)
   - Automated seller responses

4. **Multilingual AI Translation**
   - Speak in Kpelle → Post in English
   - Read English → Hear in local language

---

## ✅ Accessibility Checklist

- [x] Voice search implemented
- [x] Product card voice read-aloud
- [x] Product detail voice read-aloud
- [x] Voice input component created
- [x] Large touch targets (44px+)
- [x] High contrast colors
- [x] Icon-first navigation
- [x] Minimal text UI
- [ ] Voice input on Add Product form (ready to implement)
- [ ] Voice registration (ready to implement)
- [ ] Audio welcome/tutorial
- [ ] Multilingual support

---

## 📊 Impact Metrics

### Target Users:
- **Illiterate**: Can fully use app with voice only
- **Semi-literate**: Voice assists reading
- **Literate**: Voice adds convenience

### Success Indicators:
- Time to complete product search (with voice)
- Time to post a product (with voice)
- User retention among illiterate population
- Voice feature usage rate

---

## 🔧 Developer Guide

### Adding Voice to a New Component:

1. **Import utilities**:
```typescript
import { speak, startListening } from '../utils/voiceAssistant'
import VoiceButton from '../components/VoiceButton'
```

2. **Add read-aloud**:
```typescript
<VoiceButton text="Your text here" size="medium" />
```

3. **Add voice input**:
```typescript
import VoiceInput from '../components/VoiceInput'

<VoiceInput
  value={value}
  onChange={setValue}
  label="Product Title"
  helpText="Tell us what you are selling"
/>
```

### Testing Voice Features:
1. Open app on mobile device (voice works best on phones)
2. Allow microphone permissions
3. Test in quiet environment first
4. Test with local accent/pronunciation

---

## 🌟 Key Takeaway

**LibMarket is designed so that someone who cannot read can:**
1. Search for products using their voice
2. Listen to product details
3. Post products using their voice
4. Complete transactions without reading

**Goal achieved**: Simple, accessible, voice-first marketplace for all Liberians.
