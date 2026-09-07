# Bario Seeker
## Product Requirements Document

**Document Version:** 2.0
**Date:** 7 September 2026
**Product:** Bario Seeker — Provenance, Grading & Price Transparency for Bario Rice
**Owner:** Product Team
**Status:** Draft — Ready for Stakeholder Review
**Supersedes:** Bario Rice Authenticity & Visibility Platform PRD v1.0 (1 Sept 2026)

---

## 1. Executive Summary

Bario Seeker lets anyone with a smartphone confirm, in under two seconds, that a bag of Bario rice came from a real Bario farmer, at the grade printed on the label, at a price they can trace from farm to shelf.

The platform issues each producer a Soulbound NFT (SBT) — a digital certificate permanently bound to their verified identity and cannot be sold or transferred. Every harvest batch gets a child SBT carrying its audited grade, harvest date and quantity. QR codes on each bag resolve to a public verification page. No wallet, no app download, no crypto knowledge required on the consumer side.

**The problem in one line:** There is no tamper-proof link between a bag of rice on a Klang Valley shelf and the highland farmer who grew it, so counterfeiters, inconsistent grading and opaque markups all thrive.

**The solution in one line:** Bind producer identity to blockchain, bind batch grade to producer, bind QR code to batch — then hide all of it behind a page that looks like a product label.

### Target outcomes, Year 1

| Outcome | Baseline | Year 1 target |
|---|---|---|
| Consumer confidence in authenticity (surveyed, platform users) | 32% | 85% |
| Verified batches sold at ≥25% premium over farmgate | ~0% | 45% |
| Sales with visible end-to-end price history | 0% | 60% |
| Counterfeit incidence in participating retail | 40–50% | ≤25% |

Note on ambition: v1.0 of this document cited 95% consumer confidence and 35% counterfeit reduction in its summary while the KPI tables said 85% and 25%. The lower figures are the committed targets. The higher figures were aspirational and have been removed.

---

## 2. Problem Statement

### 2.1 Authenticity cannot be verified at the point of purchase

Counterfeit and mislabelled products bearing the Bario name are widespread in Kuala Lumpur, Selangor and Sabah, frequently priced as premium goods despite inferior content.

- Only **32%** of surveyed consumers believe the "Bario" rice they buy is genuine
- An estimated **40–50%** of Bario-labelled rice in Peninsula markets is mislabelled or adulterated
- Genuine highland farmers lose share to imitators, and brand dilution erodes the premium they can command

**Root cause:** the existing Bario Rice Certification Scheme is paper-based. Certificates travel separately from the product, are trivially forged, and cannot be checked by a consumer standing in an aisle.

### 2.2 Quality grades are not standardised or enforced

A single shelf may carry "Bario A1", "Bario Premium" and "Bario Select" at very different prices with no shared definition behind any of them.

- **67%** of consumers cannot articulate the difference between grade labels
- The same nominal grade sells for **RM18–RM28/kg** across retailers
- Bags labelled A1 are routinely found containing damaged grain

**Root cause:** grading is set variously by producers, packers and retailers. There is no independent verification and no quality assurance after packaging.

### 2.3 Pricing is opaque end to end

- Farmgate to KL retail spans **RM12/kg → RM28/kg**, a 133% markup with no visibility into where value is added
- No central registry of prices; consumers and farmers both operate on guesswork
- Bario rice is exempt from the Paddy and Rice Control Act 1994, so no statutory price ceiling applies

**Root cause:** specialty rice sits outside government price controls, demand exceeds supply, and every intermediary benefits from information asymmetry. No public price discovery mechanism exists.

---

## 3. Goals and Non-Goals

### 3.1 Goals

**G1 — Make authenticity checkable in under 10 seconds** by any adult with a phone camera, including users with no technical background.

**G2 — Make grade claims independently verifiable** by binding grades to third-party audit records that cannot be edited after issuance.

**G3 — Make the price journey visible** from farmgate through distribution to shelf.

**G4 — Make provenance economically worth it for farmers**, so supply-side adoption is driven by realised premium rather than goodwill.

