"use client";

import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProducerCard } from "@/components/marketplace/producer-card";
import { PRODUCERS, getLatestBatch } from "@/lib/data/producers";
import { RiceGrade } from "@/lib/data/malaysia-prices";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

const GRADE_FILTERS: (RiceGrade | "All")[] = ["All", "A1", "A2", "B"];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<RiceGrade | "All">("All");

  const filteredProducers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return PRODUCERS.filter((producer) => {
      const matchesQuery =
        !query ||
        producer.name.toLowerCase().includes(query) ||
        producer.location.toLowerCase().includes(query);

      const matchesGrade =
        gradeFilter === "All" ||
        getLatestBatch(producer).grade === gradeFilter;

      return matchesQuery && matchesGrade;
    });
  }, [search, gradeFilter]);

  return (
    <div className="min-h-screen bg-[#F5F6F1] dark:bg-[#111813] text-[#111813] dark:text-[#F5F6F1] flex flex-col font-sans selection:bg-[#D4F63D] selection:text-black">
      <div className="w-full mx-auto space-y-10 px-4 lg:px-0 max-w-7xl">
        <div className="pt-6">
          <Navbar />
        </div>

        {/* Header */}
        <section className="space-y-4 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-white/5 text-xs text-black/80 dark:text-white/80 font-semibold shadow-2xs">
            <span>{PRODUCERS.length} registered producers</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold tracking-tight text-[#0C2317] dark:text-white leading-[1.15]">
            Meet the Farmers Behind Every Bag
          </h1>
          <p className="text-sm sm:text-base text-black/70 dark:text-white/70 max-w-[65ch]">
            Every producer here holds a non-transferable Producer SBT. Browse
            their farms and harvest grades, then buy straight from the batch.
          </p>
        </section>

        {/* Filters */}
        <section className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full px-4 py-2.5 w-full sm:max-w-sm">
            <MagnifyingGlassIcon className="size-4 text-black/40 dark:text-white/40 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or village"
              className="w-full bg-transparent border-none text-sm focus:outline-none placeholder:text-black/40 dark:placeholder:text-white/40"
            />
          </div>

          <div className="inline-flex items-center bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-1 rounded-full self-start">
            {GRADE_FILTERS.map((grade) => (
              <button
                key={grade}
                onClick={() => setGradeFilter(grade)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  gradeFilter === grade
                    ? "bg-[#D4F63D] text-black shadow-sm"
                    : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                }`}
              >
                {grade === "All" ? "All Grades" : `Grade ${grade}`}
              </button>
            ))}
          </div>
        </section>

        {/* Grid */}
        <section className="pb-8">
          {filteredProducers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducers.map((producer) => (
                <ProducerCard key={producer.id} producer={producer} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-sm text-black/50 dark:text-white/50">
              No producers match that search.
            </div>
          )}
        </section>

        <Footer />
      </div>
    </div>
  );
}
