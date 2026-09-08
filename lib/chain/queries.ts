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
import type {
  BatchSummary,
  BatchView,
  ProducerBatchView,
  ProducerReviewView,
  ProducerSummary,
  ProducerView,
  ScanView,
  StopView,
} from "./types";

const secondsToMs = (bn: { toNumber(): number }) => bn.toNumber() * 1000;

/**
 * Retry a read that the RPC throttled.
 *
 * The public devnet endpoint rate-limits by IP, and serverless functions share
 * addresses, so 429s arrive in bursts under load. Without this a throttled read
 * surfaces as "could not check this batch", which reads to a shopper as though
 * the bag might be fake — the one thing this page must never say by accident.
 */
async function withRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let delay = 250;
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const message = String((error as Error)?.message ?? error);
      const throttled = /429|Too Many Requests|rate/i.test(message);
      if (!throttled || attempt >= 4) throw error;
      console.warn(`rpc throttled on ${label}, retrying in ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

/**
 * batch code -> batch address, cached briefly.
 *
 * A batch PDA is seeded by (producer, code), so resolving a printed code means
 * scanning every batch account — a `getProgramAccounts` call heavy enough that
 * doing it per page view is what triggers the throttling above. QR codes carry
 * the address and skip this entirely; the cache is for people typing the code
 * off a bag.
 */
const CODE_INDEX_TTL_MS = 60_000;
let codeIndex: { at: number; map: Map<string, string> } | null = null;

async function resolveCode(code: string): Promise<PublicKey | null> {
  const key = code.trim().toLowerCase();
  const fresh = codeIndex && Date.now() - codeIndex.at < CODE_INDEX_TTL_MS;

  if (fresh) {
    const hit = codeIndex!.map.get(key);
    // Trust a fresh index for misses too. Falling through to a rescan on every
    // unknown code means the counterfeit case — the one most likely to be
    // hammered — triggers a full getProgramAccounts scan per request, which is
    // exactly backwards. The cost is that a batch registered in the last minute
    // reads as unknown until the index expires.
    return hit ? new PublicKey(hit) : null;
  }

  const all = await withRetry("batch.all", () => getProgram().account.batch.all());
  codeIndex = {
    at: Date.now(),
    map: new Map(
      all.map((b) => [b.account.batchCode.toLowerCase(), b.publicKey.toBase58()])
    ),
  };

  const found = codeIndex.map.get(key);
  return found ? new PublicKey(found) : null;
}

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

/**
 * Assembled certificates, cached briefly.
 *
 * Reading one costs about five RPC round trips — the batch, its producer, the
 * journey, the scans, and the actor names. Against the public devnet endpoint
 * that is enough to trigger rate limiting under quite light load, which pushed
 * the p90 past sixteen seconds in testing.
 *
 * A short TTL is honest here rather than merely convenient: checkpoints are
 * append-only and a grade changes at most once per audit, so a certificate is
 * stale by seconds at worst. It matches the s-maxage already set on /api/*.
 */
const BATCH_TTL_MS = 30_000;
const batchCache = new Map<string, { at: number; value: BatchView | null }>();

/** Load one batch and its whole journey. Returns null if the batch does not exist. */
export async function loadBatch(batchPda: PublicKey): Promise<BatchView | null> {
  const cacheKey = batchPda.toBase58();
  const cached = batchCache.get(cacheKey);
  if (cached && Date.now() - cached.at < BATCH_TTL_MS) return cached.value;

  const value = await loadBatchUncached(batchPda);
  batchCache.set(cacheKey, { at: Date.now(), value });
  return value;
}

async function loadBatchUncached(batchPda: PublicKey): Promise<BatchView | null> {
  const program = getProgram();
  const pda = pdas(program.programId);

  const batch = await withRetry("batch.fetch", () =>
    program.account.batch.fetchNullable(batchPda)
  );
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
  const retail = [...journey].reverse().find((s) => s.kind === "retail") ?? null;
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
    producerRating: producer.ratingWeight.isZero()
      ? null
      : Math.round(
          (producer.ratingSum.toNumber() / producer.ratingWeight.toNumber()) * 10
        ) / 10,

    auditDate: audit?.timestamp ?? null,
    auditorOrg: audit?.actorName ?? null,
    auditReportCid: audit?.noteCid || null,
    auditCount: batch.auditCount,

    // Deliberately null — see the note in types.ts.
    brokenGrainPct: null,
    moisturePct: null,

    retailPriceSen: retail && retail.priceSen > 0 ? retail.priceSen : null,
    bagSizeKg: batch.bagCount > 0 ? Math.round(batch.quantityKg / batch.bagCount) : 0,

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
  const address = await resolveCode(code);
  return address ? loadBatch(address) : null;
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

// ---------------------------------------------------------------------------
// Producers
// ---------------------------------------------------------------------------

const PRODUCER_TTL_MS = 30_000;
let producerCache: { at: number; value: ProducerView[] } | null = null;

const shortKey = (k: string) => `${k.slice(0, 4)}…${k.slice(-4)}`;

/**
 * Every producer, with their batches and reviews.
 *
 * Assembled in three `getProgramAccounts` calls rather than per-producer reads,
 * because that scan is the expensive part and the whole set is small. Cached on
 * the same short TTL as certificates — the data is append-only, so it is stale
 * by seconds at worst.
 */
async function loadAllProducers(): Promise<ProducerView[]> {
  if (producerCache && Date.now() - producerCache.at < PRODUCER_TTL_MS) {
    return producerCache.value;
  }

  const program = getProgram();
  const pda = pdas(program.programId);

  const [producers, batches, reviews] = await Promise.all([
    withRetry("producer.all", () => program.account.producer.all()),
    withRetry("batch.all", () => program.account.batch.all()),
    withRetry("review.all", () => program.account.review.all()),
  ]);

  // The shelf price lives on the last checkpoint, so read the final stop of
  // every batch in one batched request rather than one call per batch.
  const lastStopKeys = batches.map((b) =>
    pda.checkpoint(b.publicKey, Math.max(0, b.account.checkpointCount - 1))
  );
  const lastStops = await withRetry("checkpoint.fetchMultiple", () =>
    program.account.checkpoint.fetchMultiple(lastStopKeys)
  );

  const batchViews = new Map<string, ProducerBatchView[]>();
  const batchCodeByPda = new Map<string, string>();

  batches.forEach(({ publicKey, account }, i) => {
    const grade = variant<GradeKey>(account.grade);
    const last = lastStops[i];
    const isRetail =
      last && variant<CheckpointKindKey>(last.kind) === "retail" && last.priceSen > 0;

    const view: ProducerBatchView = {
      batchPda: publicKey.toBase58(),
      batchCode: account.batchCode,
      variety: account.variety,
      grade,
      gradeLabel: GRADE_LABEL[grade],
      isAudited: grade !== "pending",
      harvestDate: secondsToMs(account.harvestDate),
      quantityKg: account.quantityKg,
      bagCount: account.bagCount,
      bagSizeKg:
        account.bagCount > 0 ? Math.round(account.quantityKg / account.bagCount) : 0,
      farmgatePriceSen: account.farmgatePriceSen,
      retailPriceSen: isRetail ? last!.priceSen : null,
      stopCount: account.checkpointCount,
      scanCount: account.scanCount,
      ratingCount: account.ratingCount,
      ratingAverage:
        account.ratingCount > 0
          ? Math.round((account.ratingSum / account.ratingCount) * 10) / 10
          : null,
    };

    const key = account.producer.toBase58();
    batchViews.set(key, [...(batchViews.get(key) ?? []), view]);
    batchCodeByPda.set(view.batchPda, view.batchCode);
  });

  const reviewsByBatch = new Map<string, ProducerReviewView[]>();
  for (const { account } of reviews) {
    const batchPda = account.batch.toBase58();
    const view: ProducerReviewView = {
      batchPda,
      batchCode: batchCodeByPda.get(batchPda) ?? "",
      reviewer: shortKey(account.reviewer.toBase58()),
      rating: account.rating,
      reviewCid: account.reviewCid,
      createdAt: secondsToMs(account.createdAt),
    };
    reviewsByBatch.set(batchPda, [...(reviewsByBatch.get(batchPda) ?? []), view]);
  }

  const value = producers.map(({ publicKey, account }) => {
    const key = publicKey.toBase58();
    const mine = (batchViews.get(key) ?? []).sort(
      (a, b) => b.harvestDate - a.harvestDate
    );
    const myReviews = mine
      .flatMap((b) => reviewsByBatch.get(b.batchPda) ?? [])
      .sort((a, b) => b.createdAt - a.createdAt);

    return {
      producerPda: key,
      producerAsset: account.asset.toBase58(),
      name: account.name,
      // The chain stores coordinates, not a place name. The farm checkpoint's
      // label repeats the producer's own name, so the region is the honest
      // thing to show here.
      location: "Bario Highlands, Sarawak",
      farmLat: account.farmLat,
      farmLon: account.farmLon,
      elevationM: account.farmElevationM,
      joinedAt: secondsToMs(account.joinedAt),
      batchCount: account.batchCount,
      rating: account.ratingWeight.isZero()
        ? null
        : Math.round(
            (account.ratingSum.toNumber() / account.ratingWeight.toNumber()) * 10
          ) / 10,
      latestBatch: mine[0] ?? null,
      batches: mine,
      reviews: myReviews,
      reviewCount: myReviews.length,
      cluster: CLUSTER,
    } satisfies ProducerView;
  });

  producerCache = { at: Date.now(), value };
  return value;
}

export async function listProducers(): Promise<ProducerSummary[]> {
  return (await loadAllProducers()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadProducer(producerPda: string): Promise<ProducerView | null> {
  const all = await loadAllProducers();
  return all.find((p) => p.producerPda === producerPda) ?? null;
}
