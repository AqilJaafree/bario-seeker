"use client";

import React from "react";
import {
  StatePriceData,
  RiceGrade,
  FARMGATE_PRICE_BENCHMARK,
} from "@/lib/data/malaysia-prices";
import {
  ShieldCheckIcon,
  WarningCircleIcon,
  TrendUpIcon,
  MapPinIcon,
  StorefrontIcon,
  ArrowRightIcon,
  SparkleIcon,
} from "@phosphor-icons/react";

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
  const deltaRm = (shelfPrice - farmgate).toFixed(2);
  const deltaPct = (((shelfPrice - farmgate) / farmgate) * 100).toFixed(1);

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 md:p-6 shadow-xs transition-all flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
                {stateData.id} • {stateData.region}
              </span>
              {stateData.isOrigin && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded-full">
                  <SparkleIcon weight="fill" className="size-3 text-emerald-600" />
                  Origin (Highlands ≥1,100m)
                </span>
              )}
            </div>
            <h3 className="text-2xl font-serif tracking-tight font-medium mt-1.5 text-foreground flex items-center gap-2">
              {stateData.name}
            </h3>
          </div>

          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block">
              Grade {activeGrade} Shelf
            </span>
            <div className="text-2xl font-mono font-semibold tracking-tight text-foreground">
              RM {shelfPrice.toFixed(2)}
              <span className="text-xs text-muted-foreground font-normal ml-0.5">
                /kg
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Comparison Bar */}
        <div className="my-4 bg-muted/40 border border-border/40 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <MapPinIcon className="size-3.5" /> Bario Farmgate Base:
            </span>
            <span className="font-mono font-medium text-foreground">
              RM {farmgate.toFixed(2)}/kg
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendUpIcon className="size-3.5 text-amber-600 dark:text-amber-400" /> Distribution Markup:
            </span>
            <span
              className={`font-mono font-semibold ${
                Number(deltaPct) > 50
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              +{deltaPct}% (+RM {deltaRm}/kg)
            </span>
          </div>

          {/* Visual Bar Indicator */}
          <div className="w-full bg-border/40 h-2 rounded-full mt-3 overflow-hidden flex">
            <div
              className="bg-emerald-700 h-full rounded-l-full"
              style={{ width: `${(farmgate / shelfPrice) * 100}%` }}
              title="Farmgate Share"
            />
            <div
              className="bg-amber-500 h-full rounded-r-full"
              style={{
                width: `${100 - (farmgate / shelfPrice) * 100}%`,
              }}
              title="Logistics & Retail Margin"
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
            <span>Producer: {((farmgate / shelfPrice) * 100).toFixed(0)}%</span>
            <span>Markup: {(100 - (farmgate / shelfPrice) * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Grade Breakdown Pill Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(["A1", "A2", "B"] as RiceGrade[]).map((grade) => {
            const isSelected = grade === activeGrade;
            return (
              <div
                key={grade}
                className={`rounded-lg p-2 text-center border transition-all ${
                  isSelected
                    ? "bg-foreground text-background border-foreground shadow-xs"
                    : "bg-muted/30 border-border/50 text-foreground"
                }`}
              >
                <div
                  className={`text-[10px] uppercase font-semibold ${
                    isSelected ? "text-background/80" : "text-muted-foreground"
                  }`}
                >
                  Grade {grade}
                </div>
                <div className="font-mono text-sm font-semibold mt-0.5">
                  RM {stateData.prices[grade].toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Notes & Market Surveillance */}
        <div className="text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
          <p className="line-clamp-2">{stateData.notes}</p>
        </div>

        {/* Verified Stockists Sample */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <StorefrontIcon className="size-3.5 text-muted-foreground" />
              Verified Retail Stockists ({stateData.stockistCount})
            </span>
          </div>
          <div className="space-y-1">
            {stateData.sampleRetailers.slice(0, 2).map((retailer, i) => (
              <div
                key={i}
                className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate bg-muted/20 px-2 py-1 rounded-md"
              >
                <span className="size-1 rounded-full bg-emerald-600 shrink-0" />
                <span className="truncate">{retailer}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Status & Action */}
      <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {stateData.status === "verified" ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              <ShieldCheckIcon weight="fill" className="size-3.5" />
              DOA Verified Corridors
            </span>
          ) : stateData.status === "high_risk" ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
              <WarningCircleIcon weight="fill" className="size-3.5" />
              Scan QR Before Buying
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              <WarningCircleIcon weight="fill" className="size-3.5" />
              Market Monitored
            </span>
          )}
        </div>

        <button
          onClick={onVerifyBatchClick}
          className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer group"
        >
          Inspect Sample Batch
          <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