**G5 — Give regulators a real-time counterfeit signal** through consumer reports tied to specific batches, retailers and locations.

### 3.2 Non-Goals (v1)

- **Not a marketplace.** Bario Seeker does not sell rice or process consumer purchases in v1.
- **Not a full supply chain track-and-trace.** We verify producer identity and batch grade, not the physical custody of every kilogram at every hop.
- **Not a tradeable asset platform.** SBTs are non-transferable by design. No secondary market, no speculation, no token sale.
- **Not a consumer wallet.** Consumers never create a wallet, hold a token or sign a transaction.
- **Not extending to other Malaysian specialty crops** in v1, though the architecture should not preclude it.

### 3.3 Explicit scope boundary on counterfeiting

Bario Seeker proves that *a certificate is authentic and describes a real audited batch*. It cannot, on its own, prove that the rice currently inside a given bag is the rice that was sealed into it. Bag-swapping and refilling remain possible. We mitigate this with tamper-evident packaging requirements, per-bag serialisation and scan-anomaly detection (Section 6.4), but the residual risk must be stated plainly to retailers and regulators rather than papered over.

---

## 4. Target Users

### 4.1 Primary — Consumers

**Segment 1: Premium health-conscious buyers, 28–50**
Urban professionals and wellness-oriented shoppers earning RM4,000–RM12,000/month, concentrated in Kuala Lumpur, Petaling Jaya, Subang Jaya and Johor Bahru. Willing to pay a 50–100% premium for verified provenance; already sceptical of counterfeit health products. Approximately **120,000 households**.

**Segment 2: Older buyers loyal to trusted brands, 60–80**
Retirees and traditional home cooks earning RM2,000–RM6,000/month across the Klang Valley, Ipoh and Penang. Brand-loyal, wary of unfamiliar products, and need verification to be genuinely one-step. Approximately **80,000 households**. This segment sets the accessibility bar for the entire product.

**Segment 3: Middle-class household grocery buyers, 35–60**
Family decision-makers earning RM3,000–RM8,000/month, nationwide and supermarket-dependent. Price-sensitive, focused on quality-per-ringgit, influenced by peer recommendation. Approximately **280,000 households**.

### 4.2 Primary — Producers

Bario and highland Kelabit farmers and cooperatives. Typically smallholders, variable smartphone literacy, intermittent connectivity in Bario itself. This constraint is load-bearing: batch registration must work offline and sync later.

### 4.3 Secondary

**Retailers and supermarket chains** — Tesco, Aeon, Mydin, independent grocers. Motivated by premium differentiation and reduced counterfeit liability. Target **150–200 retail points in Year 1**.

**Restaurants, hotels and QSR chains** — premium dining and hotel F&B, where "Bario from the Kalang family, 2026 harvest" is a menu asset and traceability supports food safety compliance. Target **50–100 institutional buyers in Year 1**.

**Department of Agriculture Sarawak** — regulator and enforcement partner; consumes counterfeit reports and market surveillance data.

---

## 5. Solution Overview

### 5.1 Why Soulbound NFTs

A Soulbound NFT is non-transferable by construction. It cannot be bought, sold or moved to another wallet. For provenance this is exactly the property we want: the certificate *is* the producer, and it cannot be detached from them and resold to a counterfeiter.

| Requirement | Paper certification | Centralised database | Soulbound NFT |
|---|---|---|---|
| Resistant to forgery | No | Partially | Yes (cryptographic) |
| Survives issuer failure | No | No | Yes (distributed ledger) |
| Certificate cannot be resold | No | No | Yes (non-transferable by design) |
| Consumer-verifiable in aisle | No | Depends on operator | Yes (QR → public page) |
| Record cannot be retroactively edited | No | No | Yes (immutable) |

The honest counter-argument: a well-run centralised registry would deliver most of this at lower cost and complexity. The case for the ledger rests on two things — no single operator (including us) can quietly rewrite a grade after the fact, and the record outlives the company. If the pilot shows consumers and regulators do not value those properties, a centralised fallback should be reconsidered at the Phase 2 gate.

