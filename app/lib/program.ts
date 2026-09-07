/**
 * Read-only Anchor client.
 *
 * The consumer verification page must work with no wallet, no login and no
 * backend, so this provider is deliberately unable to sign anything. Writes
 * (scans, ratings, reports) go through a server-side relayer instead — see the
 * PRD: consumers never hold a wallet.
 */
import "server-only";

import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

import idl from "./idl/bario_seeker_program.json";
import type { BarioSeekerProgram } from "./idl/bario_seeker_program";

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com";

export const CLUSTER = process.env.NEXT_PUBLIC_CLUSTER ?? "devnet";

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ??
    "7aTL3mhtrRg57Jr3dBmTgHYHufmsepzhPqbYMhioV5Yc"
);

/** An explorer link for any address, on the configured cluster. */
export const explorer = (address: string): string =>
  `https://explorer.solana.com/address/${address}` +
  (CLUSTER === "mainnet-beta" ? "" : `?cluster=${CLUSTER}`);

let cached: Program<BarioSeekerProgram> | null = null;

export function getProgram(): Program<BarioSeekerProgram> {
  if (cached) return cached;

  const connection = new Connection(RPC_URL, "confirmed");

  // Anchor requires a wallet on the provider even for reads. This one throws on
  // every signing path, which is the point: nothing reachable from the
  // verification page can sign a transaction.
  const wallet = {
    publicKey: Keypair.generate().publicKey,
    signTransaction: () => Promise.reject(new Error("read-only provider")),
    signAllTransactions: () => Promise.reject(new Error("read-only provider")),
  };

  const provider = new AnchorProvider(connection, wallet as never, {
    commitment: "confirmed",
  });

  cached = new Program<BarioSeekerProgram>(
    idl as BarioSeekerProgram,
    provider
  );
  return cached;
}

export const getConnection = (): Connection => getProgram().provider.connection;
