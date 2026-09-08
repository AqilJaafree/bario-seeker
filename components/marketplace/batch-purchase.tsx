"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CertificateIcon,
  CheckCircleIcon,
  MinusIcon,
  PlusIcon,
} from "@phosphor-icons/react";

import { GradeBadge } from "@/components/marketplace/grade-badge";
import { LimeButton } from "@/components/ui/lime-button";
import { fmtRm } from "@/lib/chain/bario";
import type { ProducerBatchView } from "@/lib/chain/types";

/**
 * Harvest selector and order controls.
 *
 * Bario Seeker does not process purchases — PRD 3.2 lists a marketplace as an
 * explicit non-goal for v1 — so this records an interest request rather than
 * pretending to take payment, and says so.
 */
export function BatchPurchase({
  producerName,
  batches,
}: {
  producerName: string;
  batches: ProducerBatchView[];
}) {
  const [selectedPda, setSelectedPda] = useState(batches[0]?.batchPda);
  const [quantity, setQuantity] = useState(1);
  const [requested, setRequested] = useState(false);

  const batch = batches.find((b) => b.batchPda === selectedPda) ?? batches[0];
  if (!batch) {
    return (
      <p className="text-sm text-black/60 dark:text-white/60">
        This producer has not registered a harvest yet.
      </p>
    );
  }

  // A shelf price only exists once a batch reaches a retail stop.
  const perKg = batch.retailPriceSen ?? batch.farmgatePriceSen;
  const perBag = perKg * batch.bagSizeKg;
  const maxQuantity = Math.max(1, batch.bagCount);

  return (
    <div className="space-y-5">
      <div>
        <span className="text-[10px] uppercase tracking-wider text-black/50 dark:text-white/50 font-medium block">
          {batch.retailPriceSen ? "Shelf price" : "Farmgate price"}
        </span>
        <div className="text-3xl font-mono font-extrabold text-[#0C2317] dark:text-white mt-0.5">
          {fmtRm(perBag)}
          <span className="text-sm font-normal text-black/50 dark:text-white/50 ml-1">
            / {batch.bagSizeKg}kg bag
          </span>
        </div>
        <div className="text-xs text-black/50 dark:text-white/50 mt-1">
          {fmtRm(perKg)}/kg · {batch.bagCount} bags in this harvest
        </div>
      </div>

      {/* Harvest selector */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-wider text-black/50 dark:text-white/50 font-medium block">
          Harvest
        </span>
        <div className="flex flex-wrap gap-2">
          {batches.map((option) => (
            <button
              key={option.batchPda}
              onClick={() => {
                setSelectedPda(option.batchPda);
                setQuantity(1);
                setRequested(false);
              }}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                option.batchPda === batch.batchPda
                  ? "border-[#0C2317] dark:border-[#D4F63D] bg-white dark:bg-white/10"
                  : "border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30"
              }`}
            >
              {option.batchCode}
              {option.isAudited ? (
                <GradeBadge grade={option.gradeLabel as "A1" | "A2" | "B"} />
              ) : (
                <span className="text-amber-600 dark:text-amber-400">Ungraded</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Specs, all from the ledger */}
      <dl className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm border-t border-black/10 dark:border-white/10 pt-4">
        <dt className="text-black/50 dark:text-white/50">Variety</dt>
        <dd className="text-right font-medium">{batch.variety}</dd>
        <dt className="text-black/50 dark:text-white/50">Harvest</dt>
        <dd className="text-right font-medium">
          {new Date(batch.harvestDate).toLocaleDateString("en-MY", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </dd>
        <dt className="text-black/50 dark:text-white/50">Quantity</dt>
        <dd className="text-right font-medium">{batch.quantityKg} kg</dd>
        <dt className="text-black/50 dark:text-white/50">Journey</dt>
        <dd className="text-right font-medium">
          {batch.stopCount} {batch.stopCount === 1 ? "stop" : "stops"} recorded
        </dd>
      </dl>

      <Link
        href={`/verify/${batch.batchCode}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0C2317] dark:text-[#D4F63D] hover:underline"
      >
        <CertificateIcon className="size-4" />
        View the certificate for {batch.batchCode}
      </Link>

      <div className="flex items-center gap-3 pt-2">
        <div className="inline-flex items-center border border-black/10 dark:border-white/10 rounded-full bg-white dark:bg-white/5 w-fit shrink-0">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="size-11 flex items-center justify-center cursor-pointer text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          >
            <MinusIcon className="size-4" />
          </button>
          <span className="w-8 text-center text-base font-mono font-semibold">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
            aria-label="Increase quantity"
            className="size-11 flex items-center justify-center cursor-pointer text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          >
            <PlusIcon className="size-4" />
          </button>
        </div>

        <LimeButton
          onClick={() => setRequested(true)}
          className="flex-1 justify-center gap-2 text-base px-6 py-3.5"
        >
          <span>Request {fmtRm(perBag * quantity)}</span>
        </LimeButton>
      </div>

      {requested && (
        <div className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl px-4 py-3">
          <CheckCircleIcon weight="fill" className="size-4 shrink-0 mt-0.5" />
          <span>
            Noted: {quantity} bag{quantity > 1 ? "s" : ""} of {batch.batchCode}{" "}
            from {producerName}. Bario Seeker does not process payments — this
            is not an order, and nothing has been sent.
          </span>
        </div>
      )}
    </div>
  );
}
