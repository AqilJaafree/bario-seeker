"use client";

import React, { useState, useId } from "react";
import { MALAYSIA_SVG_PATHS } from "./map-paths";
import {
  MALAYSIA_STATES_DATA,
  FARMGATE_PRICE_BENCHMARK,
  RiceGrade,
  StatePriceData,
} from "@/lib/data/malaysia-prices";
import { StatePriceCard } from "./state-price-card";
import {
  SparkleIcon,
  TrendUpIcon,
  SlidersHorizontalIcon,
  ArrowsClockwiseIcon,
  TableIcon,
  MapTrifoldIcon,
} from "@phosphor-icons/react";

interface MalaysiaMapProps {
  onVerifyBatchClick?: () => void;
}

export const MalaysiaMap: React.FC<MalaysiaMapProps> = ({
  onVerifyBatchClick,
}) => {
  const [selectedStateId, setSelectedStateId] = useState<string>("MY14"); // Default to Kuala Lumpur (primary retail hub)
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);
  const [activeGrade, setActiveGrade] = useState<RiceGrade>("A1");
  const [viewMode, setViewMode] = useState<"map" | "table">("map");
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null
  );

  const filterId = useId();

  const selectedState =
    MALAYSIA_STATES_DATA[selectedStateId] || MALAYSIA_STATES_DATA["MY14"];
  const hoveredState: StatePriceData | null = hoveredStateId
    ? MALAYSIA_STATES_DATA[hoveredStateId] || null
    : null;

  const farmgateBase = FARMGATE_PRICE_BENCHMARK[activeGrade];

  // Helper to calculate choropleth color intensity based on price
  const getStateFillColor = (
    stateId: string,
    isHovered: boolean,
    isSelected: boolean
  ) => {
    const data = MALAYSIA_STATES_DATA[stateId];
    if (!data) return "var(--muted)";

    if (data.isOrigin) {
      // Distinct highlands origin green
      if (isSelected) return "#15803d"; // emerald-700
      if (isHovered) return "#16a34a"; // emerald-600
      return "#22c55e"; // emerald-500
    }

    const price = data.prices[activeGrade];
    const markupPct = ((price - farmgateBase) / farmgateBase) * 100;

    if (isSelected) {
      return "#1e293b"; // slate-800 selected
    }

    if (isHovered) {
      return "#334155"; // slate-700 hovered
    }

    // Gradient based on markup range:
    if (markupPct > 50) {
      // High markup hub (KL, Selangor, Putrajaya, Johor)
      return "rgba(225, 29, 72, 0.18)"; // subtle rose tint
    } else if (markupPct > 35) {
      // Moderate markup (Perak, Pahang, Melaka, Penang)
      return "rgba(217, 119, 6, 0.15)"; // subtle amber tint
    } else {
      // Regional close to origin / low markup
      return "rgba(16, 185, 129, 0.16)"; // soft emerald tint
    }
  };

  const getStateStrokeColor = (
    stateId: string,
    isHovered: boolean,
    isSelected: boolean
  ) => {
    const data = MALAYSIA_STATES_DATA[stateId];
    if (isSelected) return "oklch(0.141 0.005 285.823)";
    if (isHovered) return "oklch(0.21 0.006 285.885)";
    if (data?.isOrigin) return "#15803d";
    return "rgba(160, 160, 160, 0.35)";
  };

  const handleMouseMove = (
    e: React.MouseEvent<SVGPathElement>,
    stateId: string
  ) => {
    setHoveredStateId(stateId);
    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredStateId(null);
    setTooltipPos(null);
  };

  return (
    <section className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-emerald-800 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950/70 border border-emerald-300/60 dark:border-emerald-800/80 px-2.5 py-0.5 rounded-full">
              Live National Price Index
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              16 Administrative Regions
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif tracking-tight font-medium text-foreground">
            Malaysian State Price Map
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1 max-w-2xl">
            Hover over any state to reveal verified retail benchmarks and
            distribution margins against the highland farmgate base of{" "}
            <strong className="text-foreground font-semibold">
              RM {farmgateBase.toFixed(2)}/kg
            </strong>
            .
          </p>
        </div>

        {/* View mode & Grade Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Grade Selector */}
          <div className="inline-flex items-center bg-muted/60 p-1 rounded-xl border border-border/60">
            <span className="text-xs text-muted-foreground px-2 flex items-center gap-1 font-medium">
              <SlidersHorizontalIcon className="size-3" /> Grade:
            </span>
            {(["A1", "A2", "B"] as RiceGrade[]).map((grade) => (
              <button
                key={grade}
                onClick={() => setActiveGrade(grade)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeGrade === grade
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Grade {grade}
              </button>
            ))}
          </div>

          {/* Toggle Map / Table */}
          <div className="inline-flex items-center bg-muted/60 p-1 rounded-xl border border-border/60">
            <button
              onClick={() => setViewMode("map")}
              className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === "map"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapTrifoldIcon className="size-3.5" /> Map
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TableIcon className="size-3.5" /> Table
            </button>
          </div>
        </div>
      </div>

      {viewMode === "map" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Main: The Vector SVG Map */}
          <div className="lg:col-span-8 bg-card border border-border/80 rounded-3xl p-4 sm:p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
            {/* Map Top Bar */}
            <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/40 pb-3 mb-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Origin Farmgate: RM {farmgateBase.toFixed(2)}/kg
                </span>
                <span className="hidden sm:inline-block text-border">•</span>
                <span className="hidden sm:inline-flex items-center gap-1">
                  Click any state to lock inspector
                </span>
              </div>
              <button
                onClick={() => setSelectedStateId("MY13")}
                className="text-[11px] font-medium text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <SparkleIcon weight="fill" className="size-3" /> Jump to Origin (Bario, Sarawak)
              </button>
            </div>

            {/* SVG Interactive Canvas */}
            <div className="relative w-full aspect-1000/400 select-none my-2">
              <svg
                viewBox="0 0 1000 332"
                className="w-full h-full drop-shadow-xs"
                style={{ filter: "contrast(1.02)" }}
              >
                <defs>
                  {/* Subtle drop shadow for selected state */}
                  <filter id={`state-shadow-${filterId}`} x="-10%" y="-10%" width="130%" height="130%">
                    <feDropShadow
                      dx="0"
                      dy="2"
                      stdDeviation="3"
                      floodOpacity="0.18"
                    />
                  </filter>
                </defs>

                {/* State Vector Paths */}
                <g id="states-group">
                  {MALAYSIA_SVG_PATHS.map((statePath) => {
                    const isSelected = statePath.id === selectedStateId;
                    const isHovered = statePath.id === hoveredStateId;
                    const fillColor = getStateFillColor(
                      statePath.id,
                      isHovered,
                      isSelected
                    );
                    const strokeColor = getStateStrokeColor(
                      statePath.id,
                      isHovered,
                      isSelected
                    );

                    return (
                      <path
                        key={statePath.id}
                        id={statePath.id}
                        d={statePath.d}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isSelected ? "1.8" : isHovered ? "1.4" : "0.75"}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        className="cursor-pointer transition-all duration-150"
                        style={{
                          transformOrigin: `${statePath.centroid.x}px ${statePath.centroid.y}px`,
                          transform: isHovered ? "scale(1.008)" : "none",
                        }}
                        filter={isSelected ? `url(#state-shadow-${filterId})` : undefined}
                        onClick={() => setSelectedStateId(statePath.id)}
                        onMouseMove={(e) => handleMouseMove(e, statePath.id)}
                        onMouseLeave={handleMouseLeave}
                      />
                    );
                  })}
                </g>

                {/* Region Names & Centroid markers */}
                <g id="state-labels" className="pointer-events-none">
                  {MALAYSIA_SVG_PATHS.map((statePath) => {
                    const data = MALAYSIA_STATES_DATA[statePath.id];
                    if (!data) return null;
                    const isSelected = statePath.id === selectedStateId;
                    const isHovered = statePath.id === hoveredStateId;

                    return (
                      <g
                        key={`label-${statePath.id}`}
                        transform={`translate(${statePath.centroid.x}, ${statePath.centroid.y})`}
                      >
                        {/* Only show text on prominent states or active state */}
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          className={`font-sans font-medium transition-all ${
                            isSelected || isHovered
                              ? "text-[9px] fill-foreground font-bold"
                              : "text-[7.5px] fill-muted-foreground/75"
                          }`}
                          dy="-2"
                        >
                          {data.shortName}
                        </text>
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          className={`font-mono transition-all ${
                            isSelected || isHovered
                              ? "text-[8px] fill-foreground font-semibold"
                              : "text-[6.5px] fill-muted-foreground/60"
                          }`}
                          dy="7"
                        >
                          {data.prices[activeGrade].toFixed(1)}
                        </text>
                      </g>
                    );
                  })}
                </g>

                {/* Bario Highland Origin Pin in Sarawak */}
                <g
                  transform="translate(738, 175)"
                  className="pointer-events-none"
                >
                  <circle
                    r="12"
                    className="fill-emerald-500/20 animate-ping origin-center"
                  />
                  <circle
                    r="5"
                    className="fill-emerald-700 stroke-2 stroke-white shadow-md"
                  />
                  {/* Origin Tag */}
                  <g transform="translate(10, -8)">
                    <rect
                      x="0"
                      y="0"
                      width="105"
                      height="18"
                      rx="4"
                      className="fill-card stroke stroke-border"
                    />
                    <text
                      x="6"
                      y="12"
                      className="text-[8px] font-sans font-bold fill-emerald-800 dark:fill-emerald-400"
                    >
                      ★ Bario Highlands (1,100m+)
                    </text>
                  </g>
                </g>

                {/* Klang Valley Focus Callout */}
                <g
                  transform="translate(140, 208)"
                  className="pointer-events-none"
                >
                  <circle
                    r="4"
                    className="fill-rose-500 stroke-1 stroke-white"
                  />
                </g>
              </svg>

              {/* Floating Dynamic Tooltip following cursor */}
              {tooltipPos && hoveredState && (
                <div
                  className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-full mb-3 transition-transform duration-75"
                  style={{
                    left: `${tooltipPos.x}px`,
                    top: `${tooltipPos.y - 12}px`,
                  }}
                >
                  <div className="bg-popover text-popover-foreground border border-border/80 px-3.5 py-2.5 rounded-xl shadow-lg text-left whitespace-nowrap min-w-37.5">
                    <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-1.5 mb-1.5">
                      <span className="font-serif font-medium text-xs text-foreground">
                        {hoveredState.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {hoveredState.id}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[11px] text-muted-foreground">
                        Grade {activeGrade} Shelf:
                      </span>
                      <span className="text-xs font-mono font-bold text-foreground">
                        RM {hoveredState.prices[activeGrade].toFixed(2)}/kg
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-1 text-[10px]">
                      <span className="text-muted-foreground">Markup vs Base:</span>
                      <span
                        className={`font-mono font-semibold ${
                          (hoveredState.prices[activeGrade] - farmgateBase) /
                            farmgateBase >
                          0.5
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        +
                        {(
                          ((hoveredState.prices[activeGrade] - farmgateBase) /
                            farmgateBase) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Map Bottom Legend */}
            <div className="mt-3 pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-emerald-600" />
                  Highland Origin (Sarawak)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-amber-500/70" />
                  Regional Distribution (30–50% markup)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-rose-500/70" />
                  Urban Retail Hub (&gt;50% markup)
                </span>
              </div>
              <div className="text-[11px] font-mono">
                Source: Bario Cooperative Audit 2026
              </div>
            </div>
          </div>

          {/* Right: State Price Inspector Card */}
          <div className="lg:col-span-4">
            <StatePriceCard
              stateData={selectedState}
              activeGrade={activeGrade}
              onVerifyBatchClick={onVerifyBatchClick}
            />
          </div>
        </div>
      ) : (
        /* Accessible Table View */
        <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Region / State</th>
                  <th className="py-3 px-4">Territory</th>
                  <th className="py-3 px-4 text-right">Grade A1 (RM/kg)</th>
                  <th className="py-3 px-4 text-right">Grade A2 (RM/kg)</th>
                  <th className="py-3 px-4 text-right">Grade B (RM/kg)</th>
                  <th className="py-3 px-4 text-right">Markup vs Base</th>
                  <th className="py-3 px-4 text-center">Stockists</th>
                  <th className="py-3 px-4">Surveillance Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {Object.values(MALAYSIA_STATES_DATA).map((state) => {
                  const isSelected = state.id === selectedStateId;
                  const priceA1 = state.prices.A1;
                  const markup = (
                    ((priceA1 - FARMGATE_PRICE_BENCHMARK.A1) /
                      FARMGATE_PRICE_BENCHMARK.A1) *
                    100
                  ).toFixed(1);

                  return (
                    <tr
                      key={state.id}
                      className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                        isSelected ? "bg-muted/40 font-medium" : ""
                      }`}
                      onClick={() => {
                        setSelectedStateId(state.id);
                        setViewMode("map");
                      }}
                    >
                      <td className="py-3 px-4 font-semibold text-foreground flex items-center gap-1.5">
                        {state.name}
                        {state.isOrigin && (
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-sans">
                            Origin
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {state.region} ({state.id})
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-foreground">
                        RM {state.prices.A1.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                        RM {state.prices.A2.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                        RM {state.prices.B.toFixed(2)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-semibold ${
                          Number(markup) > 50
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        +{markup}%
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {state.stockistCount} stores
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            state.status === "verified"
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : state.status === "high_risk"
                              ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                              : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          {state.status === "verified"
                            ? "Verified Chain"
                            : state.status === "high_risk"
                            ? "High Markup Alert"
                            : "Monitoring"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStateId(state.id);
                            setViewMode("map");
                          }}
                          className="text-xs text-foreground hover:underline font-medium"
                        >
                          View Map →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
