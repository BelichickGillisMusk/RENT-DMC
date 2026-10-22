# Rent-Ruby Component Guide

Technical reference for the Rent-Ruby property management application. Covers the app's four-view architecture, admin tabs, major components, REST API, and the data layer.

---

## App Architecture

Rent-Ruby is a single-page React app served via a single Express + Vite middleware process on port 3000. `server.ts` handles the REST API and serves the compiled frontend at `/*`.

### Top-level views

The `view` state in `App.tsx` drives the entire layout. There are four values:

| View | Value | Access | Description |
|------|-------|--------|-------------|
| Hub (Landing) | `hub` | Public | Marketing hero, amenities, neighborhood, gallery |
| Admin | `admin` | Password-gated (`1111`) | Full property management suite |
| Tenant Portal | `tenant` | Firebase auth | Resident self-service (rent, notices, Info Nook) |
| Travel Nurse | `travel` | Public | Corporate/nurse short-term housing showcase |

The nav bar always renders. The Tenant Portal and Admin views are accessible via footer links or the persistent nav buttons at the bottom.

> **Rent Roll unlock**: Even after entering the admin view, the Rent Roll tab requires a separate double-click action on the "Executive Rent Roll" badge. `rentRollUnlocked` is a separate boolean in `App.tsx` state.

---

## Admin View

### `AdminNotificationSettings`

Rendered **above** the admin tab bar — not inside a tab. Always visible when the admin view is active.

- **File:** `src/components/AdminNotificationSettings.tsx` (481 lines)
- **Persistence:** localStorage only — no server round-trips for preferences
- **Keys persisted:**
  - `ruby_notify_maint_email` / `ruby_notify_maint_push`
  - `ruby_notify_sec_email` / `ruby_notify_sec_push`
- **Email destination config:** `hello@rent-ruby.com` (to), `bryan@norcalcarbmobile.com` (CC). Changing these is done in component state; there is no server-side notification dispatch in the current implementation — the UI simulates alerts locally.
- **Urgency threshold:** `all | high | critical` — controls which simulated alert types appear in the test log.

### Admin tabs

| Tab key | Label | Component | Description |
|---------|-------|-----------|-------------|
| `portfolio` | Portfolio | Inline in `App.tsx` | Property overview, stats, floor plan, construction timeline |
| `rent-roll` | Rent Roll | `RentRollDashboard` | Full unit/tenant management (requires unlock) |
| `maintenance` | Maintenance | `MaintenanceModule` | Request queue with emergency and escalation flags |
| `ceo` | CEO Briefing | `CEOBriefingPortal` | Financial summary and ownership metrics |
| `legal` | Legal & Forms | `AdminLegalLog` | Lease violations, notices, laws reference |
| `sfplus` | SF Plus | `SFPlusModule` | SF co-living competitive analysis |
| `marketmax` | MarketMax | `MarketMaxModule` | Comparable rent and market data |
| `concerns` | Concerns | `TenantConcernsModule` | Tenant complaint tracker |
| `vendors` | Vendors | Inline | Vendor contact list |
| `flow` | Flow | `LeaseUpdateWalkthrough` | Guided lease update wizard |
| `travel` | Travel | `TravelNursePortal` | Travel nurse portal (also top-level view) |
| `cameras` | Cameras | `SecurityCameras` | Security camera management |
| `email-templates` | Email Templates | `EmailTemplates` | Outreach and notice templates |

> `marketing` and `community` tab keys exist in the TypeScript type definition but have no rendered tab buttons in the current nav — they are placeholder variants.

---

## Key Components

### `RentRollDashboard`

- **File:** `src/components/RentRollDashboard.tsx` (1948 lines)
- **Entry point:** Admin tab `rent-roll` (requires `rentRollUnlocked`)

The most complex component in the app. Provides a split-pane management view:

- **Left pane** (resizable, 30–70% width): Unit list, tenant details, messages, notices, lease violations, financials
- **Right pane**: Messaging thread with selected tenant

**Internal tabs within the left panel:**
- Messages
- Tenant Notices
- Lease Violations
- Financials
- Reports

**API calls:**
```
GET  /api/rent-roll               # All units with tenant and balance data
GET  /api/stats                   # Portfolio-level stats
GET  /api/me                      # Current user (role: owner | accounting | gm)
GET  /api/property/1              # Property info for property 1
GET  /api/messages/:unitId        # Thread for a unit
POST /api/messages                # Send message to tenant
GET  /api/maintenance/:unitId     # Maintenance requests for a unit
GET  /api/tenant-notices/:tenantId
POST /api/tenant-notices
GET  /api/lease-violations/:tenantId
```

**Role-based display:** If `user.role === 'owner'` or `'accounting'`, the dashboard shows owner-level financial controls. GM view is read-only for some financial data.