### 5.2 System flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PRODUCER ONBOARDING (one-time)                           │
├─────────────────────────────────────────────────────────────┤
│ • KYC — government ID verification (Sumsub)                 │
│ • Device-local biometric bound to custodial wallet          │
│ • Farm verification — GPS + satellite imagery, ≥1,100m      │
│ • Producer SBT minted (non-transferable)                    │
│   metadata: name, farm coordinates, join date, photo        │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. BATCH REGISTRATION (per harvest)                          │
├─────────────────────────────────────────────────────────────┤
│ • Farmer submits quantity, variety, harvest date, photos    │
│   (offline-capable; syncs when connectivity returns)        │
│ • Independent lab audit → grade A1 / A2 / B                 │
│ • Batch SBT minted as child of Producer SBT                 │
│ • Per-bag serialised QR codes generated                     │
│ • Photos + audit report pinned to IPFS                      │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. DISTRIBUTION & RETAIL                                     │
├─────────────────────────────────────────────────────────────┤
│ • Distributor scans at pickup → logs entry price            │
│ • Retailer scans at inbound → confirms batch, logs price    │
│ • Retailer earns "Verified Authentic" merchandising rights  │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. CONSUMER VERIFICATION (in aisle or at home)               │
├─────────────────────────────────────────────────────────────┤
│ • Scan bag QR with any phone camera                         │
│ • Public web page loads — no download, no wallet, no login   │
│ • Shows: producer, grade, harvest date, price journey,       │
│   cryptographic proof, retailer status                       │
│ • Actions: rate batch · report counterfeit · share           │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Features and Requirements

### F1 — Producer Soulbound Identity

Each producer receives a non-transferable SBT that serves as their permanent verified identity on the platform.

> **As** a Bario farmer,
> **I want** to register my farm once and receive a verified identity certificate,
> **so that** buyers see my name, photo and farm when they buy my rice, and my reputation compounds across harvests.

**Acceptance criteria**
- [ ] Farmer completes KYC using Malaysian government ID
- [ ] Geolocation check confirms farm within the Bario highlands (≥1,100m elevation), corroborated by satellite imagery
- [ ] Producer SBT minted to a custodial wallet; farmer never handles a seed phrase
- [ ] Metadata includes producer name, farm coordinates, join date, portrait photo
- [ ] Transfer, sale and burn-and-remint are all blocked at the contract level
- [ ] Producer profile renders in the verification page with photo, harvest count and rolling rating
- [ ] Account recovery path exists that does not require the original device (see Open Question OQ-3)

**Technical notes**
Custodial key management with device-local biometric unlock. Biometric templates never leave the device. KYC records stored encrypted, retained per Malaysian PDPA, and never written on-chain.

---

### F2 — Batch Grading and Certification

Every harvest batch is independently audited and its grade is written into a Batch SBT that is a child of the producer's identity token.

> **As** a rice quality auditor,
> **I want** to inspect batches and record verified grades,
> **so that** consumers and retailers can trust the grade claim and producers are rewarded for quality.

**Acceptance criteria**
- [ ] Auditor samples per a published, standardised rubric (grain integrity, moisture, colour uniformity)
- [ ] Audit report timestamped and hash-anchored on-chain; full report on IPFS
- [ ] Batch SBT minted as a child of the Producer SBT
- [ ] Metadata: batch ID, grade, harvest date, quantity, variety, audit date, auditor ID
- [ ] Serialised QR codes generated per bag and linked to the batch
- [ ] Grade visible on the verification page within 1 hour of audit completion
- [ ] Farmer may request a re-audit within 30 days; re-audit outcome is appended, never overwritten

**Grading standard**

| Grade | Criteria | Target premium over farmgate |
|---|---|---|
| **A1** | <5% broken grain, <12% moisture, uniform colour | +40% |
| **A2** | 5–8% broken grain, <13% moisture, minor discolouration | +25% |
| **B** | 8–12% broken grain, <14% moisture, visible colour variance | +10% |

**Auditor integrity.** Grading is the weakest link in the trust chain: a corrupt auditor invalidates everything downstream. Controls — contract only with accredited Sarawak laboratories; rotate auditor assignment so no auditor works the same producer consecutively; blind re-audit of a random 5% of batches; publish auditor-level agreement statistics.

