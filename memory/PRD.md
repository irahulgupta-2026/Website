# RevvCars — Product Requirements Document

## Original Problem Statement
> Build me a website from where I can generate leads and bookings for my car rental business. Build a modern website with all necessary tools and checkout page. For reference use revv.co.in.

## Vision
A modern, distinctive, dark-themed car rental platform for India (Delhi, Mumbai, Bangalore) that generates both leads (callback form) and paid bookings (Stripe checkout) — inspired by revv.co.in but with an original "Performance Pro" dark aesthetic.

## User Personas
1. **Casual traveller** — browses cars, filters by category/city, books with Stripe.
2. **Corporate/wedding lead** — fills lead capture form for bulk needs.
3. **Returning customer** — signs in via Google, manages bookings.
4. **Admin** — logs in with credentials, manages cars/bookings/leads.

## Core Requirements (Static)
- Multi-city car rental (Delhi, Mumbai, Bangalore)
- Full browse → book → Stripe checkout flow
- Lead capture form on landing
- Emergent Google Auth for customers
- Admin dashboard (JWT-protected) for cars, bookings, leads CRUD
- INR pricing, day-based rental
- Responsive, dark-first design with sticky mobile booking bar

## Architecture
- **Backend**: FastAPI, MongoDB, Emergent Stripe (Flow B, sk_test_emergent), Emergent Auth
- **Frontend**: React + shadcn/ui + Tailwind, Outfit/IBM Plex Sans/JetBrains Mono fonts
- **Payments**: `emergentintegrations` library, variable INR amounts, webhook + status polling

## Implemented — 2026-02-21
### Backend endpoints
- `GET /api/cars`, `GET /api/cars/{id}` (with filters: city, category, transmission, fuel, max_price)
- `POST /api/leads`
- `POST /api/bookings/quote`, `POST /api/bookings`, `GET /api/bookings/{id}`, `GET /api/bookings/me/list`
- `POST /api/payments/checkout`, `GET /api/payments/status/{session_id}`, `POST /api/webhook/stripe`
- `POST /api/auth/session`, `GET /api/auth/me`, `POST /api/auth/logout`
- `POST /api/admin/login`, admin CRUD for cars, bookings, leads, plus `/api/admin/stats`
- Auto-seed 10 sample cars on startup

### Frontend pages
- `/` Landing (hero, search widget, featured cars, how-it-works, why-us, testimonials, lead form, FAQ)
- `/cars` Browse with filters
- `/cars/:id` Car detail with sticky pricing + mobile sticky bar
- `/book/:id` Booking form with live quote
- `/checkout/:bookingId` Secure Stripe checkout redirect
- `/payment/success` Polling for confirmation
- `/payment/cancel`
- `/login` Google OAuth
- `/dashboard` Customer bookings
- `/admin/login`, `/admin` Full admin panel with tabs

## Prioritized Backlog
### P1 (post-MVP)
- Email/SMS confirmations (Resend + Twilio integration)
- Image gallery per car (multiple images)
- Coupon/promo codes
- Customer reviews/ratings tied to bookings
- WhatsApp share for lead-follow-up
### P2
- Multiple pricing plans (hourly/weekly/monthly with different rates)
- Delivery address geolocation + delivery fee calculation
- Waitlist for sold-out dates
- Admin analytics charts

## Next Action Items
- After user acceptance, integrate email confirmation (Resend) so bookings trigger auto-email.
- Add subscription/monthly rental tier with tab UI on car detail page.
