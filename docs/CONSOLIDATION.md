# Rent / DMC / Rent-Ruby consolidation plan

This document inventories what we know today and proposes how to merge ~5 months of Google AI Studio work into **one canonical repo** under `CARBComplianceApp`.

## Goal

1. **Discover** every Rent-Ruby, DMC, Silverback property, and related AI Studio export.
2. **Consolidate** into a single codebase (recommended: `RENT-DMC` as the monolith).
3. **Compare** homepages and design systems (screenshots + palette notes).
4. **Ship** a polished **public homepage** + **password-protected tenant portal** (pilot on **Unit 105** only).

---

## GitHub inventory (`CARBComplianceApp`)

| Repo | Role today | Rent/DMC relevance | Action |
|------|------------|-------------------|--------|
| **[RENT-DMC](https://github.com/CARBComplianceApp/RENT-DMC)** | **Primary** — full-stack Rent-Ruby (Express + SQLite + Vite React) | Hub, Admin, Tenant portal, travel nurse, legal, rent roll | **Keep as canonical** |
| **[more-silverback](https://github.com/CARBComplianceApp/more-silverback)** | Silverback AI agency SPA; embeds **Rent DMC** ledger view | Alternate UI / rent table prototype; mock tenants on Ruby units | **Merge** Rent DMC module + any superior UX into `RENT-DMC`; archive or mark read-only |
| **stock** | Empty placeholder (“htmls for cloud”) | Unknown exports | Check Google Drive / AI Studio; populate or delete |
| **1111** | Archived | Possibly early experiments | Skim for assets only |

Other org repos (CARB, Solo-Partner-AI, etc.) are **not** property sites unless you confirm otherwise.

### Not in GitHub (you are checking AI Studio)

Export anything that matches:

- Rent-Ruby, Rent-Ruby.com, 3875 Ruby
- DMC Properties, Rent DMC, rent-dmc
- Mosswood / Silverback property marketing pages
- Duplicate AI Studio apps with different color themes

**Per app, please capture:**

- AI Studio share URL (like `https://ai.studio/apps/85f4144f-...` in `README.md`)
- `metadata.json` + full source zip if export differs from GitHub
- Firebase project ID / Firestore database ID (see `firebase-applet-config.json` pattern)
- Which domain was intended (rent-ruby.com, travel subdomain, etc.)

---

## Canonical AI Studio app (this repo)

| Field | Value |
|-------|--------|
| App name | Rent-Ruby \| The Ultimate Oakland Lifestyle |
| AI Studio | https://ai.studio/apps/85f4144f-dabc-4ffc-b990-b6a65dc46dad |
| Firebase Firestore DB | `ai-studio-85f4144f-dabc-4ffc-b990-b6a65dc46dad` |
| Firebase project | `gen-lang-client-0013150741` |

---

## Visual comparison (two live variants today)

Screenshots saved under `/opt/cursor/artifacts/consolidation/` when captured from dev servers.

| # | App | URL (dev) | Palette | Typography | Best for |
|---|-----|-----------|---------|------------|----------|
| 1 | **Rent-Ruby Hub** | `:3000` Hub | Orange `#FD5A1E`, navy `#0B1A2D`, white | Inter + serif italics | **Public marketing** — story, amenities, neighborhood |
| 2 | **Rent-Ruby Tenant** | `:3000` Tenant | Warm brown + orange accents | Same family | **Resident portal** — floor plan, Info Nook, mailbox |
| 3 | **Silverback home** | `:3001` SILVERBACK | Black + silver gradient + **cyan** `#00F0FF` | Bebas Neue + DM Sans/Mono | Agency brand; not property-first |
| 4 | **Silverback Rent DMC** | `:3001` RENTDMC | Black + cyan; green/red ledger | Mono dashboard | **Admin ledger** feel — fast scan paid/late |

**Recommendation:** Use **Rent-Ruby (1–2)** as the public + tenant skin. Pull **ledger table clarity** from Silverback Rent DMC (4) into Admin rent roll, not as a separate homepage.

---

## Proposed monorepo structure (after merge)

```
RENT-DMC/
  apps/
    web/          # current Vite + Express (or split later)
  packages/
    ui/           # shared tokens (orange Giants vs cyan Silverback themes)
    db/           # SQLite schema + migrations
  docs/
    CONSOLIDATION.md
    design-comparison/
```

Phase 1 can stay flat (current layout) and only add `docs/` + imports from `more-silverback` where useful.

---

## Tenant portal: Unit 105 pilot (password + database)

### Current state

- **SQLite** already backs units/tenants (`server.ts`, `rentroll_v3.db`).
- **Tenant portal** (`TenantPortal.tsx`) mostly uses **hardcoded `tenant_id=1`** in API calls.
- **Firebase Google sign-in** maps one email to unit `105`; everything else defaults to `101`.
- **No tenant password gate** — footer toggle opens portal without auth.

### Target (pilot)

| Requirement | Approach |
|-------------|----------|
| Login | Unit number + password (105 + secret stored hashed in SQLite) |
| Session | HTTP-only cookie or JWT from Express |
| Data scope | All `/api/*` tenant routes scoped to `tenant_id` for unit 105 |
| Safe testing | Feature flag `TENANT_AUTH_PILOT=105` — other units show “coming soon” |
| Admin | Keep existing admin password (`1111` in `App.tsx`) until replaced |

### Practice credentials (to implement)

- Unit: `105`
- Password: set via seed/env (e.g. `TENANT_105_PASSWORD` for dev only)
- Map to real `tenant_id` from `units` table where `unit_number = '105'`

---

## Suggested work order (today)

1. **You:** List every AI Studio app + export zip / Firebase IDs not in GitHub.
2. **Us:** Confirm no other GitHub orgs/repos (personal account, `rent-ruby` org, etc.).
3. **Us:** Side-by-side review using comparison screenshots → pick **one** homepage direction.
4. **Us:** Implement tenant login (105 only) + wire APIs to `tenant_id` from session.
5. **Later:** Merge `more-silverback` Rent DMC table UX; delete duplicate apps.

---

## Open questions for you

1. Are there repos or AI Studio apps under a **different GitHub org or Google account**?
2. Which homepage wins: **Giants orange/navy** (Rent-Ruby) or **cyan/black** (Silverback)?
3. For Unit 105 pilot: email+password, unit+password, or Google sign-in only?
4. Should **travel.rent-ruby.com** stay a separate view or a tab on the main site?