---

### F3 — Transparent Price Tracking

Price is captured at each ownership transfer and displayed as a journey rather than a single number.

> **As** a price-conscious shopper,
> **I want** to see what the farmer received, what the distributor charged and what I am being asked to pay,
> **so that** I can judge whether the markup is reasonable.

**Acceptance criteria**
- [ ] Farmer sets farmgate price at batch registration
- [ ] Distributor logs entry price on scan at pickup
- [ ] Retailer logs shelf price on inbound scan; corrections permitted with an audit trail
- [ ] Verification page renders the full timeline: farm → wholesale → retail, with margin at each step
- [ ] Cross-retailer comparison for the same batch or grade
- [ ] Historical trends: 30-day, 90-day, year-to-date
- [ ] Optional price alerts for consumers tracking a grade or producer

**Data model**

```json
{
  "batch_id": "2026-11-001",
  "producer_sbt": "So1a...",
  "grade": "A1",
  "price_history": [
    { "stage": "producer",    "price_rm_kg": 15.50, "location": "Bario, Sarawak", "timestamp": "2026-11-01T08:00:00Z", "actor": "farmer_001" },
    { "stage": "distributor", "price_rm_kg": 17.50, "location": "Kuching",        "timestamp": "2026-11-02T14:30:00Z", "actor": "dist_kch_01",  "margin_pct": 12.9 },
    { "stage": "retail",      "price_rm_kg": 21.50, "location": "Tesco Pavilion", "timestamp": "2026-11-05T09:15:00Z", "actor": "retail_007",   "margin_pct": 22.9 }
  ]
}
```

**Adoption risk.** Retailers have a clear incentive *not* to publish their margin. Mitigation: shelf price can be sourced from consumer scans and shelf-label photos where a retailer declines to integrate, with the entry marked "consumer-reported" rather than verified. Margin display should be framed as distribution cost, not profiteering, in all consumer-facing copy.

---

### F4 — Consumer Verification Page

The single most important surface in the product. Everything else exists to populate it.

> **As** a 55-year-old shopper in a supermarket,
> **I want** to point my phone at the bag and immediately see whether it is real and whether the price is fair,
> **without** downloading anything, creating an account, or knowing what a blockchain is.

**Acceptance criteria**
- [ ] QR printed on every bag, positioned and sized for one-handed scanning
- [ ] Scan opens a mobile web page — no app install, no login, no wallet
- [ ] Page interactive in **<2s at the 90th percentile on 4G**
- [ ] Information hierarchy: producer → grade → price → proof
- [ ] "Verified Authentic" state is visually unmistakable, and the *unverified* state is equally unmistakable
- [ ] Full Bahasa Malaysia, English and Mandarin localisation at launch
- [ ] Minimum 16px body text, WCAG AA contrast, tap targets ≥44px
- [ ] "Report Counterfeit" is reachable without scrolling past the fold on a 5" screen
- [ ] Rating and review entry
- [ ] Share to WhatsApp

**Layout**

```
┌─────────────────────────────────┐
│ Bario Seeker                    │
├─────────────────────────────────┤
│ [Producer photo]                │
│ Ruben K. — Bario, Sarawak       │
│ Farming since 2015              │
│ ★ 4.8  (142 reviews)            │
├─────────────────────────────────┤
│ Grade A1  ✓ audited 17 Nov 2026 │
│ Harvest   15 Nov 2026           │
│ Batch     2026-11-001           │
├─────────────────────────────────┤
│ PRICE JOURNEY                   │
│ Farm          RM15.50/kg        │
│ Distributor   RM17.50  +12.9%   │
│ This store    RM21.50  +22.9%   │
├─────────────────────────────────┤
│ ✓ VERIFIED AUTHENTIC            │
│ Proof: 5fK7…a91                 │
├─────────────────────────────────┤
│ [ Rate this batch ]             │
│ [ Report a problem ]            │
└─────────────────────────────────┘
```

