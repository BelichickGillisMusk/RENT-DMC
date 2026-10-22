# Project Context: Rent-Ruby

This document tracks persistent enhancements and project-specific rules for the Rent-Ruby application.

## Core Aesthetic: Multi-Palette Theming System
- **Color Palette**: Controlled at runtime by `ThemeContext` (see `src/components/ThemeContext.tsx`). All colors are CSS variables on `:root`; do NOT hardcode hex values. Use `var(--app-accent)`, `var(--app-bg)`, `var(--ruby)`, etc.
  - **Default palette**: `ruby-sensation` — espresso/dusty-rose/coral.
  - **Legacy/original palette**: `giants-orange` ("Classic Legacy") — deep navy `#0B1A2D` + vibrant orange `#FF5F1F`. Use `id: 'giants-orange'` to reference it.
  - Six total palettes: `ruby-sensation`, `future-dusk`, `cherry-lacquer`, `aquatic-awe`, `apricot-sage` (only light palette), `giants-orange`.
  - See `docs/theme-system.md` for the full palette reference.
- **Typography**: 
  - Headings: Bold, tight-tracking sans-serif (Inter/font-sans).
  - Accents: Elegant serif italics for subheadings and distances.
  - Metadata: Bold, small-caps, wide-tracking for descriptions and badges.
- **Layout Patterns**: 
  - Use `rounded-sm` for technical badges (e.g., "EST. 1924").
  - Use `rounded-[2rem]` or `rounded-[2.5rem]` for main cards and sections.
  - High-contrast elements with subtle glassmorphism (`bg-white/5 backdrop-blur-md`).

## Key Features & Enhancements

### 1. The Info Nook (Tenant Portal)
- **Purpose**: A central hub for tenant documents, forms, and building knowledge.
- **Location**: `src/components/TenantPortal.tsx` (activeTab: `info-nook`).
- **Content**: 
  - Move-Out Checklist (Required).
  - Building Rules 2026.
  - Parking & Transit Maps.
  - Trash & Recycling Schedule (AI-monitored smart bins).
  - Quick Forms (Sublet, Pet registration, etc.).

### 2. Navigation & UX
- **Simplified Nav**: The "Platform" link has been removed from the main navigation to focus on the Hub, Amenities, Neighborhood, and Gallery.
- **View Toggles**: The app supports four distinct views:
  - `hub` — Public-facing landing page (default).
  - `admin` — Password-gated property management portal.
  - `tenant` — Tenant self-service portal with Firebase Firestore.
  - `travel` — Traveling nurse / corporate housing portal (`TravelNursePortal`).

### 3. Hero Section Specifics
- **Tagline**: "POSITIVE VIBES LIVE HERE STORY." (Blue text + White/40 label).
- **Status Indicator**: "ONLY 2 UNITS LEFT" with a pulsing ruby dot.

## Development Rules
- **Icons**: Always use `lucide-react`.
- **Animations**: Always use `motion/react`.
- **Styling**: Strictly Tailwind CSS.
- **Data**: Prefer real-time patterns with `onSnapshot` if Firebase is used.

## Cloud Agent development
- The public site is the static Cloudflare Pages site in `site/`. `npm run dev` serves it on port 3000. `npm run build` copies `site/` to `dist/` for Pages.
- Phone on the site is 628-999-3912. The notices ticker reads `site/notices.json`.
- The tenant sign-in app is not part of the public site. `/login` redirects home.
- `npm run build:app` still builds the older Express dashboard. That dashboard is not what rent-ruby.com publishes.
