/**
 * Shared client helpers for the Bario Seeker program.
 *
 * Every PDA in this program is derivable from the program ID plus public data,
 * which is deliberate: the consumer verification page must be able to resolve a
 * QR code to a full journey using nothing but an RPC endpoint. There is no
 * account whose address only our backend knows.
 */
import { BN, Program } from "@coral-xyz/anchor";
import { ComputeBudgetProgram, PublicKey, TransactionInstruction } from "@solana/web3.js";

/** Metaplex Core. Same address on every cluster. */
export const MPL_CORE_PROGRAM_ID = new PublicKey(
  "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
);

const enc = new TextEncoder();
const seed = (s: string) => enc.encode(s);

/** Little-endian u32, matching `index.to_le_bytes()` in the program. */
export function u32le(n: number): Buffer {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n, 0);
  return b;
}

export function pdas(programId: PublicKey) {
  const find = (parts: (Uint8Array | Buffer)[]) =>
    PublicKey.findProgramAddressSync(parts, programId)[0];

  const producer = (authority: PublicKey) =>
    find([seed("producer"), authority.toBuffer()]);

  const batch = (producerPda: PublicKey, batchCode: string) =>
    find([seed("batch"), producerPda.toBuffer(), seed(batchCode)]);

  return {
    config: () => find([seed("config")]),
    producerCollection: () => find([seed("producer_collection")]),
    actor: (authority: PublicKey) => find([seed("actor"), authority.toBuffer()]),
    producer,
    producerAsset: (authority: PublicKey) =>
      find([seed("producer_asset"), authority.toBuffer()]),
    batchCollection: (producerPda: PublicKey) =>
      find([seed("batch_collection"), producerPda.toBuffer()]),
    batch,
    batchAsset: (producerPda: PublicKey, batchCode: string) =>
      find([seed("batch_asset"), producerPda.toBuffer(), seed(batchCode)]),
    checkpoint: (batchPda: PublicKey, index: number) =>
      find([seed("checkpoint"), batchPda.toBuffer(), u32le(index)]),
    scan: (batchPda: PublicKey, index: number) =>
      find([seed("scan"), batchPda.toBuffer(), u32le(index)]),
    review: (batchPda: PublicKey, reviewer: PublicKey) =>
      find([seed("review"), batchPda.toBuffer(), reviewer.toBuffer()]),
    report: (batchPda: PublicKey, reporter: PublicKey) =>
      find([seed("report"), batchPda.toBuffer(), reporter.toBuffer()]),
  };
}

// ---------------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------------

/** Degrees to the micro-degrees the program stores. `3.7333` -> `3733300`. */
export const deg = (d: number): number => Math.round(d * 1_000_000);

/** Micro-degrees back to degrees, for display and map rendering. */
export const toDeg = (micro: number): number => micro / 1_000_000;

/** Ringgit to sen. `15.50` -> `1550`. */
export const rm = (ringgit: number): number => Math.round(ringgit * 100);

/** Sen to a display string. `1550` -> `"RM15.50"`. */
export const fmtRm = (sen: number): string =>
  `RM${Math.floor(sen / 100)}.${String(sen % 100).padStart(2, "0")}`;

/** The ~1 km grid the program snaps consumer scans to. */
export const SCAN_GRID_MICRO = 1_0000;
export const coarsen = (micro: number): number =>
  Math.floor(micro / SCAN_GRID_MICRO) * SCAN_GRID_MICRO;

/**
 * Great-circle distance in km, for "1,320 km from the farm".
 * Client-side only — the program never computes distance.
 */
export function distanceKm(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number
): number {
  const R = 6371;
  const toRad = (d: number) => (toDeg(d) * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// ---------------------------------------------------------------------------
// Enum helpers — Anchor represents Rust enums as single-key objects
// ---------------------------------------------------------------------------

export const Role = {
  auditor: { auditor: {} },
  distributor: { distributor: {} },
  retailer: { retailer: {} },
} as const;

export const Kind = {
  farm: { farm: {} },
  collection: { collection: {} },
  audit: { audit: {} },
  distribution: { distribution: {} },
  retail: { retail: {} },
  consumerScan: { consumerScan: {} },
} as const;

export const GradeArg = {
  pending: { pending: {} },
  a1: { a1: {} },
  a2: { a2: {} },
  b: { b: {} },
} as const;

/** Read the variant name out of an Anchor-decoded enum. */
export const variant = (e: Record<string, unknown>): string => Object.keys(e)[0];

// ---------------------------------------------------------------------------
// Real places on the Bario -> Klang Valley route
// ---------------------------------------------------------------------------

export interface Place {
  label: string;
  lat: number;
  lon: number;
}

export const PLACES = {
  barioAsal: { label: "Bario Asal, Kelabit Highlands", lat: deg(3.746), lon: deg(115.453) },
  barioTown: { label: "Bario, Sarawak", lat: deg(3.7333), lon: deg(115.4667) },
  paDalih: { label: "Pa' Dalih, Kelabit Highlands", lat: deg(3.6072), lon: deg(115.5539) },
  miriLab: { label: "Sarawak Rice Laboratory, Miri", lat: deg(4.3995), lon: deg(113.9914) },
  kuchingHub: { label: "Kuching Distribution Hub", lat: deg(1.5535), lon: deg(110.3593) },
  portKlang: { label: "Port Klang, Selangor", lat: deg(3.0004), lon: deg(101.3928) },
  pavilionKl: { label: "Pavilion Kuala Lumpur", lat: deg(3.149), lon: deg(101.713) },
  midValley: { label: "Mid Valley Megamall, KL", lat: deg(3.118), lon: deg(101.677) },
  usjSubang: { label: "USJ Subang Jaya, Selangor", lat: deg(3.045), lon: deg(101.585) },
} satisfies Record<string, Place>;

/** Consumer scan origins, deliberately coarse. */
export const SCAN_SPOTS: Place[] = [
  { label: "Kuala Lumpur", lat: deg(3.14), lon: deg(101.7) },
  { label: "Petaling Jaya", lat: deg(3.107), lon: deg(101.606) },
  { label: "Subang Jaya", lat: deg(3.043), lon: deg(101.581) },
  { label: "Shah Alam", lat: deg(3.073), lon: deg(101.518) },
  { label: "Cheras", lat: deg(3.104), lon: deg(101.744) },
];

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

/**
 * `register_producer` and `register_batch` each make two Metaplex Core CPIs on
 * top of initialising program accounts, which is more than the 200k default.
 */
export const withComputeBudget = (units = 400_000): TransactionInstruction[] => [
  ComputeBudgetProgram.setComputeUnitLimit({ units }),
];

export const bn = (n: number | bigint): BN => new BN(n.toString());

/** Seconds since epoch, for harvest dates. */
export const daysAgo = (days: number): number =>
  Math.floor(Date.now() / 1000) - days * 86_400;

export type BarioProgram = Program<any>;