**Design principle.** The word "blockchain" must not appear above the fold. The proof hash is present for the sceptical and the regulator; it is not the pitch. If a 70-year-old cannot use this page unaided on first attempt, the feature has failed regardless of what the backend does.

---

### F5 — Producer Reputation

> **As** a farmer,
> **I want** to see how buyers rate my rice,
> **so that** I can improve and build a reputation that earns a durable premium.

**Acceptance criteria**
- [ ] Consumers rate a batch 1–5 stars with optional text (max 200 characters)
- [ ] Reviews appear within 24 hours of moderation
- [ ] Producer score is quantity-weighted across batches
- [ ] Producers appear in a discovery leaderboard
- [ ] Producers can respond publicly once per review

**Scoring**

```
Producer Score = Σ(batch rating × batch quantity) / Σ(quantity sold)

Example — Ruben K.:
  Batch A  50kg @ 4.8★
  Batch B  50kg @ 4.6★
  Score = (4.8×50 + 4.6×50) / 100 = 4.7★
```

**Fairness constraint.** Ratings partly reflect retail handling, storage and cooking rather than farming. Reviews must be filterable by retailer so a producer is not penalised for a distributor's poor storage, and a producer's score must be adjustable on appeal where a batch is shown to have been mishandled downstream.

---

### F6 — Counterfeit Reporting and Response

- [ ] One-tap report from the verification page, with optional photo
- [ ] Report routed to platform team, affected producer, retailer management, and DOA Sarawak
- [ ] Producer notified and given a right of reply before any public flag is raised
- [ ] Retailers exceeding a threshold rate of substantiated reports are flagged in-app
- [ ] Anomaly detection: same serial scanned in geographically implausible locations, or scan volume exceeding bags issued for a batch
- [ ] Reports are not published unmoderated — malicious reports against competitors are a foreseeable abuse vector

---

## 7. Non-Functional Requirements

| Area | Requirement |
|---|---|
| **Performance** | Verification page interactive <2s (p90, 4G); <4s (p99) |
| **Availability** | 99.9% monthly for the verification path; degraded read-only mode if the ledger is unreachable |
| **Offline** | Producer app registers batches fully offline and syncs on reconnection |
| **Accessibility** | WCAG 2.1 AA; usable one-handed; tested with users aged 60+ |
| **Localisation** | Bahasa Malaysia, English, Mandarin at launch |
| **Privacy** | PDPA 2010 compliant; KYC and biometric data never on-chain; producer PII published only with explicit consent |
| **Security** | Annual third-party smart contract audit before mainnet; serialised QR with signed payload to resist bulk cloning |
| **Data retention** | On-chain records permanent by design — this must be disclosed at producer consent, since it cannot be undone |

---

## 8. Technical Architecture

```
CONSUMER LAYER
  Mobile web verification portal · consumer dashboard · ratings
        │
APPLICATION LAYER
  Node.js + TypeScript API · PostgreSQL · Elasticsearch
  QR generation & shortlink resolution · S3 media
        │
BLOCKCHAIN LAYER
  Solana mainnet · Anchor/Rust SBT contracts
  Producer SBT (non-transferable) · Batch SBT (child, non-transferable)
  On-chain price history
        │
DATA LAYER
  IPFS (batch photos, audit reports) · Solana RPC (Helius)
  Encrypted KYC store · analytics warehouse
```

### Stack

| Component | Choice | Rationale |
|---|---|---|
| Blockchain | Solana mainnet | Sub-cent fees, sub-second finality, low energy per transaction |
| Smart contracts | Rust / Anchor | Solana-native; mature tooling |
| Backend | Node.js + TypeScript | Development speed; broad hiring pool in Malaysia |
| Database | PostgreSQL | Transactional integrity for pricing and user data |
| Storage | AWS S3 + IPFS | S3 for hot media; IPFS for permanent audit records |
| Search | Elasticsearch | Batch and producer discovery |
| Frontend | React (web-first), React Native later | Verification must work without an install |
| Hosting | AWS + Vercel CDN | Fast QR resolution nationwide |
| Analytics | Mixpanel + on-chain event indexing | Behaviour plus ledger events |
| KYC | Sumsub | Malaysia-compliant identity verification |
| Farmer payouts | Alchemy Pay (MYR ↔ USDC) | Cash-out rail for producers |

