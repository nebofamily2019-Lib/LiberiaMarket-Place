# LibMarketplace Test Plan

## Overview
This document outlines the comprehensive testing strategy for the LibMarketplace e-commerce platform, focusing on the critical accessibility features implemented for Liberian users with varying literacy levels.

## Testing Strategy

### 1. Unit Tests
Test individual components in isolation to ensure they work correctly.

### 2. Integration Tests  
Test how components work together and with external APIs.

### 3. End-to-End (E2E) Tests
Test complete user workflows from start to finish.

## Test Coverage Goals
- **Lines**: 80%
- **Functions**: 80% 
- **Branches**: 80%
- **Statements**: 80%

## Critical Features to Test

### 🎤 Voice Features
1. **VoiceRecorder Component**
   - Audio recording functionality
   - Playback controls
   - Delete functionality
   - Error handling (no microphone access)
   - Timer accuracy
   - File format validation

2. **VoiceInput Component**
   - Speech-to-text functionality
   - Text input fallback
   - Voice feedback
   - Error states

3. **SearchHeader Voice Search**
   - Speech recognition
   - Search query processing
   - Voice prompts
   - Microphone permissions

### 📍 Location Features
4. **LocationSelector Component**
   - GPS location detection
   - Reverse geocoding
   - Liberian county/city mapping
   - Fallback location selection
   - Error handling

### 📱 Core App Features
5. **AddProduct Form**
   - Form validation
   - Voice recording integration
   - Image upload
   - Price presets
   - Location integration
   - WhatsApp contact integration

6. **Home Page**
   - Navigation buttons
   - Voice feedback
   - User type selection
   - Removed welcome message

7. **ProductDetail Page**
   - WhatsApp integration
   - Call functionality
   - Product information display
   - Voice description playback (future)

### 🔐 Authentication & Context
8. **AuthContext**
   - Login/logout functionality
   - User state management
   - Token handling
   - Protected routes

9. **Voice Assistant Utilities**
   - Text-to-speech functionality
   - Voice prompts
   - Language support
   - Browser compatibility

## Test File Structure
```
src/
├── components/
│   ├── VoiceRecorder.test.tsx
│   ├── VoiceInput.test.tsx
│   ├── LocationSelector.test.tsx
│   └── SearchHeader.test.tsx
├── pages/
│   ├── AddProduct.test.tsx
│   ├── Home.test.tsx
│   └── ProductDetail.test.tsx
├── context/
│   └── AuthContext.test.tsx
├── utils/
│   └── voiceAssistant.test.ts
└── hooks/
    └── useGeolocation.test.ts
```

## Testing Tools & Setup
- **Framework**: Vitest
- **Rendering**: @testing-library/react
- **DOM Testing**: @testing-library/jest-dom
- **User Interactions**: @testing-library/user-event
- **Mocking**: Vitest vi functions
- **Coverage**: V8 provider

## Mock Requirements

### Browser APIs
- `navigator.mediaDevices.getUserMedia` (for audio recording)
- `webkitSpeechRecognition` / `SpeechRecognition` (for voice input)
- `speechSynthesis` (for text-to-speech)
- `navigator.geolocation` (for GPS)
- `localStorage` / `sessionStorage`

### External APIs
- OpenStreetMap Nominatim API (reverse geocoding)
- Backend API endpoints
- Image upload endpoints

## Test Scenarios

### Happy Path Tests
- User can record voice description for product
- User can search products using voice
- GPS automatically fills location
- WhatsApp integration opens correctly
- Form submissions work with all features

### Error Handling Tests
- Microphone access denied
- Speech recognition fails
- GPS unavailable
- Network errors
- Invalid form data

### Accessibility Tests
- Voice feedback works for illiterate users
- Screen reader compatibility
- Keyboard navigation
- Mobile touch targets

### Performance Tests
- Audio file size limits
- Voice recognition timeout
- GPS detection speed
- Component load times

## Browser Compatibility
Test across:
- Chrome (primary)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Device Testing
- Desktop
- Tablet
- Mobile phones
- Different screen sizes

## Security Testing
- Audio data handling
- Location data privacy
- User authentication
- XSS prevention

## Running Tests

### Commands
```bash
# Run all tests
npm test

# Run tests in watch mode  
npm run test:ui

# Run tests once
npm run test:run

# Generate coverage report
npm run test:coverage
```

### Coverage Reports
- HTML report: `coverage/index.html`
- JSON report: `coverage/coverage-final.json`
- Text report: Console output

## Success Criteria
1. ✅ All critical components have >80% test coverage
2. ✅ Voice features work in supported browsers
3. ✅ Location features handle GPS errors gracefully
4. ✅ Form integrations work end-to-end
5. ✅ No accessibility regressions
6. ✅ Performance meets mobile standards
7. ✅ Security vulnerabilities addressed

## Test Implementation Priority
1. **High Priority**: VoiceRecorder, VoiceInput, LocationSelector
2. **Medium Priority**: AddProduct integration, SearchHeader
3. **Low Priority**: Home page, ProductDetail, utility functions

## Continuous Integration
- Tests run on every commit
- Coverage reports generated
- Failed tests block deployment
- Performance benchmarks tracked

---

*This test plan ensures the LibMarketplace platform provides reliable, accessible e-commerce functionality for all Liberian users, regardless of literacy level.*