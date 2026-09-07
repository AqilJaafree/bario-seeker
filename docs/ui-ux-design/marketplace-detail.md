# Bario Seeker — Producer / Product Detail

## UI/UX Design Reference

Documents `app/marketplace/[producerId]/page.tsx`. Reflects the shipped
state on the `landing-page` branch, not a target spec — update this file
when the page changes.

Shares its design tokens with the homepage — see
[`homepage.md` § 1](./homepage.md#1-design-language). This file only calls
out what's specific to this page.

---

## 1. Purpose and Scope

This page carries two jobs at once, by explicit product decision: it's the
producer's profile (identity, story, reviews — closer to the PRD's F5
"Producer Reputation" surface) *and* a per-batch product page with a real
buy box (price, quantity, Add to Cart). It was reshaped into the current
ecommerce-style layout after direct feedback that the first version (a
narrow info column with a small side image) read as "hard to read" and
didn't look like something you could actually purchase from.

**Scope note.** The PRD explicitly states Bario Seeker "is not a
marketplace" in v1 — no checkout, no payment processing. The Buy box here is
intentionally a lead-capture pattern, not a real transaction: clicking
"Add to Cart" sets local state and shows an "order request sent" message,
it does not charge anyone or persist an order anywhere. Copy was written to
be honest about that ("will confirm stock and delivery"), not to imply a
completed purchase.

## 2. Page Structure

`max-w-7xl`, `space-y-12`.

### 2.1 Product (two-column, `lg:grid-cols-2`)

**Left — gallery.** A large square hero image with `GradeBadge` (top-left)
and a "Verified" pill (top-right) overlaid, plus a 4-thumbnail strip below
that swaps the hero image on click. The gallery array is
`[producer.photo, ...three shared site photos]` — there's only one real
photo per producer in the current dataset, so the extra thumbnails are
reused stock images from `/public/images/`, not distinct per-producer
assets. Documented here so it isn't mistaken for a data bug: **the gallery
does not currently represent different real photos of this specific
batch.**

**Right — info / buy box**, top to bottom:
1. Producer name + rating link (back to this same page — acts as a
   "you are here" affordance more than navigation).
2. Large title (`text-5xl`) + mono batch/grade line.
3. Big price (`text-5xl font-mono`), the sell price per bag — the number
   that matters to a buyer, not farmgate.
4. Location, then the bio paragraph.
5. Batch (variant) selector, shown only if the producer has more than one
   harvest batch — pill buttons, same interaction pattern as a size/color
   selector on a normal product page.
6. Specs as a stacked `dt`/`dd` label:value list (`border-t`, one visual
   divider for the whole group, not per-row) — the "grouped chunks"
   alternative to a bordered spec table, not a `divide-y` row list.
7. "View Certificate" link to `/verify/[batchId]`.
8. Quantity stepper + `Add to Cart` button, pinned together as one unit.
9. An inline confirmation banner on click, no toast/modal.

### 2.2 About the Producer
A repeat of the bio in a dedicated card, this time with the SBT ID,
elevation, and "farming since" — the identity facts that belong to the
*producer*, not the batch, and so are separated from the buy box above.

### 2.3 Buyer Reviews
Two-column card grid, one review per card (author, star rating, comment,
date, optional retailer tag). No carousel — the review count here is small
enough that a plain grid reads faster than a slider.

## 3. Known Repetition (flagged, not fixed)

Grade currently appears three times in the top section: the `GradeBadge` on
the image, the mono "Batch #X · Grade Y" line under the title, and again as
a row in the specs list. Each occurrence is doing a slightly different job
(visual badge / scannable meta line / formal spec record), so this wasn't
collapsed — but if the page gets a future pass, this is the first place to
look for cutting repetition without losing information.

## 4. Shared Components Used

| Component | Notes |
|---|---|
| `components/marketplace/grade-badge.tsx` | See [`marketplace.md` § 4](./marketplace.md#4-shared-components-introduced-here). |
| `components/ui/lime-button.tsx` | Used here for the primary Add to Cart CTA. |

## 5. Known Constraints

- **No real cart or checkout.** See the scope note in § 1. `orderPlaced` is
  local component state; refreshing the page loses it.
- **Quantity is capped at `min(quantityBags, 20)`**, an arbitrary UI ceiling
  to keep the stepper from being dragged to an absurd number against a small
  demo stock figure, not a real inventory rule.
- **Gallery photos are not batch-specific** — see § 2.1.
