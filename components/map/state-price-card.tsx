"use client";

import React from "react";
import {
  StatePriceData,
  RiceGrade,
  FARMGATE_PRICE_BENCHMARK,
  getMarkupPct,
} from "@/lib/data/malaysia-prices";
import {
  ShieldCheckIcon,
  WarningCircleIcon,
  TrendUpIcon,
  MapPinIcon,
  StorefrontIcon,
  ArrowUpRightIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { LimeButton } from "@/components/ui/lime-button";

interface StatePriceCardProps {
  stateData: StatePriceData;
  activeGrade: RiceGrade;
  onVerifyBatchClick?: () => void;
}

export const StatePriceCard: React.FC<StatePriceCardProps> = ({
  stateData,
  activeGrade,
  onVerifyBatchClick,
}) => {
  const farmgate = FARMGATE_PRICE_BENCHMARK[activeGrade];
  const shelfPrice = stateData.prices[activeGrade];
  const deltaPct = getMarkupPct(shelfPrice, activeGrade).toFixed(1);
  const farmerSharePct = ((farmgate / shelfPrice) * 100).toFixed(0);
  const retailSharePct = (100 - Number(farmerSharePct)).toFixed(0);

  return (
    <div className="bg-[#0e271a] border border-white/10 rounded-[28px] overflow-hidden text-white shadow-xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
        {/* Column 1: identity & headline price */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-medium">
              {stateData.id} &middot; {stateData.region}
            </span>
            {stateData.isOrigin && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-black bg-[#D4F63D] px-2.5 py-0.5 rounded-full shadow-xs">
                <SparkleIcon weight="fill" className="size-3 text-black" />
                Origin (&ge;1,100m)
              </span>
            )}
          </div>

          <h3 className="text-2xl font-heading tracking-tight font-bold text-white">
            {stateData.name}
          </h3>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/60 font-medium block">
              Grade {activeGrade} shelf
            </span>
            <div className="text-3xl font-mono font-bold tracking-tight text-[#D4F63D]">
              RM {shelfPrice.toFixed(2)}
              <span className="text-xs text-white/60 font-normal ml-1">
                /kg
              </span>
            </div>
          </div>

          <div className="text-xs text-white/70 flex items-center gap-1.5">
            <MapPinIcon className="size-3.5 text-white/50" />
            vs RM {farmgate.toFixed(2)} base &middot;{" "}
            <span
              className={`font-mono font-bold ${
                Number(deltaPct) > 50 ? "text-rose-400" : "text-[#D4F63D]"
              }`}
            >
              +{deltaPct}%
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10 font-mono text-xs">
            <span className="text-white/70 flex items-center gap-1.5">
              <TrendUpIcon className="size-3.5 text-[#D4F63D]" /> Farmer{" "}
              <strong className="text-[#D4F63D] font-bold">
                {farmerSharePct}%
              </strong>
            </span>
            <span className="text-white/70">
              Logistics &amp; retail{" "}
              <strong className="text-white font-bold">
                {retailSharePct}%
              </strong>
            </span>
          </div>
        </div>

        {/* Column 2: all grades & notes */}
        <div className="p-6 flex flex-col gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/60 font-medium block mb-2">
              All grades
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(["A1", "A2", "B"] as RiceGrade[]).map((grade) => {
                const isSelected = grade === activeGrade;
                return (
                  <div
                    key={grade}
                    className={`rounded-xl p-2.5 text-center border transition-all ${
                      isSelected
                        ? "bg-[#D4F63D] text-black border-[#D4F63D] font-bold shadow-md"
                        : "bg-white/5 border-white/10 text-white/80"
                    }`}
                  >
                    <div
                      className={`text-[10px] uppercase font-semibold ${
                        isSelected ? "text-black/80" : "text-white/50"
                      }`}
                    >
                      {grade}
                    </div>
                    <div className="font-mono text-sm font-bold mt-0.5">
                      RM {stateData.prices[grade].toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-white/70 leading-relaxed line-clamp-4">
            {stateData.notes}
          </p>
        </div>

        {/* Column 3: stockists & action */}
        <div className="p-6 flex flex-col gap-4 justify-between">
          <div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-white/80 mb-2">
              <StorefrontIcon className="size-3.5 text-[#D4F63D]" />
              Verified stockists ({stateData.stockistCount})
            </span>
            <div className="space-y-1.5">
              {stateData.sampleRetailers.slice(0, 3).map((retailer, i) => (
                <div
                  key={i}
                  className="text-[11px] text-white/75 flex items-center gap-2 truncate bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl"
                >
                  <StorefrontIcon className="size-3 text-[#D4F63D] shrink-0" />
                  <span className="truncate">{retailer}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/10">
            {stateData.status === "verified" ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#D4F63D] font-medium">
                <ShieldCheckIcon weight="fill" className="size-3.5 text-[#D4F63D]" />
                DOA Verified
              </span>
            ) : stateData.status === "high_risk" ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                <WarningCircleIcon weight="fill" className="size-3.5" />
                Scan QR Before Buying
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-medium">
                <WarningCircleIcon weight="fill" className="size-3.5" />
                Monitored Corridor
              </span>
            )}

            <LimeButton
              onClick={onVerifyBatchClick}
              className="gap-1.5 text-xs px-3.5 py-1.5 shadow-sm shrink-0"
            >
              <span>Verify Batch</span>
              <ArrowUpRightIcon className="size-3.5 text-black transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </LimeButton>
          </div>
        </div>
      </div>
    </div>
  );
};
