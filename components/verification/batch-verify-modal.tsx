"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  XIcon,
  ShieldCheckIcon,
  StarIcon,
  CheckCircleIcon,
  WarningOctagonIcon,
  ShareNetworkIcon,
  CertificateIcon,
  MapPinIcon,
  ClockIcon,
  ArrowSquareOutIcon,
  SpinnerGapIcon,
  SealQuestionIcon,
  HourglassMediumIcon,
} from "@phosphor-icons/react";

import { fmtRm } from "@/lib/chain/bario";
import type { BatchView } from "@/lib/chain/types";

interface BatchVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBatchId?: string;
}

type LoadState =
  | { status: "loading" }
  | { status: "ok"; batch: BatchView }
  | { status: "missing"; reason: string }
  | { status: "error"; reason: string };

const shortAddress = (a: string) => `${a.slice(0, 6)}…${a.slice(-6)}`;

const explorerUrl = (address: string, cluster: string) =>
  `https://explorer.solana.com/address/${address}` +
  (cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`);

const formatDate = (ms: number) =>
  new Date(ms).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const BatchVerifyModal: React.FC<BatchVerifyModalProps> = ({
  isOpen,
  onClose,
  initialBatchId = "2026-11-001",
}) => {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [reportSuccess, setReportSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async (id: string) => {
    setState({ status: "loading" });
    try {
      const res = await fetch(`/api/batch/${encodeURIComponent(id)}`);
      const body = await res.json();
      if (body.found) {
        setState({ status: "ok", batch: body.batch as BatchView });
      } else {
        // A code that resolves to nothing is not a bug. It is the counterfeit
        // case, and the PRD requires it to be as unmistakable as a pass.
        setState({ status: "missing", reason: body.reason ?? "Not found." });
      }
    } catch {
      setState({
        status: "error",
        reason: "Could not reach the network. Check your connection.",
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setReportSuccess(false);
    void load(initialBatchId);
  }, [isOpen, initialBatchId, load]);

  // Escape closes, and the page behind does not scroll while the dialog is up.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const batch = state.status === "ok" ? state.batch : null;

  const handleShare = () => {
    if (!navigator.clipboard) return;
    const text = batch
      ? `https://barioseeker.my/verify/${batch.batchCode} — ${
          batch.isAudited ? `Verified Grade ${batch.gradeLabel}` : "Awaiting audit"
        } Bario rice from ${batch.producerName}`
      : `https://barioseeker.my/verify/${initialBatchId}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="batch-certificate-title"
        className="bg-card text-card-foreground border border-border/80 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${
                state.status === "loading"
                  ? "bg-muted-foreground animate-pulse"
                  : state.status === "ok"
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-rose-500"
              }`}
            />
            <span
              id="batch-certificate-title"
              className="text-xs font-mono font-medium text-foreground tracking-wide"
            >
              BATCH CERTIFICATE #{batch?.batchCode ?? initialBatchId}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {/* ---------------------------------------------------------- */}
          {state.status === "loading" && (
            <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
              <SpinnerGapIcon className="size-7 animate-spin" />
              <p className="text-sm">Reading the certificate from Solana…</p>
            </div>
          )}

          {(state.status === "missing" || state.status === "error") && (
            <div className="py-10 flex flex-col items-center gap-4 text-center">
              <div className="size-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs">
                <SealQuestionIcon weight="fill" className="size-7" />
              </div>
              <div>
                <p className="text-base font-semibold text-rose-700 dark:text-rose-300">
                  {state.status === "missing"
                    ? "Not verified"
                    : "Could not check"}
                </p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  {state.reason}
                </p>
              </div>
              {state.status === "missing" && (
                <p className="text-xs text-muted-foreground max-w-xs">
                  No Bario Seeker certificate exists for{" "}
                  <span className="font-mono">{initialBatchId}</span>. Treat this
                  bag as unverified and report it if it is sold as genuine Bario
                  rice.
                </p>
              )}
              <button
                onClick={() => void load(initialBatchId)}
                className="text-xs px-3.5 py-2 rounded-xl border border-border hover:bg-muted transition-colors cursor-pointer font-medium"
              >
                Try again
              </button>
            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {batch && (
            <>
              {/* Authenticity banner. Three states, not two: a batch can be
                  genuine but not yet audited, and saying so is the point. */}
              {batch.isAudited ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 flex items-center gap-3.5">
                  <div className="size-11 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheckIcon weight="fill" className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 tracking-tight">
                        Verified Authentic Bario Rice
                      </span>
                      <CheckCircleIcon
                        weight="fill"
                        className="size-4 text-emerald-600"
                      />
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Soulbound certificate permanently bound to the producer,
                      with an independent grade recorded on-chain.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 flex items-center gap-3.5">
                  <div className="size-11 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <HourglassMediumIcon weight="fill" className="size-6" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-amber-900 dark:text-amber-200 tracking-tight">
                      Registered, awaiting audit
                    </span>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                      This batch has a genuine producer certificate, but no
                      laboratory has graded it yet. Any grade on the packaging is
                      not independently verified.
                    </p>
                  </div>
                </div>
              )}

              {/* Producer */}
              <div className="flex items-start gap-4 border border-border/60 p-4 rounded-2xl bg-muted/20">
                <div className="size-16 rounded-xl bg-emerald-800 text-white flex items-center justify-center border border-border shadow-xs shrink-0 font-serif text-xl">
                  {batch.producerName
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-serif text-lg font-medium text-foreground truncate">
                      {batch.producerName}
                    </h4>
                    {batch.ratingAverage !== null ? (
                      <div className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 shrink-0">
                        <StarIcon weight="fill" className="size-3.5" />
                        <span>{batch.ratingAverage.toFixed(1)}</span>
                        <span className="text-muted-foreground">
                          ({batch.ratingCount})
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        No reviews yet
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-y-0.5 gap-x-3">
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="size-3 text-muted-foreground shrink-0" />
                      {batch.producerLocation}
                    </span>
                    <span>{batch.farmElevationM} m elevation</span>
                  </div>
                  <a
                    href={explorerUrl(batch.producerAsset, batch.cluster)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-[11px] text-emerald-700 dark:text-emerald-400 font-mono hover:underline"
                  >
                    Producer SBT: {shortAddress(batch.producerAsset)}
                    <span className="text-muted-foreground">
                      {" "}
                      (non-transferable)
                    </span>
                  </a>
                </div>
              </div>

              {/* Audit */}
              <div className="border border-border/60 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <div className="flex items-center gap-1.5">
                    <CertificateIcon className="size-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground uppercase tracking-wider font-mono">
                      Laboratory Audit Result
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${
                      batch.isAudited
                        ? "bg-foreground text-background"
                        : "bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200"
                    }`}
                  >
                    {batch.isAudited ? `Grade ${batch.gradeLabel}` : "Ungraded"}
                  </span>
                </div>

                {/* Only facts the chain actually holds. Grain integrity and
                    moisture live in the IPFS audit report, so they are linked
                    rather than printed as if the ledger vouched for them. */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-muted/30 p-2 rounded-xl">
                    <div className="text-[10px] text-muted-foreground uppercase">
                      Variety
                    </div>
                    <div className="text-sm font-mono font-semibold text-foreground mt-0.5">
                      {batch.variety}
                    </div>
                  </div>
                  <div className="bg-muted/30 p-2 rounded-xl">
                    <div className="text-[10px] text-muted-foreground uppercase">
                      Harvest
                    </div>
                    <div className="text-sm font-mono font-semibold text-foreground mt-0.5">
                      {formatDate(batch.harvestDate)}
                    </div>
                  </div>
                  <div className="bg-muted/30 p-2 rounded-xl">
                    <div className="text-[10px] text-muted-foreground uppercase">
                      Batch Lot
                    </div>
                    <div className="text-sm font-mono font-semibold text-foreground mt-0.5">
                      {batch.bagCount} bags
                    </div>
                  </div>
                </div>

                {batch.isAudited ? (
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40 gap-2">
                    <span className="truncate">
                      Auditor: {batch.auditorOrg ?? "—"}
                      {batch.auditCount > 1 && (
                        <span className="ml-1 text-amber-600 dark:text-amber-400">
                          (re-audited {batch.auditCount}×)
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <ClockIcon className="size-3" />
                      {batch.auditDate ? formatDate(batch.auditDate) : "—"}
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    No laboratory result recorded on-chain for this batch yet.
                  </p>
                )}
              </div>

              {/* Price journey */}
              <div className="border border-border/60 rounded-2xl p-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-3">
                  <span className="text-xs font-medium text-foreground uppercase tracking-wider font-mono">
                    Farm-to-Shelf Price Journey
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {batch.totalDistanceKm.toLocaleString()} km travelled
                  </span>
                </div>

                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
                  {batch.journey.map((step) => (
                    <div
                      key={step.index}
                      className="relative flex items-start gap-3.5 pl-1.5"
                    >
                      <div className="size-3 rounded-full bg-foreground border-2 border-background mt-1 shrink-0 z-10" />
                      <div className="flex-1 flex items-center justify-between text-xs gap-3">
                        <div className="min-w-0">
                          <div className="font-medium text-foreground">
                            {step.kindLabel}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {step.actorName ? `${step.actorName} • ` : ""}
                            {step.label}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {step.priceSen > 0 ? (
                            <>
                              <div className="font-mono font-semibold text-foreground">
                                {fmtRm(step.priceSen)}/kg
                              </div>
                              {step.marginPct !== null && (
                                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                                  +{step.marginPct}% margin
                                </span>
                              )}
                            </>
                          ) : (
                            <div className="font-mono text-[11px] text-muted-foreground">
                              {step.distanceKm.toLocaleString()} km
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {batch.journey.length < 4 && (
                  <p className="text-[11px] text-muted-foreground mt-3 pt-2 border-t border-border/40">
                    This batch has not been recorded all the way to a shelf yet.
                    The stops above are everything on the ledger so far.
                  </p>
                )}
              </div>

              {/* Ledger proof */}
              <div className="p-3.5 bg-muted/40 rounded-xl border border-border/40 flex items-center justify-between text-xs gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-mono text-muted-foreground">
                    Immutable Ledger Anchor
                  </div>
                  <div className="font-mono text-xs text-foreground mt-0.5 truncate">
                    Solana {batch.cluster}: {shortAddress(batch.batchAsset)}
                  </div>
                </div>
                <a
                  href={explorerUrl(batch.batchAsset, batch.cluster)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground underline font-mono shrink-0"
                >
                  Verify <ArrowSquareOutIcon className="size-3" />
                </a>
              </div>

              {reportSuccess && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                  Report noted for batch #{batch.batchCode}. On-chain reporting is
                  not wired up yet — this does not reach Department of
                  Agriculture Sarawak.
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-muted/30 border-t border-border/60 flex items-center justify-between gap-3">
          <button
            onClick={() => setReportSuccess(true)}
            disabled={!batch}
            className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-medium px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <WarningOctagonIcon className="size-4" />
            Report Counterfeit
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs text-foreground px-3.5 py-2 rounded-xl border border-border hover:bg-muted transition-colors cursor-pointer font-medium"
            >
              <ShareNetworkIcon className="size-4" />
              {copied ? "Copied Link" : "Share"}
            </button>
            <button
              onClick={onClose}
              className="text-xs bg-foreground text-background font-medium px-4 py-2 rounded-xl hover:bg-foreground/90 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
