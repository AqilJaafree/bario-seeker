/**
 * Seed a deployed Bario Seeker program with the demo dataset.
 *
 * Idempotent: every step checks whether its account already exists, so the
 * script can be re-run after a partial failure without starting over. Demo
 * keypairs are persisted to `scripts/.demo-keys.json` so repeated runs reuse
 * the same producers, actors and PDAs — which matters because printed QR codes
 * resolve to addresses, and those addresses must not move between runs.
 *
 *   anchor build && anchor deploy --provider.cluster devnet
 *   ANCHOR_PROVIDER_URL=https://api.devnet.solana.com \
 *   ANCHOR_WALLET=~/.config/solana/id.json \
 *   pnpm exec ts-node scripts/seed-devnet.ts
 */
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

import {
  GradeArg,
  Kind,
  MPL_CORE_PROGRAM_ID,
  PLACES,
  Role,
  SCAN_SPOTS,
  bn,
  distanceKm,
  fmtRm,
  pdas,
  withComputeBudget,
} from "./lib/bario";
import { BATCHES, PRODUCERS, harvestTimestamp } from "./lib/demo-data";
import { BarioSeekerProgram } from "../target/types/bario_seeker_program";

const KEYS_FILE = path.join(__dirname, ".demo-keys.json");
const URI = "https://arweave.net/bario-seeker-demo-metadata.json";

/**
 * Per-role funding, in SOL. Sized from measured usage (the whole demo consumes
 * about 0.23 SOL) with roughly 2x headroom, because devnet airdrops are rate
 * limited and over-funding eleven wallets is the difference between one
 * airdrop and five.
 */
const FUND_SOL: Record<string, number> = {
  relayer: 0.15, // pays for every consumer scan
  distributor: 0.08,
  auditor: 0.06,
  retailer: 0.06,
  producer: 0.08,
  consumer: 0.03,
};
const TOP_UP_BELOW_SOL = 0.02;
const CONSUMER_COUNT = 4;

/** Gap between RPC calls. The public devnet endpoint throttles aggressively. */
const PACE_MS = Number(process.env.SEED_PACE_MS ?? 250);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Wrap an RPC method so a 429 backs off and retries instead of killing the run.
 *
 * Applied to the connection and the provider rather than to each call site,
 * which means it also covers the requests Anchor makes internally when it
 * fetches accounts and confirms transactions.
 */
function throttleGuard<T extends (...args: any[]) => Promise<any>>(fn: T, label: string): T {
  return (async (...args: any[]) => {
    let delay = 800;
    for (let attempt = 1; ; attempt++) {
      try {
        const out = await fn(...args);
        if (PACE_MS > 0) await sleep(PACE_MS);
        return out;
      } catch (e: any) {
        const msg = String(e?.message ?? e);
        if (attempt >= 8 || !/429|Too Many Requests/i.test(msg)) throw e;
        console.log(`    rate limited on ${label}, retrying in ${delay}ms`);
        await sleep(delay);
        delay = Math.min(delay * 2, 8_000);
      }
    }
  }) as T;
}

/** `producer:ruben` and `consumer:2` share the funding of their role. */
const fundingFor = (name: string): number =>
  FUND_SOL[name.split(":")[0]] ?? 0.05;

type KeyBag = Record<string, Keypair>;

