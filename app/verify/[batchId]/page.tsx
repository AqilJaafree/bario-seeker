"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
// import { LimeButton } from "@/components/ui/lime-button";
import { GradeBadge } from "@/components/marketplace/grade-badge";
import { getBatchWithProducer } from "@/lib/data/producers";
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  StarIcon,
  MapPinIcon,
  CertificateIcon,
  ArrowSquareOutIcon,
  ArrowLeftIcon,
  ShareNetworkIcon,
  WarningOctagonIcon,
  // ShoppingCartIcon,
  LockKeyIcon,
} from "@phosphor-icons/react";

const GRADE_THRESHOLDS: Record<string, { brokenGrainPct: number; moisturePct: number }> = {
  A1: { brokenGrainPct: 5, moisturePct: 12 },
  A2: { brokenGrainPct: 8, moisturePct: 13 },
  B: { brokenGrainPct: 12, moisturePct: 14 },
};

export default function CertificatePage() {
  const params = useParams<{ batchId: string }>();
  const result = getBatchWithProducer(params.batchId);
  const [copied, setCopied] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [rating, setRating] = useState(0);

  if (!result) {
    return (
      <div className="min-h-screen bg-[#F5F6F1] dark:bg-[#111813] text-[#111813] dark:text-[#F5F6F1] flex flex-col font-sans">
        <div className="w-full mx-auto px-4 lg:px-0 max-w-7xl flex-1 flex flex-col">
          <div className="pt-6">
            <Navbar />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <WarningOctagonIcon className="size-10 text-rose-500" />
            <h1 className="text-xl font-heading font-bold">
              No batch found for &quot;{params.batchId}&quot;
            </h1>
            <p className="text-sm text-black/60 dark:text-white/60 max-w-md">
              This code could not be matched to any registered Producer SBT.
              Treat this bag with caution and report it if purchased as
              genuine Bario rice.
            </p>
            <Link
              href="/marketplace"
              className="text-sm font-semibold text-[#0C2317] dark:text-[#D4F63D] hover:underline"
            >
              Browse verified producers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { producer, batch } = result;
  // const pricePerBag = batch.sellPriceRmKg * batch.bagSizeKg;
  const thresholds = GRADE_THRESHOLDS[batch.grade];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `https://barioseeker.my/verify/${batch.batchId}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6F1] dark:bg-[#111813] text-[#111813] dark:text-[#F5F6F1] flex flex-col font-sans selection:bg-[#D4F63D] selection:text-black">
      <div className="w-full mx-auto space-y-8 px-4 lg:px-0 max-w-7xl">
        <div className="pt-6">
          <Navbar />
        </div>

        <div className="max-w-2xl mx-auto w-full space-y-8">
          <Link
            href={`/marketplace/${producer.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="size-4" />
            Back to {producer.name}
          </Link>

          {/* Verified Authentic Banner, unmistakable, above the fold */}
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
                Batch #{batch.batchId} is bound to a real, audited Producer SBT.
              </p>
            </div>
          </section>

          {/* Producer */}
          <Link
            href={`/marketplace/${producer.id}`}
            className="flex items-center gap-4 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[28px] p-5 hover:border-[#0C2317] dark:hover:border-white/30"
          >
            <div className="relative size-16 rounded-2xl overflow-hidden shrink-0 border border-black/10 dark:border-white/10">
              <Image src={producer.photo} alt={producer.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-heading font-bold truncate text-[#0C2317] dark:text-white">
                  {producer.name}
                </h2>
                <span className="flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400 shrink-0">
                  <StarIcon weight="fill" className="size-4" />
                  {producer.rating}
                  <span className="text-black/40 dark:text-white/40 font-normal">
                    ({producer.reviewCount})
                  </span>
                </span>
              </div>
              <div className="text-sm text-black/60 dark:text-white/60 mt-1 flex items-center gap-1.5">
                <MapPinIcon className="size-3.5" />
                {producer.location}
                <span className="text-black/30 dark:text-white/30">&middot;</span>
                Farming since {producer.joinedYear}
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-mono mt-1">
                Producer SBT {producer.sbtId} &middot; Non-transferable
              </div>
            </div>
          </Link>

          {/* Certificate Details */}
          <section className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[28px] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-black/50 dark:text-white/50">
                <CertificateIcon className="size-4" />
                Certificate Details
              </div>
              <GradeBadge grade={batch.grade} />
            </div>

            <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <dt className="text-black/50 dark:text-white/50">Batch ID</dt>
              <dd className="text-right font-mono font-medium">{batch.batchId}</dd>

              <dt className="text-black/50 dark:text-white/50">Harvest Date</dt>
              <dd className="text-right font-medium">{batch.harvestDate}</dd>

              <dt className="text-black/50 dark:text-white/50">Audit Date</dt>
              <dd className="text-right font-medium">{batch.auditDate}</dd>

              <dt className="text-black/50 dark:text-white/50">Audited By</dt>
              <dd className="text-right font-medium">{batch.auditorOrg}</dd>

              <dt className="text-black/50 dark:text-white/50">Lab Certificate</dt>
              <dd className="text-right font-mono font-medium">{batch.labCertificateId}</dd>

              <dt className="text-black/50 dark:text-white/50">Lot Size</dt>
              <dd className="text-right font-medium">{batch.quantityBags} bags</dd>
            </dl>

            <div className="grid grid-cols-2 divide-x divide-black/10 dark:divide-white/10 pt-1 border-t border-black/10 dark:border-white/10">
              <div className="pt-4 pr-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-black/50 dark:text-white/50">Broken Grain</span>
                  {batch.brokenGrainPct <= thresholds.brokenGrainPct && (
                    <CheckCircleIcon weight="fill" className="size-3.5 text-emerald-600" />
                  )}
                </div>
                <div className="text-lg font-mono font-bold mt-0.5">
                  {batch.brokenGrainPct}%{" "}
                  <span className="text-xs font-normal text-black/40 dark:text-white/40">
                    (max {thresholds.brokenGrainPct}% for Grade {batch.grade})
                  </span>
                </div>
              </div>
              <div className="pt-4 pl-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-black/50 dark:text-white/50">Moisture</span>
                  {batch.moisturePct <= thresholds.moisturePct && (
                    <CheckCircleIcon weight="fill" className="size-3.5 text-emerald-600" />
                  )}
                </div>
                <div className="text-lg font-mono font-bold mt-0.5">
                  {batch.moisturePct}%{" "}
                  <span className="text-xs font-normal text-black/40 dark:text-white/40">
                    (max {thresholds.moisturePct}% for Grade {batch.grade})
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Price */}
          {/* <section className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[28px] p-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs uppercase font-mono text-black/50 dark:text-white/50">
                Price
              </div>
              <div className="text-2xl font-mono font-extrabold text-[#0C2317] dark:text-white mt-0.5">
                RM {pricePerBag.toFixed(2)}
                <span className="text-sm font-normal text-black/50 dark:text-white/50 ml-1">
                  / {batch.bagSizeKg}kg bag
                </span>
              </div>
              <div className="text-xs text-black/50 dark:text-white/50 mt-1">
                {batch.quantityBags} bags in stock
              </div>
            </div>
            <LimeButton
              as="a"
              href={`/marketplace/${producer.id}`}
              className="gap-2 text-sm px-4 py-2.5"
            >
              <ShoppingCartIcon className="size-4" />
              <span>Buy This Batch</span>
            </LimeButton>
          </section> */}

          {/* Ledger Proof */}
          <section className="bg-[#0C2317] text-white rounded-[28px] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <LockKeyIcon weight="fill" className="size-4 text-[#D4F63D]" />
              <span className="text-xs font-mono uppercase tracking-wider text-white/60">
                Cryptographic Ledger Proof
              </span>
            </div>
            <p className="text-sm text-white/75 leading-relaxed">
              This certificate is a Soulbound NFT permanently bound to{" "}
              {producer.name}. It cannot be resold, transferred, or edited by
              anyone, including us, once issued.
            </p>
            <dl className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm border-t border-white/10 pt-4">
              <dt className="text-white/50">Chain</dt>
              <dd className="text-right font-mono">Solana</dd>
              <dt className="text-white/50">Certificate Type</dt>
              <dd className="text-right font-mono">Batch SBT</dd>
              <dt className="text-white/50">Token Address</dt>
              <dd className="text-right font-mono truncate">{batch.sbtTokenHash}</dd>
            </dl>
            <a
              href={`https://explorer.solana.com/address/${batch.sbtTokenHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#D4F63D] hover:underline"
            >
              View on Solana Explorer <ArrowSquareOutIcon className="size-3.5" />
            </a>
          </section>

          {/* Rate + Report + Share, reachable without scrolling past the fold on mobile */}
          <section className="space-y-3 pb-10">
            <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-sm font-medium text-black/70 dark:text-white/70">
                Rate this batch
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    aria-label={`Rate ${star} stars`}
                    className="cursor-pointer p-0.5"
                  >
                    <StarIcon
                      weight={star <= rating ? "fill" : "regular"}
                      className={`size-5 ${
                        star <= rating ? "text-amber-500" : "text-black/25 dark:text-white/25"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {reportSubmitted && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-sm text-amber-900 dark:text-amber-200">
                Report submitted. Department of Agriculture Sarawak
                surveillance notified for batch #{batch.batchId}.
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setReportSubmitted(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl border border-rose-200 dark:border-rose-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <WarningOctagonIcon className="size-4" />
                Report Counterfeit
              </button>
              <button
                onClick={handleShare}
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ShareNetworkIcon className="size-4" />
                {copied ? "Link Copied" : "Share"}
              </button>
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </div>
  );
}