**Correction from v1.0:** Alchemy Pay was listed as both a KYC provider and a payments provider. It is a payments rail only. Sumsub handles KYC.

**Price oracle:** v1.0 specified Pyth Network for pricing. Pyth publishes financial market feeds and does not carry Malaysian specialty rice prices. Bario Seeker prices are supplied by participants, not oracles. Pyth is retained only for MYR/USDC conversion at payout.

**Canonical domain:** `barioseeker.my`. v1.0 variously used `bario.direct`, `bariorseeker.my` and `barioseeker.my`. QR codes are printed and permanent — a single domain must be locked before the first bag is printed.

---

## 9. Success Metrics

### Consumer adoption

| KPI | Year 1 target | Measurement |
|---|---|---|
| Monthly active verifiers | 50,000 | Unique devices resolving a QR |
| Cumulative scans | 500,000 | Verification portal analytics |
| Trust score | 85% | Survey: "I trust this rice is authentic" |
| Repeat verification | 60% | Users scanning >2 distinct batches |

### Producer engagement

| KPI | Year 1 target | Measurement |
|---|---|---|
| Registered producers | 40 | Producer SBTs issued |
| Batches certified | 200 | Batch SBTs issued |
| Mean producer rating | 4.5★ | Quantity-weighted mean |
| Realised premium | 45% of batches at ≥+25% | Logged retail vs farmgate price |

### Market impact

| KPI | Year 1 target | Measurement |
|---|---|---|
| Price transparency | 60% of platform sales with full history | Batch price records with ≥3 stages |
| Counterfeit incidence | ≤25% in participating retail | Independent market survey |
| Retail participation | 150 stores | Onboarded retail points |
| Platform revenue | RM500K | Commission, data licensing, premium listings |

### Technical

| KPI | Target |
|---|---|
| Verification page load | <2s at p90 on 4G |
| Ledger finality | <1s |
| Verification path uptime | 99.9% |
| Producer app crash rate | <0.1% per 1,000 sessions |

---

## 10. Release Plan

### Phase 0 — Validation (Sept – Oct 2026)
Technical feasibility review, farmer and retailer interviews, Malaysian legal review of the SBT structure, devnet MVP. **Gate:** legal sign-off that non-transferable certificates fall outside securities and digital asset regulation.

### Phase 1 — Pilot (Nov 2026 – Feb 2027)
10 producers, 3 retail chains, Klang Valley only. In-store signage and QR promotion. **Gate:** ≥60% of pilot consumers who see a bag actually scan it, and ≥1 retailer commits to a paid rollout.

### Phase 2 — Expansion (Mar – Aug 2027)
30 producers, 50 retail points, 3 distributors. Klang Valley, Penang, Johor Bahru. E-commerce integration. Producer documentary content. **Gate:** realised premium sustained above +25% for A1 batches.

### Phase 3 — National (Sept 2027 onward)
50+ producers, 150+ retail points nationwide. Native iOS and Android apps. B2B institutional supply. Export trials to Singapore and Brunei.

### Six-month success definition (by May 2027)

- 5,000+ monthly active verifiers
- 20+ producers holding Producer SBTs
- 100+ participating retail locations
- 100,000+ cumulative scans
- 85%+ surveyed consumer trust
- 30%+ of verified batches selling at ≥+25% premium
- 4.5★+ mean producer rating
- RM200K+ platform revenue

The v1.0 criterion of "zero counterfeit fraud incidents detected" has been removed. Detecting counterfeits is the product working, not the product failing. The replacement criterion is: **every substantiated report resolved within 14 days, with no producer wrongly penalised.**

---

## 11. Stakeholder Incentives

**Producers** — 15–30% realised price premium on verified batches; free onboarding and training; quarterly recognition awards. Adoption depends entirely on the premium being real and arriving quickly. If farmers do not see money within one harvest cycle, they will not register a second batch.

**Retailers** — no platform fee in v1; "Verified Authentic" merchandising rights; POS integration support, staff training and in-store signage supplied. Revenue via commission and premium placement.

