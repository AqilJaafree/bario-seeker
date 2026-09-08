import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProducerBrowser } from "@/components/marketplace/producer-browser";
import { listProducers } from "@/lib/chain/queries";
import type { ProducerSummary } from "@/lib/chain/types";

/**
 * Revalidate rather than prerender. Without this Next bakes the producer list
 * at build time, so a producer registered after deploy would never appear. The
 * window matches the query-layer cache: the ledger is append-only, so the list
 * is stale by seconds at worst.
 */
export const revalidate = 30;

export const metadata = {
  title: "Producers — Bario Seeker",
  description:
    "Every producer here holds a non-transferable Producer SBT, issued on-chain against a farm verified to sit in the Bario highlands.",
};

export default async function MarketplacePage() {
  let producers: ProducerSummary[] = [];
  let unreachable = false;
  try {
    producers = await listProducers();
  } catch {
    unreachable = true;
  }

  return (
    <div className="min-h-screen bg-[#F5F6F1] dark:bg-[#111813] text-[#111813] dark:text-[#F5F6F1] flex flex-col font-sans selection:bg-[#D4F63D] selection:text-black">
      <div className="w-full mx-auto space-y-10 px-4 lg:px-0 max-w-7xl">
        <div className="pt-6">
          <Navbar />
        </div>

        <section className="space-y-4 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-white/5 text-xs text-black/80 dark:text-white/80 font-semibold shadow-2xs">
            <span>
              {producers.length} registered{" "}
              {producers.length === 1 ? "producer" : "producers"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold tracking-tight text-[#0C2317] dark:text-white leading-[1.15]">
            Meet the Farmers Behind Every Bag
          </h1>
          <p className="text-sm sm:text-base text-black/70 dark:text-white/70 max-w-[65ch]">
            Every producer here holds a non-transferable Producer SBT, issued
            against a farm the program verified sits in the Bario highlands
            above 1,100 m. Browse their harvests and audited grades.
          </p>
        </section>

        {unreachable ? (
          <section className="py-16 text-center text-sm text-black/60 dark:text-white/60">
            Could not reach the network to load producers. This does not mean
            there are none — try again in a moment.
          </section>
        ) : (
          <ProducerBrowser producers={producers} />
        )}

        <Footer />
      </div>
    </div>
  );
}
