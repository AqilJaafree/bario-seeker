# Repo Structure

This repository holds **two separate projects** that happen to share a root:

| Path | Project | Toolchain |
|---|---|---|
| `app/`, `components/`, `lib/`, `public/` | The Next.js web app (landing page, marketplace, verification certificate) | `pnpm dev` / `pnpm build` / `pnpm lint` at the repo root |
| `bario-seeker-program/` | The Solana Anchor program (Rust + TS tests and devnet scripts) | `anchor build` / `anchor test` / `prettier`, run from inside `bario-seeker-program/` with its own `package.json` and `tsconfig.json` |

They do not import from each other. Nothing in `app/` references the Anchor
program today — the verification page's on-chain data is still mock data in
`lib/data/producers.ts`.

---

## The root build excludes `bario-seeker-program/` on purpose

Both `tsconfig.json` and `eslint.config.mjs` at the repo root explicitly
exclude `bario-seeker-program`. **Do not remove those excludes** without
reading this section.

### Why

The root `tsconfig.json` uses a broad `"include": ["**/*.ts", "**/*.tsx", ...]`
with only `node_modules` excluded. Left alone, that glob swallows the Anchor
program's TypeScript too — `bario-seeker-program/tests/*.ts` and
`scripts/*.ts`.

Those files are written for a completely different toolchain:

- They use mocha globals (`describe`, `it`) that the Next.js tsconfig has no
  `@types` entry for.
- The Anchor program's own `bario-seeker-program/tsconfig.json` declares
  exactly what they need (`"types": ["mocha", "chai", "node"]`, CommonJS
  modules, `es2020` target) — settings that would be wrong for the Next.js app.

So when both projects landed in one repo, `next build` started type-checking
Anchor test files against the frontend's config and failed with ~67 errors
(`Cannot find name 'describe'`, `Cannot find name 'it'`, implicit `any`
parameters). `pnpm lint` failed the same way with ~20 more.

Neither project was broken on its own. The failure only existed at the seam.

### What the exclude does and does not do

- **Does:** stop the Next.js build and the root ESLint run from looking at a
  directory that was never part of the Next.js app.
- **Does not:** stop the Anchor program from being type-checked. It still is,
  by its own `tsconfig.json`, through `anchor build` / `anchor test` run from
  inside `bario-seeker-program/`. The exclude changes no Rust and no Anchor
  config.

### If you are working on the Anchor program

Run its commands from inside its own directory:

```bash
cd bario-seeker-program
pnpm install     # it has its own package.json / pnpm-lock.yaml
anchor build
anchor test
pnpm lint        # prettier --check over scripts/ and tests/
```

Root-level `pnpm build` and `pnpm lint` will ignore your files entirely. That
is intended, not a misconfiguration.

---

## `.gitignore` is a recurring merge-conflict point

Both sides of the repo append to the bottom of the root `.gitignore`, so it
tends to conflict whenever the web branch and the program branch merge. It
conflicted on the `origin/main` → `landing-page` merge and will likely do so
again.

The resolution is always the same: **keep both blocks.** There is no case
where one side's ignore rules should replace the other's. Current contents of
the shared tail:

- `.agents`, `.claude` — local agent/session state (web side)
- `**/target/`, `**/.anchor/`, `**/test-ledger/`, `.demo-keys.json`,
  `**/scripts/.demo-keys.json`, `*-keypair.json`, `*.so`, `id.json` — Solana
  build output and keypairs (program side)

The keypair rules are deliberately duplicated at the root even though
`bario-seeker-program/.gitignore` already covers them. A leaked keypair cannot
be un-leaked, so the redundancy is intentional. **Never resolve a `.gitignore`
conflict by dropping the keypair lines.**

---

## Adding a third project here later

If another workspace lands in this repo, it needs the same treatment: add it to
the root `tsconfig.json` `exclude` and `eslint.config.mjs` `globalIgnores`, or
the root Next.js build will try to compile it. Consider converting the repo to
a real pnpm workspace at that point instead of keeping the exclude list
growing.