**Consumers** — trust and price transparency; loyalty points for scanning and rating, redeemable against discounts; producer discovery and early access to new harvests.

**Department of Agriculture Sarawak** — real-time market surveillance and counterfeit signal; alignment with national food traceability policy; potential integration with official certification records.

---

## 12. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Low producer adoption | High | Fatal — no supply, no platform | Partner through cooperatives; free onboarding; guarantee first-harvest premium underwriting for pilot farmers |
| "Crypto scam" perception among consumers | High | Blocks the 60–80 segment entirely | Web-first UX; blockchain terminology absent from consumer surface; DOA endorsement as trust anchor |
| Bag-swapping / refilling after seal | Medium | Undermines the core promise | Tamper-evident packaging mandate; per-bag serialisation; scan-anomaly detection; explicit disclosure of the limit |
| Auditor capture or inconsistency | Medium | Destroys trust chain at the root | Accredited labs only; auditor rotation; blind 5% re-audit; published auditor agreement stats |
| Retailer refusal to publish margins | Medium | Guts the price transparency feature | Consumer-reported shelf prices as fallback; frame margin as distribution cost |
| Regulatory restriction on NFTs | Low | Forces architecture change | Upfront legal review; structure as non-financial, non-transferable utility certificate; maintain a centralised-registry fallback design |
| Connectivity gaps in Bario | High | Producers cannot register batches | Offline-first producer app with deferred sync |
| Blockchain cost or chain instability | Low | Micro-transactions become unviable | Batch transaction writes; maintain chain-abstraction layer to permit migration |

---

## 13. Open Questions

- **OQ-1** — Who bears the cost of independent audits at scale, and does that cost survive contact with a smallholder's margin?
- **OQ-2** — What is the tamper-evident packaging specification, and who supplies it in Bario?
- **OQ-3** — What is the producer account recovery path when a phone is lost or a farmer dies and a cooperative inherits the farm? Non-transferable identity and real-world succession are in tension.
- **OQ-4** — Can DOA Sarawak's existing certification records be integrated, or does Bario Seeker create a parallel and competing scheme?
- **OQ-5** — What is the fallback if the pilot shows consumers value the *verification* but are indifferent to the *ledger*? At what point does a centralised registry become the better product?
- **OQ-6** — How is the "Bario" geographical indication legally protected today, and does enforcement depend on it?

---

## 14. Glossary

| Term | Meaning |
|---|---|
| **Soulbound NFT (SBT)** | A non-transferable digital certificate permanently bound to one identity |
| **Producer SBT** | A farmer's or cooperative's verified platform identity |
| **Batch SBT** | A certificate for one harvest lot, issued as a child of a Producer SBT |
| **Bario rice** | Premium short-grain rice grown in the Bario highlands (1,100m+), Sarawak |
| **Grade A1 / A2 / B** | Quality classification by grain integrity, moisture and colour |
| **Farmgate price** | Price received by the producer at point of sale from the farm |
| **IPFS** | InterPlanetary File System — content-addressed decentralised storage |
| **PDPA** | Personal Data Protection Act 2010 (Malaysia) |
| **Solana** | Blockchain platform selected for low transaction cost and fast finality |

---

## 15. Document Control

| Version | Date | Author | Status | Notes |
|---|---|---|---|---|
| 0.9 | 1 Sept 2026 | Product Team | Draft | Initial draft |
| 1.0 | 7 Sept 2026 | Product Team | Superseded | Bario Rice Authenticity & Visibility Platform |
| 2.0 | 7 Sept 2026 | Product Team | Ready for review | Rebuilt as Bario Seeker; timeline, metrics and vendor stack corrected |

### Next steps

1. Technical feasibility review with engineering — 2 weeks
2. Field interviews: 15 producers, 5 retailers, 30 consumers — 2 weeks
3. Legal review of SBT structure under Malaysian law — 2 weeks
4. Devnet MVP build — 4 weeks
5. Pilot operations planning, incl. packaging and auditor contracts — 2 weeks

**Contact:** product@barioseeker.my