function loadOrCreateKeys(names: string[]): KeyBag {
  const stored: Record<string, number[]> = fs.existsSync(KEYS_FILE)
    ? JSON.parse(fs.readFileSync(KEYS_FILE, "utf8"))
    : {};
  const bag: KeyBag = {};
  let dirty = false;

  for (const name of names) {
    if (stored[name]) {
      bag[name] = Keypair.fromSecretKey(Uint8Array.from(stored[name]));
    } else {
      bag[name] = Keypair.generate();
      stored[name] = Array.from(bag[name].secretKey);
      dirty = true;
    }
  }

  if (dirty) {
    fs.writeFileSync(KEYS_FILE, JSON.stringify(stored, null, 2));
    console.log(`  keypairs saved to ${path.relative(process.cwd(), KEYS_FILE)}`);
  }
  return bag;
}

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.barioSeekerProgram as Program<BarioSeekerProgram>;
  const pda = pdas(program.programId);
  const admin = provider.wallet.publicKey;
  const connection = provider.connection;

  for (const m of ["getAccountInfo", "getBalance", "getLatestBlockhash"] as const) {
    (connection as any)[m] = throttleGuard((connection as any)[m].bind(connection), m);
  }
  (provider as any).sendAndConfirm = throttleGuard(
    provider.sendAndConfirm!.bind(provider),
    "sendAndConfirm"
  );

  const exists = async (key: PublicKey) => (await connection.getAccountInfo(key)) !== null;

  console.log("Bario Seeker — devnet seed");
  console.log(`  cluster : ${connection.rpcEndpoint}`);
  console.log(`  program : ${program.programId.toBase58()}`);
  console.log(`  admin   : ${admin.toBase58()}`);

  const adminBalance = await connection.getBalance(admin);
  console.log(`  balance : ${(adminBalance / LAMPORTS_PER_SOL).toFixed(3)} SOL`);

  // ---------------------------------------------------------------- keypairs
  const names = [
    "auditor",
    "distributor",
    "retailer",
    "relayer",
    ...PRODUCERS.map((p) => `producer:${p.key}`),
    ...Array.from({ length: CONSUMER_COUNT }, (_, i) => `consumer:${i}`),
  ];
  console.log("\n[1/7] demo keypairs");
  const keys = loadOrCreateKeys(names);

  // ------------------------------------------------------------------ fund
  console.log("\n[2/7] funding demo wallets");
  const needsFunding: { to: PublicKey; lamports: number }[] = [];
  for (const [name, kp] of Object.entries(keys)) {
    const bal = await connection.getBalance(kp.publicKey);
    if (bal < TOP_UP_BELOW_SOL * LAMPORTS_PER_SOL) {
      const sol = fundingFor(name);
      needsFunding.push({ to: kp.publicKey, lamports: Math.round(sol * LAMPORTS_PER_SOL) });
      console.log(`  fund ${name.padEnd(18)} ${sol} SOL`);
    }
  }
  // Check affordability against what is actually still owed, not the full
  // budget — on a resume the demo wallets are already funded and the admin
  // only pays transaction fees.
  const owed = needsFunding.reduce((sum, f) => sum + f.lamports, 0);
  const feeHeadroom = 0.05 * LAMPORTS_PER_SOL;
  if (adminBalance < owed + feeHeadroom) {
    throw new Error(
      `Admin wallet ${admin.toBase58()} has ` +
        `${(adminBalance / LAMPORTS_PER_SOL).toFixed(3)} SOL but needs ` +
        `${((owed + feeHeadroom) / LAMPORTS_PER_SOL).toFixed(3)} SOL.\n` +
        `Run: solana airdrop 2 ${admin.toBase58()} -u devnet ` +
        `(or use https://faucet.solana.com if rate limited)`
    );
  }

  // Transfers from the admin wallet rather than airdrops, which devnet
  // rate-limits aggressively.
  for (let i = 0; i < needsFunding.length; i += 8) {
    const tx = new Transaction().add(
      ...needsFunding.slice(i, i + 8).map(({ to, lamports }) =>
        SystemProgram.transfer({ fromPubkey: admin, toPubkey: to, lamports })
      )
    );
    await provider.sendAndConfirm(tx);
  }
  if (needsFunding.length === 0) console.log("  all wallets already funded");

  // ------------------------------------------------------------- initialize
  console.log("\n[3/7] platform config");
  const configPda = pda.config();
  const producerCollection = pda.producerCollection();

  if (await exists(configPda)) {
    console.log("  config already initialised");
  } else {
    await program.methods
      .initialize(URI)
      .accountsPartial({
        admin,
        config: configPda,
        producerCollection,
        mplCoreProgram: MPL_CORE_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`  config              ${configPda.toBase58()}`);
    console.log(`  producer collection ${producerCollection.toBase58()}`);
  }

  // ----------------------------------------------------------------- actors
  console.log("\n[4/7] supply-chain actors");
  const actorRows: [Keypair, any, string][] = [
    [keys.auditor, Role.auditor, "Sarawak Rice Laboratory, Miri"],
    [keys.distributor, Role.distributor, "Kuching Highland Trading"],
    [keys.retailer, Role.retailer, "Klang Valley Grocers"],
  ];
  for (const [kp, role, name] of actorRows) {
    const actorPda = pda.actor(kp.publicKey);
    if (await exists(actorPda)) {
      console.log(`  ${name} — already registered`);
      continue;
    }
    await program.methods
      .registerActor(kp.publicKey, role, name)
      .accountsPartial({
        admin,
        config: configPda,
        actor: actorPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`  ${name} — ${kp.publicKey.toBase58()}`);
  }

  // -------------------------------------------------------------- producers
  console.log("\n[5/7] producers");
  const producerPdas: Record<string, PublicKey> = {};

  for (const p of PRODUCERS) {
    const kp = keys[`producer:${p.key}`];
    const producerPda = pda.producer(kp.publicKey);
    producerPdas[p.key] = producerPda;

    if (await exists(producerPda)) {
      console.log(`  ${p.name} — already registered`);
      continue;
    }

    await program.methods
      .registerProducer({
        name: p.name,
        farmLat: p.farm.lat,
        farmLon: p.farm.lon,
        farmElevationM: p.elevationM,
        identityHash: Array.from(Buffer.alloc(32, 1)),
        assetUri: URI,
        collectionUri: URI,
      })
      .accountsPartial({
        authority: kp.publicKey,
        config: configPda,
        producer: producerPda,
        producerAsset: pda.producerAsset(kp.publicKey),
        batchCollection: pda.batchCollection(producerPda),
        producerCollection,
        mplCoreProgram: MPL_CORE_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .preInstructions(withComputeBudget())
      .signers([kp])
      .rpc();

    console.log(
      `  ${p.name} — SBT ${pda.producerAsset(kp.publicKey).toBase58()} (${p.farm.label}, ${p.elevationM} m)`
    );
  }

  // ---------------------------------------------------------------- batches
  console.log("\n[6/7] batches and journeys");

  for (const b of BATCHES) {
    const producer = PRODUCERS.find((p) => p.key === b.producerKey)!;
    const farmerKp = keys[`producer:${b.producerKey}`];
    const producerPda = producerPdas[b.producerKey];
    const batchPda = pda.batch(producerPda, b.batchCode);
    const batchAsset = pda.batchAsset(producerPda, b.batchCode);
    const batchCollection = pda.batchCollection(producerPda);

    if (!(await exists(batchPda))) {
      await program.methods
        .registerBatch({
          batchCode: b.batchCode,
          variety: b.variety,
          harvestDate: bn(harvestTimestamp(b)),
          quantityKg: b.quantityKg,
          bagCount: b.bagCount,
          farmgatePriceSen: b.farmgateSen,
          assetUri: URI,
          noteCid: `bafyharvest${b.batchCode.replace(/-/g, "")}`,
        })
        .accountsPartial({
          authority: farmerKp.publicKey,
          config: configPda,
          producer: producerPda,
          batch: batchPda,
          batchAsset,
          batchCollection,
          farmCheckpoint: pda.checkpoint(batchPda, 0),
          mplCoreProgram: MPL_CORE_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .preInstructions(withComputeBudget())
        .signers([farmerKp])
        .rpc();
    }

    const state = await program.account.batch.fetch(batchPda);
    let index: number = state.checkpointCount;

    const addStop = async (kind: any, place: any, priceSen: number, cid = "") => {
      await program.methods
        .addCheckpoint({
          index,
          kind,
          lat: place.lat,
          lon: place.lon,
          label: place.label,
          priceSen,
          noteCid: cid,
        })
        .accountsPartial({
          actorAuthority:
            kind === Kind.retail ? keys.retailer.publicKey : keys.distributor.publicKey,
          actor: pda.actor(
            kind === Kind.retail ? keys.retailer.publicKey : keys.distributor.publicKey
          ),
          producer: producerPda,
          batch: batchPda,
          checkpoint: pda.checkpoint(batchPda, index),
          systemProgram: SystemProgram.programId,
        })
        .signers([kind === Kind.retail ? keys.retailer : keys.distributor])
        .rpc();
      index += 1;
    };

    // 1. village collection point
    if (index === 1) {
      await addStop(
        Kind.collection,
        producer.collectionPoint,
        b.farmgateSen + 40,
        `bafycollect${b.batchCode.replace(/-/g, "")}`
      );
    }

    // 2. independent audit
    if (b.grade && index === 2) {
      await program.methods
        .recordAudit({
          index,
          grade: (GradeArg as any)[b.grade],
          lat: PLACES.miriLab.lat,
          lon: PLACES.miriLab.lon,
          label: PLACES.miriLab.label,
          reportCid: `bafyaudit${b.batchCode.replace(/-/g, "")}`,
        })
        .accountsPartial({
          auditor: keys.auditor.publicKey,
          config: configPda,
          actor: pda.actor(keys.auditor.publicKey),
          producer: producerPda,
          batch: batchPda,
          batchAsset,
          batchCollection,
          checkpoint: pda.checkpoint(batchPda, index),
          mplCoreProgram: MPL_CORE_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .preInstructions(withComputeBudget())
        .signers([keys.auditor])
        .rpc();
      index += 1;
    }

    // 3. consolidation in Kuching, 4. the shelf
    if (b.distributionSen > 0 && index === 3) {
      await addStop(Kind.distribution, PLACES.kuchingHub, b.distributionSen);
    }
    if (b.retailSen > 0 && index === 4) {
      await addStop(Kind.retail, b.retail, b.retailSen);
    }

    // consumer scans, at ~1 km precision
    const after = await program.account.batch.fetch(batchPda);
    for (let s = after.scanCount; s < b.scanCount; s++) {
      const spot = SCAN_SPOTS[s % SCAN_SPOTS.length];
      await program.methods
        .recordScan({
          index: s,
          // jitter within the block so the heat layer is not a single pixel
          lat: spot.lat + ((s * 2_713) % 9_000),
          lon: spot.lon - ((s * 1_931) % 9_000),
          label: spot.label,
        })
        .accountsPartial({
          payer: keys.relayer.publicKey,
          producer: producerPda,
          batch: batchPda,
          scan: pda.scan(batchPda, s),
          systemProgram: SystemProgram.programId,
        })
        .signers([keys.relayer])
        .rpc();
    }

    // ratings
    for (let r = 0; r < b.ratings.length; r++) {
      const consumer = keys[`consumer:${r % CONSUMER_COUNT}`];
      const reviewPda = pda.review(batchPda, consumer.publicKey);
      if (await exists(reviewPda)) continue;
      await program.methods
        .rateBatch(b.ratings[r], `bafyreview${b.batchCode.replace(/-/g, "")}${r}`)
        .accountsPartial({
          reviewer: consumer.publicKey,
          producer: producerPda,
          batch: batchPda,
          review: reviewPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([consumer])
        .rpc();
    }

    const final = await program.account.batch.fetch(batchPda);
    const km = distanceKm(producer.farm.lat, producer.farm.lon, b.retail.lat, b.retail.lon);
    console.log(
      `  ${b.batchCode} ${producer.name.padEnd(14)} ` +
        `${(b.grade ?? "pending").toUpperCase().padEnd(7)} ` +
        `${fmtRm(b.farmgateSen)} → ${b.retailSen ? fmtRm(b.retailSen) : "—"}  ` +
        `${final.checkpointCount} stops, ${final.scanCount} scans, ${Math.round(km)} km`
    );
  }

  // ---------------------------------------------------------------- summary
  console.log("\n[7/7] summary");
  const config = await program.account.config.fetch(configPda);
  console.log(`  producers registered : ${config.producerCount}`);
  console.log(`  batches certified    : ${config.batchCount}`);
  console.log("\n  Addresses the frontend needs:");
  console.log(`    programId          ${program.programId.toBase58()}`);
  console.log(`    config             ${configPda.toBase58()}`);
  console.log(`    producerCollection ${producerCollection.toBase58()}`);
  for (const p of PRODUCERS) {
    const kp = keys[`producer:${p.key}`];
    console.log(`    ${p.name.padEnd(14)} producer ${producerPdas[p.key].toBase58()}`);
    console.log(`    ${"".padEnd(14)} SBT      ${pda.producerAsset(kp.publicKey).toBase58()}`);
  }
  const cluster = connection.rpcEndpoint.includes("devnet") ? "?cluster=devnet" : "";
  console.log(
    `\n  Explorer: https://explorer.solana.com/address/${producerCollection.toBase58()}${cluster}`
  );
  console.log("\nSeed complete.");
}

main().catch((e) => {
  console.error("\nSeed failed:", e);
  process.exit(1);
});
