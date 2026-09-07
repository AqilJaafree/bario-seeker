/**
 * Reads the verification page's data straight from Solana.
 *
 * No backend, no indexer, no cached copy of the truth: given a batch code or a
 * batch address, everything below is derived from the program ID plus public
 * account data. That is the property the whole product rests on — a shopper
 * standing in an aisle is trusting the chain, not us.
 */
import "server-only";

import { PublicKey } from "@solana/web3.js";

import {
  CheckpointKindKey,
  GRADE_LABEL,
  GradeKey,
  KIND_LABEL,
  distanceKm,
  pdas,
  variant,
} from "./bario";
import { CLUSTER, getProgram } from "./program";
import type { BatchSummary, BatchView, ScanView, StopView } from "./types";

const secondsToMs = (bn: { toNumber(): number }) => bn.toNumber() * 1000;

/** Resolve registered actor names so the UI can say who recorded a stop. */
async function actorNames(keys: PublicKey[]): Promise<Map<string, string>> {
  const program = getProgram();
  const pda = pdas(program.programId);
  const unique = [...new Set(keys.map((k) => k.toBase58()))];

  const accounts = await program.account.actor.fetchMultiple(
    unique.map((k) => pda.actor(new PublicKey(k)))
  );

  const names = new Map<string, string>();
  unique.forEach((key, i) => {
    const account = accounts[i];
    if (account) names.set(key, account.name);
  });
  return names;
}

/** Load one batch and its whole journey. Returns null if the batch does not exist. */
export async function loadBatch(batchPda: PublicKey): Promise<BatchView | null> {
  const program = getProgram();
  const pda = pdas(program.programId);

  const batch = await program.account.batch.fetchNullable(batchPda);
  if (!batch) return null;

  // Checkpoint PDAs derive from the batch address alone, so the producer read
  // does not have to block them. Checkpoint indices are dense, so derive them
  // all and pull each set in a single getMultipleAccounts rather than one
  // request per stop.
  const [producer, rawJourney, rawScans] = await Promise.all([
    program.account.producer.fetch(batch.producer),
    program.account.checkpoint.fetchMultiple(
      Array.from({ length: batch.checkpointCount }, (_, i) =>
        pda.checkpoint(batchPda, i)
      )
    ),
    program.account.checkpoint.fetchMultiple(
      Array.from({ length: batch.scanCount }, (_, i) => pda.scan(batchPda, i))
    ),
  ]);

  const stops = rawJourney
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) => a.index - b.index);

  const names = await actorNames(stops.map((s) => s.actor));

  // Margin is derived for display and never stored, so the chain cannot carry a
  // percentage that contradicts the prices it sits next to.
  let previousPrice = 0;
  const journey: StopView[] = stops.map((stop) => {
    const marginPct =
      stop.priceSen > 0 && previousPrice > 0
        ? Math.round(((stop.priceSen - previousPrice) / previousPrice) * 1000) / 10
        : null;
    if (stop.priceSen > 0) previousPrice = stop.priceSen;

    const kind = variant<CheckpointKindKey>(stop.kind);
    return {
      index: stop.index,
      kind,
      kindLabel: KIND_LABEL[kind],
      label: stop.label,
      lat: stop.lat,
      lon: stop.lon,
      priceSen: stop.priceSen,
      marginPct,
      distanceKm: Math.round(
        distanceKm(producer.farmLat, producer.farmLon, stop.lat, stop.lon)
      ),
      timestamp: secondsToMs(stop.timestamp),
      actorName: names.get(stop.actor.toBase58()) ?? null,
      actor: stop.actor.toBase58(),
      noteCid: stop.noteCid,
    };
  });

  const scans: ScanView[] = rawScans
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .map((s) => ({
      index: s.index,
      lat: s.lat,
      lon: s.lon,
      label: s.label,
      timestamp: secondsToMs(s.timestamp),
    }));

  const audit = [...journey].reverse().find((s) => s.kind === "audit") ?? null;
  const farm = journey.find((s) => s.kind === "farm") ?? null;

  // The program labels checkpoint #0 as "<producer name>, Bario", which reads
  // as a stutter directly under the producer's name in the UI. Strip the
  // prefix and name the region properly.
  const farmPlace = (() => {
    const label = farm?.label?.trim();
    if (!label) return "Bario Highlands, Sarawak";
    const prefix = `${producer.name},`;
    const rest = label.startsWith(prefix)
      ? label.slice(prefix.length).trim()
      : label;
    return !rest || /^bario$/i.test(rest) ? "Bario Highlands, Sarawak" : rest;
  })();
  const grade = variant<GradeKey>(batch.grade);
  const last = journey[journey.length - 1];

  return {
    batchPda: batchPda.toBase58(),
    batchAsset: batch.asset.toBase58(),
    producerPda: batch.producer.toBase58(),
    producerAsset: producer.asset.toBase58(),

    batchCode: batch.batchCode,
    variety: batch.variety,
    grade,
    gradeLabel: GRADE_LABEL[grade],
    isAudited: grade !== "pending",

    harvestDate: secondsToMs(batch.harvestDate),
    registeredAt: secondsToMs(batch.registeredAt),
    quantityKg: batch.quantityKg,
    bagCount: batch.bagCount,
    farmgatePriceSen: batch.farmgatePriceSen,

    producerName: producer.name,
    producerLocation: farmPlace,
    farmLat: producer.farmLat,
    farmLon: producer.farmLon,
    farmElevationM: producer.farmElevationM,
    producerJoinedAt: secondsToMs(producer.joinedAt),

    auditDate: audit?.timestamp ?? null,
    auditorOrg: audit?.actorName ?? null,
    auditReportCid: audit?.noteCid || null,
    auditCount: batch.auditCount,

    // Deliberately null — see the note in types.ts.
    brokenGrainPct: null,
    moisturePct: null,

    journey,
    scans,
    totalDistanceKm: last?.distanceKm ?? 0,

    ratingCount: batch.ratingCount,
    ratingAverage:
      batch.ratingCount > 0
        ? Math.round((batch.ratingSum / batch.ratingCount) * 10) / 10
        : null,
    reportCount: batch.reportCount,

    cluster: CLUSTER,
  };
}

