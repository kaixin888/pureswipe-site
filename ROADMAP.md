# clowand Product Roadmap

## Current Version: v2.6.0 (The Security & Intelligence Patch)
- **Status**: 100% Secure, Admin Protected (Server-side Auth), Real-time Insights (Chart.js).
- **Core Feature**: Disposable Toilet Brush System with 18-inch handle.

---

## Phase 2: Intelligence & Optimization (v2.6.0 - v2.6.2) - COMPLETED (April 14, 2026)

### 1. Data Visualization (P1) - DONE
- **Goal**: Provide actionable insights for the business owner.
- **Task**: 
  - Integrated `Chart.js` into the Admin Dashboard (`/admin/stats`).
  - Implemented 7-day GMV trend and Conversion Funnel (Visitors -> Checkout -> Orders).

### 2. Mobile Layout Refinement (P1) - DONE
- **Goal**: 100% usability on smallest US-standard mobile devices (375px / iPhone SE).
- **Task**: 
  - Verified 375px rendering: Hero, Bundles, and Reviews are fully optimized.
  - "Add to Cart" buttons are perfectly centered and tappable.
  - Full-screen Hamburger Menu implemented with `tailwindcss-animate`.

### 3. Trust Signal Expansion (P1) - DONE
- **Goal**: Increase conversion rate from 2.5% to 4.5%.
- **Task**: 
  - Added "Sarah J." and 10 verified US reviews.
  - Implemented high-performance Marquee for "Free Shipping across US".

---

## Phase 3: Engagement & Growth (v2.7.0 - v2.8.0) - IN_PROGRESS (Started: April 14, 2026)

### 1. Newsletter & Lead Capture (P1) - DONE (April 14, 2026)
- **Goal**: Build an email list for repeat refill sales.
- **Task**:
  - Implemented Exit-intent Popup (PC mouseleave / Mobile 30s delay).
  - Created `subscribers` table in Supabase for real-time lead capture.
  - Added `CLOWAND10` success code for 10% discount.
  - Integrated `localStorage` persistence (once per device).

### 2. User Accounts & Persistence (P1) - DONE (April 14, 2026)
- **Goal**: Allow customers to track orders and save shipping info.
- **Task**:
  - Integrated **Supabase Auth** (Email/Password).
  - Created `/login` and `/register` pages with mobile-responsive UI.
  - Implemented `/account` dashboard showing **Order History** linked to user email.
  - Added Session Persistence in `Navbar.js`.
  - Configured RLS-ready order lookup.

### 3. Content Strategy (P2)
- **Goal**: SEO long-tail keyword capture and brand story depth.
- **Task**:
  - Expand "About Us" page with "Boston Engineering" narrative.
  - Draft first 3 blog posts: "Why 18-inches is the hygiene standard", "Traditional brushes vs Clowand", "Moving into a new home? The hygiene checklist".

---

## Success Metrics
- **Performance**: Lighthouse SEO Score = 100, Performance > 90.
- **Conversion**: Target 3%+ initial conversion rate on US traffic.
- **Compliance**: 100% CCPA/GDPR coverage.
- **Maintenance**: Zero manual code injections required (Automated Git/Vercel workflow).
