"use client";

import React, { useState } from "react";
import { MalaysiaMap } from "@/components/map/malaysia-map";
import { BatchVerifyModal } from "@/components/verification/batch-verify-modal";
import {
  ShieldCheck,
  MagnifyingGlass,
  QrCode,
  Sparkle,
  TrendUp,
  CheckCircle,
  Plant,
  Certificate,
  ArrowsLeftRight,
  ArrowUpRight,
  Scales,
} from "@phosphor-icons/react";

export default function Home() {
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Minimalist Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/90 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-foreground text-background flex items-center justify-center shadow-xs">
              <Plant weight="fill" className="size-5" />
            </div>
            <div>
              <span className="font-serif text-lg tracking-tight font-semibold block leading-none text-foreground">
                Bario Seeker
              </span>
              <span className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase block mt-0.5">
                Sarawak Highland Provenance
              </span>
            </div>
          </div>

          {/* Center Quick Search (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative max-w-xs w-full"
          >
            <MagnifyingGlass className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search batch (e.g. 2026-11-001)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-14 py-1.5 text-xs bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/60 rounded-full focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
            />
            <button
              type="submit"
              className="absolute right-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors cursor-pointer"
            >
              Verify
            </button>
          </form>

          {/* Right Action */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsVerifyModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all shadow-xs cursor-pointer"
            >
              <QrCode className="size-4" />
              <span>Verify Batch QR</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Minimalist Hero Section */}
      <section className="relative pt-12 pb-8 md:pt-18 md:pb-12 border-b border-border/60 overflow-hidden">
        {/* Subtle geometric backdrop glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-emerald-50/50 dark:from-emerald-950/20 to-transparent -z-10 blur-2xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 bg-muted/30 text-xs text-muted-foreground font-medium mb-5 shadow-2xs">
            <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>2026 Harvest Season Active</span>
            <span className="text-border">•</span>
            <span className="text-foreground">Sarawak DOA Traceability</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal tracking-tight text-foreground leading-[1.12]">
            Highland Purity. <br />
            <span className="italic font-light text-muted-foreground">
              Transparent Farm-to-Shelf Price.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every bag bound directly to verified Kelabit smallholders at
            1,100m+ elevation. Track authentic Malaysian shelf prices, inspect
            audited lab grades, and eliminate counterfeit markups.
          </p>

          {/* Quick Instant Batch Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-md mx-auto flex items-center bg-card border border-border/90 rounded-2xl p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-foreground/20 transition-all"
          >
            <div className="pl-3 text-muted-foreground">
              <QrCode className="size-5" />
            </div>
            <input
              type="text"
              placeholder="Enter bag serial or batch # (try 2026-11-001)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all shrink-0 cursor-pointer"
            >
              Verify Now
            </button>
          </form>

          {/* Key Metric Pills */}
          <div className="mt-8 pt-6 border-t border-border/40 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-3 bg-muted/20 rounded-xl border border-border/40">
              <div className="text-[11px] text-muted-foreground font-mono uppercase">
                Base Farmgate
              </div>
              <div className="text-lg font-mono font-semibold text-foreground mt-0.5">
                RM 15.50
                <span className="text-xs font-normal text-muted-foreground">
                  /kg
                </span>
              </div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                Paid to highland farmer
              </div>
            </div>

            <div className="p-3 bg-muted/20 rounded-xl border border-border/40">
              <div className="text-[11px] text-muted-foreground font-mono uppercase">
                KL Retail Average
              </div>
              <div className="text-lg font-mono font-semibold text-foreground mt-0.5">
                RM 24.50
                <span className="text-xs font-normal text-muted-foreground">
                  /kg
                </span>
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                +58% distribution markup
              </div>
            </div>

            <div className="p-3 bg-muted/20 rounded-xl border border-border/40">
              <div className="text-[11px] text-muted-foreground font-mono uppercase">
                Audited Grade
              </div>
              <div className="text-lg font-mono font-semibold text-foreground mt-0.5">
                Grade A1
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                &lt;5% broken, &lt;12% moisture
              </div>
            </div>

            <div className="p-3 bg-muted/20 rounded-xl border border-border/40">
              <div className="text-[11px] text-muted-foreground font-mono uppercase">
                Verification Time
              </div>
              <div className="text-lg font-mono font-semibold text-foreground mt-0.5">
                &lt; 2 Seconds
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Zero app / wallet needed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Feature: Interactive Malaysia State Price Map */}
      <MalaysiaMap onVerifyBatchClick={() => setIsVerifyModalOpen(true)} />

      {/* 4. Price Transparency Journey: Where value is added */}
      <section className="py-14 border-t border-border/60 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-mono font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block mb-1">
              End-to-End Price Visibility
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-foreground">
              Deconstructing the Price of Grade A1 Bario Rice
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Unlike commercial commodity rice, Bario specialty rice is exempt
              from statutory price controls. We make the distribution trail
              transparent to prevent opportunistic retail price gouging.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-card border border-border/80 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono border-b border-border/50 pb-2 mb-4">
                  <span>STAGE 01</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    100% PRODUCER VALUE
                  </span>
                </div>
                <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-800 dark:text-emerald-300 mb-3">
                  <Plant weight="fill" className="size-5" />
                </div>
                <h4 className="text-lg font-serif font-medium text-foreground">
                  Highland Farmgate
                </h4>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Collected directly from farmer cooperative mills in Bario Asal
                  Lembaa and Pa’ Dalih. Smallholders are guaranteed a base
                  price that reflects artisan hand-harvesting.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">
                  Co-op Payout
                </span>
                <span className="font-mono text-xl font-semibold text-foreground">
                  RM 15.50<span className="text-xs font-normal">/kg</span>
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-card border border-border/80 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono border-b border-border/50 pb-2 mb-4">
                  <span>STAGE 02</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    +12.9% DISTRIBUTION
                  </span>
                </div>
                <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-300 mb-3">
                  <ArrowsLeftRight className="size-5" />
                </div>
                <h4 className="text-lg font-serif font-medium text-foreground">
                  Logistics & Lab Audit
                </h4>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Highland turboprop / 4WD transport to Miri/Kuching hubs, batch
                  moisture and grain integrity laboratory audit, tamper-evident
                  bagging with serialised QR codes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">
                  Wholesale Drop
                </span>
                <span className="font-mono text-xl font-semibold text-foreground">
                  RM 17.50<span className="text-xs font-normal">/kg</span>
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-card border border-border/80 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono border-b border-border/50 pb-2 mb-4">
                  <span>STAGE 03</span>
                  <span className="text-rose-600 dark:text-rose-400 font-semibold">
                    +40.0% RETAIL MARGIN
                  </span>
                </div>
                <div className="size-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-700 dark:text-rose-300 mb-3">
                  <Scales className="size-5" />
                </div>
                <h4 className="text-lg font-serif font-medium text-foreground">
                  Peninsula Retail Shelf
                </h4>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Air freight to Klang Valley / Penang / Johor, store shelving,
                  and verified merchandising rights. Any price exceeding RM28/kg
                  is flagged for potential counterfeit adulteration.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">
                  Verified Retail Price
                </span>
                <span className="font-mono text-xl font-semibold text-foreground">
                  RM 24.50<span className="text-xs font-normal">/kg</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Minimalist Proof Pillars */}
      <section className="py-16 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="size-10 rounded-xl bg-muted/80 flex items-center justify-center text-foreground">
                <ShieldCheck weight="fill" className="size-5" />
              </div>
              <h4 className="text-lg font-serif font-medium text-foreground">
                Non-Transferable Soulbound ID
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Each Kelabit smallholder holds a permanent Soulbound certificate
                bound to government KYC and farm GPS elevation (≥1,100m).
                Certificates cannot be traded, resold, or detached.
              </p>
            </div>

            <div className="space-y-3">
              <div className="size-10 rounded-xl bg-muted/80 flex items-center justify-center text-foreground">
                <Certificate weight="fill" className="size-5" />
              </div>
              <h4 className="text-lg font-serif font-medium text-foreground">
                Independent Quality Grading
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No self-declared labels. Every batch is graded A1 (&lt;5%
                broken grain), A2, or B by accredited Sarawak laboratories.
                Full moisture analysis reports are immutably anchored.
              </p>
            </div>

            <div className="space-y-3">
              <div className="size-10 rounded-xl bg-muted/80 flex items-center justify-center text-foreground">
                <CheckCircle weight="fill" className="size-5" />
              </div>
              <h4 className="text-lg font-serif font-medium text-foreground">
                Built for Older Consumers
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No crypto jargon, no app download, no wallet setup. Point any
                smartphone camera at the bag QR code to see verified origin and
                price history in under 2 seconds.
              </p>
            </div>
          </div>

          {/* Quick Demo Verification Trigger Banner */}
          <div className="mt-12 bg-card border border-border/80 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-foreground text-background flex items-center justify-center shrink-0">
                <QrCode className="size-8" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold block">
                  Interactive Demo
                </span>
                <h4 className="text-xl font-serif font-medium text-foreground mt-0.5">
                  Experience the In-Store Consumer Verification Page
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Preview how Ruben Kalang’s Batch #2026-11-001 appears when
                  scanned in a supermarket aisle.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsVerifyModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-all shrink-0 cursor-pointer shadow-xs"
            >
              <span>View Sample Certificate</span>
              <ArrowUpRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. Minimalist Footer */}
      <footer className="mt-auto border-t border-border/60 py-8 bg-muted/30 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Plant weight="fill" className="size-4 text-emerald-600" />
            <span className="font-serif font-medium text-foreground">
              Bario Seeker
            </span>
            <span>— Canonical Domain: barioseeker.my</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <span>DOA Sarawak Surveillance Partner</span>
            <span>•</span>
            <span>PDPA 2010 Compliant</span>
            <span>•</span>
            <span>Exempt from Paddy and Rice Control Act 1994</span>
          </div>
        </div>
      </footer>

      {/* Batch Verification Modal */}
      <BatchVerifyModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        initialBatchId={searchInput.trim() || "2026-11-001"}
      />
    </div>
  );
}
