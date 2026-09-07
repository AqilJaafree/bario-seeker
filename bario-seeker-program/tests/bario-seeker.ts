/**
 * Bario Seeker integration tests.
 *
 * These run against a local validator with the real Metaplex Core program
 * loaded from `tests/fixtures/mpl_core.so`, not a mock. The soulbound guarantee
 * is enforced by Core rather than by our own code, so testing it against a stub
 * would prove nothing.
 */
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { assert, expect } from "chai";

import { BarioSeekerProgram } from "../target/types/bario_seeker_program";

import {
  GradeArg,
  Kind,
  MPL_CORE_PROGRAM_ID,
  PLACES,
  Role,
  SCAN_SPOTS,
  bn,
  coarsen,
  daysAgo,
  deg,
  pdas,
  rm,
  variant,
  withComputeBudget,
} from "../scripts/lib/bario";

const URI = "https://arweave.net/bario-seeker-demo-metadata.json";

describe("bario-seeker", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.barioSeekerProgram as Program<BarioSeekerProgram>;
  const pda = pdas(program.programId);
  const admin = (provider.wallet as anchor.Wallet).payer;

  // Actors
  const farmer = Keypair.generate();
  const otherFarmer = Keypair.generate();
  const lowlandFarmer = Keypair.generate();
  const auditor = Keypair.generate();
  const distributor = Keypair.generate();
  const retailer = Keypair.generate();
  const relayer = Keypair.generate();
  const consumer = Keypair.generate();

  const BATCH_CODE = "2026-11-001";

  let configPda: PublicKey;
  let producerCollection: PublicKey;
  let producerPda: PublicKey;
  let producerAsset: PublicKey;
  let batchCollection: PublicKey;
  let batchPda: PublicKey;
  let batchAsset: PublicKey;

  const fund = async (kp: Keypair, sol = 5) => {
    const sig = await provider.connection.requestAirdrop(
      kp.publicKey,
      sol * LAMPORTS_PER_SOL
    );
    const bh = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({ signature: sig, ...bh }, "confirmed");
  };

  /** Assert a transaction failed with a specific Anchor error code. */
  const expectAnchorError = async (p: Promise<unknown>, code: string) => {
    try {
      await p;
      assert.fail(`expected the transaction to fail with ${code}, but it succeeded`);
    } catch (e: any) {
      const text = `${e?.error?.errorCode?.code ?? ""} ${e?.message ?? ""} ${JSON.stringify(
        e?.logs ?? []
      )}`;
      expect(text, `expected ${code}, got: ${text.slice(0, 400)}`).to.include(code);
    }
  };

  before(async () => {
    configPda = pda.config();
    producerCollection = pda.producerCollection();
    producerPda = pda.producer(farmer.publicKey);
    producerAsset = pda.producerAsset(farmer.publicKey);
    batchCollection = pda.batchCollection(producerPda);
    batchPda = pda.batch(producerPda, BATCH_CODE);
    batchAsset = pda.batchAsset(producerPda, BATCH_CODE);

    await Promise.all(
      [farmer, otherFarmer, lowlandFarmer, auditor, distributor, retailer, relayer, consumer].map(
        (kp) => fund(kp)
      )
    );
  });

  // -------------------------------------------------------------------------
  it("initialises the platform and the producer collection", async () => {
    await program.methods
      .initialize(URI)
      .accountsPartial({
        admin: admin.publicKey,
        config: configPda,
        producerCollection,
        mplCoreProgram: MPL_CORE_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const config = await program.account.config.fetch(configPda);
    expect(config.admin.toBase58()).to.equal(admin.publicKey.toBase58());
    expect(config.producerCollection.toBase58()).to.equal(producerCollection.toBase58());
    expect(config.producerCount).to.equal(0);

    const collection = await provider.connection.getAccountInfo(producerCollection);
    expect(collection?.owner.toBase58()).to.equal(MPL_CORE_PROGRAM_ID.toBase58());
  });

  // -------------------------------------------------------------------------
  describe("roles", () => {
    it("lets the admin register an auditor, a distributor and a retailer", async () => {
      const rows: [Keypair, any, string][] = [
        [auditor, Role.auditor, "Sarawak Rice Laboratory"],
        [distributor, Role.distributor, "Kuching Highland Trading"],
        [retailer, Role.retailer, "Pavilion Grocer KL"],
      ];

      for (const [kp, role, name] of rows) {
        await program.methods
          .registerActor(kp.publicKey, role, name)
          .accountsPartial({
            admin: admin.publicKey,
            config: configPda,
            actor: pda.actor(kp.publicKey),
            systemProgram: SystemProgram.programId,
          })
          .rpc();
      }

      const a = await program.account.actor.fetch(pda.actor(auditor.publicKey));
      expect(variant(a.role)).to.equal("auditor");
      expect(a.active).to.equal(true);
      expect(a.name).to.equal("Sarawak Rice Laboratory");
    });

    it("refuses to let a non-admin register an actor", async () => {
      const impostor = Keypair.generate();
      await fund(impostor);
      const victim = Keypair.generate();

      await expectAnchorError(
        program.methods
          .registerActor(victim.publicKey, Role.auditor, "Totally Legitimate Lab")
          .accountsPartial({
            admin: impostor.publicKey,
            config: configPda,
            actor: pda.actor(victim.publicKey),
            systemProgram: SystemProgram.programId,
          })
          .signers([impostor])
          .rpc(),
        "NotAdmin"
      );
    });
  });

  // -------------------------------------------------------------------------
  describe("producer registration", () => {
    const producerArgs = (name: string, place = PLACES.barioAsal, elevation = 1130) => ({
      name,
      farmLat: place.lat,
      farmLon: place.lon,
      farmElevationM: elevation,
      identityHash: Array.from(Buffer.alloc(32, 7)),
      assetUri: URI,
      collectionUri: URI,
    });

    it("mints a soulbound producer SBT and the producer's own harvest collection", async () => {
      await program.methods
        .registerProducer(producerArgs("Ruben Kalang"))
        .accountsPartial({
          authority: farmer.publicKey,
          config: configPda,
          producer: producerPda,
          producerAsset,
          batchCollection,
          producerCollection,
          mplCoreProgram: MPL_CORE_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .preInstructions(withComputeBudget())
        .signers([farmer])
        .rpc();

      const producer = await program.account.producer.fetch(producerPda);
      expect(producer.name).to.equal("Ruben Kalang");
      expect(producer.authority.toBase58()).to.equal(farmer.publicKey.toBase58());
      expect(producer.asset.toBase58()).to.equal(producerAsset.toBase58());
      expect(producer.batchCollection.toBase58()).to.equal(batchCollection.toBase58());
      expect(producer.farmElevationM).to.equal(1130);
      expect(producer.batchCount).to.equal(0);

      // Both the SBT and the producer's collection are real Core accounts.
      for (const key of [producerAsset, batchCollection]) {
        const info = await provider.connection.getAccountInfo(key);
        expect(info?.owner.toBase58()).to.equal(MPL_CORE_PROGRAM_ID.toBase58());
      }

      const config = await program.account.config.fetch(configPda);
      expect(config.producerCount).to.equal(1);
    });

    it("rejects a farm outside the Bario highlands", async () => {
      // Kuching is in Sarawak but nowhere near the Kelabit Highlands.
      await expectAnchorError(
        program.methods
          .registerProducer(producerArgs("Lowland Larry", PLACES.kuchingHub, 1200))
          .accountsPartial({
            authority: lowlandFarmer.publicKey,
            config: configPda,
            producer: pda.producer(lowlandFarmer.publicKey),
            producerAsset: pda.producerAsset(lowlandFarmer.publicKey),
            batchCollection: pda.batchCollection(pda.producer(lowlandFarmer.publicKey)),
            producerCollection,
            mplCoreProgram: MPL_CORE_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .preInstructions(withComputeBudget())
          .signers([lowlandFarmer])
          .rpc(),
        "OutsideBarioBounds"
      );
    });

    it("rejects a farm inside the box but below the 1,100 m highland threshold", async () => {
      await expectAnchorError(
        program.methods
          .registerProducer(producerArgs("Valley Vince", PLACES.barioTown, 800))
          .accountsPartial({
            authority: otherFarmer.publicKey,
            config: configPda,
            producer: pda.producer(otherFarmer.publicKey),
            producerAsset: pda.producerAsset(otherFarmer.publicKey),
            batchCollection: pda.batchCollection(pda.producer(otherFarmer.publicKey)),
            producerCollection,
            mplCoreProgram: MPL_CORE_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .preInstructions(withComputeBudget())
          .signers([otherFarmer])
          .rpc(),
        "ElevationTooLow"
      );
    });
  });

  // -------------------------------------------------------------------------
  describe("batch registration", () => {
    it("mints a batch SBT into the producer's collection and opens the journey at the farm", async () => {
      await program.methods
        .registerBatch({
          batchCode: BATCH_CODE,
          variety: "Adan Halus",
          harvestDate: bn(daysAgo(20)),
          quantityKg: 500,
          bagCount: 200,
          farmgatePriceSen: rm(15.5),
          assetUri: URI,
          noteCid: "bafyharvestphotos001",
        })
        .accountsPartial({
          authority: farmer.publicKey,
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
        .signers([farmer])
        .rpc();

      const batch = await program.account.batch.fetch(batchPda);
      expect(batch.batchCode).to.equal(BATCH_CODE);
      expect(variant(batch.grade)).to.equal("pending");
      expect(batch.quantityKg).to.equal(500);
      expect(batch.checkpointCount).to.equal(1);
      expect(batch.producer.toBase58()).to.equal(producerPda.toBase58());

      // Checkpoint #0 exists and sits at the farm, with the farmgate price.
      const cp0 = await program.account.checkpoint.fetch(pda.checkpoint(batchPda, 0));
      expect(variant(cp0.kind)).to.equal("farm");
      expect(cp0.lat).to.equal(PLACES.barioAsal.lat);
      expect(cp0.lon).to.equal(PLACES.barioAsal.lon);
      expect(cp0.priceSen).to.equal(rm(15.5));

      const producer = await program.account.producer.fetch(producerPda);
      expect(producer.batchCount).to.equal(1);
    });

    it("rejects a harvest date in the future", async () => {
      await expectAnchorError(
        program.methods
          .registerBatch({
            batchCode: "2099-01-001",
            variety: "Adan Halus",
            harvestDate: bn(Math.floor(Date.now() / 1000) + 86_400 * 30),
            quantityKg: 10,
            bagCount: 5,
            farmgatePriceSen: rm(15),
            assetUri: URI,
            noteCid: "",
          })
          .accountsPartial({
            authority: farmer.publicKey,
            config: configPda,
            producer: producerPda,
            batch: pda.batch(producerPda, "2099-01-001"),
            batchAsset: pda.batchAsset(producerPda, "2099-01-001"),
            batchCollection,
            farmCheckpoint: pda.checkpoint(pda.batch(producerPda, "2099-01-001"), 0),
            mplCoreProgram: MPL_CORE_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .preInstructions(withComputeBudget())
          .signers([farmer])
          .rpc(),
        "InvalidHarvestDate"
      );
    });
  });

  // -------------------------------------------------------------------------
  describe("soulbinding", () => {
    /**
     * Metaplex Core's own instruction builders, sent through the Anchor
     * provider. Using the real builders means we are testing what a wallet or
     * a marketplace would actually submit, not a hand-rolled approximation.
     */
    const coreIx = async (
      build: (umi: any, helpers: any) => any
    ): Promise<TransactionInstruction> => {
      const core = await import("@metaplex-foundation/mpl-core");
      const { createUmi } = await import("@metaplex-foundation/umi-bundle-defaults");
      const { createNoopSigner, signerIdentity, publicKey } = await import(
        "@metaplex-foundation/umi"
      );
      const { toWeb3JsInstruction } = await import(
        "@metaplex-foundation/umi-web3js-adapters"
      );

      const umi = createUmi(provider.connection.rpcEndpoint).use(core.mplCore());
      umi.use(signerIdentity(createNoopSigner(publicKey(farmer.publicKey.toBase58()))));

      const builder = build(umi, { core, publicKey });
      return toWeb3JsInstruction(builder.getInstructions()[0]);
    };

    /** Send an instruction the farmer signs, and return the failure text. */
    const expectRejected = async (ix: TransactionInstruction): Promise<string> => {
      const tx = new Transaction().add(ix);
      try {
        await provider.sendAndConfirm(tx, [farmer]);
        return "";
      } catch (e: any) {
        const logs = e?.logs ?? e?.cause?.logs ?? [];
        return `${e?.message ?? ""} ${JSON.stringify(logs)}`;
      }
    };

    it("refuses to transfer the producer SBT", async () => {
      const ix = await coreIx((umi, { core, publicKey }) =>
        core.transferV1(umi, {
          asset: publicKey(producerAsset.toBase58()),
          collection: publicKey(producerCollection.toBase58()),
          newOwner: publicKey(Keypair.generate().publicKey.toBase58()),
        })
      );

      const failure = await expectRejected(ix);
      assert.notEqual(failure, "", "the producer SBT was transferred — it is not soulbound");
      // Metaplex Core names the plugin that refused, so we can prove the
      // rejection came from the freeze and not from a malformed instruction.
      expect(failure).to.include("permanent_freeze_delegate");
      expect(failure).to.include("Reject");

      // The certificate is still owned by the farmer, untouched.
      const info = await provider.connection.getAccountInfo(producerAsset);
      expect(info).to.not.equal(null);
    });

    it("refuses to burn the batch SBT, so burn-and-remint is blocked", async () => {
      const ix = await coreIx((umi, { core, publicKey }) =>
        core.burnV1(umi, {
          asset: publicKey(batchAsset.toBase58()),
          collection: publicKey(batchCollection.toBase58()),
        })
      );

      const failure = await expectRejected(ix);
      assert.notEqual(failure, "", "the batch SBT was burned — burn-and-remint is not blocked");
      expect(failure).to.include("permanent_freeze_delegate");
      expect(failure).to.include("Reject");

      const info = await provider.connection.getAccountInfo(batchAsset);
      expect(info).to.not.equal(null);
    });
  });

  // -------------------------------------------------------------------------
  describe("audit", () => {
    const auditAccounts = (signer: PublicKey, index: number) => ({
      auditor: signer,
      config: configPda,
      actor: pda.actor(signer),
      producer: producerPda,
      batch: batchPda,
      batchAsset,
      batchCollection,
      checkpoint: pda.checkpoint(batchPda, index),
      mplCoreProgram: MPL_CORE_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    });

    it("refuses a grade from a wallet that is not a registered auditor", async () => {
      // The retailer is a real, active actor — just the wrong kind of one.
      await expectAnchorError(
        program.methods
          .recordAudit({
            index: 1,
            grade: GradeArg.a1,
            lat: PLACES.miriLab.lat,
            lon: PLACES.miriLab.lon,
            label: "Definitely A Real Lab",
            reportCid: "bafyfakereport",
          })
          .accountsPartial(auditAccounts(retailer.publicKey, 1))
          .preInstructions(withComputeBudget())
          .signers([retailer])
          .rpc(),
        "NotAuditor"
      );
    });

    it("refuses a grade from a wallet with no actor record at all", async () => {
      await expectAnchorError(
        program.methods
          .recordAudit({
            index: 1,
            grade: GradeArg.a1,
            lat: PLACES.miriLab.lat,
            lon: PLACES.miriLab.lon,
            label: "Nobody's Lab",
            reportCid: "bafyfakereport",
          })
          .accountsPartial(auditAccounts(consumer.publicKey, 1))
          .preInstructions(withComputeBudget())
          .signers([consumer])
          .rpc(),
        "AccountNotInitialized"
      );
    });

    it("lets a registered auditor grade the batch and writes it onto the certificate", async () => {
      await program.methods
        .recordAudit({
          index: 1,
          grade: GradeArg.a1,
          lat: PLACES.miriLab.lat,
          lon: PLACES.miriLab.lon,
          label: PLACES.miriLab.label,
          reportCid: "bafyauditreport001",
        })
        .accountsPartial(auditAccounts(auditor.publicKey, 1))
        .preInstructions(withComputeBudget())
        .signers([auditor])
        .rpc();

      const batch = await program.account.batch.fetch(batchPda);
      expect(variant(batch.grade)).to.equal("a1");
      expect(batch.auditCount).to.equal(1);
      expect(batch.checkpointCount).to.equal(2);

      const cp = await program.account.checkpoint.fetch(pda.checkpoint(batchPda, 1));
      expect(variant(cp.kind)).to.equal("audit");
      expect(variant(cp.grade!)).to.equal("a1");
      expect(cp.actor.toBase58()).to.equal(auditor.publicKey.toBase58());
    });

    it("cannot overwrite an existing checkpoint, so grade history survives", async () => {
      // Re-submitting index 1 must fail: checkpoints are append-only. Whether
      // it trips our index constraint or the runtime's "account already exists"
      // is an implementation detail — what matters is that the first audit
      // stands.
      let failed = false;
      try {
        await program.methods
          .recordAudit({
            index: 1,
            grade: GradeArg.b,
            lat: PLACES.miriLab.lat,
            lon: PLACES.miriLab.lon,
            label: "Downgrade Attempt",
            reportCid: "bafyauditreport002",
          })
          .accountsPartial(auditAccounts(auditor.publicKey, 1))
          .preInstructions(withComputeBudget())
          .signers([auditor])
          .rpc();
      } catch {
        failed = true;
      }
      expect(failed, "a checkpoint index was overwritten").to.equal(true);

      // The original A1 audit is intact.
      const cp = await program.account.checkpoint.fetch(pda.checkpoint(batchPda, 1));
      expect(variant(cp.grade!)).to.equal("a1");
      expect(cp.label).to.equal(PLACES.miriLab.label);
      const batch = await program.account.batch.fetch(batchPda);
      expect(variant(batch.grade)).to.equal("a1");
      expect(batch.auditCount).to.equal(1);
    });

    it("rejects a checkpoint index that would leave a gap in the journey", async () => {
      await expectAnchorError(
        program.methods
          .recordAudit({
            index: 9, // journey is only 2 long
            grade: GradeArg.a2,
            lat: PLACES.miriLab.lat,
            lon: PLACES.miriLab.lon,
            label: PLACES.miriLab.label,
            reportCid: "bafyauditreport004",
          })
          .accountsPartial(auditAccounts(auditor.publicKey, 9))
          .preInstructions(withComputeBudget())
          .signers([auditor])
          .rpc(),
        "CheckpointBatchMismatch"
      );
    });

    it("rejects Pending as an audit outcome", async () => {
      await expectAnchorError(
        program.methods
          .recordAudit({
            index: 2,
            grade: GradeArg.pending,
            lat: PLACES.miriLab.lat,
            lon: PLACES.miriLab.lon,
            label: PLACES.miriLab.label,
            reportCid: "bafyauditreport003",
          })
          .accountsPartial(auditAccounts(auditor.publicKey, 2))
          .preInstructions(withComputeBudget())
          .signers([auditor])
          .rpc(),
        "InvalidGrade"
      );
    });
  });

  // -------------------------------------------------------------------------
  describe("journey checkpoints", () => {
    const addCheckpoint = (signer: Keypair, args: any) =>
      program.methods
        .addCheckpoint(args)
        .accountsPartial({
          actorAuthority: signer.publicKey,
          actor: pda.actor(signer.publicKey),
          producer: producerPda,
          batch: batchPda,
          checkpoint: pda.checkpoint(batchPda, args.index),
          systemProgram: SystemProgram.programId,
        })
        .signers([signer])
        .rpc();

    it("lets a distributor log a distribution stop", async () => {
      await addCheckpoint(distributor, {
        index: 2,
        kind: Kind.distribution,
        lat: PLACES.kuchingHub.lat,
        lon: PLACES.kuchingHub.lon,
        label: PLACES.kuchingHub.label,
        priceSen: rm(17.5),
        noteCid: "bafydeliveryorder001",
      });

      const cp = await program.account.checkpoint.fetch(pda.checkpoint(batchPda, 2));
      expect(variant(cp.kind)).to.equal("distribution");
      expect(cp.priceSen).to.equal(rm(17.5));
      expect(cp.label).to.equal(PLACES.kuchingHub.label);
    });

    it("lets a retailer log a retail stop", async () => {
      await addCheckpoint(retailer, {
        index: 3,
        kind: Kind.retail,
        lat: PLACES.pavilionKl.lat,
        lon: PLACES.pavilionKl.lon,
        label: PLACES.pavilionKl.label,
        priceSen: rm(21.5),
        noteCid: "",
      });

      const batch = await program.account.batch.fetch(batchPda);
      expect(batch.checkpointCount).to.equal(4);
    });

    it("refuses to let a retailer log a distribution stop", async () => {
      await expectAnchorError(
        addCheckpoint(retailer, {
          index: 4,
          kind: Kind.distribution,
          lat: PLACES.portKlang.lat,
          lon: PLACES.portKlang.lon,
          label: "Not My Lane",
          priceSen: rm(18),
          noteCid: "",
        }),
        "WrongRole"
      );
    });

    it("refuses to let a distributor forge a farm checkpoint", async () => {
      await expectAnchorError(
        addCheckpoint(distributor, {
          index: 4,
          kind: Kind.farm,
          lat: PLACES.barioTown.lat,
          lon: PLACES.barioTown.lon,
          label: "Definitely The Farm",
          priceSen: rm(12),
          noteCid: "",
        }),
        "InvalidCheckpointKind"
      );
    });

    it("refuses a checkpoint from a deactivated actor", async () => {
      await program.methods
        .setActorActive(false)
        .accountsPartial({
          admin: admin.publicKey,
          config: configPda,
          actor: pda.actor(distributor.publicKey),
        })
        .rpc();

      await expectAnchorError(
        addCheckpoint(distributor, {
          index: 4,
          kind: Kind.distribution,
          lat: PLACES.portKlang.lat,
          lon: PLACES.portKlang.lon,
          label: PLACES.portKlang.label,
          priceSen: rm(18),
          noteCid: "",
        }),
        "ActorInactive"
      );

      // Restore, and confirm the earlier checkpoints survived deactivation.
      await program.methods
        .setActorActive(true)
        .accountsPartial({
          admin: admin.publicKey,
          config: configPda,
          actor: pda.actor(distributor.publicKey),
        })
        .rpc();

      const cp = await program.account.checkpoint.fetch(pda.checkpoint(batchPda, 2));
      expect(cp.actor.toBase58()).to.equal(distributor.publicKey.toBase58());
    });

    it("builds a journey whose prices only move forward", async () => {
      const batch = await program.account.batch.fetch(batchPda);
      const stops = await Promise.all(
        Array.from({ length: batch.checkpointCount }, (_, i) =>
          program.account.checkpoint.fetch(pda.checkpoint(batchPda, i))
        )
      );

      const priced = stops.filter((s) => s.priceSen > 0);
      expect(priced.length).to.be.greaterThanOrEqual(3);
      for (let i = 1; i < priced.length; i++) {
        expect(priced[i].priceSen).to.be.greaterThan(priced[i - 1].priceSen);
      }
      // Farm -> Miri -> Kuching -> KL: every stop is somewhere real.
      for (const s of stops) {
        expect(Math.abs(s.lat)).to.be.lessThanOrEqual(90_000_000);
        expect(Math.abs(s.lon)).to.be.lessThanOrEqual(180_000_000);
      }
    });
  });

  // -------------------------------------------------------------------------
  describe("consumer scans", () => {
    it("records a scan and coarsens the location to the ~1 km grid", async () => {
      const spot = SCAN_SPOTS[0];
      // A precise location, as a careless client might send.
      const preciseLat = spot.lat + 4_321;
      const preciseLon = spot.lon + 8_765;

      await program.methods
        .recordScan({ index: 0, lat: preciseLat, lon: preciseLon, label: spot.label })
        .accountsPartial({
          payer: relayer.publicKey,
          producer: producerPda,
          batch: batchPda,
          scan: pda.scan(batchPda, 0),
          systemProgram: SystemProgram.programId,
        })
        .signers([relayer])
        .rpc();

      const scan = await program.account.checkpoint.fetch(pda.scan(batchPda, 0));
      expect(variant(scan.kind)).to.equal("consumerScan");
      expect(scan.lat).to.equal(coarsen(preciseLat));
      expect(scan.lon).to.equal(coarsen(preciseLon));
      expect(scan.lat).to.not.equal(preciseLat);

      const batch = await program.account.batch.fetch(batchPda);
      expect(batch.scanCount).to.equal(1);
      // Scans live in their own namespace and never disturb the journey.
      expect(batch.checkpointCount).to.equal(4);
    });

    it("accumulates scans without a consumer wallet", async () => {
      for (let i = 1; i < 4; i++) {
        const spot = SCAN_SPOTS[i];
        await program.methods
          .recordScan({ index: i, lat: spot.lat, lon: spot.lon, label: spot.label })
          .accountsPartial({
            payer: relayer.publicKey,
            producer: producerPda,
            batch: batchPda,
            scan: pda.scan(batchPda, i),
            systemProgram: SystemProgram.programId,
          })
          .signers([relayer])
          .rpc();
      }

      const batch = await program.account.batch.fetch(batchPda);
      expect(batch.scanCount).to.equal(4);
    });
  });

  // -------------------------------------------------------------------------
  describe("ratings and reports", () => {
    it("records a rating and updates both batch and producer aggregates", async () => {
      await program.methods
        .rateBatch(5, "bafyreview001")
        .accountsPartial({
          reviewer: consumer.publicKey,
          producer: producerPda,
          batch: batchPda,
          review: pda.review(batchPda, consumer.publicKey),
          systemProgram: SystemProgram.programId,
        })
        .signers([consumer])
        .rpc();

      const batch = await program.account.batch.fetch(batchPda);
      expect(batch.ratingCount).to.equal(1);
      expect(batch.ratingSum).to.equal(5);

      const producer = await program.account.producer.fetch(producerPda);
      // Quantity-weighted: 5 stars on a 500 kg batch.
      expect(producer.ratingSum.toNumber()).to.equal(5 * 500);
      expect(producer.ratingWeight.toNumber()).to.equal(500);
    });

    it("refuses a second rating from the same wallet", async () => {
      await expectAnchorError(
        program.methods
          .rateBatch(1, "bafyreview002")
          .accountsPartial({
            reviewer: consumer.publicKey,
            producer: producerPda,
            batch: batchPda,
            review: pda.review(batchPda, consumer.publicKey),
            systemProgram: SystemProgram.programId,
          })
          .signers([consumer])
          .rpc(),
        "already in use"
      );
    });

    it("rejects a rating outside 1-5", async () => {
      const other = Keypair.generate();
      await fund(other);
      await expectAnchorError(
        program.methods
          .rateBatch(9, "")
          .accountsPartial({
            reviewer: other.publicKey,
            producer: producerPda,
            batch: batchPda,
            review: pda.review(batchPda, other.publicKey),
            systemProgram: SystemProgram.programId,
          })
          .signers([other])
          .rpc(),
        "InvalidRating"
      );
    });

    it("records a counterfeit report with a coarsened location", async () => {
      const lat = deg(3.1417);
      const lon = deg(101.6869);

      await program.methods
        .reportCounterfeit(lat, lon, "bafyevidence001")
        .accountsPartial({
          reporter: relayer.publicKey,
          producer: producerPda,
          batch: batchPda,
          report: pda.report(batchPda, relayer.publicKey),
          systemProgram: SystemProgram.programId,
        })
        .signers([relayer])
        .rpc();

      const report = await program.account.report.fetch(pda.report(batchPda, relayer.publicKey));
      expect(report.lat).to.equal(coarsen(lat));
      expect(report.evidenceCid).to.equal("bafyevidence001");

      const batch = await program.account.batch.fetch(batchPda);
      expect(batch.reportCount).to.equal(1);
    });
  });

  // -------------------------------------------------------------------------
  // Declared as a suite rather than a bare `it`, because Mocha runs a suite's
  // own tests before any of its nested suites — a bare test here would run
  // second, before a producer existed.
  describe("verification page", () => {
    it("resolves the whole journey from the chain alone, with no backend", async () => {
      // What the verification page does: derive from a batch code, read, render.
      const producer = await program.account.producer.fetch(pda.producer(farmer.publicKey));
      const batch = await program.account.batch.fetch(
        pda.batch(pda.producer(farmer.publicKey), BATCH_CODE)
      );

      expect(producer.name).to.equal("Ruben Kalang");
      expect(variant(batch.grade)).to.equal("a1");
      expect(batch.checkpointCount).to.be.greaterThanOrEqual(4);

      const journey = await Promise.all(
        Array.from({ length: batch.checkpointCount }, (_, i) =>
          program.account.checkpoint.fetch(pda.checkpoint(batchPda, i))
        )
      );
      const kinds = journey.map((c) => variant(c.kind));
      expect(kinds).to.deep.equal(["farm", "audit", "distribution", "retail"]);

      // Every stop has coordinates, which is what the map needs.
      for (const stop of journey) {
        expect(stop.lat).to.not.equal(0);
        expect(stop.lon).to.not.equal(0);
      }

      const scans = await Promise.all(
        Array.from({ length: batch.scanCount }, (_, i) =>
          program.account.checkpoint.fetch(pda.scan(batchPda, i))
        )
      );
      expect(scans.length).to.be.greaterThan(0);
      expect(scans.every((s) => variant(s.kind) === "consumerScan")).to.equal(true);
    });
  });
});
