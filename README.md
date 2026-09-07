# Rent-Ruby — Property Management Dashboard

A full-stack property management SPA for an Oakland/East Bay rental portfolio. Built with React + TypeScript (Vite), Express, and SQLite. Integrates Firebase for real-time tenant features and Gemini AI for content generation.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript, Vite 6, Tailwind CSS 4 |
| Backend | Express (TypeScript via `tsx`) |
| Database | SQLite via `better-sqlite3` (file: `rentroll_v3.db`) |
| Real-time | Firebase Firestore (tenant portal) |
| AI | Google Gemini (`@google/genai`) |
| Animations | `motion/react` |
| Icons | `lucide-react` |

Express serves Vite in middleware mode during development — one port, one server.

## Quick start

```bash
npm install
cp .env.example .env.local   # set GEMINI_API_KEY
npm run dev                  # http://localhost:3000
```

The SQLite database (`rentroll_v3.db`) is created and seeded automatically on first run. Delete it to reset to seed data.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI content generation |

Firebase config is read from `firebase-applet-config.json` (committed, public values only — no service account key needed for the tenant-facing Firestore reads).

## Four views

The app exposes four top-level views via the `view` state (`hub` | `admin` | `tenant` | `travel`):

| View | Entry | Description |
|------|-------|-------------|
| **Hub** | Default | Public-facing landing page with building showcase, amenities, neighborhood, and gallery |
| **Admin** | Password prompt | Property management portal — rent roll, maintenance, legal, marketing, cameras, CEO briefing |
| **Tenant** | Tenant login | Tenant self-service portal — pay rent, submit maintenance, view notices, Info Nook docs |
| **Travel** | Hub section | Dedicated portal for traveling nurses and corporate housing inquiries |

Admin password is set via a `prompt()` check in `App.tsx`. There is no backend auth — this is a single-owner admin UI.

## Admin dashboard layout

The admin view has two sections:

**Always-visible controls** (rendered above the tab bar):
- `AdminOccupancyMonitor` — live unit occupancy at a glance
- `VisibilityMatrix` — controls which data columns show per role (Owner, GM, Accounting, Tenant)
- `AdminNotificationSettings` — per-channel alert preferences (email, push) for maintenance and security events

**Tab-based modules** (one active at a time):

| Tab (`adminTab`) | Component | Purpose |
|-----------------|-----------|---------|
| `portfolio` | Inline | Building overview, vacancy status, activity feed |
| `rent-roll` | `RentRollDashboard` | Unit-level rent tracking, overdue flags (locked until password confirmed) |
| `maintenance` | `MaintenanceModule` | Work order tracking and status updates |
| `ceo` | `CEOBriefingPortal` | KPI summary and investor narrative |
| `legal` | `AdminLegalLog` | Lease violations, notices, Oakland/CA housing law summaries |
| `sfplus` | `SFPlusModule` | SF+ market positioning and rent benchmarks |
| `marketmax` | `MarketMaxModule` | Comparable rent analysis |
| `concerns` | `TenantConcernsModule` | Tenant concern log with assignment and notes |
| `vendors` | `VendorManagement` | Vendor contacts and certifications |
| `flow` | `MaintenanceFlow` | End-to-end maintenance workflow |
| `travel` | `TravelNursePortal` | Travel nurse / corporate housing portal |
| `cameras` | `SecurityCameras` | Camera status and location registry |
| `email-templates` | `EmailTemplates` | Pre-written tenant and vendor email templates |

## Key components

### AdminNotificationSettings
Notification preference UI for the property manager. Always-visible in the admin dashboard (rendered above the tab bar, not inside a tab). Configures per-channel alerts (email, push) for maintenance requests and security events, with separate toggles and destination email/CC settings. Preferences are persisted to `localStorage` immediately on change. Includes a live alert simulator that fires sample notifications at the current configuration so you can verify routing before a real event.

### FloorPlanView
Visual floor-by-floor unit map for a property. Groups units by floor and renders each as a clickable card. Selecting a unit opens a slide-out detail panel showing tenant name, lease end date, balance, and active maintenance requests; includes a quick-submit form for new maintenance requests and a message-send shortcut. Used inside `PropertyHierarchy`. Fetches from `/api/rent-roll` and `/api/maintenance` on mount.

### RentRollDashboard
Full rent roll with unit status, tenant balance, overdue flags, and inline editing. Calls `PATCH /api/rent-roll/:unitId/overdue` to toggle overdue status.

### TravelNursePortal
Marketing and inquiry portal for traveling nurses and agency housing. Rendered both inside the admin travel tab and as a standalone `travel` view.

