import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  MapPinIcon,
  ShieldCheckIcon,
  StarIcon,
} from "@phosphor-icons/react/dist/ssr";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BatchPurchase } from "@/components/marketplace/batch-purchase";
import { toDeg } from "@/lib/chain/bario";
import { loadProducer } from "@/lib/chain/queries";
import type { ProducerView } from "@/lib/chain/types";

/**
 * A producer, read from the chain and keyed by their Producer PDA.
 *
 * Deliberately generic imagery: the ledger holds a name, coordinates, an
 * elevation and a join date — no portrait — and captioning a stock photograph
 * with a real farmer's name would be the kind of small dishonesty this whole
 * product exists to argue against.
 */
const GALLERY_IMAGES = [
  "/images/bario-terrace.jpg",
  "/images/bario-grains.jpg",
  "/images/bario-farmer.jpg",
];

const explorerUrl = (address: string, cluster: string) =>
  `https://explorer.solana.com/address/${address}` +
  (cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ producerId: string }>;
}): Promise<Metadata> {
  const { producerId } = await params;
  const producer = await loadProducer(producerId).catch(() => null);
  return producer
    ? {
        title: `${producer.name} — Bario Seeker`,
        description: `${producer.name} farms at ${producer.elevationM} m in the Kelabit Highlands, with ${producer.batchCount} certified harvests on-chain.`,
      }
    : { title: "Producer not found — Bario Seeker" };
}

export default async function ProducerDetailPage({
  params,
}: {
  params: Promise<{ producerId: string }>;
}) {
  const { producerId } = await params;

  let producer: ProducerView | null = null;
  let unreachable = false;
  try {
    producer = await loadProducer(producerId);
  } catch {
    unreachable = true;
  }

  if (!producer) {
    return (
      <div className="min-h-screen bg-[#F5F6F1] dark:bg-[#111813] text-[#111813] dark:text-[#F5F6F1] flex flex-col items-center justify-center gap-4 font-sans px-6 text-center">
        <p className="text-sm text-black/60 dark:text-white/60 max-w-md">
          {unreachable
            ? "Could not reach the network to load this producer. Try again in a moment."
            : "No producer certificate exists at that address."}
        </p>
        <Link
          href="/marketplace"
          className="text-sm font-semibold text-[#0C2317] dark:text-[#D4F63D] hover:underline"
        >
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const initials = producer.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  const since = new Date(producer.joinedAt).getFullYear();

  return (
    <div className="min-h-screen bg-[#F5F6F1] dark:bg-[#111813] text-[#111813] dark:text-[#F5F6F1] flex flex-col font-sans selection:bg-[#D4F63D] selection:text-black">
      <div className="w-full mx-auto space-y-10 px-4 lg:px-0 max-w-7xl">
        <div className="pt-6">
          <Navbar />
        </div>

        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          All producers
        </Link>

        <section className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-4/3 rounded-[28px] overflow-hidden bg-[#0C2317]">
              <Image
                src={GALLERY_IMAGES[0]}
                alt="Bario highland rice terraces"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {GALLERY_IMAGES.map((src) => (
                <div
                  key={src}
                  className="relative aspect-square rounded-2xl overflow-hidden"
                >
                  <Image
                    src={src}
                    alt="Bario rice"
                    fill
                    sizes="33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-black/45 dark:text-white/45">
              Photographs of the Bario highlands. The ledger does not hold
              producer portraits.
            </p>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="size-14 rounded-2xl bg-[#0C2317] text-[#D4F63D] flex items-center justify-center shrink-0 font-heading text-lg">
                {initials}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-[#0C2317] dark:text-white">
                  {producer.name}
                </h1>
                <p className="text-sm text-black/60 dark:text-white/60 flex items-center gap-1.5 mt-1">
                  <MapPinIcon className="size-4 shrink-0" />
                  {producer.location} · {producer.elevationM} m
                </p>
                <div className="flex items-center gap-3 mt-2 text-sm">
                  {producer.rating !== null ? (
                    <span className="inline-flex items-center gap-1">
                      <StarIcon weight="fill" className="size-4 text-amber-500" />
                      {producer.rating.toFixed(1)}
                      <span className="text-black/50 dark:text-white/50">
                        ({producer.reviewCount})
                      </span>
                    </span>
                  ) : (
                    <span className="text-black/50 dark:text-white/50 text-xs">
                      Not yet rated
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                    <ShieldCheckIcon weight="fill" className="size-3.5" />
                    Verified producer
                  </span>
                </div>
              </div>
            </div>

            <BatchPurchase
              producerName={producer.name}
              batches={producer.batches}
            />
          </div>
        </section>

        {/* About, assembled from the ledger */}
        <section className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[28px] p-6 space-y-4">
          <h2 className="font-heading font-bold text-lg">
            About {producer.name}
          </h2>
          <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed max-w-[70ch]">
            {producer.name} has held a Producer SBT since {since}, issued
            against a farm at {producer.elevationM} m — above the 1,100 m
            threshold the program enforces on chain for Bario rice. They have
            registered {producer.batchCount}{" "}
            {producer.batchCount === 1 ? "harvest" : "harvests"}, each minted as
            a certificate inside this producer&apos;s own collection. Neither
            certificate can be transferred, sold or burned.
          </p>
          <dl className="grid sm:grid-cols-2 gap-y-2 gap-x-6 text-sm border-t border-black/10 dark:border-white/10 pt-4">
            <dt className="text-black/50 dark:text-white/50">Farm coordinates</dt>
            <dd className="sm:text-right font-mono">
              {toDeg(producer.farmLat).toFixed(4)},{" "}
              {toDeg(producer.farmLon).toFixed(4)}
            </dd>
            <dt className="text-black/50 dark:text-white/50">Producer SBT</dt>
            <dd className="sm:text-right font-mono truncate">
              <a
                href={explorerUrl(producer.producerAsset, producer.cluster)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-700 dark:text-[#D4F63D] hover:underline"
              >
                {producer.producerAsset.slice(0, 8)}…
                {producer.producerAsset.slice(-8)}
                <ArrowSquareOutIcon className="size-3" />
              </a>
            </dd>
          </dl>
        </section>

        {/* Reviews */}
        <section className="space-y-4 pb-10">
          <h2 className="font-heading font-bold text-lg">
            Ratings ({producer.reviewCount})
          </h2>

          {producer.reviews.length === 0 ? (
            <p className="text-sm text-black/60 dark:text-white/60">
              No shopper has rated a harvest from {producer.name} yet.
            </p>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                {producer.reviews.map((review) => (
                  <div
                    key={`${review.batchPda}-${review.reviewer}`}
                    className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            weight={star <= review.rating ? "fill" : "regular"}
                            className={`size-3.5 ${
                              star <= review.rating
                                ? "text-amber-500"
                                : "text-black/20 dark:text-white/20"
                            }`}
                          />
                        ))}
                      </span>
                      <span className="text-xs text-black/50 dark:text-white/50">
                        {new Date(review.createdAt).toLocaleDateString("en-MY", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-black/60 dark:text-white/60 font-mono">
                      {review.reviewer} · batch {review.batchCode}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-black/50 dark:text-white/50">
                The chain records the star rating, who left it and when. Review
                text is stored off-chain and is not shown here.
              </p>
            </>
          )}
        </section>

        <Footer />
      </div>
    </div>
  );
}
