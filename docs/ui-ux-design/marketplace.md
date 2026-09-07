# Bario Seeker — Marketplace

## UI/UX Design Reference

Documents `app/marketplace/page.tsx` — the producer directory / browse page.
Reflects the shipped state on the `landing-page` branch, not a target spec —
update this file when the page changes.

Shares its design tokens (palette, type, radii, dark mode) with the homepage.
See [`homepage.md` § 1](./homepage.md#1-design-language) for the base system;
this file only calls out what's specific to this page.

---

## 1. Purpose and Scope

A discovery surface for the producers registered on the platform, framed as
"meet the farmers" rather than a storefront. Non-goal per the PRD: this is
not a general rice marketplace with cart/checkout across multiple sellers —
it's a directory that lets a shopper land on one producer's batch and buy
that specific batch. The actual buy flow lives on the
[producer detail page](./marketplace-detail.md), not here.

## 2. Page Structure

Single-column `space-y-10`, `max-w-7xl` content width, matching the
homepage's non-hero sections.

### 2.1 Header
A pill showing the live producer count, a heading, and one supporting
sentence. No hero image, no bento grid — this page is a browsing tool, not a
landing moment, so it gets straight to the content.

### 2.2 Filters
A search input (name or village, client-side substring match) and a grade
filter (`All / A1 / A2 / B`) as a segmented pill control, both driving a
single `useMemo`-derived `filteredProducers` list. No debounce — the dataset
is four producers; adding one would be premature for the current scale.

### 2.3 Grid
`ProducerCard` (`components/marketplace/producer-card.tsx`) in a responsive
grid (`1 / 2 / 3` columns). Empty state is a plain centered message, no
illustration — consistent with the "no fake screenshots, no decorative SVG"
discipline used elsewhere.

## 3. `ProducerCard`

Photo with a `GradeBadge` overlay (top-left) and a name + rating row
(bottom, over a gradient scrim) live inside the image; the price and a
"Verified" label sit below in the card body. Card price reads as **sell
price** (`sellPriceRmKg × bagSizeKg`, what the buyer pays), not farmgate —
this was a deliberate correction: an earlier version showed the farmgate
benchmark here, which is the wrong number for someone deciding whether to
buy.

## 4. Shared Components Introduced Here

| Component | Responsibility |
|---|---|
| `components/marketplace/producer-card.tsx` | Directory card, see § 3. |
| `components/marketplace/grade-badge.tsx` | The lime `Grade {X}` pill. Extracted after the same badge markup drifted slightly out of sync across three places (this card, the detail page's gallery, the certificate page's header) — see [`marketplace-detail.md`](./marketplace-detail.md) and [`verify-certificate.md`](./verify-certificate.md) for the other two call sites. All three now render identically off one component. |

`Navbar` is used here with no `onVerifyClick` handler — see
[`homepage.md` § 4](./homepage.md#4-shared-components) for the fallback
behavior (the CTA becomes a link home instead of disappearing).

## 5. Known Constraints

- **No pagination.** Fine at four producers; will need one before this scales
  past a screen or two of cards.
- **Search has no debounce and no fuzzy matching.** Deliberate given the
  current dataset size — revisit if the producer list grows past what a
  client-side filter over a plain array should handle.
