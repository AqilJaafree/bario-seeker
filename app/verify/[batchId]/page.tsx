import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  CertificateIcon,
  CheckCircleIcon,
  HourglassMediumIcon,
  LockKeyIcon,
  MapPinIcon,
  ShieldCheckIcon,
  StarIcon,
  WarningOctagonIcon,
} from "@phosphor-icons/react/dist/ssr";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { GradeBadge } from "@/components/marketplace/grade-badge";
import { CertificateActions } from "@/components/verification/certificate-actions";
import { fmtRm, toDeg } from "@/lib/chain/bario";
import { loadBatchByAnyId } from "@/lib/chain/queries";
import type { BatchView } from "@/lib/chain/types";

/**
 * The certificate a QR code resolves to.
 *
 * A Server Component on purpose: the PRD budgets under two seconds at the 90th
 * percentile on 4G for someone standing in an aisle, and the page must render
 * its verdict before any JavaScript arrives. Everything below comes from the
 * chain via an RPC endpoint — no backend, no indexer, no cached copy of the
 * truth.
 */

const shortAddress = (a: string) => `${a.slice(0, 8)}…${a.slice(-8)}`;

const explorerUrl = (address: string, cluster: string) =>
  `https://explorer.solana.com/address/${address}` +
  (cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`);

const formatDate = (ms: number) =>
  new Date(ms).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ batchId: string }>;
}): Promise<Metadata> {
  const { batchId } = await params;
  const batch = await loadBatchByAnyId(decodeURIComponent(batchId));

  if (!batch) {
    return { title: `Batch ${batchId} not verified — Bario Seeker` };
  }
  return {
    title: `${batch.batchCode} — ${batch.producerName} — Bario Seeker`,
    description: batch.isAudited
      ? `Grade ${batch.gradeLabel} Bario rice from ${batch.producerName}, audited and traced ${batch.totalDistanceKm} km from the Kelabit Highlands.`
      : `Registered Bario rice from ${batch.producerName}, awaiting independent audit.`,
  };
}

const shell = (children: React.ReactNode) => (
  <div className="min-h-screen bg-[#F5F6F1] dark:bg-[#111813] text-[#111813] dark:text-[#F5F6F1] flex flex-col font-sans selection:bg-[#D4F63D] selection:text-black">
    <div className="w-full mx-auto space-y-8 px-4 lg:px-0 max-w-7xl flex-1 flex flex-col">
      <div className="pt-6">
        <Navbar />
      </div>
      {children}
      <Footer />
    </div>
  </div>
);

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;

  let batch: BatchView | null = null;
  let unreachable = false;
  try {
    batch = await loadBatchByAnyId(decodeURIComponent(batchId));
  } catch {
    // Losing the network is not the same as a bag being fake, and the page must
    // not accuse a genuine producer because an RPC call timed out.
    unreachable = true;
  }

  if (!batch) {
    return shell(
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-24">
        <WarningOctagonIcon className="size-10 text-rose-500" />
        <h1 className="text-xl font-heading font-bold">
          {unreachable ? "Could not check this batch" : `Not verified`}
        </h1>
        <p className="text-sm text-black/60 dark:text-white/60 max-w-md">
          {unreachable ? (
            <>
              We could not reach the network to check{" "}
              <span className="font-mono">{batchId}</span>. This does not mean
              the bag is fake — try again in a moment.
            </>
          ) : (
            <>
              No Bario Seeker certificate exists for{" "}
              <span className="font-mono">{batchId}</span>. Treat this bag as
              unverified, and report it if it is being sold as genuine Bario
              rice.
            </>
          )}
        </p>
        <Link
          href="/marketplace"
          className="text-sm font-semibold text-[#0C2317] dark:text-[#D4F63D] hover:underline"
        >
          Browse verified producers
        </Link>
      </div>
    );
  }

  const initials = batch.producerName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return shell(
    <div className="max-w-2xl mx-auto w-full space-y-8">
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
      >
        <ArrowLeftIcon className="size-4" />
        All producers
      </Link>

      {/* The verdict, above the fold. A batch can be genuine but ungraded, and
          saying so plainly is the point — an amber state is not a failure. */}
      {batch.isAudited ? (
        <section className="bg-emerald-700 text-white rounded-[28px] p-6 flex items-center gap-4 shadow-lg">
          <div className="size-14 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <ShieldCheckIcon weight="fill" className="size-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-heading font-bold tracking-tight">
                Verified Authentic
              </span>
              <CheckCircleIcon weight="fill" className="size-5" />
            </div>
            <p className="text-sm text-white/85 mt-0.5">
              Batch #{batch.batchCode} is bound to a real, audited Producer SBT.
            </p>
          </div>
        </section>
      ) : (
        <section className="bg-amber-600 text-white rounded-[28px] p-6 flex items-center gap-4 shadow-lg">
          <div className="size-14 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <HourglassMediumIcon weight="fill" className="size-8" />
          </div>
          <div>
            <span className="text-lg font-heading font-bold tracking-tight">
              Registered, awaiting audit
            </span>
            <p className="text-sm text-white/85 mt-0.5">
              A real producer certificate, but no laboratory has graded this
              batch yet. Any grade on the packaging is not independently
              verified.
            </p>
          </div>
        </section>
      )}

      {/* Producer */}
      <section className="flex items-center gap-4 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[28px] p-5">
        <div className="size-16 rounded-2xl bg-[#0C2317] text-[#D4F63D] flex items-center justify-center shrink-0 font-heading text-xl">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading font-bold text-lg truncate">
              {batch.producerName}
            </h2>
            {batch.producerRating !== null ? (
              <span className="inline-flex items-center gap-1 text-sm shrink-0">
                <StarIcon weight="fill" className="size-4 text-amber-500" />
                {batch.producerRating.toFixed(1)}
                <span className="text-black/50 dark:text-white/50">
                  ({batch.ratingCount})
                </span>
              </span>
            ) : (
              <span className="text-xs text-black/50 dark:text-white/50 shrink-0">
                No reviews yet
              </span>
            )}
          </div>
          <p className="text-sm text-black/60 dark:text-white/60 flex items-center gap-1 mt-0.5">
            <MapPinIcon className="size-3.5 shrink-0" />
            {batch.producerLocation} · {batch.farmElevationM} m
          </p>
          <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">
            Farming since {new Date(batch.producerJoinedAt).getFullYear()}
          </p>
          <a
            href={explorerUrl(batch.producerAsset, batch.cluster)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-emerald-700 dark:text-[#D4F63D] hover:underline mt-1 inline-block"
          >
            Producer SBT {shortAddress(batch.producerAsset)} · non-transferable
          </a>
        </div>
      </section>

      {/* Audit */}
      <section className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[28px] p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-black/50 dark:text-white/50">
            <CertificateIcon className="size-4" />
            Laboratory Audit
          </span>
          {batch.isAudited ? (
            <GradeBadge grade={batch.gradeLabel as "A1" | "A2" | "B"} />
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
              Ungraded
            </span>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
          <dt className="text-black/50 dark:text-white/50">Batch</dt>
          <dd className="text-right font-mono font-medium">{batch.batchCode}</dd>
          <dt className="text-black/50 dark:text-white/50">Variety</dt>
          <dd className="text-right font-medium">{batch.variety}</dd>
          <dt className="text-black/50 dark:text-white/50">Harvest</dt>
          <dd className="text-right font-medium">
            {formatDate(batch.harvestDate)}
          </dd>
          <dt className="text-black/50 dark:text-white/50">Quantity</dt>
          <dd className="text-right font-medium">
            {batch.bagCount} bags · {batch.quantityKg} kg
          </dd>
          {batch.isAudited && (
            <>
              <dt className="text-black/50 dark:text-white/50">Audited</dt>
              <dd className="text-right font-medium">
                {batch.auditDate ? formatDate(batch.auditDate) : "—"}
              </dd>
              <dt className="text-black/50 dark:text-white/50">Auditor</dt>
              <dd className="text-right font-medium truncate">
                {batch.auditorOrg ?? "—"}
              </dd>
            </>
          )}
        </dl>

        {/* Grain integrity and moisture are in the IPFS audit report, not on
            chain. Printing figures the ledger cannot vouch for would undercut
            the whole point of the certificate, so we link the report instead. */}
        <p className="text-xs text-black/50 dark:text-white/50 border-t border-black/10 dark:border-white/10 pt-3">
          {batch.isAudited ? (
            <>
              Grain integrity and moisture readings are in the full audit report
              {batch.auditReportCid && (
                <>
                  {" "}
                  (<span className="font-mono">{batch.auditReportCid}</span>)
                </>
              )}
              . The chain records the grade, the auditor and the date; it does
              not hold the raw measurements.
              {batch.auditCount > 1 && (
                <>
                  {" "}
                  This batch was re-audited {batch.auditCount} times — earlier
                  results remain on the ledger and were never overwritten.
                </>
              )}
            </>
          ) : (
            <>No laboratory result has been recorded on-chain for this batch.</>
          )}
        </p>
      </section>

      {/* Journey */}
      <section className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[28px] p-6">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-black/10 dark:border-white/10">
          <span className="text-xs font-mono uppercase tracking-wider text-black/50 dark:text-white/50">
            Farm to shelf
          </span>
          <span className="text-xs font-mono text-black/50 dark:text-white/50">
            {batch.totalDistanceKm.toLocaleString()} km travelled
          </span>
        </div>

        <ol className="mt-4 space-y-4 relative before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-0.5 before:bg-black/10 dark:before:bg-white/10">
          {batch.journey.map((stop, i) => {
            const previous = batch.journey
              .slice(0, i)
              .filter((s) => s.priceSen > 0)
              .pop();
            return (
              <li key={stop.index} className="relative flex gap-4 pl-0">
                <span className="size-3 rounded-full bg-[#0C2317] dark:bg-[#D4F63D] border-2 border-[#F5F6F1] dark:border-[#111813] mt-1.5 shrink-0 z-10" />
                <div className="flex-1 flex items-start justify-between gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{stop.kindLabel}</div>
                    <div className="text-xs text-black/55 dark:text-white/55 truncate">
                      {stop.actorName ? `${stop.actorName} · ` : ""}
                      {stop.label}
                    </div>
                    <div className="text-[11px] font-mono text-black/40 dark:text-white/40 mt-0.5">
                      {toDeg(stop.lat).toFixed(4)}, {toDeg(stop.lon).toFixed(4)}
                      {stop.distanceKm > 0 && ` · ${stop.distanceKm} km`}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {stop.priceSen > 0 ? (
                      <>
                        <div className="font-mono font-semibold text-sm">
                          {fmtRm(stop.priceSen)}
                          <span className="text-black/50 dark:text-white/50 font-normal">
                            /kg
                          </span>
                        </div>
                        {previous && (
                          <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                            +
                            {Math.round(
                              ((stop.priceSen - previous.priceSen) /
                                previous.priceSen) *
                                1000
                            ) / 10}
                            %
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-black/35 dark:text-white/35">
                        —
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {batch.journey.length < 4 && (
          <p className="text-xs text-black/50 dark:text-white/50 mt-4 pt-3 border-t border-black/10 dark:border-white/10">
            This batch has not been recorded all the way to a shelf yet. The
            stops above are everything on the ledger so far.
          </p>
        )}

        {batch.scans.length > 0 && (
          <p className="text-xs text-black/50 dark:text-white/50 mt-4 pt-3 border-t border-black/10 dark:border-white/10">
            Scanned {batch.scans.length}{" "}
            {batch.scans.length === 1 ? "time" : "times"} by shoppers. Scan
            locations are recorded to about a kilometre, never precisely.
          </p>
        )}
      </section>

      {/* Ledger proof */}
      <section className="bg-[#0C2317] text-white rounded-[28px] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <LockKeyIcon weight="fill" className="size-4 text-[#D4F63D]" />
          <span className="text-xs font-mono uppercase tracking-wider text-white/60">
            Cryptographic Ledger Proof
          </span>
        </div>
        <p className="text-sm text-white/75 leading-relaxed">
          This certificate is a Soulbound NFT permanently bound to{" "}
          {batch.producerName}. It is frozen at the token program level, so it
          cannot be transferred, sold or burned by anyone — including us.
        </p>
        <dl className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm border-t border-white/10 pt-4">
          <dt className="text-white/50">Chain</dt>
          <dd className="text-right font-mono">Solana {batch.cluster}</dd>
          <dt className="text-white/50">Certificate Type</dt>
          <dd className="text-right font-mono">Batch SBT</dd>
          <dt className="text-white/50">Token Address</dt>
          <dd className="text-right font-mono truncate">
            {shortAddress(batch.batchAsset)}
          </dd>
        </dl>
        <a
          href={explorerUrl(batch.batchAsset, batch.cluster)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#D4F63D] hover:underline"
        >
          View on Solana Explorer <ArrowSquareOutIcon className="size-3.5" />
        </a>
      </section>

      <CertificateActions batchCode={batch.batchCode} />
    </div>
  );
}
