# Production Launch Plan (TODO-PROD)

## Phase 1: Infrastructure & Security (Immediate)
- [ ] **Database Migration**:
    - Switch from SQLite to PostgreSQL.
    - Run `npx sequelize-cli db:migrate` on the production DB.
- [ ] **Image Hosting**:
    - Configure Cloudinary or AWS S3 bucket.
    - Update `backend/.env` with storage credentials.
- [ ] **Environment Variables**:
    - Generate a strong `JWT_SECRET`.
    - Set `NODE_ENV=production`.
    - Set `FRONTEND_URL` to the actual domain.

## Phase 2: Final Polish (Pre-Launch)
- [ ] **Legal Pages**:
    - Create `TermsOfService.tsx`.
    - Create `PrivacyPolicy.tsx`.
- [ ] **SEO & Metadata**:
    - Update `index.html` title and meta description.
    - Add OpenGraph tags for social sharing (WhatsApp previews).
- [ ] **Performance**:
    - Run `npm run build` and analyze bundle size.
    - Enable Gzip/Brotli compression on the backend (`compression` middleware).

## Phase 3: Beta Launch (Soft Launch)
- [ ] **Deploy**:
    - Frontend: Vercel / Netlify.
    - Backend: Railway / Heroku / DigitalOcean.
- [ ] **User Testing**:
    - Onboard 10 "Power Sellers" manually.
    - Test Mobile Money flows with real small amounts.
- [ ] **Marketing**:
    - Share link via WhatsApp groups.

## Phase 4: Post-Launch (V2 Features)
- [ ] **Real-time Chat**: Implement Socket.io.
- [ ] **SMS Notifications**: Integrate Twilio or local SMS gateway.
- [ ] **PWA**: Add `manifest.json` and Service Workers for offline support.
