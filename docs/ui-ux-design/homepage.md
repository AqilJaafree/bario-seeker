# Bario Seeker — Homepage
## UI/UX Design Reference

Documents the design decisions actually implemented in `app/page.tsx` and its
supporting components. Reflects the shipped state on the `landing-page`
branch, not a target spec — update this file when the homepage changes.

---

## 1. Design Language

**Palette** — one accent, locked across the whole page.

| Token | Value | Use |
|---|---|---|
| Canvas (light) | `#F5F6F1` | Page background, light mode |
| Canvas (dark) | `#111813` | Page background, dark mode |
| Ink (light) | `#111813` | Body text, light mode |
| Ink (dark) | `#F5F6F1` | Body text, dark mode |
| Deep forest | `#0C2317` | Fixed-dark feature blocks (map, journey headings, testimonial) — same tone in both themes |
| Map canvas | `#07170e` | Nested map surface inside the forest block |
| Accent | `#D4F63D` (hover `#c6e930`) | The one accent color: primary CTAs, selection highlight, active states, origin markers |

Semantic colors (emerald/amber/rose) are used only for real state — markup
severity tiers on the map, DOA verification status, stage badges on the value
chain rows. They are never used as decoration and never compete with the lime
accent for attention.

**Typography** — two families, one job each.

- **Figtree** (`font-heading`) — every headline, section title, card title,
  the nav wordmark, and large display numbers (stat tiles, prices).
- **Raleway** (`font-sans`, the page default) — body copy, labels, UI chrome.
- **Geist Mono** (`font-mono`) — prices, IDs, badges, anything tabular or
  code-like.

Both are loaded via `next/font/google` in `app/layout.tsx` and exposed as
CSS custom properties (`--font-heading`, `--font-sans`) consumed through
Tailwind's `font-heading` / `font-sans` utilities — never hardcoded font
stacks in component files.

**Shape** — two radius tiers, no in-between.

- `rounded-[36px]` — outer feature containers (map card, testimonial card, hero).
- `rounded-[28px]` — cards and tiles nested inside those containers.
- `rounded-full` — every interactive pill: buttons, badges, toggles.

**Dark mode** — real, not decorative. `app/layout.tsx` inlines a
render-blocking script that reads `localStorage.theme` (falling back to
`prefers-color-scheme`) and applies `.dark` on `<html>` before hydration, so
there's no flash. `components/layout/theme-toggle.tsx` flips it at runtime
via `useSyncExternalStore`, listening for a custom `themechange` event rather
than local state, since the DOM class is the actual source of truth. The dark
forest-green blocks (map, testimonial) don't need a dark variant — they're
already dark in both themes by design.

---

## 2. Page Structure

Six sections in a single-column `space-y-12` flow, `max-w-7xl` content width.

### 2.1 Hero
Full-bleed photo (`bario-hero.jpg`) with a bottom-anchored gradient for
legibility, `min-h-145 md:min-h-165`. Content sits at the bottom edge in a
two-column split at `md:`: headline left, supporting copy + an inline
"Verify Batch" search bar right. `Navbar` overlays the top of the same photo
rather than sitting in its own bar.

### 2.2 Mission + Bento Grid
A single-column headline/body/CTA block (no split-header — headline and
supporting paragraph stack vertically, not side-by-side, to keep one focused
message per section) followed by a 4-tile bento row: two photo tiles with a
one-line caption, and two data tiles (guaranteed farmgate price, one-farmer-
one-code stat) using the lime accent card as the visual break in the row.