### VisibilityMatrix
Manages what content is visible to which user role (Owner, GM, Accounting, Tenant). Used across the admin portal to conditionally surface sensitive data.

### AILaurenWidget
Floating AI assistant powered by Gemini. Handles tenant questions and can generate lease-related copy via `POST /api/gemini/generate`. Appears as a chat bubble overlay accessible from the Hub view. Maintains conversation history within the session and sends the full history to Gemini on each turn for context-aware responses.

### GmailContactForm
Contact form that sends email directly via the Gmail API using the visitor's own Google account (OAuth popup). Requires the user to sign in with Google and grant the `gmail.send` scope. Collects name, phone, inquiry type, unit number, subject, and message. Because email is sent from the visitor's account (not a server account), no server-side email credentials are needed. Token is cached in module scope for the session and cleared on sign-out. Used for leasing inquiries and general contact from the Hub.

## API reference

All routes served by `server.ts` under `/api/`.

### Rent roll & units
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/rent-roll` | All units with tenant and payment data |
| PATCH | `/api/rent-roll/:unitId/overdue` | Toggle overdue flag on a unit |
| PATCH | `/api/units/:id` | Update unit fields |
| GET | `/api/property/:id` | Single property details |
| GET | `/api/properties` | All properties |
| GET | `/api/stats` | Portfolio-level KPIs |

### Maintenance
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/maintenance` | All open maintenance requests |
| GET | `/api/maintenance/:unitId` | Requests for one unit |
| POST | `/api/maintenance` | Create a new request |
| PATCH | `/api/maintenance/:id/status` | Update request status |

### Tenants & communication
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/messages/:unitId` | Message thread for a unit |
| POST | `/api/messages` | Post a message |
| GET | `/api/concerns` | All tenant concerns |
| POST | `/api/concerns` | Log a new concern |
| PATCH | `/api/concerns/:id` | Update concern (status, assignee, notes) |
| GET | `/api/tenant-rent/:tenantId` | Rent ledger for a tenant |
| GET/POST | `/api/lease-updates` | Lease update history |
| GET/POST/PATCH | `/api/tenant-notices` | Notices (view, acknowledge) |
| GET | `/api/referrals` | Referral list |
| POST | `/api/referrals` | Log a referral |

### Legal & compliance
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/lease-violations` | All lease violations |
| GET | `/api/lease-violations/:tenantId` | Violations per tenant |
| POST | `/api/lease-violations` | Log a violation |
| GET | `/api/legal-forms` | Available legal form templates |
| GET | `/api/laws-regulations` | Oakland/CA housing law summaries |

### Finance & market
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/market-comparables` | Comparable unit rents |
| GET | `/api/bank-transactions` | Bank transaction list |
| POST | `/api/bank-transactions/match` | Match a transaction to a unit/tenant |
| GET | `/api/investment-projections` | IRR, cap rate, cash flow projections |

### Infrastructure
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/security-cameras` | Camera list with status |
| POST | `/api/security-cameras` | Register a new camera |
| PATCH | `/api/security-cameras/:id` | Update camera status/notes |
| GET | `/api/vendors` | Vendor contacts |
| GET/PATCH | `/api/user-settings/:userId` | Notification preferences |
| GET | `/api/me` | Current user (cookie-based) |
| POST | `/api/gemini/generate` | AI text generation via Gemini |

## Database

SQLite file: `rentroll_v3.db` (gitignored — auto-created on first run).

Core tables: `properties`, `units`, `users`, `tenants`, `user_settings`, `referrals`, `construction_updates`, `security_cameras`, `maintenance_requests`, `messages`, `concerns`, `legal_documents`, `vendors`, `security_events`, `bank_transactions`, `lease_updates`, `tenant_notices`, `lease_violations`.

The server seeds one demo property (The Ruby, 4020 MacArthur Blvd, Oakland) with sample tenants on first run.

## Build & deploy

```bash
npm run build   # Vite build + esbuild server → dist/
npm run start   # node dist/server.cjs (production)
npm run lint    # TypeScript check only (tsc --noEmit)
```

Production serves the compiled React SPA as static files from `dist/` with the same Express server.

## Design system

- **Palette:** Orange accent (`#FF5F1F` / `app-accent`), deep navy (`#0B1A2D`), white
- **Rounding:** `rounded-sm` for badges/tags, `rounded-[2rem]` for cards/sections
- **Glass effect:** `bg-white/5 backdrop-blur-md` for overlay panels
- **Rules:** Tailwind CSS only (no custom CSS classes); `motion/react` for all animations; `lucide-react` for all icons
