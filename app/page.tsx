"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MalaysiaMap } from "@/components/map/malaysia-map";
import { BatchVerifyModal } from "@/components/verification/batch-verify-modal";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { LimeButton } from "@/components/ui/lime-button";
import { QrCodeIcon } from "@phosphor-icons/react";

export default function Home() {
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F6F1] dark:bg-[#111813] text-[#111813] dark:text-[#F5F6F1] flex flex-col font-sans selection:bg-[#D4F63D] selection:text-black">
      {/* Main Container Wrapper */}
      <div className="w-full mx-auto space-y-12">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION: Full-width rounded card with highland terrace background */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden min-h-145 md:min-h-165 flex flex-col justify-between p-6 sm:p-10 text-white">
          {/* Background Image with Dark Vignette Gradient */}
          <div className="absolute inset-0 z-10">
            <Image
              src="/images/bario-hero.jpg"
              alt="Bario Highland Rice Terraces, Sarawak"
              fill
              priority
              className="object-cover object-center brightness-[0.88] contrast-[1.05]"
            />
            {/* Soft dark gradient overlays so topbar and bottom text are legible */}
            <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/20 to-black/85" />
          </div>

          <Navbar onVerifyClick={() => setIsVerifyModalOpen(true)} />

          {/* Hero Bottom Split Content */}
          <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-8 pt-24 pb-4 z-20">
            {/* Left Big Headline */}
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold tracking-tight text-white leading-[1.08] drop-shadow-lg">
                Know Your Bario Rice.
              </h1>
            </div>

            {/* Right Description & Quick CTA */}
            <div className="max-w-md space-y-4">
              <p className="text-xs sm:text-sm text-white/85 leading-relaxed drop-shadow-md">
                Every bag traces back to a real Kelabit farmer, with the grade
                and price checked by us before it hits the shelf.
                <br />
                Scan the code. Know what you&apos;re paying for.
              </p>

              {/* Instant Search Bar inside Hero */}
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center bg-black/55 backdrop-blur-md border border-white/20 rounded-full p-1.5 shadow-xl focus-within:ring-2 focus-within:ring-[#D4F63D]"
              >
                <div className="pl-3.5 text-white/60">
                  <QrCodeIcon className="size-4" />
                </div>
                <input
                  type="text"
                  placeholder="Enter bag serial (e.g. 2026-11-001)"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs bg-transparent border-none text-white placeholder:text-white/50 focus:outline-none"
                />
                <LimeButton
                  type="submit"
                  className="gap-1.5 text-xs px-3.5 py-1.5 shrink-0"
                >
                  <span>Verify Batch</span>
                  <ArrowCircle
                    size="size-4"
                    iconSize="size-2.5"
                    animated={false}
                    stroke={false}
                  />
                </LimeButton>
              </form>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. MISSION & BENTO GRID ("Farming Made Smarter" Style)                    */}
        {/* ========================================================================= */}
        <section
          id="mission"
          className="space-y-8 pt-4 max-w-7xl mx-auto px-4 lg:px-0"
        >
          {/* Top Pill & Two-Column Split */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-white/5 text-xs text-black/80 dark:text-white/80 font-semibold shadow-2xs">
              <span>Grown in Bario. Nowhere else.</span>
            </div>

            <div className="max-w-3xl space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold tracking-tight text-[#0C2317] dark:text-white leading-[1.15]">
                Half the &quot;Bario&quot; rice on shelves isn&apos;t Bario. We fix that.
              </h2>

              <p className="text-base sm:text-lg text-[#0C2317]/80 dark:text-white/75 leading-relaxed max-w-[65ch]">
                Nearly half the rice sold as Bario in KL supermarkets isn&apos;t.
                Grades get invented. Prices swing from RM18 to RM28 for the
                same bag. We check every batch at the mill, print a code you
                can scan, and show you what the farmer got paid, so you know
                what you&apos;re buying and they get their share.
              </p>

              <div className="pt-1">
                <LimeButton
                  as="a"
                  href="#price-map"
                  className="gap-2 text-xs px-5 py-2.5 shadow-xs"
                >
                  <span>See Prices in Your State</span>
                  <ArrowCircle />
                </LimeButton>
              </div>
            </div>
          </div>

          {/* Bento Grid Row (Matches the 4-column card row in the reference) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Bento Card 1: Farmer Photo */}
            <div className="relative h-64 rounded-[28px] overflow-hidden shadow-sm border border-black/5 group">
              <Image
                src="/images/bario-farmer.jpg"
                alt="Kelabit farmer in Pa' Dalih, Bario"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-sm font-bold">
                Pa&apos; Dalih &amp; Bario Asal
              </div>
            </div>

            {/* Bento Card 2: Stat Card 1 */}
            <div className="h-64 rounded-[28px] bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-6 flex flex-col justify-between shadow-sm">
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-black/50 dark:text-white/50">
                Guaranteed Farmgate
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-heading font-extrabold text-[#0C2317] dark:text-white tracking-tight">
                  RM 15.50
                  <span className="text-sm font-normal text-black/50 dark:text-white/50 ml-1">
                    /kg
                  </span>
                </div>
                <p className="text-xs text-black/70 dark:text-white/70 mt-2 leading-relaxed">
                  Realised direct payout to smallholders, preventing middleman
                  price erosion.
                </p>
              </div>
              <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
                +25-40% over the old middleman route
              </div>
            </div>

            {/* Bento Card 3: Photo of Grains in Hands */}
            <div className="relative h-64 rounded-[28px] overflow-hidden shadow-sm border border-black/5 group">
              <Image
                src="/images/bario-grains.jpg"
                alt="Raw Bario rice grains, Grade A1"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-sm font-bold">
                Grade A1: whole grain, low moisture
              </div>
            </div>

            {/* Bento Card 4: Solid Lime Green Accent Card */}
            <div className="h-64 rounded-[28px] bg-[#D4F63D] border border-black/10 p-6 flex flex-col justify-between shadow-sm text-black">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-black/70">
                One Farmer, One Code
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight text-black">
                  100%
                </div>
                <p className="text-xs text-black/85 font-medium mt-2 leading-relaxed">
                  Every certified farmer above 1,100m gets a permanent ID.
                  Bags carry it. Nobody can fake it or resell it.
                </p>
              </div>
              <div className="text-[11px] font-bold text-black/90">
                Impossible to counterfeit
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. CORE MAP FEATURE ("Making Farming Easier and Better" Style)            */}
        {/* ========================================================================= */}
        <MalaysiaMap onVerifyBatchClick={() => setIsVerifyModalOpen(true)} />

        {/* ========================================================================= */}
        {/* 4. VALUE CHAIN JOURNEY ("Farming Smarter Starts Here" Style)              */}
        {/* ========================================================================= */}
        <section
          id="journey"
          className="space-y-6 pt-4 max-w-7xl mx-auto px-4 lg:px-0"
        >
          <div className="max-w-[65ch] space-y-3">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-[#0C2317] dark:text-white">
              From Bario Mill to KL Shelf — Every Ringgit Accounted For
            </h2>
            <p className="text-xs sm:text-sm text-black/70 dark:text-white/70">
              Bario rice sits outside government price controls. So we track
              every markup ourselves — mill, freight, retail — and flag any
              shelf that overcharges.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Collage Photos */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="relative rounded-[28px] overflow-hidden min-h-65 border border-black/5 shadow-xs">
                <Image
                  src="/images/bario-terrace.jpg"
                  alt="Highland terraces, origin of the harvest"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="relative rounded-[28px] overflow-hidden min-h-65 border border-black/5 shadow-xs">
                <Image
                  src="/images/bario-grains.jpg"
                  alt="Lab-audited Bario rice grains"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right: 3 Step Action Rows (Matching right column in reference) */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-3">
              {/* Row 1 */}
              <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-[28px] flex items-center justify-between gap-4 shadow-sm hover:border-[#0C2317] dark:hover:border-white/30 transition-all group">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                    Guaranteed Base
                  </span>
                  <h4 className="text-base sm:text-lg font-heading font-bold text-[#0C2317] dark:text-white mt-1">
                    Bario Highland Farmgate Mill
                  </h4>
                  <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">
                    Cooperative payout to Ruben Kalang and registered
                    smallholders.
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono text-lg sm:text-xl font-bold text-[#0C2317] dark:text-white">
                    RM 15.50/kg
                  </span>
                  <ArrowCircle
                    size="size-8"
                    iconSize="size-4"
                    variant="light"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-[28px] flex items-center justify-between gap-4 shadow-sm hover:border-[#0C2317] dark:hover:border-white/30 transition-all group">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                    Freight and Lab Audit
                  </span>
                  <h4 className="text-base sm:text-lg font-heading font-bold text-[#0C2317] dark:text-white mt-1">
                    Kuching & Miri Regional Logistics Drop
                  </h4>
                  <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">
                    Moisture analysis, grain integrity audit, and per-bag QR
                    minting (+12.9%).
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono text-lg sm:text-xl font-bold text-[#0C2317] dark:text-white">
                    RM 17.50/kg
                  </span>
                  <ArrowCircle
                    size="size-8"
                    iconSize="size-4"
                    variant="light"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-5 rounded-[28px] flex items-center justify-between gap-4 shadow-sm hover:border-[#0C2317] dark:hover:border-white/30 transition-all group">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/60">
                    Certified Retail
                  </span>
                  <h4 className="text-base sm:text-lg font-heading font-bold text-[#0C2317] dark:text-white mt-1">
                    Peninsula Supermarket Shelves (KL / JB)
                  </h4>
                  <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">
                    Air freight, verified merchandising, retail margin. Any
                    shelf exceeding RM28/kg is flagged.
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono text-lg sm:text-xl font-bold text-[#0C2317] dark:text-white">
                    RM 24.50/kg
                  </span>
                  <ArrowCircle
                    size="size-8"
                    iconSize="size-4"
                    variant="light"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. FARMER TESTIMONIAL CARD ("What Farmers Are Saying" Style)              */}
        {/* ========================================================================= */}
        <section
          id="testimonials"
          className="pt-4 max-w-7xl mx-auto px-4 lg:px-0"
        >
          <div className="bg-[#0C2317] text-white rounded-[36px] p-8 sm:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Subtle background contour wave */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-linear-to-bl from-white/5 to-transparent rounded-full pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Quote text */}
              <div className="lg:col-span-8 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#D4F63D] text-xs font-mono font-bold border border-white/10">
                  <span>Producer Testimony</span>
                </div>

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-white tracking-tight leading-snug">
                  “Buyers in KL scan the bag and see my name. My family’s
                  name. Last harvest we got{" "}
                  <span className="text-[#D4F63D] underline decoration-[#D4F63D]/40">
                    40% more
                  </span>{" "}
                  for the same rice we used to sell wholesale.”
                </h3>

                <div>
                  <div className="font-bold text-base text-white">
                    Ruben Kalang & Family
                  </div>
                  <div className="text-xs text-[#D4F63D] font-mono">
                    Producer SBT #BAR-402, Bario Asal Lembaa (1,180m)
                  </div>
                </div>
              </div>

              {/* Farmer photo card */}
              <div className="lg:col-span-4 flex flex-col items-center lg:items-end gap-2">
                <div className="relative w-64 h-80 rounded-[28px] overflow-hidden border-2 border-[#D4F63D] shadow-2xl">
                  <Image
                    src="/images/bario-farmer.jpg"
                    alt="Ruben Kalang, farmer since 2015"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-[11px] text-white/60 font-mono">
                  Ruben Kalang, farming since 2015
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. MINIMALIST FOOTER                                                      */}
        {/* ========================================================================= */}
        <Footer />
      </div>

      {/* Batch Verification Modal */}
      <BatchVerifyModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
      />
    </div>
  );
}
