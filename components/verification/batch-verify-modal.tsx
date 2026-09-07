"use client";

import React, { useState } from "react";
import { SAMPLE_BATCH_2026 } from "@/lib/data/malaysia-prices";
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
} from "@phosphor-icons/react";

interface BatchVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBatchId?: string;
}

export const BatchVerifyModal: React.FC<BatchVerifyModalProps> = ({
  isOpen,
  onClose,
  initialBatchId = "2026-11-001",
}) => {
  const [reportSuccess, setReportSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const batch = SAMPLE_BATCH_2026;

  if (!isOpen) return null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `https://barioseeker.my/verify/${batch.batchId} - Verified Grade ${batch.grade} Bario Rice from ${batch.producerName}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-card text-card-foreground border border-border/80 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-medium text-foreground tracking-wide">
              BATCH CERTIFICATE #{batch.batchId}
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

        {/* Scrollable Modal Content (Designed like a genuine digital highland label) */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Verified Authentic Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="size-11 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheckIcon weight="fill" className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 tracking-tight">
                  Verified Authentic Bario Rice
                </span>
                <CheckCircleIcon weight="fill" className="size-4 text-emerald-600" />
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                Cryptographic Soulbound certificate permanently bound to producer
                and batch audit.
              </p>
            </div>
          </div>

          {/* Producer Profile Section */}
          <div className="flex items-start gap-4 border border-border/60 p-4 rounded-2xl bg-muted/20">
            <img
              src={batch.producerPhoto}
              alt={batch.producerName}
              className="size-16 rounded-xl object-cover border border-border shadow-xs shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-serif text-lg font-medium text-foreground truncate">
                  {batch.producerName}
                </h4>
                <div className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 shrink-0">
                  <StarIcon weight="fill" className="size-3.5" />
                  <span>4.8</span>
                  <span className="text-muted-foreground">(142)</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-y-1 gap-x-2">
                <span className="flex items-center gap-1">
                  <MapPinIcon className="size-3 text-muted-foreground" />
                  {batch.producerLocation}
                </span>
                <span>•</span>
                <span>Elevation: {batch.farmElevationMeters}m</span>
              </div>
              <div className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                Producer SBT: #BAR-402 (Non-transferable)
              </div>
            </div>
          </div>

          {/* Independent Lab Quality Audit */}
          <div className="border border-border/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div className="flex items-center gap-1.5">
                <CertificateIcon className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground uppercase tracking-wider font-mono">
                  Laboratory Audit Result
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-foreground text-background font-mono text-xs font-bold">
                Grade {batch.grade}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-muted/30 p-2 rounded-xl">
                <div className="text-[10px] text-muted-foreground uppercase">
                  Broken Grain
                </div>
                <div className="text-sm font-mono font-semibold text-foreground mt-0.5">
                  {batch.brokenGrainPct}%{" "}
                  <span className="text-[10px] text-emerald-600 font-normal">
                    (&lt;5%)
                  </span>
                </div>
              </div>

              <div className="bg-muted/30 p-2 rounded-xl">
                <div className="text-[10px] text-muted-foreground uppercase">
                  Moisture Content
                </div>
                <div className="text-sm font-mono font-semibold text-foreground mt-0.5">
                  {batch.moisturePct}%{" "}
                  <span className="text-[10px] text-emerald-600 font-normal">
                    (&lt;12%)
                  </span>
                </div>
              </div>

              <div className="bg-muted/30 p-2 rounded-xl">
                <div className="text-[10px] text-muted-foreground uppercase">
                  Batch Lot
                </div>
                <div className="text-sm font-mono font-semibold text-foreground mt-0.5">
                  {batch.quantityBags} bags
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
              <span>Auditor: {batch.auditorOrg}</span>
              <span className="flex items-center gap-1">
                <ClockIcon className="size-3" /> {batch.auditDate}
              </span>
            </div>
          </div>

          {/* Transparent Price Journey */}
          <div className="border border-border/60 rounded-2xl p-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-3">
              <span className="text-xs font-medium text-foreground uppercase tracking-wider font-mono">
                Farm-to-Shelf Price Journey
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                Total Value Added
              </span>
            </div>

            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
              {batch.priceJourney.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-3.5 pl-1.5">
                  <div className="size-3 rounded-full bg-foreground border-2 border-background mt-1 shrink-0 z-10" />
                  <div className="flex-1 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-foreground">
                        {step.stage}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {step.actor} • {step.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-foreground">
                        RM {step.price.toFixed(2)}/kg
                      </div>
                      {step.marginPct && (
                        <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                          +{step.marginPct}% margin
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Ledger Proof */}
          <div className="p-3.5 bg-muted/40 rounded-xl border border-border/40 flex items-center justify-between text-xs">
            <div>
              <div className="text-[10px] uppercase font-mono text-muted-foreground">
                Immutable Ledger Anchor
              </div>
              <div className="font-mono text-xs text-foreground mt-0.5 truncate max-w-60">
                Solana: {batch.sbtTokenHash}…
              </div>
            </div>
            <a
              href={`https://explorer.solana.com/address/${batch.sbtTokenHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground underline font-mono"
            >
              Verify <ArrowSquareOutIcon className="size-3" />
            </a>
          </div>

          {/* Reporting Confirmation Message */}
          {reportSuccess && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
              ✓ Market report submitted. Department of Agriculture Sarawak
              surveillance notified for batch #{batch.batchId}.
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-muted/30 border-t border-border/60 flex items-center justify-between gap-3">
          <button
            onClick={() => setReportSuccess(true)}
            className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-medium px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
