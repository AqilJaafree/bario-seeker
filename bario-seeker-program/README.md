# Bario Seeker — Solana program

Soulbound provenance, grading and geotagged journey checkpoints for Bario rice.
Implements Sections 6 and 8 of [`../bario_seeker_prd.md`](../bario_seeker_prd.md) (v3.0).

**Building the frontend?** Start with
[`../frontend_integration.md`](../frontend_integration.md) — PDA derivation, the
three surfaces, the relayer, error mapping, and the traps.

Devnet demo scope. No KYC, no custodial wallets, no payouts — every transaction
is signed by an ordinary devnet wallet.

## What is on-chain

| | Metaplex Core object | Soulbound how |
|---|---|---|
| **Producer SBT** | Asset in the global `Bario Seeker Producers` Collection, owned by the farmer | `PermanentFreezeDelegate { frozen: true }` |
| **Batch SBT** | Asset in that producer's **own** Collection, created at registration | same |

The per-producer Collection makes "a batch certificate is a child of the
producer certificate" structural rather than a claim: any wallet or explorer
groups a farmer's harvests under their own name with no help from a backend.

**Soulbinding** is enforced by the Metaplex Core program, not by our code. A
frozen Core asset can be neither transferred nor burned, and the freeze plugin's
authority is `PluginAuthority::None`, so the freeze can never be lifted — not by
the holder, not by the platform admin, and not by a future upgrade of this
program. The tests prove it by submitting real `transferV1` and `burnV1`
instructions and asserting that Core rejects them from
`permanent_freeze_delegate.rs`.

That irreversibility is a deliberate trade. See **OQ-3** in the PRD: producer
succession has to be handled by issuing a new certificate and retiring the old
one, because this one will never move.

### Checkpoints

Every event in a batch's life is one append-only, geotagged record:

```
Checkpoint  seeds ["checkpoint", batch, index]   (journey)
            seeds ["scan",       batch, index]   (consumer scans)

  kind       Farm | Collection | Audit | Distribution | Retail | ConsumerScan
  lat, lon   micro-degrees (i32, ~11 cm)
  label      "Tesco Pavilion, Kuala Lumpur"
  price_sen  integer sen — RM15.50 is 1550. No floating point anywhere.
  grade      Audit checkpoints only
  actor, timestamp, note_cid
```

One primitive serves four features: the consumer journey map, the price journey,
the grading history, and the scan-anomaly signal. Nothing in this program
mutates or closes a checkpoint once written.

## Accounts

| Account | Seeds |
|---|---|
| `Config` | `["config"]` |
| `Actor` | `["actor", wallet]` |
| `Producer` | `["producer", wallet]` |
| `Batch` | `["batch", producer, batch_code]` |
| `Checkpoint` | `["checkpoint", batch, index]` / `["scan", batch, index]` |
| `Review` | `["review", batch, reviewer]` |
| `Report` | `["report", batch, reporter]` |

Every address is derivable from the program ID plus public data. The consumer
verification page resolves a QR code to a full journey using only an RPC
endpoint — there is no account whose address only our backend knows.

## Instructions

| Instruction | Signer | Effect |
|---|---|---|
| `initialize` | admin | Config + the global producer Collection |
| `register_actor` | admin | Grants Auditor / Distributor / Retailer |
| `set_actor_active` | admin | Withdraws or restores accreditation, leaving history intact |
| `register_producer` | producer | Validates Bario coordinates on-chain, mints the frozen SBT, creates the producer's Collection |
| `register_batch` | producer | Mints the frozen batch SBT, writes checkpoint #0 at the farm |
| `record_audit` | **auditor only** | Sets grade, appends an Audit checkpoint, writes the grade onto the certificate |
| `add_checkpoint` | **distributor / retailer** | Appends a geotagged, priced stop |
| `record_scan` | anyone (relayer) | Coarse `ConsumerScan` checkpoint |
| `rate_batch` | anyone | 1–5 stars, one per wallet per batch |
| `report_counterfeit` | anyone | One report per wallet per batch |

### What the program enforces

- A farm must sit inside the Bario highlands bounding box **and** at ≥1,100 m
- Only a registered, active Auditor can set a grade
- A Retailer cannot log a Distribution stop, and neither can forge a `Farm` or
  `Audit` checkpoint
- Checkpoints are append-only; a re-audit adds a record and never overwrites one
- Consumer scan and report coordinates are snapped to a ~1 km grid **inside the
  program**, so a careless or hostile client cannot write a precise consumer
  location to a ledger that can never forget it

### What it does not prove

Coordinates are self-reported. A checkpoint proves that a registered actor
asserted a place and a price at a time, and that the assertion has not been
altered since. It does not prove the actor, or the rice, was there. The defence
is consistency across independent actors and thousands of consumer scans, not
the honesty of any single write. See PRD §3.3.

## Live on devnet

Deployed and seeded. The addresses the frontend needs:

| | Address |
|---|---|
| Program | `7aTL3mhtrRg57Jr3dBmTgHYHufmsepzhPqbYMhioV5Yc` |
| Config PDA | `3JFmTjaU6oTgjzftWdHHe2xpVgsMyXFLVSdTemnYiU36` |
| Producer Collection | `FvMa84QKhxrPL4ZAb5hfDsyKe7WhSAcXCRLPvopTfyJa` |
| IDL account | `TMxctA5BrtanbmixHt3AyCyo4mEtEnXwJAwDoGpC2b8` |

Three producers, six batches, twenty-four consumer scans:

| Batch | Producer | Grade | Farmgate → shelf | Stops |
|---|---|---|---|---|
| `2026-11-001` | Ruben Kalang | A1 | RM15.50 → RM21.50 | 5 |
| `2026-10-014` | Ruben Kalang | A1 | RM16.20 → RM22.90 | 5 |
| `2026-11-002` | Sina Rian | A2 | RM15.00 → RM19.80 | 5 |
| `2026-11-007` | Sina Rian | B | RM14.80 → RM18.50 | 5 |
| `2026-10-031` | Balang Radu | A1 | RM16.00 → RM22.40 | 5 |
| `2026-12-002` | Balang Radu | *pending* | RM15.90 → — | 2 |

Check it yourself — this reads devnet with nothing but an RPC endpoint:

```bash
pnpm run verify:devnet          # defaults to 2026-11-001
pnpm run verify:devnet 2026-10-031
```

It prints the journey the consumer page will render and asserts every demo
criterion in PRD 9.1, including submitting a real transfer of a Producer SBT and
confirming Metaplex Core rejects it.

```
  JOURNEY
   0. farm          Ruben Kalang, Bario            RM15.50          3.7460, 115.4530     0 km
   1. collection    Bario Asal Collection Point    RM15.90  +2.6%   3.7471, 115.4562     0 km
   2. audit         Sarawak Rice Laboratory, Miri        —          4.3995, 113.9914   178 km
   3. distribution  Kuching Distribution Hub       RM17.50 +10.1%   1.5535, 110.3593   616 km
   4. retail        Pavilion Kuala Lumpur          RM21.50 +22.9%   3.1490, 101.7130  1526 km
```

**Known cosmetic wrinkle:** batch codes read `2026-11-xxx` (carried over from the
PRD's example lot code) while harvest dates are seeded relative to today, so they
land in August/September. Codes are human labels and are part of the PDA seeds,
so correcting them means seeding a fresh set of batches.

## Build

```bash
pnpm install
anchor build
```

`programs/bario-seeker-program/Cargo.toml` pins `tools-version = "v1.54"` under
`[package.metadata.solana]`. The SBF toolchain bundled with `solana-cli 2.3.13`
is rustc 1.84, which predates `edition2024` and cannot build some transitive
dependencies; v1.54 is rustc 1.89 and builds cleanly. Remove the pin once the
installed Solana CLI ships a newer default.

`mpl-core` needs `default-features = false` — its default `borsh-v1` feature is
mutually exclusive with the `anchor` feature it also needs.

During the build, Metaplex Core logs three stack-frame-size errors from its
`hooked` module (`registry_records_to_plugin_list`, `Asset::deserialize`,
`Collection::deserialize`). Those functions are not on any path this program
calls, the build completes, and the tests pass against the real Core program.

## Test

```bash
anchor test
```

29 tests against a local validator running the **real** Metaplex Core program
(`tests/fixtures/mpl_core.so`), not a mock — soulbinding is enforced by Core, so
testing it against a stub would prove nothing.

If the fixture is missing:

```bash
solana program dump -u d CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d \
  tests/fixtures/mpl_core.so
```

Coverage includes every instruction and every authorisation failure: non-admin
actor registration, a retailer trying to grade, an unregistered wallet trying to
grade, a retailer logging a distribution stop, a distributor forging a farm
checkpoint, a deactivated actor, out-of-bounds and too-low farms, a future
harvest date, double rating, and both transfer and burn of a soulbound
certificate.

## Deploy to devnet

The Anchor wallet is `~/.config/solana/id.json`, which may differ from your
`solana config get` keypair. Check the one that matters:

```bash
solana-keygen pubkey ~/.config/solana/id.json
solana balance $(solana-keygen pubkey ~/.config/solana/id.json) -u devnet
```

Budget roughly **3.7 SOL to deploy** plus **0.8 SOL to seed**. A size-optimised
build cuts the deploy to about 3.2 SOL and passes the same 29 tests:

```bash
cd programs/bario-seeker-program
cargo-build-sbf --optimize-size --sbf-out-dir ../../target/deploy
cd ../..
```

Then:

```bash
anchor deploy --provider.cluster devnet
```

Devnet airdrops are rate-limited to a couple of SOL. If `solana airdrop` fails,
use https://faucet.solana.com.

## Seed the demo

```bash
pnpm run seed:devnet
```

Creates three real Kelabit Highlands producers and six harvest lots, each walked
along the actual road Bario rice travels:

```
Bario farm → village collection point → Miri lab (grade)
           → Kuching consolidator → Klang Valley shelf
```

plus consumer scans and ratings. One batch (`2026-12-002`) is deliberately left
unaudited so the verification page has to render an honest "awaiting audit"
state rather than pretending every bag is graded.

The public devnet RPC throttles hard; the script backs off and retries on 429,
and paces itself with `SEED_PACE_MS` (default 250 ms). A dedicated RPC such as
Helius makes it noticeably faster.

The script is **idempotent** — every step checks whether its account exists, so
a partial failure can be resumed by re-running. Demo keypairs persist to
`scripts/.demo-keys.json` (gitignored) so PDAs stay stable across runs, which
matters because printed QR codes resolve to addresses.

It prints the `programId`, `config` and `producerCollection` addresses the
frontend needs.

## Before mainnet

- Third-party audit of this program
- **Transfer the upgrade authority to a multisig, or revoke it.** Until that
  happens, an upgrade could add a thaw path, and the soulbinding claim in the
  PRD should not be published as unconditional
- Replace the `identity_hash` placeholder with a real Sumsub verification digest
- Legal review of permanently publishing coarse consumer scan locations to an
  immutable ledger under PDPA (PRD OQ-8)
