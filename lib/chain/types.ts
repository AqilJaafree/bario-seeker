/**
 * Serialisable view models.
 *
 * Anchor decodes accounts into `BN` and `PublicKey` instances, which cannot
 * cross the server/client boundary as React props. Everything here is plain
 * JSON, shaped for what the verification UI actually renders.
 *
 * Money stays in integer sen and coordinates stay in micro-degrees all the way
 * to the render boundary — see `fmtRm` and `toDeg`.
 */
import type { CheckpointKindKey, GradeKey } from "./bario";

export interface StopView {
  index: number;
  kind: CheckpointKindKey;
  /** "Laboratory", "Distributor", … — never a raw enum variant. */
  kindLabel: string;
  /** "Pavilion Kuala Lumpur" */
  label: string;
  /** Micro-degrees. Convert with `toDeg` at render time. */
  lat: number;
  lon: number;
  /** Integer sen; 0 where the stop carries no price. */
  priceSen: number;
  /** Percent change from the previous priced stop, computed not stored. */
  marginPct: number | null;
  /** Whole km from the farm. */
  distanceKm: number;
  /** Unix milliseconds. */
  timestamp: number;
  /** Display name of the submitting actor, when it is a registered one. */
  actorName: string | null;
  actor: string;
  noteCid: string;
}

export interface ScanView {
  index: number;
  /** Coarsened to ~1 km by the program. */
  lat: number;
  lon: number;
  label: string;
  timestamp: number;
}

export interface BatchView {
  /** Addresses, for the proof section and explorer links. */
  batchPda: string;
  batchAsset: string;
  producerPda: string;
  producerAsset: string;

  batchCode: string;
  variety: string;
  grade: GradeKey;
  /** "A1" | "Awaiting audit" — ready to render. */
  gradeLabel: string;
  /** False until an auditor has recorded a grade. */
  isAudited: boolean;

  harvestDate: number;
  registeredAt: number;
  quantityKg: number;
  bagCount: number;
  farmgatePriceSen: number;

  producerName: string;
  /** Taken from the farm checkpoint's own label. */
  producerLocation: string;
  farmLat: number;
  farmLon: number;
  farmElevationM: number;
  producerJoinedAt: number;
  /**
   * The producer's quantity-weighted score across every batch, in stars.
   * Null when nothing they grew has been rated yet.
   *
   * There is no producer-level review *count* on chain — only a weight in kg —
   * so the verify page shows the batch's own review count beside this.
   */
  producerRating: number | null;

  /** From the Audit checkpoint, when one exists. */
  auditDate: number | null;
  auditorOrg: string | null;
  /** IPFS CID of the full audit report. */
  auditReportCid: string | null;
  auditCount: number;

  /**
   * Grain integrity and moisture live in the IPFS audit report, not on chain.
   * They are `null` here rather than invented — the UI should link to the
   * report instead of printing numbers the ledger cannot vouch for.
   */
  brokenGrainPct: null;
  moisturePct: null;

  /** Shelf price, only once a Retail stop actually exists. */
  retailPriceSen: number | null;
  /** Derived: total kg divided across the bags. */
  bagSizeKg: number;

  journey: StopView[];
  scans: ScanView[];
  /** Whole km, farm to the last recorded stop. */
  totalDistanceKm: number;

  ratingCount: number;
  /** Mean stars to one decimal, or null when unrated. */
  ratingAverage: number | null;
  reportCount: number;

  cluster: string;
}

export interface BatchSummary {
  batchPda: string;
  batchCode: string;
  producerName: string;
  grade: GradeKey;
  gradeLabel: string;
  variety: string;
  quantityKg: number;
  farmgatePriceSen: number;
  /** Last priced stop, i.e. the shelf price where one is recorded. */
  retailPriceSen: number | null;
  stopCount: number;
  scanCount: number;
}

// ---------------------------------------------------------------------------
// Producers
// ---------------------------------------------------------------------------

export interface ProducerBatchView {
  batchPda: string;
  batchCode: string;
  variety: string;
  grade: GradeKey;
  gradeLabel: string;
  isAudited: boolean;
  harvestDate: number;
  quantityKg: number;
  bagCount: number;
  bagSizeKg: number;
  farmgatePriceSen: number;
  /** Shelf price, only once a Retail stop exists. */
  retailPriceSen: number | null;
  stopCount: number;
  scanCount: number;
  ratingCount: number;
  ratingAverage: number | null;
}

export interface ProducerReviewView {
  batchPda: string;
  batchCode: string;
  /** Truncated reviewer address. There are no names on chain. */
  reviewer: string;
  rating: number;
  /**
   * IPFS CID of the review text. The prose itself is off-chain, so the UI must
   * not present a comment it does not have.
   */
  reviewCid: string;
  createdAt: number;
}

export interface ProducerSummary {
  producerPda: string;
  producerAsset: string;
  name: string;
  location: string;
  farmLat: number;
  farmLon: number;
  elevationM: number;
  joinedAt: number;
  batchCount: number;
  /** Quantity-weighted across every batch, in stars. */
  rating: number | null;
  /** Most recent harvest, for the card's headline figures. */
  latestBatch: ProducerBatchView | null;
  cluster: string;
}

export interface ProducerView extends ProducerSummary {
  batches: ProducerBatchView[];
  reviews: ProducerReviewView[];
  /** Reviews across all of this producer's batches. */
  reviewCount: number;
}
