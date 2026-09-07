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
