# PRD: Exit-intent Popup for Lead Capture (v1.0)

## 1. Problem Statement
High bounce rate is common in e-commerce. Currently, clowand has no way to capture "interested but not ready" visitors who are about to leave the site.

## 2. Objective
Convert leaving visitors into email subscribers by offering a one-time 10% discount, building a lead list for future refill subscription sales.

## 3. User Story
**As a** hesitant visitor on clowand.com,
**I want to** see a special offer when I'm about to leave,
**So that** I have a reason to stay or at least save the brand for later with a discount.

---

## 4. Functional Requirements

### 4.1 Trigger Logic
- **Desktop**: Detect "Exit Intent" when the cursor moves outside the top of the viewport (indicating closing tab or switching URLs).
- **Mobile**: Trigger after 30 seconds of dwell time OR when user scrolls up rapidly (indicating attempt to access the address bar).
- **Frequency**: Show only ONCE per session (use `localStorage` to track `lastShown`).

### 4.2 UI/UX Specifications
- **Modal Overlay**: Semi-transparent dark background (`bg-black/50`).
- **Headline**: "WAIT! Don't leave your hygiene to chance."
- **Offer**: "Get **10% OFF** your first clowand system today."
- **Social Proof**: "Join 5,000+ households choosing zero-touch cleaning."
- **Form**:
  - Input: Email address (required, regex validation).
  - Button: "GET MY 10% OFF" (Primary action, clowand blue).
  - Dismiss: Small "x" or "No thanks, I'll pay full price" link.

### 4.3 Data Handling
- **Backend**: Create a new Supabase table `subscribers` with fields: `id`, `email`, `created_at`, `status` (active).
- **Success State**: Replace form with: "Success! Use code **CLOWAND10** at checkout. (Check your email for the link)".

---

## 5. Acceptance Criteria
- [ ] Modal correctly detects exit intent on desktop (top-out).
- [ ] Email is validated before submission.
- [ ] Data is successfully saved to Supabase `subscribers` table.
- [ ] Success message displays the discount code.
- [ ] Modal does not reappear in the same session after being dismissed or submitted.

## 6. Technical Implementation Note
- Use `useEffect` for the `mouseleave` listener.
- Use `framer-motion` for smooth fade-in/out animation.
- Table schema in Supabase must be created before deployment.
