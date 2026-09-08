import Link from "next/link";
import {
  StarIcon,
  MapPinIcon,
  ShieldCheckIcon,
  HourglassMediumIcon,
} from "@phosphor-icons/react/dist/ssr";

import { ArrowCircle } from "@/components/ui/arrow-circle";
import { GradeBadge } from "@/components/marketplace/grade-badge";
import { fmtRm } from "@/lib/chain/bario";
import type { ProducerSummary } from "@/lib/chain/types";

/**
 * A producer, as the chain knows them.
 *
 * There is no portrait and no biography on chain — only a name, coordinates, an
 * elevation and a join date. Rather than invent either, the card uses the
 * producer's initials and a line assembled from facts the ledger actually
 * holds.
 */
export function ProducerCard({ producer }: { producer: ProducerSummary }) {
  const latest = producer.latestBatch;
  const initials = producer.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  const harvests = producer.batchCount === 1 ? "1 harvest" : `${producer.batchCount} harvests`;
  const since = new Date(producer.joinedAt).getFullYear();
  const descriptor = `Farming at ${producer.elevationM} m in the Kelabit Highlands. ${harvests} certified since ${since}.`;

  // A shelf price only exists once a batch reaches a Retail stop. Showing the
  // farmgate price in its place, clearly labelled, is better than implying a
  // retail price the ledger has never recorded.
  const priceSen = latest?.retailPriceSen ?? latest?.farmgatePriceSen ?? null;
  const priceLabel = latest?.retailPriceSen ? "Shelf price" : "Farmgate price";

  return (
    <Link
      href={`/marketplace/${producer.producerPda}`}
      className="group flex flex-col bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[28px] overflow-hidden shadow-sm hover:border-[#0C2317] dark:hover:border-white/30 transition-all"
    >
      <div className="relative h-44 overflow-hidden bg-[#0C2317] flex items-center justify-center">
        <span className="font-heading text-5xl text-[#D4F63D]/90 transition-transform duration-500 group-hover:scale-105">
          {initials}
        </span>
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
        {latest?.isAudited ? (
          <GradeBadge
            grade={latest.gradeLabel as "A1" | "A2" | "B"}
            className="absolute top-3 left-3"
          />
        ) : (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-bold">
            <HourglassMediumIcon weight="fill" className="size-3" />
            Ungraded
          </span>
        )}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
          <span className="text-sm font-heading font-bold truncate">
            {producer.name}
          </span>
          {producer.rating !== null ? (
            <span className="flex items-center gap-1 text-xs font-medium shrink-0 ml-2">
              <StarIcon weight="fill" className="size-3.5 text-[#D4F63D]" />
              {producer.rating.toFixed(1)}
            </span>
          ) : (
            <span className="text-[11px] text-white/70 shrink-0 ml-2">
              Not yet rated
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-1.5 text-xs text-black/60 dark:text-white/60">
          <MapPinIcon className="size-3.5 shrink-0" />
          {producer.location}
        </div>

        <p className="text-xs text-black/70 dark:text-white/70 leading-relaxed line-clamp-2">
          {descriptor}
        </p>

        <div className="mt-auto pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-black/50 dark:text-white/50 font-medium block">
              {priceLabel}
            </span>
            <span className="font-mono text-sm font-bold text-[#0C2317] dark:text-white">
              {priceSen !== null ? (
                <>
                  {fmtRm(priceSen)}
                  <span className="font-normal text-black/50 dark:text-white/50">
                    {" "}
                    / kg
                  </span>
                </>
              ) : (
                <span className="font-normal text-black/50 dark:text-white/50">
                  No harvest yet
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {latest?.isAudited && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                <ShieldCheckIcon weight="fill" className="size-3.5" />
                Verified
              </span>
            )}
            <ArrowCircle size="size-8" iconSize="size-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
