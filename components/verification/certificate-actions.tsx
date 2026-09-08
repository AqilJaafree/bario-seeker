"use client";

import { useState } from "react";
import {
  ShareNetworkIcon,
  StarIcon,
  WarningOctagonIcon,
} from "@phosphor-icons/react";

/**
 * The interactive footer of a certificate page.
 *
 * Split out so the certificate itself can stay a Server Component: the page
 * must render its verification result from the chain on the server, both for
 * speed in an aisle on 4G and so it works before any JavaScript arrives.
 *
 * Rating and reporting are not wired to the chain yet — both are permissionless
 * instructions a relayer would sign, since consumers never hold a wallet.
 */
export function CertificateActions({ batchCode }: { batchCode: string }) {
  const [copied, setCopied] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [rating, setRating] = useState(0);

  const handleShare = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(
      typeof window !== "undefined" ? window.location.href : ""
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
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
                  star <= rating
                    ? "text-amber-500"
                    : "text-black/25 dark:text-white/25"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {rating > 0 && (
        <p className="text-xs text-black/50 dark:text-white/50 px-1">
          Ratings are not recorded on-chain yet, so this is not saved.
        </p>
      )}

      {reportSubmitted && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-sm text-amber-900 dark:text-amber-200">
          Report noted for batch #{batchCode}. On-chain reporting is not wired up
          yet, so this has not reached Department of Agriculture Sarawak.
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
  );
}
