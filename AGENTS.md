# Project Context: Rent-Ruby

This document tracks persistent enhancements and project-specific rules for the Rent-Ruby application.

## Core Aesthetic: Giants-Inspired Modern
- **Color Palette**: Vibrant Orange (`#FF5F1F` / `app-accent`), Black/Deep Navy (`#0B1A2D`), and White.
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
- **View Toggles**: The app supports three distinct views: Hub (Landing), Admin (Management), and Tenant (Portal).

### 3. Hero Section Specifics
- **Tagline**: "POSITIVE VIBES LIVE HERE STORY." (Blue text + White/40 label).
- **Status Indicator**: "ONLY 2 UNITS LEFT" with a pulsing ruby dot.

## Development Rules
- **Icons**: Always use `lucide-react`.
- **Animations**: Always use `motion/react`.
- **Styling**: Strictly Tailwind CSS.
- **Data**: Prefer real-time patterns with `onSnapshot` if Firebase is used.

## Cursor Cloud specific instructions

### Architecture
Single Node process: **Express** serves REST APIs and (in dev) **Vite** middleware for the React SPA. **SQLite** (`rentroll_v3.db`, via `better-sqlite3`) is created/seeded automatically when `server.ts` starts. No Docker, emulators, or separate DB service.

### Commands (see `package.json`)
| Task | Command |
|------|---------|
| Install | `npm install` |
| Dev (API + UI) | `npm run dev` → http://localhost:3000 |
| Lint | `npm run lint` (`tsc --noEmit` only; no ESLint) |
| Build | `npm run build` |
| Production | `npm run build && npm run start` |

There is **no test script** in this repo.

### Running the dev server
Use a **tmux** session (long-lived): `npm run dev` from `/workspace`. Do **not** use `npm run preview` for full-stack work — preview is Vite-only and has no Express API.

### Optional integrations
- **`GEMINI_API_KEY`**: Required only for `/api/gemini/*` (CEO briefing, AI visualizer). Hub, admin SQLite flows, and rent roll work without it.
- **Firebase** (Auth + Firestore): Used for tenant mailbox customization in `TenantPortal.tsx`; most flows use REST + SQLite.

### Admin smoke-test login
Footer **Admin Login** uses password `1111` (see `src/App.tsx`). View toggles in the footer switch Hub / Admin / Tenant.

### Gotchas
- `server.ts` reads `GEMINI_API_KEY` from the process environment; README mentions `.env.local` but the server does not load dotenv by default — export the var in the shell or rely on Vite client injection during dev.
- Some admin legal UI calls (`/api/legal-library-*`) are not implemented in `server.ts` and return 404; other legal routes work.
