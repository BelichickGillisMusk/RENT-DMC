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

## Cloud Agent development
- Install with `npm ci`. The lockfile is the source of truth.
- `npm run dev` starts Express and Vite together (`tsx server.ts`) on port 3000.
- The first server start creates `rentroll_v3.db` in the repository root. That file is generated local data.
- `GEMINI_API_KEY` is optional. Hub, admin, and tenant flows use the local API. Only `POST /api/gemini/generate` calls Gemini.
- A Firestore console warning that database `(default)` was not found comes from the committed Firebase config. The SQLite API routes still respond.
- Checks: `npm run lint` (`tsc --noEmit`) and `npm run build`. There is no test script.
