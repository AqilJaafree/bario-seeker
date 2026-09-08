"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

import { ProducerCard } from "@/components/marketplace/producer-card";
import type { GradeKey } from "@/lib/chain/bario";
import type { ProducerSummary } from "@/lib/chain/types";

/**
 * Search and grade filtering over the producer list.
 *
 * Only this part is a Client Component; the list itself is fetched from the
 * chain on the server, so the page renders complete before any JavaScript.
 */
const GRADE_FILTERS: { key: GradeKey | "all"; label: string }[] = [
  { key: "all", label: "All Grades" },
  { key: "a1", label: "Grade A1" },
  { key: "a2", label: "Grade A2" },
  { key: "b", label: "Grade B" },
  { key: "pending", label: "Ungraded" },
];

export function ProducerBrowser({ producers }: { producers: ProducerSummary[] }) {
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState<GradeKey | "all">("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return producers.filter((producer) => {
      const matchesQuery =
        !query ||
        producer.name.toLowerCase().includes(query) ||
        producer.location.toLowerCase().includes(query);

      // Filter on the producer's most recent harvest, which is what the card
      // shows — filtering on any batch would surface cards that contradict it.
      const matchesGrade = grade === "all" || producer.latestBatch?.grade === grade;

      return matchesQuery && matchesGrade;
    });
  }, [producers, search, grade]);

  return (
    <>
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

        <div className="inline-flex items-center bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-1 rounded-full self-start overflow-x-auto">
          {GRADE_FILTERS.map((option) => (
            <button
              key={option.key}
              onClick={() => setGrade(option.key)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                grade === option.key
                  ? "bg-[#D4F63D] text-black shadow-sm"
                  : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="pb-8">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((producer) => (
              <ProducerCard key={producer.producerPda} producer={producer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-sm text-black/50 dark:text-white/50">
            No producers match that search.
          </div>
        )}
      </section>
    </>
  );
}
