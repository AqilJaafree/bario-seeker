/**
 * Isomorphic helpers for the Bario Seeker program.
 *
 * Safe on both server and client: no RPC, no wallet, no Node built-ins. Every
 * PDA is derivable from the program ID plus public data, which is what lets the
 * verification page resolve a QR code with nothing but an RPC endpoint.
 *
 * Ported from `bario-seeker-program/scripts/lib/bario.ts`. Keep the two in step.
 */
import { PublicKey } from "@solana/web3.js";

/** Metaplex Core. Same address on every cluster. */
export const MPL_CORE_PROGRAM_ID = new PublicKey(
  "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
);

const enc = new TextEncoder();
const seed = (s: string) => enc.encode(s);

/** Little-endian u32, matching `index.to_le_bytes()` in the program. */
export function u32le(n: number): Uint8Array {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n, true);
  return b;
}

export function pdas(programId: PublicKey) {
  const find = (parts: Uint8Array[]) =>
    PublicKey.findProgramAddressSync(parts, programId)[0];

  const producer = (authority: PublicKey) =>
    find([seed("producer"), authority.toBytes()]);

  return {
    config: () => find([seed("config")]),
    producerCollection: () => find([seed("producer_collection")]),
    actor: (authority: PublicKey) => find([seed("actor"), authority.toBytes()]),
    producer,
    producerAsset: (authority: PublicKey) =>
      find([seed("producer_asset"), authority.toBytes()]),
    batchCollection: (producerPda: PublicKey) =>
      find([seed("batch_collection"), producerPda.toBytes()]),
    batch: (producerPda: PublicKey, batchCode: string) =>
      find([seed("batch"), producerPda.toBytes(), seed(batchCode)]),
    batchAsset: (producerPda: PublicKey, batchCode: string) =>
      find([seed("batch_asset"), producerPda.toBytes(), seed(batchCode)]),
    checkpoint: (batchPda: PublicKey, index: number) =>
      find([seed("checkpoint"), batchPda.toBytes(), u32le(index)]),
    scan: (batchPda: PublicKey, index: number) =>
      find([seed("scan"), batchPda.toBytes(), u32le(index)]),
    review: (batchPda: PublicKey, reviewer: PublicKey) =>
      find([seed("review"), batchPda.toBytes(), reviewer.toBytes()]),
    report: (batchPda: PublicKey, reporter: PublicKey) =>
      find([seed("report"), batchPda.toBytes(), reporter.toBytes()]),
  };
}

// ---------------------------------------------------------------------------
// Units
//
// Coordinates are signed micro-degrees and money is integer sen, on-chain and
// here. Convert only at the render boundary; never introduce a float into the
// price path.
// ---------------------------------------------------------------------------

/** `3.7333` -> `3733300`. */
export const deg = (d: number): number => Math.round(d * 1_000_000);

/** `3733300` -> `3.7333`. */
export const toDeg = (micro: number): number => micro / 1_000_000;

/** `15.50` -> `1550`. */
export const rm = (ringgit: number): number => Math.round(ringgit * 100);

/** `1550` -> `"RM15.50"`. */
export const fmtRm = (sen: number): string =>
  `RM${Math.floor(sen / 100)}.${String(sen % 100).padStart(2, "0")}`;

/** The ~1 km privacy grid the program snaps consumer scans to. */
export const SCAN_GRID_MICRO = 10_000;
export const coarsen = (micro: number): number =>
  Math.floor(micro / SCAN_GRID_MICRO) * SCAN_GRID_MICRO;

/** Great-circle distance in km between two micro-degree points. */
export function distanceKm(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number
): number {
  const R = 6371;
  const toRad = (micro: number) => (toDeg(micro) * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// ---------------------------------------------------------------------------
// Enums
//
// Anchor encodes Rust enums as single-key objects, and lowercases the first
// letter: `Grade::A1` becomes `{ a1: {} }`, `CheckpointKind::ConsumerScan`
// becomes `{ consumerScan: {} }`. Matching the Rust casing fails silently.
// ---------------------------------------------------------------------------

export type GradeKey = "pending" | "a1" | "a2" | "b";
export type CheckpointKindKey =
  | "farm"
  | "collection"
  | "audit"
  | "distribution"
  | "retail"
  | "consumerScan";

/** Read the variant name out of an Anchor-decoded enum. */
export const variant = <T extends string>(e: Record<string, unknown>): T =>
  Object.keys(e)[0] as T;

export const GRADE_LABEL: Record<GradeKey, string> = {
  pending: "Awaiting audit",
  a1: "A1",
  a2: "A2",
  b: "B",
};

/** Plain-language stop names. Never render a raw variant to a user. */
export const KIND_LABEL: Record<CheckpointKindKey, string> = {
  farm: "Farm",
  collection: "Collection point",
  audit: "Laboratory",
  distribution: "Distributor",
  retail: "Store",
  consumerScan: "Scanned here",
};
