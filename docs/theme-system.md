# Theme System — Rent-Ruby

Rent-Ruby uses a multi-palette runtime theming system built on CSS custom properties. All colors are
applied dynamically to `:root` at runtime, so Tailwind utilities that reference CSS variables (e.g.
`bg-app-accent`, `text-app-text`) respond automatically when the palette changes.

**Source:** `src/components/ThemeContext.tsx`, `src/components/ThemeToggle.tsx`

---

## How it works

1. `ThemeProvider` (in `App.tsx`) wraps the entire component tree.
2. The active palette is stored in `localStorage` under the key `app-palette`. Default is
   `ruby-sensation`.
3. On every palette change, `ThemeProvider` applies the palette's CSS variable map to
   `document.documentElement.style` and sets the `light` or `dark` class on `<html>` (for
   Tailwind's `dark:` variant).
4. `ThemeToggle` (in the main nav) renders a palette picker dropdown (all six palettes) plus a
   quick sun/moon toggle that cycles between `future-dusk` (dark) and `apricot-sage` (light).

---

## CSS variables

Every palette sets the same set of variables. Reference these in Tailwind or inline styles — never
hardcode hex values.

| Variable | Purpose |
|----------|---------|
| `--app-bg` | Page / body background |
| `--app-card` | Card / panel background |
| `--app-text` | Primary body text |
| `--app-accent` | Brand accent color (buttons, highlights, links) |
| `--app-border` | Subtle border color (usually accent at low opacity) |
| `--ruby` | The "ruby" feature color (used for badges, indicators) |
| `--ruby-light` | Lighter tint of ruby for hover states |
| `--ruby-dark` | Darker shade of ruby for active states |
| `--body-gradient-1` | First stop of the page background gradient |
| `--body-gradient-2` | Second stop of the page background gradient |

---

## Palettes

### `ruby-sensation` — Ruby Sensation (default)
> Espresso-chocolate background with dusty rose and warm coral accents. 2026 Trend.

| Variable | Value |
|----------|-------|
| `--app-bg` | `#231515` |
| `--app-card` | `#2E1D1D` |
| `--app-text` | `#FFF1EC` |
| `--app-accent` | `#EC7286` |
| `--ruby` | `#EE5937` |
| category | dark |

---

### `future-dusk` — Future Dusk
> Celestial deep indigo and cybernetic violet. WGSN's 2026 Color of the Year.

| Variable | Value |
|----------|-------|
| `--app-bg` | `#0F101E` |
| `--app-card` | `#191A30` |
| `--app-text` | `#F0F1FA` |
| `--app-accent` | `#8F00FF` |
| `--ruby` | `#8B82FF` |
| category | dark |

**Note:** `toggleTheme()` defaults to this palette when switching from light.

---

### `cherry-lacquer` — Cherry Lacquer
> Black-cherry depth with crème parchment highlights. High-fashion couture runway trend.

| Variable | Value |
|----------|-------|
| `--app-bg` | `#120205` |
| `--app-card` | `#1E060C` |
| `--app-text` | `#FFFBF7` |
| `--app-accent` | `#D12C49` |
| `--ruby` | `#D12C49` |
| category | dark |

---

### `aquatic-awe` — Aquatic Awe
> Bioluminescent deep-ocean teal and radiant neon turquoise. Tech-nature design.

| Variable | Value |
|----------|-------|
| `--app-bg` | `#040E12` |
| `--app-card` | `#091E26` |
| `--app-text` | `#ECF8FF` |
| `--app-accent` | `#00F2FE` |
| `--ruby` | `#00F2FE` |
| category | dark |

---

### `apricot-sage` — Apricot Wellness (light)
> Earthy calming sage green, mineral sand, and peach-apricot pops.

| Variable | Value |
|----------|-------|
| `--app-bg` | `#FAF5F0` |
| `--app-card` | `#FFFFFF` |
| `--app-text` | `#2B2522` |
| `--app-accent` | `#E27E57` |
| `--ruby` | `#E27E57` |
| category | light |

**Note:** The only `light`-category palette. `toggleTheme()` defaults to this when switching from dark.

---

### `giants-orange` — Classic Legacy
> The original Rent-Ruby look. Deep navy slate with vibrant sunset orange. Legacy palette.

| Variable | Value |
|----------|-------|
| `--app-bg` | `#0B1A2D` |
| `--app-card` | `#14253D` |
| `--app-text` | `#F9F7F5` |
| `--app-accent` | `#FF5F1F` |
| `--ruby` | `#A64B4B` |
| category | dark |

This palette reproduces the original Giants-inspired brand colors documented in early AGENTS.md
versions. It is not the default but is available to users and agents that reference the legacy
"orange/navy" design tokens.

---

## `useTheme()` API

```tsx
import { useTheme } from './ThemeContext';

const { theme, activePalette, setPalette, palettes, toggleTheme } = useTheme();
```

| Value | Type | Description |
|-------|------|-------------|
| `theme` | `'dark' \| 'light'` | Category of the active palette |
| `activePalette` | `string` | ID of the active palette (e.g. `'ruby-sensation'`) |
| `setPalette(id)` | `(id: string) => void` | Switch to a palette by ID; persists to `localStorage` |
| `palettes` | `Palette[]` | Full array of all six palette objects |
| `toggleTheme()` | `() => void` | Cycle between `future-dusk` (dark) and `apricot-sage` (light) |

Must be called inside a `<ThemeProvider>` subtree — throws otherwise.

---

## `ThemeToggle` component

Placed in the main navigation bar. Renders two controls:

1. **Palette picker button** — shows active palette name; opens an animated dropdown listing all six
   palettes with color chip previews. Closing: click outside or select a palette.
2. **Sun/Moon quick toggle** — calls `toggleTheme()`. Shows a moon icon in dark mode, sun in light.

No props required. Reads and writes palette state through `useTheme()`.

---

## Adding a new palette

1. Add a new `Palette` object to the `PALETTES` array in `ThemeContext.tsx`. Follow the existing
   shape: `id`, `name`, `description`, `year`, `category` (`'dark'` or `'light'`), `chips` (4 hex
   preview swatches), and the full `colors` map.
2. The palette becomes immediately available in the `ThemeToggle` dropdown and via `setPalette(id)`.
3. Update this file with the new palette's variable values.

---

## Pitfalls

- Do not use hardcoded hex values in component styles. Use `var(--app-accent)` or the corresponding
  Tailwind utility (`text-[var(--app-accent)]` / `bg-[--app-accent]`).
- The `dark:` Tailwind variant responds to the `dark` class on `<html>`, which `ThemeProvider` sets
  automatically. You do not need to set it manually.
- `localStorage` key is `app-palette`. Clearing `localStorage` resets to `ruby-sensation`.
