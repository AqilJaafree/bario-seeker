# Bario Seeker — Verification Certificate

## UI/UX Design Reference

Documents `app/verify/[batchId]/page.tsx` — the public page a QR code on a
bag resolves to. This is PRD § F4, "Consumer Verification Page": *"the
single most important surface in the product. Everything else exists to
populate it."* Reflects the shipped state on the `landing-page` branch, not
a target spec — update this file when the page changes.

Shares its design tokens with the homepage — see
[`homepage.md` § 1](./homepage.md#1-design-language). This file only calls
out what's specific to this page.

---

## 1. Purpose and Scope

No wallet, no login, no app — a mobile web page that answers "is this real,
what grade is it, what am I paying, and can I check the math myself"
in that order (PRD's producer → grade → price → proof hierarchy). The word
"blockchain" is deliberately absent above the fold; the cryptographic proof
exists for the skeptical and for regulators, not as the pitch.

Route is `/verify/[batchId]`, matching the share URL format already baked
into the legacy `BatchVerifyModal` on the homepage
(`https://barioseeker.my/verify/{batchId}`) — this page is effectively that
modal's full-page, permanent, shareable successor for real QR scans, not a
new URL scheme.

## 2. Page Structure

Outer shell is `max-w-7xl` (same as every other page, so the navbar lines up
site-wide); the actual certificate content is a centered `max-w-2xl` column
inside that shell — wide chrome, narrow reading column, the same shape as a
physical receipt.

### 2.1 Not-found state
A distinct return path (not a shared component) for a `batchId` with no
match: warning icon, plain explanation, a link back to the marketplace. This
exists so an unverified scan doesn't silently 404 — see § 4 for why it's
currently under-built relative to the verified state.

### 2.2 Verified Authentic banner
Solid emerald card, shield icon, "Verified Authentic" + a checkmark. This is
the "unmistakable" state PRD acceptance criteria calls for; see § 4 for the
gap on the negative side.

### 2.3 Producer
Photo, name, star rating **with review count** (`★4.7 (142)`), location,
"Farming since {year}", and the Producer SBT ID tagged "Non-transferable".
Links to the producer's detail page. The rating + review count + farming
year were a direct fix — an earlier version dropped review count and
farming-since entirely, even though both are in the PRD's own mock layout
for this exact card and both already existed in the data model.

### 2.4 Certificate Details
Replaced an earlier "Grade Audit" section that was missing the harvest date
entirely (a hard PRD requirement) and showed quality numbers with no
benchmark to judge them against. Now:
- A `dt`/`dd` grid: Batch ID, Harvest Date, Audit Date, Audited By, Lab
  Certificate, Lot Size.
- Below a divider, Broken Grain and Moisture as two columns **separated by
  a vertical rule** (`divide-x`), each showing the measured value next to
  its grade-specific pass threshold (`GRADE_THRESHOLDS`, pulled from the
  PRD's own grading table — A1/A2/B have different limits, this is not one
  fixed number) and a checkmark when it passes. This restores context that
  existed in the legacy `BatchVerifyModal` (which showed `(<5%)` next to
  each figure) and had been lost in the first version of this page.

### 2.5 Price
**Currently commented out in the source**, mid-edit at time of writing —
not deleted, disabled. When enabled it renders price per bag + a "Buy This
Batch" button linking to the producer's detail page (where the real buy box
lives, per [`marketplace-detail.md`](./marketplace-detail.md)). Whoever
picks this back up: re-enable by uncommenting rather than rewriting, the
markup is intact.

### 2.6 Cryptographic Ledger Proof
Rebuilt from a single truncated hash line into an actual explanation: one
sentence on what a Soulbound NFT guarantees (non-transferable, can't be
edited by anyone including the platform), then Chain / Certificate Type /
Token Address as facts, then the explorer link. The point of this section
is PRD § 5.1's whole argument for using a ledger at all — a bare hash
doesn't communicate that on its own.

### 2.7 Rate + Report + Share
Star rating input (local state only, not persisted), a Report Counterfeit
button, and a Share button. See § 4 — this is currently the weakest part of
the page relative to its own acceptance criteria.

## 3. Shared Components Used

| Component | Notes |
|---|---|
| `components/marketplace/grade-badge.tsx` | The Certificate Details header used to render its own one-off dark badge (`bg-[#0C2317]`) instead of the lime pill used everywhere else for the same concept. Switched to the shared component for consistency — see [`marketplace.md` § 4](./marketplace.md#4-shared-components-introduced-here). |

## 4. Known Constraints and Open Gaps

Checked directly against PRD § F4 and § F6 acceptance criteria:

- **Report Counterfeit is no longer reachable without scrolling** on a 5"
  screen — a hard acceptance criterion. Adding Certificate Details and the
  enriched Ledger Proof pushed it further down the page than it was before;
  this is a real regression that needs a fix (e.g. a persistent bottom
  action bar) before this page could ship as-is.
- **Share doesn't actually share to WhatsApp.** PRD explicitly calls for
  WhatsApp share; the current button just copies the URL to the clipboard.
- **No localization.** PRD requires Bahasa Malaysia, English, and Mandarin
  at launch. This page is English-only with hardcoded strings — no i18n
  layer exists yet anywhere in the app.
- **The unverified (not-found) state is visually weaker than the verified
  state.** PRD asks for both to be equally unmistakable; right now
  "Verified" is a bold solid-emerald card and "not found" is a plain
  centered paragraph with an icon.
- **No photo upload on Report Counterfeit.** PRD § F6 lists an optional
  photo as part of the report flow; not built.
- **No batch-specific photo.** The page shows the producer's profile photo,
  not a harvest/audit photo of this specific batch (PRD notes batch photos
  get pinned to IPFS).
- **No re-audit history.** PRD § F2 says a re-audit is appended, never
  overwrites the original. If a batch had one, this page has nowhere to
  show it.
