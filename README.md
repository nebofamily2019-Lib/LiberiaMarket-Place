# Liberia Marketplace 🇱🇷

> Liberia's Premier Community E-commerce Platform

## Overview

- Liberia Marketplace is a secure, user-friendly marketplace designed specifically for the Liberian community. Built with modern web technologies and accessibility in mind.

## Features

✅ **Multi-Role Authentication** - Buyers, Sellers, and Admins
✅ **Product Listings** - Post and browse items with categories
✅ **Make Offers** - Negotiate prices directly with sellers
✅ **Phone Verification** - Secure account verification
✅ **Real-time Search** - Find products quickly
✅ **Mobile Responsive** - Works on all devices
✅ **Security Hardened** - Rate limiting, XSS protection, CSP

## Project Structure

```
CommunityE-commerce-SPA-Liberia/
├── frontend/          # React SPA frontend
├── backend/           # Node.js/Express API
├── database/          # Database migrations and seeds
├── docs/             # Project documentation
└── README.md         # This file
```

## Tech Stack

- **Frontend**: React.js with mobile-first responsive design
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: JWT-based auth
- **Deployment**: To be configured

## Getting Started

```bash
# Clone repository
- git clone https://github.com/yourusername/libmarket.git
- cd libmarket

# Install dependencies
npm run install:all

# Start development servers
npm run dev
```

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository
2. Install frontend dependencies: `cd frontend && npm install`
3. Install backend dependencies: `cd backend && npm install`
4. Set up the database (instructions in database/README.md)
5. Start the development servers

## Quick Start (Manual)

- See MANUAL-RUN.md for step-by-step environment setup, CORS, and run commands.

## Features (MVP Phase 1)

- [x] User registration and authentication
- [x] Product listing for sellers
- [x] Product browsing for buyers
- [x] Search by category and keyword
- [x] Contact/purchase functionality
- [x] 5-star rating system for sellers

## AI-first & Illiterate-friendly UX Recommendations

- Goal: make the app usable by low-literacy users in Liberia and surface AI features to simplify tasks.
- UI principles
  - Minimal text, icon-first design, large touch targets (≥44px), high contrast, simple language.
  - Use clear emojis/icons alongside short labels (e.g., 📱 Electronics) and spoken labels.
  - Default to phone-first flows (phone required, email optional) and show example formats.
- Voice + Audio
  - Provide TTS prompts for forms and key actions (registration, add product, confirm).
  - Provide short audio confirmations for success/errors and audio-only navigation for onboarding.
- Visual affordances
  - Use large, consistent category chips with icons and optional color accents.
  - Use step-by-step wizards for multi-field flows (Add Product) with progress indicators.
- AI-assisted features
  - Smart form fill: suggest product title/category/tags from a short voice/text input using an AI helper.
  - Auto-generate friendly product descriptions from a few voice prompts (AI summarization).
  - Suggest price ranges based on category and local market data.
- Safety & trust
  - Prominent safety tips (meet in public, confirm contact) shown as audio + visual cue.
  - Seller verification badge workflow clearly explained in simple steps with audio.
- Performance & offline
  - Data-saving mode: low-bandwidth image thumbnails, defer full images until requested.
  - Save drafts locally and auto-sync when online.
- Localization
  - English + simple Liberian Pidgin English copy variants; all audio in the same languages.
- Measurement
  - Track success metrics for illiterate flows (voice interactions completed, drop-off points).
- Implementation note
  - Start with critical screens: Register, Login, Add Product, Product Detail, and Messages (future).

## Contributing

This project follows mobile-first and accessibility principles to ensure it works well for users in Liberia with varying levels of digital literacy and device capabilities.

## License

MIT License - see LICENSE file for details

---

- **Liberia Marketplace** - Built with ❤️ for Liberia 🇱🇷