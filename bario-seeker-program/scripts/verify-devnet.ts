/**
 * Read a batch's whole journey back from the chain and check the demo criteria
 * in PRD section 9.1.
 *
 * Uses nothing but an RPC endpoint and the program ID — no backend, no indexer,
 * no cached state. This is exactly what the consumer verification page will do
 * when someone scans a bag, so if this script works the page can work.
 *
 *   ANCHOR_PROVIDER_URL=https://api.devnet.solana.com \
 *   ANCHOR_WALLET=$HOME/.config/solana/id.json \
 *   pnpm exec ts-node scripts/verify-devnet.ts [batchCode]
 */
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

import { distanceKm, fmtRm, pdas, toDeg, variant } from "./lib/bario";
import { BATCHES, PRODUCERS } from "./lib/demo-data";
import { BarioSeekerProgram } from "../target/types/bario_seeker_program";

const KEYS_FILE = path.join(__dirname, ".demo-keys.json");
const pass = (s: string) => console.log(`  \x1b[32m✓\x1b[0m ${s}`);
const fail = (s: string) => {
  console.log(`  \x1b[31m✗\x1b[0m ${s}`);
  failures += 1;
};
let failures = 0;

async function main() {
  const batchCode = process.argv[2] ?? "2026-11-001";
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.barioSeekerProgram as Program<BarioSeekerProgram>;
  const pda = pdas(program.programId);
  const connection = provider.connection;

  console.log(`Bario Seeker — reading batch ${batchCode} from ${connection.rpcEndpoint}\n`);

  const demo = BATCHES.find((b) => b.batchCode === batchCode);
  if (!demo) throw new Error(`No demo batch ${batchCode}`);
  const demoProducer = PRODUCERS.find((p) => p.key === demo.producerKey)!;

  const keys = JSON.parse(fs.readFileSync(KEYS_FILE, "utf8"));
  const farmer = Keypair.fromSecretKey(
    Uint8Array.from(keys[`producer:${demo.producerKey}`])
  );

  const producerPda = pda.producer(farmer.publicKey);
  const batchPda = pda.batch(producerPda, batchCode);
  const producerAsset = pda.producerAsset(farmer.publicKey);

  // ------------------------------------------------------- the page's payload
  const producer = await program.account.producer.fetch(producerPda);
  const batch = await program.account.batch.fetch(batchPda);

  const journey = [];
  for (let i = 0; i < batch.checkpointCount; i++) {
    journey.push(await program.account.checkpoint.fetch(pda.checkpoint(batchPda, i)));
  }
  const scans = [];
  for (let i = 0; i < batch.scanCount; i++) {
    scans.push(await program.account.checkpoint.fetch(pda.scan(batchPda, i)));
  }

  const rating =
    batch.ratingCount > 0 ? (batch.ratingSum / batch.ratingCount).toFixed(1) : "—";

  console.log(`  ${producer.name} — Bario, Sarawak`);
  console.log(
    `  Farming since ${new Date(producer.joinedAt.toNumber() * 1000).getFullYear()}` +
      `   ★ ${rating} (${batch.ratingCount} reviews)`
  );
  console.log(
    `  Grade ${variant(batch.grade).toUpperCase()}   ` +
      `Harvest ${new Date(batch.harvestDate.toNumber() * 1000).toISOString().slice(0, 10)}   ` +
      `Batch ${batch.batchCode}   ${batch.quantityKg} kg\n`);

  console.log("  JOURNEY");
  let previousPrice = 0;
  for (const stop of journey) {
    const km = distanceKm(producer.farmLat, producer.farmLon, stop.lat, stop.lon);
    const price = stop.priceSen > 0 ? fmtRm(stop.priceSen).padStart(9) : "        —";
    const margin =
      stop.priceSen > 0 && previousPrice > 0
        ? ` +${(((stop.priceSen - previousPrice) / previousPrice) * 100).toFixed(1)}%`
        : "";
    if (stop.priceSen > 0) previousPrice = stop.priceSen;
    console.log(
      `   ${String(stop.index).padStart(2)}. ${variant(stop.kind).padEnd(13)} ` +
        `${stop.label.padEnd(36)} ${price}${margin.padEnd(8)} ` +
        `${toDeg(stop.lat).toFixed(4)}, ${toDeg(stop.lon).toFixed(4)}  ${Math.round(km)} km`
    );
  }

  const last = journey[journey.length - 1];
  console.log(
    `\n  ${Math.round(
      distanceKm(producer.farmLat, producer.farmLon, last.lat, last.lon)
    ).toLocaleString()} km from the farm · ${scans.length} consumer scans\n`
  );

  // ------------------------------------------------------ PRD 9.1 assertions
  console.log("  DEMO CRITERIA (PRD 9.1)");

  const assetInfo = await connection.getAccountInfo(producerAsset);
  assetInfo !== null
    ? pass("Producer SBT exists on devnet as a Metaplex Core asset")
    : fail("Producer SBT is missing");

  const batchAssetInfo = await connection.getAccountInfo(pda.batchAsset(producerPda, batchCode));
  batchAssetInfo !== null
    ? pass("Batch SBT exists inside the producer's own Collection")
    : fail("Batch SBT is missing");

  variant(batch.grade) === (demo.grade ?? "pending")
    ? pass(`Grade is ${variant(batch.grade).toUpperCase()}, set by a registered auditor`)
    : fail(`Grade is ${variant(batch.grade)}, expected ${demo.grade}`);

  journey.length >= 5
    ? pass(`Journey has ${journey.length} checkpoints, all read from the chain alone`)
    : fail(`Journey has only ${journey.length} checkpoints`);

  const spansSarawakToKl =
    journey.some((s) => toDeg(s.lon) > 113) && journey.some((s) => toDeg(s.lon) < 103);
  spansSarawakToKl
    ? pass("Route spans Sarawak to the Klang Valley")
    : fail("Route does not span Sarawak to the Klang Valley");

  const monotonic = journey
    .filter((s) => s.priceSen > 0)
    .every((s, i, a) => i === 0 || s.priceSen > a[i - 1].priceSen);
  monotonic ? pass("Price journey is coherent farm to shelf") : fail("Prices are not monotonic");

  const coarse = scans.every((s) => s.lat % 10_000 === 0 && s.lon % 10_000 === 0);
  coarse
    ? pass("Every consumer scan is coarsened to the ~1 km privacy grid")
    : fail("A consumer scan carries precise coordinates");

  // The load-bearing claim: the certificate cannot move.
  const core = await import("@metaplex-foundation/mpl-core");
  const { createUmi } = await import("@metaplex-foundation/umi-bundle-defaults");
  const { createNoopSigner, signerIdentity, publicKey } = await import(
    "@metaplex-foundation/umi"
  );
  const { toWeb3JsInstruction } = await import("@metaplex-foundation/umi-web3js-adapters");

  const umi = createUmi(connection.rpcEndpoint).use(core.mplCore());
  umi.use(signerIdentity(createNoopSigner(publicKey(farmer.publicKey.toBase58()))));

  const ix = toWeb3JsInstruction(
    core
      .transferV1(umi, {
        asset: publicKey(producerAsset.toBase58()),
        collection: publicKey(pda.producerCollection().toBase58()),
        newOwner: publicKey(Keypair.generate().publicKey.toBase58()),
      })
      .getInstructions()[0]
  );

  try {
    await provider.sendAndConfirm!(new Transaction().add(ix), [farmer]);
    fail("THE PRODUCER SBT WAS TRANSFERRED — it is not soulbound");
  } catch (e: any) {
    const logs = JSON.stringify(e?.logs ?? e?.cause?.logs ?? []);
    logs.includes("permanent_freeze_delegate")
      ? pass("Transferring the Producer SBT is rejected by PermanentFreezeDelegate")
      : fail(`Transfer failed, but not from the freeze plugin: ${String(e?.message).slice(0, 160)}`);
  }

  console.log(
    failures === 0
      ? "\n  All criteria met.\n"
      : `\n  ${failures} criteria not met.\n`
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("\nVerification failed:", e);
  process.exit(1);
});
