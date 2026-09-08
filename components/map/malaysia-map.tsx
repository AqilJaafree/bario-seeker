"use client";

import React, { useState, useId, useEffect } from "react";
import { MALAYSIA_SVG_PATHS } from "./map-paths";
import {
  MALAYSIA_STATES_DATA,
  FARMGATE_PRICE_BENCHMARK,
  RiceGrade,
  StatePriceData,
  getMarkupPct,
} from "@/lib/data/malaysia-prices";
import { StatePriceCard } from "./state-price-card";
import {
  SparkleIcon,
  TableIcon,
  MapTrifoldIcon,
} from "@phosphor-icons/react";

const DISPLAY_GRADE: RiceGrade = "A1";

interface MalaysiaMapProps {
  onVerifyBatchClick?: () => void;
}

export const MalaysiaMap: React.FC<MalaysiaMapProps> = ({
  onVerifyBatchClick,
}) => {
  const [selectedStateId, setSelectedStateId] = useState<string>("MY14"); // Default: Kuala Lumpur
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "table">("map");
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null
  );

  const filterId = useId();

  const selectedState =
    MALAYSIA_STATES_DATA[selectedStateId] || MALAYSIA_STATES_DATA["MY14"];

  const farmgateBase = FARMGATE_PRICE_BENCHMARK[DISPLAY_GRADE];

  // A fixed-position tooltip has no reason to survive a scroll, and it can't
  // reliably tell whether the pointer is still over the map once the page
  // has moved underneath it.
  useEffect(() => {
    const hide = () => {
      setHoveredStateId(null);
      setTooltipPos(null);
    };
    window.addEventListener("scroll", hide, { passive: true });
    return () => window.removeEventListener("scroll", hide);
  }, []);

  const getStateFillColor = (
    stateId: string,
    isHovered: boolean,
    isSelected: boolean
  ) => {
    const data = MALAYSIA_STATES_DATA[stateId];
    if (!data) return "rgba(255, 255, 255, 0.05)";

    if (data.isOrigin) {
      if (isSelected) return "#15803d"; // emerald-700
      if (isHovered) return "#16a34a"; // emerald-600
      return "#1e613b"; // rich forest emerald
    }

    const markupPct = getMarkupPct(data.prices[DISPLAY_GRADE], DISPLAY_GRADE);

    if (isSelected) {
      return "#143825"; // active state
    }

    if (isHovered) {
      return "#19442e"; // hovered state
    }

    // Gradient based on markup range:
    if (markupPct > 50) {
      return "rgba(225, 29, 72, 0.22)"; // subtle crimson for high markup hubs
    } else if (markupPct > 35) {
      return "rgba(217, 119, 6, 0.20)"; // amber
    } else {
      return "rgba(255, 255, 255, 0.07)"; // sleek subtle glass
    }
  };

  const getStateStrokeColor = (
    stateId: string,
    isHovered: boolean,
    isSelected: boolean
  ) => {
    const data = MALAYSIA_STATES_DATA[stateId];
    if (isSelected) return "#D4F63D"; // electric lime border for selected state
    if (isHovered) return "#D4F63D"; // electric lime on hover
    if (data?.isOrigin) return "#22c55e";
    return "rgba(255, 255, 255, 0.18)";
  };

  const handleMouseMove = (
    e: React.MouseEvent<SVGPathElement>,
    stateId: string
  ) => {
    setHoveredStateId(stateId);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredStateId(null);
    setTooltipPos(null);
  };

  const hoveredState: StatePriceData | null = hoveredStateId
    ? MALAYSIA_STATES_DATA[hoveredStateId] || null
    : null;
  const hoveredMarkupPct = hoveredState
    ? getMarkupPct(hoveredState.prices[DISPLAY_GRADE], DISPLAY_GRADE)
    : 0;

  return (
    <section id="price-map" className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Dark Forest Green Bento Card Container (Matching reference image) */}
      <div className="bg-[#0C2317] text-white rounded-[36px] p-6 sm:p-10 md:p-12 border border-white/10 shadow-2xl overflow-hidden relative">
        {/* Top Header Row inside the dark container */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8 mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading tracking-tight font-bold text-white">
              Making Price Discovery <br />
              <span className="text-[#D4F63D]">Fair & Transparent</span>
            </h2>
            <p className="text-sm sm:text-base text-white/70 mt-3 max-w-xl leading-relaxed">
              Tracked against the Bario highland base of{" "}
              <strong className="text-[#D4F63D] font-mono">
                RM {farmgateBase.toFixed(2)}/kg
              </strong>
              . Every state shows all three grades at once, no switcher
              needed.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="inline-flex items-center bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10 shrink-0">
            <button
              onClick={() => setViewMode("map")}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === "map"
                  ? "bg-[#D4F63D] text-black font-bold shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <MapTrifoldIcon className="size-3.5" /> Map
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#D4F63D] text-black font-bold shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <TableIcon className="size-3.5" /> Directory
            </button>
          </div>
        </div>

        {viewMode === "map" ? (
          <div className="flex flex-col gap-8">
            {/* Map Canvas, full width */}
            <div
              onMouseLeave={handleMouseLeave}
              className="bg-[#07170e] border border-white/10 rounded-[28px] p-4 sm:p-6 relative overflow-hidden"
            >
              {/* Map Canvas Quick Bar */}
              <div className="flex items-center justify-between text-xs text-white/60 border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-white/90">
                    <span className="size-2 rounded-full bg-[#D4F63D]" />
                    Highland Base: RM {farmgateBase.toFixed(2)}/kg
                  </span>
                  <span className="hidden sm:inline-block text-[11px] text-white/50">
                    Click any state to see its full breakdown below
                  </span>
                </div>
                <button
                  onClick={() => setSelectedStateId("MY13")}
                  className="text-[11px] font-semibold text-[#D4F63D] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <SparkleIcon weight="fill" className="size-3 text-[#D4F63D]" /> Jump to Origin (Bario)
                </button>
              </div>

              {/* Vector Map Container */}
              <div className="relative w-full aspect-1000/390 select-none my-2">
                <svg viewBox="0 0 1000 332" className="w-full h-full">
                  <defs>
                    <filter id={`glow-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow
                        dx="0"
                        dy="0"
                        stdDeviation="6"
                        floodColor="#D4F63D"
                        floodOpacity="0.45"
                      />
                    </filter>
                  </defs>

                  {/* SVG Paths */}
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
                          strokeWidth={isSelected ? "2.2" : isHovered ? "1.8" : "0.75"}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          className="cursor-pointer transition-all duration-150 motion-reduce:transition-none"
                          style={{
                            transformOrigin: `${statePath.centroid.x}px ${statePath.centroid.y}px`,
                            transform: isHovered ? "scale(1.012)" : "none",
                          }}
                          filter={isSelected || isHovered ? `url(#glow-${filterId})` : undefined}
                          onClick={() => setSelectedStateId(statePath.id)}
                          onMouseMove={(e) => handleMouseMove(e, statePath.id)}
                          onMouseLeave={handleMouseLeave}
                        />
                      );
                    })}
                  </g>

                  {/* Bario Highland Origin Pin in Sarawak */}
                  <g transform="translate(738, 175)" className="pointer-events-none">
                    <circle
                      r="5"
                      className="fill-[#D4F63D] stroke-2 stroke-black shadow-lg"
                    />
                    {/* Origin Tag */}
                    <g transform="translate(10, -9)">
                      <rect
                        x="0"
                        y="0"
                        width="118"
                        height="20"
                        rx="6"
                        fill="#0C2317"
                        stroke="#D4F63D"
                        strokeWidth="1"
                      />
                      <text
                        x="7"
                        y="13.5"
                        className="text-[8.5px] font-sans font-bold fill-[#D4F63D]"
                      >
                        ★ Bario Highlands (1,100m+)
                      </text>
                    </g>
                  </g>
                </svg>
              </div>

              {/* Map Footer Legend */}
              <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
                <div className="flex flex-wrap items-center gap-5">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-[#D4F63D]" />
                    <span className="text-white/90">Highland Origin (Sarawak)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-amber-400/80" />
                    <span>Regional Freight (+30-50%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-rose-500/80" />
                    <span>Urban Retail Corridors (&gt;50%)</span>
                  </span>
                </div>
                <div className="text-[11px] font-mono text-white/50">
                  Sarawak DOA Audit 2026
                </div>
              </div>
            </div>

            {/* State detail, always visible below the map, swaps on click */}
            <StatePriceCard
              stateData={selectedState}
              activeGrade={DISPLAY_GRADE}
              onVerifyBatchClick={onVerifyBatchClick}
            />
          </div>
        ) : (
          /* Directory Table View inside the dark container */
          <div className="bg-[#07170e] border border-white/10 rounded-[28px] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-white/80">
                <thead className="bg-white/5 border-b border-white/10 text-white/50 uppercase tracking-wider font-mono text-[10px]">
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
                <tbody className="divide-y divide-white/5">
                  {Object.values(MALAYSIA_STATES_DATA).map((state) => {
                    const isSelected = state.id === selectedStateId;
                    const markup = getMarkupPct(state.prices.A1, "A1").toFixed(1);

                    return (
                      <tr
                        key={state.id}
                        className={`hover:bg-white/5 transition-colors cursor-pointer ${
                          isSelected ? "bg-white/10 text-white font-medium" : ""
                        }`}
                        onClick={() => {
                          setSelectedStateId(state.id);
                          setViewMode("map");
                        }}
                      >
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                          {state.name}
                          {state.isOrigin && (
                            <span className="text-[10px] bg-[#D4F63D] text-black px-2 py-0.5 rounded-full font-bold">
                              Origin
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-white/60">
                          {state.region} ({state.id})
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#D4F63D]">
                          RM {state.prices.A1.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-white/70">
                          RM {state.prices.A2.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-white/70">
                          RM {state.prices.B.toFixed(2)}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-mono font-bold ${
                            Number(markup) > 50
                              ? "text-rose-400"
                              : "text-[#D4F63D]"
                          }`}
                        >
                          +{markup}%
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {state.stockistCount} stores
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                              state.status === "verified"
                                ? "bg-emerald-950/80 text-[#D4F63D] border border-emerald-700/60"
                                : state.status === "high_risk"
                                ? "bg-rose-950/80 text-rose-400 border border-rose-800/60"
                                : "bg-amber-950/80 text-amber-300 border border-amber-800/60"
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
                            className="text-xs text-[#D4F63D] hover:underline font-semibold"
                          >
                            View on Map →
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
      </div>

      {/* Floating hover tooltip, fixed to the viewport so it tracks the cursor
          regardless of scroll/nesting, cleared on scroll and on leaving the map */}
      {tooltipPos && hoveredState && (
        <div
          className="fixed pointer-events-none z-30 -translate-x-1/2 -translate-y-[calc(100%+14px)]"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="bg-[#0e2a1b] text-white border border-[#D4F63D]/50 px-4 py-3 rounded-2xl shadow-2xl text-left whitespace-nowrap min-w-42.5 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-1.5 mb-2">
              <span className="font-heading font-bold text-xs text-white">
                {hoveredState.name}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-white/70">
                {hoveredState.id}
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[11px] text-white/60">
                Grade {DISPLAY_GRADE} shelf:
              </span>
              <span className="text-sm font-mono font-extrabold text-[#D4F63D]">
                RM {hoveredState.prices[DISPLAY_GRADE].toFixed(2)}/kg
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-1 text-[11px]">
              <span className="text-white/60">Distribution markup:</span>
              <span
                className={`font-mono font-bold ${
                  hoveredMarkupPct > 50 ? "text-rose-400" : "text-[#D4F63D]"
                }`}
              >
                +{hoveredMarkupPct.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