**Resize handle:** The split pane divider is drag-interactive; mouse events update `leftPanelWidth` (percentage state).

---

### `MaintenanceModule`

- **File:** `src/components/MaintenanceModule.tsx` (883 lines)
- **Entry point:** Admin tab `maintenance`
- **Exports:** `MaintenanceModule` (standalone page) and `MaintenanceDashboard` (embeddable widget)

Tracks all maintenance requests across the portfolio with filtering and inline status updates.

**Key fields per request:**
- `is_emergency` — highlights request in red; shown at top of queue
- `is_escalated` — shows escalation badge
- `is_tenant_responsible` — tracks cost responsibility
- `assigned_to`, `gm_notes`, `cost`

**API calls:**
```
GET   /api/maintenance            # All requests
GET   /api/maintenance/:unitId    # Requests for one unit
POST  /api/maintenance            # New request (description, unit_id, is_emergency)
PATCH /api/maintenance/:id/status # Status update (pending|in_progress|resolved|closed)
GET   /api/rent-roll              # Unit list for the dropdown
```

---

### `FloorPlanView`

- **File:** `src/components/FloorPlanView.tsx` (723 lines)
- **Props:** `propertyId?: number` (defaults to 1)
- **Used in:** `PropertyHierarchy.tsx`

Visual floor-by-floor map of all units. Renders units as cards grouped by floor. Clicking a unit opens a detail panel on the right showing:
- Tenant name, lease end date, balance due
- Active maintenance requests
- Quick maintenance form (submit new request inline)
- Quick message form (send a message to tenant)

**API calls:**
```
GET  /api/rent-roll         # Unit data
GET  /api/maintenance       # Maintenance for all units
POST /api/maintenance       # Submit quick maintenance request
POST /api/messages          # Send quick message to tenant
```

**Floor grouping:** Units are grouped by extracting the floor number from `unit_number`. For example, unit `2A` is floor 2. Units without a numeric prefix land on floor 1.

---

### `NeighborhoodRadiusMap`

- **File:** `src/components/NeighborhoodRadiusMap.tsx` (573 lines)
- **Entry point:** Hub view / Neighborhood section

Interactive neighborhood radius map centered on the Oakland MacArthur building. Shows walkability rings and nearby amenities (transit, dining, parks, healthcare).

No server API calls — all data is static within the component. The background uses `src/assets/images/oakland_macarthur_3d_map_1781415061100.jpg`.

---

### `TravelNursePortal`

- **File:** `src/components/TravelNursePortal.tsx` (372 lines)
- **Props:** `onBack: () => void`
- **Entry points:**
  - Top-level `view === 'travel'` — full standalone page
  - Admin tab `travel` — embedded in admin view
  - Hub preview section (rendered without functional `onBack`)

Marketing portal for short-term (travel nurse / corporate) housing. Static content — no server API calls.

