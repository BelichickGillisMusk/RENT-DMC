# Rent-Ruby

Property management dashboard for **Bryan's Oakland/East Bay portfolio** (Mosswood and surrounding buildings). Giants-inspired visual design. Deployed from Google AI Studio.

## What it is

A full-stack single-page app that surfaces three distinct views for different audiences:

| View | Purpose | Audience |
|------|---------|----------|
| **Hub** | Landing page with property showcase, neighborhood info, and travel nurse/tenant acquisition | Prospective tenants / public |
| **Admin** | Rent roll, maintenance queue, tenant concerns, legal log, financials, market comps | Owner / GM |
| **Tenant** | Tenant portal (Info Nook, notifications, lease updates, security cameras) | Existing tenants |

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript, Vite, Tailwind CSS v4 |
| UI components | Lucide React (icons), Motion/React (animations), Recharts (charts) |
| Backend | Express + SQLite (`better-sqlite3`) via `server.ts` |
| Auth | Firebase Authentication (Google OAuth) |
| Realtime | Firebase Firestore (`onSnapshot`) for tenant portal data |
| AI | Google Gemini (`@google/genai`) via `/api/gemini/generate` |
| Styling rules | `rounded-sm` badges, `rounded-[2rem]` cards, Giants palette (Orange `#FF5F1F`, Navy `#0B1A2D`, White) |

## Local development

**Prerequisites:** Node.js 18+, a Gemini API key, and a Firebase project.

```bash
# 1. Install dependencies
npm install

# 2. Set your Gemini key
echo "GEMINI_API_KEY=your-key-here" > .env.local

# 3. Start the dev server (Express + Vite HMR)
npm run dev
# → http://localhost:5173
```

The dev server (`server.ts`) runs Express with Vite in middleware mode, so the React app and API share the same port. SQLite database (`rentroll_v3.db`) is auto-created on first run from the schema in `server.ts`.

**Firebase setup:**

Credentials live in `firebase-applet-config.json` (not committed — see `firebase-blueprint.json` for the expected shape). The Firestore database ID is read from `firestoreDatabaseId` in that file. To connect to your own Firebase project:

1. Create a Firebase project and enable Authentication (Google provider) and Firestore.
2. Copy `firebase-blueprint.json` to `firebase-applet-config.json` and fill in your project values.
3. Update `firestore.rules` with your security rules and deploy via the Firebase CLI.

**Build for production:**

```bash
npm run build   # Vite build + esbuild server bundle → dist/
npm start       # Runs dist/server.cjs
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI image/text generation |

The Gemini key is embedded into the Vite client bundle at build time via `vite.config.ts` `define`. Firebase credentials come from `firebase-applet-config.json`, not from env vars.

## Key modules

### Admin view modules (`src/components/`)

| Component | Purpose |
|-----------|---------|
| `RentRollDashboard` | Unit occupancy, rent amounts, payment status |
| `MaintenanceModule` / `MaintenanceFlow` | Maintenance requests with status tracking |
| `TenantConcernsModule` | Logged tenant concerns with assignment + notes |
| `CEOBriefingPortal` | Executive summary with financials, legal, and ops highlights |
| `AdminLegalLog` | Notices, lease violations, legal forms |
| `SFPlusModule` | San Francisco-specific rent control and compliance reference |
| `MarketMaxModule` | Market comparables and investment projections |
| `VendorManagement` | Vendor directory and work order tracking |
| `AdminOccupancyMonitor` | Occupancy trends and vacancy forecasting |
| `SecurityCameras` | Security camera feed viewer |

### Tenant portal (`TenantPortal.tsx`)

The portal is gated by Firebase Google Auth. Tabs:

- **Info Nook** — Move-out checklist, building rules, parking/transit maps, quick forms (sublet, pet registration)
- **Notifications** — Preferred notification time, SMS/email toggle (persisted to Firestore via `onSnapshot`)
- **Lease** — Lease update walkthrough (`LeaseUpdateWalkthrough`)
- **Security** — Camera events and building alerts

### Hub (landing) modules

| Component | Purpose |
|-----------|---------|
| `TravelingNurseHero` / `TravelNursePortal` | Targeted acquisition for traveling nurse tenants |
| `NeighborhoodRadiusMap` | Interactive map of nearby amenities |
| `NightlifeAttractions` | Oakland nightlife guide for prospective tenants |
| `EmployersSection` | Nearby major employers (hospitals, tech) |
| `MosswoodMailboxes` | Mailbox/package policy |

### AI features

- `AIImageGenerator` — Generates property visuals via Gemini's `imagen-3.0-generate-002` model
- `AILaurenWidget` — Chat widget powered by Gemini for prospective tenant questions
- `/api/gemini/generate` — Backend endpoint; validates key presence and proxies to Gemini

## Backend API reference

All routes are in `server.ts`. SQLite is the data store; Firestore is used only for real-time tenant portal data.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/rent-roll` | Units with tenant and payment data |
| GET | `/api/stats` | Occupancy rate, total revenue, open maintenance count |
| GET | `/api/maintenance` | All maintenance requests |
| POST | `/api/maintenance` | Create maintenance request |
| GET | `/api/concerns` | All tenant concerns |
| POST | `/api/concerns` | Log a concern |
| GET | `/api/messages/:unitId` | Messages for a unit |
| POST | `/api/messages` | Post a message |
| GET | `/api/properties` | Property list |
| GET | `/api/property/:id` | Single property detail |
| GET | `/api/legal-forms` | Available legal forms |
| GET | `/api/tenant-notices` | All tenant notices |
| POST | `/api/tenant-notices` | Create a notice |
| GET | `/api/lease-violations` | Lease violations |
| POST | `/api/lease-violations` | Log a violation |
| GET | `/api/market-comparables` | Rental market comps |
| GET | `/api/bank-transactions` | Bank transaction ledger |
| POST | `/api/bank-transactions/match` | Match transactions to invoices |
| GET | `/api/vendors` | Vendor directory |
| GET | `/api/security-cameras` | Camera list |
| POST | `/api/security-cameras` | Add camera |
| GET | `/api/security-events/:propertyId` | Security event log |
| POST | `/api/gemini/generate` | AI image/text generation |
| GET | `/api/me` | Current user info (cookie auth) |

## Database schema

SQLite tables: `properties`, `units`, `users`, `user_settings`, `tenants`, `referrals`, `construction_updates`, `security_events`, `maintenance_requests`, `tenant_concerns`, `messages`, `payments`, `legal_forms`, `laws_regulations`, `market_comparables`, `bank_transactions`, `investment_projections`, `tenant_notices`, `lease_violations`, `lease_updates`, `lease_update_steps`, `vendors`, `security_cameras`.

Full schema is in `server.ts` (`db.exec(...)` block).

## Development rules

- **Icons:** `lucide-react` only — do not add other icon libraries.
- **Animations:** `motion/react` only.
- **Styling:** Tailwind CSS only — no inline styles or CSS modules.
- **Realtime data:** Use Firestore `onSnapshot` for tenant portal features that need live updates.
- **TypeScript:** Run `npm run lint` (`tsc --noEmit`) before committing.

## Lint

```bash
npm run lint   # tsc --noEmit — type checks only, no emit
```