/**
 * Every batch on the platform, newest first.
 *
 * `getProgramAccounts` is a heavy call and most RPC providers throttle it, so
 * this is the one query that should sit behind a cache in production rather
 * than run on every request.
 */
export async function listBatches(): Promise<BatchSummary[]> {
  const program = getProgram();

  const [batches, producers] = await Promise.all([
    program.account.batch.all(),
    program.account.producer.all(),
  ]);

  const producerName = new Map(
    producers.map((p) => [p.publicKey.toBase58(), p.account.name])
  );

  const summaries = await Promise.all(
    batches.map(async ({ publicKey, account }) => {
      const grade = variant<GradeKey>(account.grade);

      // A shelf price only exists once the batch actually reaches a shelf.
      // Reading the last stop and requiring kind === "retail" keeps a batch
      // that has only left the farm from advertising a retail price it does
      // not have. Reading just the final checkpoint avoids pulling a whole
      // journey for a list view.
      let retailPriceSen: number | null = null;
      if (account.checkpointCount > 1) {
        const pda = pdas(program.programId);
        const lastStop = await program.account.checkpoint.fetchNullable(
          pda.checkpoint(publicKey, account.checkpointCount - 1)
        );
        if (
          lastStop &&
          lastStop.priceSen > 0 &&
          variant<CheckpointKindKey>(lastStop.kind) === "retail"
        ) {
          retailPriceSen = lastStop.priceSen;
        }
      }

      return {
        batchPda: publicKey.toBase58(),
        batchCode: account.batchCode,
        producerName: producerName.get(account.producer.toBase58()) ?? "Unknown",
        grade,
        gradeLabel: GRADE_LABEL[grade],
        variety: account.variety,
        quantityKg: account.quantityKg,
        farmgatePriceSen: account.farmgatePriceSen,
        retailPriceSen,
        stopCount: account.checkpointCount,
        scanCount: account.scanCount,
      };
    })
  );

  return summaries.sort((a, b) => b.batchCode.localeCompare(a.batchCode));
}

/**
 * Resolve a human batch code such as "2026-11-001".
 *
 * A batch PDA is seeded by (producer, code), so a code alone is not addressable
 * without knowing the producer — hence the scan. QR codes should carry the
 * batch address directly; this exists for the search box, where a shopper types
 * the code printed on the bag.
 */
export async function loadBatchByCode(code: string): Promise<BatchView | null> {
  const program = getProgram();
  const match = (await program.account.batch.all()).find(
    (b) => b.account.batchCode.toLowerCase() === code.trim().toLowerCase()
  );
  return match ? loadBatch(match.publicKey) : null;
}

/** Accepts either a batch address or a printed batch code. */
export async function loadBatchByAnyId(id: string): Promise<BatchView | null> {
  const trimmed = id.trim();
  try {
    return await loadBatch(new PublicKey(trimmed));
  } catch {
    return loadBatchByCode(trimmed);
  }
}