### 2.3 Price Map (`components/map/malaysia-map.tsx`)
The most-iterated section — see [Section 3](#3-price-map-interaction-model)
below for the full interaction writeup.

### 2.4 Value Chain Journey
A photo collage (origin, lab-audited grain) beside three horizontal rows,
one per stage of the supply chain (farmgate → freight/audit → retail), each
row carrying a stage badge, a price, and an arrow affordance. Deliberately
*not* numbered ("Stage 1/2/3") — the stage name itself is the label.

### 2.5 Farmer Testimonial
A single dark forest-green card: quote left (large), farmer photo right,
producer SBT ID as the attribution line. One quote, capped short — this is a
snippet, not the full review.

### 2.6 Footer
Minimal single row: wordmark + domain, plus three compliance/partnership
lines. No decorative separators.

A `BatchVerifyModal` is mounted at the page root and opened from three
places (hero search, nav CTA, map's state-card CTA) — see
[Section 4](#4-shared-components).

---

## 3. Price Map Interaction Model

This section went through several iterations based on direct feedback and is
worth documenting in more depth than the rest of the page.

### What changed and why
The original layout split 8/4: map canvas left, a state-detail card
permanently reserved on the right. That reservation — plus always-on
per-state name+price labels baked into the SVG — made the map read as small
and cluttered regardless of how much room the section actually had.

The shipped layout instead:
- Gives the map canvas the **full width** of the section.
- Drops the always-on per-state labels entirely. At-a-glance reading comes
  from color tiers (origin / regional freight / urban retail markup) plus
  the legend underneath.
- Moves the state detail card **below** the map, full width, auto-selected
  to Kuala Lumpur on load (not hidden until a click — there's no empty first
  state).
- Removed the Grade A1/A2/B switcher that used to sit next to the section
  header. The detail card already lays out all three grades side by side, so
  a page-level toggle was showing the user information they could already
  see — pure redundancy. The map's color tiers now key off a fixed
  `DISPLAY_GRADE = "A1"` constant instead of a stateful toggle.
- Kept the Map/Directory (table) view switch — a genuinely different way to
  browse all 16 states at once, not something the detail-card change made
  redundant.

### Hover and click
- **Hover** — the state fill lightens, gets a lime stroke, and a lime
  `feDropShadow` SVG glow (`filter`), plus a small `scale(1.012)` lift.
  A tooltip (state name, grade-A1 shelf price, distribution markup) follows
  the cursor.
- **Click** — swaps the state shown in the detail card below. No page
  scroll, no modal — the card's content just updates.

### Tooltip positioning (a specific bug worth remembering)
The tooltip is `position: fixed`, positioned directly from the pointer
event's `clientX`/`clientY` — **not** computed relative to the SVG's or a
container's bounding rect. An earlier version did the latter and the
tooltip rendered in the wrong place whenever the map sat inside enough
nested padding, because the offset math assumed a containing block that
wasn't actually there. Fixed-position + raw client coordinates sidesteps the
whole class of bug.

Hiding is deliberately over-defended rather than relying on one event:
- `mouseleave` on each state path (the common case).
- `mouseleave` on the SVG element and on its wrapping container, as a
  backstop — `render()`-driven DOM rebuilds can otherwise land in a state
  where the per-path listener never fires.
- A `window` `scroll` listener (passive) that force-hides it — a
  fixed-position element has no organic reason to disappear on scroll, and a
  stale tooltip pointing at nothing is worse than no tooltip.

### Why the detail card doesn't animate open
It's *always* rendered — selecting a different state swaps its content, it
never mounts/unmounts. That's a deliberate simplification: an earlier
prototype used a `max-height` collapse/expand animation to reveal it, which
clipped content on mobile once the card's natural height exceeded the
animation's fixed cap. Removing the show/hide transition removes the need
for a height cap at all, so the bug class doesn't exist rather than needing
a fix.

### `StatePriceCard` layout
Reflowed into a 3-column grid (`grid-cols-1 lg:grid-cols-3`, divided by
hairlines) to make use of the full width the map redesign freed up, instead
of stretching what was originally a narrow side-column card:

1. Identity + headline price (state, region, origin badge, RM/kg, markup
   delta, farmer-vs-logistics share).
2. All three grades side by side + surveillance notes.
3. Verified stockist sample + status badge + "Verify Batch" CTA.

Collapses to a single stacked column below `lg`, with no fixed height
anywhere in the stack — content sets its own height at every breakpoint.

---

## 4. Shared Components

| Component | Responsibility |
|---|---|
| `components/layout/navbar.tsx` | Wordmark, theme toggle, primary CTA. Overlays the hero photo directly rather than owning its own bar. |
| `components/layout/theme-toggle.tsx` | Light/dark switch, DOM-class-as-source-of-truth via `useSyncExternalStore`. |
| `components/layout/footer.tsx` | Wordmark + compliance lines. |
| `components/ui/lime-button.tsx` | The one accent CTA style (`bg-[#D4F63D]` pill, black text). Renders as `<button>` or `<a>` via an `as` prop. Introduced to remove ~4 copies of the same hand-written className string that had drifted slightly out of sync across the nav, hero, mission CTA, and state card. Per-usage sizing/shadow is passed through `className`, not a size-enum prop — the paddings genuinely differ by context (inline in a search bar vs. a standalone CTA) and aren't meaningfully "variants" of one design. |
| `components/ui/arrow-circle.tsx` | The small circular arrow glyph paired with most CTAs. `variant="dark"\|"light"` for icon-on-lime vs. icon-on-white contexts. |
| `components/map/malaysia-map.tsx` | Price map + Directory table, see Section 3. |
| `components/map/state-price-card.tsx` | The state detail card, see Section 3. |
| `components/verification/batch-verify-modal.tsx` | Batch certificate lookup, opened from three CTAs across the page. |

`lib/data/malaysia-prices.ts` exports a single `getMarkupPct(price, grade)`
helper — the `(price - base) / base * 100` formula used to live independently
in five places (map tier coloring, the Directory table, twice in the hover
tooltip, and the detail card's markup delta) and has been centralized there.

---

## 5. Known Constraints / Deliberate Non-Features

- **No grade switcher on the map.** Intentionally removed — see Section 3.
  If per-grade map coloring is ever needed again, reintroduce it as a
  parameter to `getStateFillColor`, not a page-level toggle, since the detail
  card already covers "show me all three grades."
- **Nav CTA currently reads "Login"** but its `onClick` opens the batch
  verification modal, not an auth flow. Known mismatch, left as-is pending a
  product decision on whether a real login flow is coming.
- **Testimonial section shows one quote, not a carousel.** Matches the
  "landing-page quote is a snippet" constraint — don't add a rotation/slider
  without an explicit content reason (more real testimonials to show).