**Sections:**
1. Hospital proximity table (Kaiser Permanente, Summit Medical, Alta Bates Highland, Benioff Children's — with walking/driving times)
2. Unit features and benefits for medical workers
3. AI Security Camera feed simulation (local state only, cycles through `All Clear | Scanning | Motion Detected`)

The camera feed is a UI demo — `setInterval` toggles motion state every 4 seconds. It does not connect to `/api/security-cameras`.

---

### `AdminNotificationSettings`

See the [Admin View](#adminnotificationsettings) section above for full details.

---

### `AILaurenWidget`

- **File:** `src/components/AILaurenWidget.tsx`
- **Entry point:** Floating overlay in admin view

Gemini-powered chat assistant. Maintains conversation history in local component state (not persisted across sessions).

**API call:**
```
POST /api/gemini/generate
Body: { prompt: string, history: [{role, parts}] }
```

The server proxies this to the Gemini API using `GEMINI_API_KEY` from `.env.local`. If the key is missing, the server returns 503.

---

### `GmailContactForm`

- **File:** `src/components/GmailContactForm.tsx`
- **Entry point:** Hub view contact section

Sends email **using the visitor's own Google account** via the Gmail API. No server credentials are used — it's client-side OAuth only.

**OAuth flow:**
1. Google Sign-In popup (`firebase/auth` GoogleAuthProvider)
2. Scope requested: `https://www.googleapis.com/auth/gmail.send`
3. Access token used directly against Gmail API: `POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send`

This means email appears to come from the visitor's address, not from rent-ruby.com. The recipient is hardcoded to `hello@rent-ruby.com`.

---

## REST API Reference

All endpoints served by `server.ts` at `localhost:3000`. The Vite dev middleware handles `/*` fallthrough for non-API routes.

### Units & Rent Roll

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/rent-roll` | All units with tenant, balance, and last-activity data |
| `GET` | `/api/stats` | Portfolio stats (occupancy, balance totals) |
| `GET` | `/api/property/:id` | Property details |
| `GET` | `/api/properties` | All properties |
| `PATCH` | `/api/units/:id` | Update unit fields |
| `PATCH` | `/api/rent-roll/:unitId/overdue` | Mark unit overdue |
| `GET` | `/api/reports/unit/:unitId` | PDF-style unit report |

### Messaging

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/messages/:unitId` | Thread for a unit |
| `POST` | `/api/messages` | Send message (`unit_id`, `content`, `sender`) |

### Maintenance

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/maintenance` | All requests |
| `GET` | `/api/maintenance/:unitId` | Requests for one unit |
| `POST` | `/api/maintenance` | Create request (`unit_id`, `description`, `is_emergency`) |
| `PATCH` | `/api/maintenance/:id/status` | Update status |

### Tenant Management

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/tenant-rent/:tenantId` | Rent balance and payment history |
| `GET` | `/api/tenant-notices/:tenantId` | Notices for a tenant |
| `POST` | `/api/tenant-notices` | Create notice |
| `PATCH` | `/api/tenant-notices/:id/view` | Mark noticed viewed |
| `PATCH` | `/api/tenant-notices/:id/acknowledge` | Mark acknowledged |
| `GET` | `/api/lease-violations/:tenantId` | Violations for a tenant |
| `POST` | `/api/lease-violations` | Create violation |

### Concerns & Referrals

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/concerns` | All tenant concerns |
| `POST` | `/api/concerns` | Submit concern |
| `PATCH` | `/api/concerns/:id` | Update concern (`status`, `notes`, `assigned_to`) |
| `GET` | `/api/referrals` | All referrals |
| `POST` | `/api/referrals` | Create referral |

### Legal & Finance

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/legal-forms` | Downloadable legal form list |
| `GET` | `/api/laws-regulations` | Static CA landlord law reference |
| `GET` | `/api/market-comparables` | Comparable rent data |
| `GET` | `/api/bank-transactions` | Transaction list |
| `POST` | `/api/bank-transactions/match` | Match transaction to unit |
| `GET` | `/api/investment-projections` | ROI projection data |

### Infrastructure

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/me` | Current user (role derived from session cookie) |
| `GET` | `/api/cookie-set` | Set session cookie |
| `GET` | `/api/cookie-verify` | Verify session cookie |
| `GET` | `/api/security-cameras` | Camera list |
| `POST` | `/api/security-cameras` | Add camera |
| `PATCH` | `/api/security-cameras/:id` | Update camera |
| `GET` | `/api/vendors` | Vendor contacts |
| `GET` | `/api/user-settings/:userId` | User preferences |
| `PATCH` | `/api/user-settings/:userId` | Update preferences |
| `POST` | `/api/gemini/generate` | Proxy to Gemini API (requires `GEMINI_API_KEY`) |

---

## Data Layer

**Database:** SQLite via `better-sqlite3`. File: `rentroll_v3.db` in the project root (gitignored).

The database auto-initializes on first run via `db.exec(...)` in `server.ts`. Migrations for new columns (e.g., `assigned_to`, `is_emergency`) are applied with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`-style guards using try/catch.

**Key tables:**
- `properties` — property records
- `units` — individual units (linked to property)
- `tenants` — tenant records (linked to unit)
- `messages` — per-unit message threads
- `maintenance_requests` — maintenance queue
- `concerns` — tenant concern submissions
- `tenant_notices` — formal notices
- `lease_violations` — violation records
- `referrals` — referral tracking
- `security_cameras` — camera registry
- `vendors` — vendor contacts

### Firebase (Firestore)

The Tenant Portal (`view === 'tenant'`) uses Firebase Realtime / Firestore for live data with `onSnapshot` listeners. Config is in `firebase-applet-config.json` (public values only — no secrets committed). Security rules are in `firestore.rules`.

---

## Environment Variables

| Variable | Required | Used by |
|----------|----------|---------|
| `GEMINI_API_KEY` | Yes (for AI chat) | `server.ts` → `/api/gemini/generate` |
| Firebase config | Auto-loaded | `firebase-applet-config.json` (committed) |

Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY`. The server starts without it but returns 503 from `/api/gemini/generate`.

---

## Development

```bash
npm install
cp .env.example .env.local   # add GEMINI_API_KEY
npm run dev                   # starts Express + Vite on :3000
```

The SQLite database (`rentroll_v3.db`) is created automatically on first server start.

> **ThemeContext / palette system:** See `docs/theme-system.md` (open PR #4) for the 6-palette runtime theming system, CSS variable map, and `useTheme()` hook reference.
