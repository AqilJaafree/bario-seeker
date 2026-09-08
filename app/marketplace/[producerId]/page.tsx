"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LimeButton } from "@/components/ui/lime-button";
import { GradeBadge } from "@/components/marketplace/grade-badge";
import { getProducerById } from "@/lib/data/producers";
import {
  StarIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  CertificateIcon,
  MinusIcon,
  PlusIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";

const GALLERY_IMAGES = [
  "/images/bario-grains.jpg",
  "/images/bario-terrace.jpg",
  "/images/bario-farmer.jpg",
];

export default function ProducerDetailPage() {
  const params = useParams<{ producerId: string }>();
  const producer = getProducerById(params.producerId);
  const [selectedBatchId, setSelectedBatchId] = useState(
    producer?.batches[0]?.batchId,
  );
  const [quantity, setQuantity] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  if (!producer) {
    return (
      <div className="min-h-screen bg-[#F5F6F1] dark:bg-[#111813] text-[#111813] dark:text-[#F5F6F1] flex flex-col items-center justify-center gap-4 font-sans">
        <p className="text-sm text-black/60 dark:text-white/60">
          Producer not found.
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

  const selectedBatch =
    producer.batches.find((b) => b.batchId === selectedBatchId) ??
    producer.batches[0];

  const gallery = [producer.photo, ...GALLERY_IMAGES];
  const pricePerBag = selectedBatch.sellPriceRmKg * selectedBatch.bagSizeKg;
  const maxQuantity = Math.min(selectedBatch.quantityBags, 20);

  const specs = [
    { label: "Grade", value: `Grade ${selectedBatch.grade}` },
    { label: "Harvested", value: selectedBatch.harvestDate },
    {
      label: "Audited",
      value: `${selectedBatch.auditDate} by ${selectedBatch.auditorOrg}`,
    },
    { label: "Broken Grain", value: `${selectedBatch.brokenGrainPct}%` },
    { label: "Moisture", value: `${selectedBatch.moisturePct}%` },
    { label: "Bag Size", value: `${selectedBatch.bagSizeKg}kg` },
    { label: "In Stock", value: `${selectedBatch.quantityBags} bags` },
    { label: "Certificate", value: selectedBatch.labCertificateId },
  ];

  const handleSelectBatch = (batchId: string) => {
    setSelectedBatchId(batchId);
    setQuantity(1);
    setOrderPlaced(false);
    setActiveImage(0);
  };

  const handleBuy = () => {
    setOrderPlaced(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F6F1] dark:bg-[#111813] text-[#111813] dark:text-[#F5F6F1] flex flex-col font-sans selection:bg-[#D4F63D] selection:text-black">
      <div className="w-full mx-auto space-y-12 px-4 lg:px-0 max-w-7xl">
        <div className="pt-6">
          <Navbar />
        </div>

        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Marketplace
        </Link>

        {/* Product */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Gallery */}
          <div className="flex flex-col gap-3">
            <div className="relative rounded-[28px] overflow-hidden aspect-square border border-black/10 dark:border-white/10 bg-white dark:bg-white/5">
              <Image
                src={gallery[activeImage]}
                alt={producer.name}
                fill
                className="object-cover"
              />
              <GradeBadge grade={selectedBatch.grade} className="absolute top-4 left-4" />
              <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-xs font-semibold text-white bg-emerald-700/90 backdrop-blur px-2.5 py-1 rounded-full">
                <ShieldCheckIcon weight="fill" className="size-3.5" />
                Verified
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {gallery.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-colors cursor-pointer ${
                    idx === activeImage
                      ? "border-[#0C2317] dark:border-[#D4F63D]"
                      : "border-transparent hover:border-black/20 dark:hover:border-white/20"
                  }`}
                >
                  <Image src={src} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6 lg:pt-2">
            <Link
              href={`/marketplace/${producer.id}`}
              className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white w-fit"
            >
              <span className="font-semibold text-[#0C2317] dark:text-white">
                {producer.name}
              </span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <StarIcon weight="fill" className="size-3.5" />
                {producer.rating} ({producer.reviewCount})
              </span>
            </Link>

            <div>
              <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-[#0C2317] dark:text-white leading-[1.05]">
                Bario Highland Rice
              </h1>
              <div className="text-sm font-mono text-black/40 dark:text-white/40 mt-2">
                Batch #{selectedBatch.batchId} &middot; Grade{" "}
                {selectedBatch.grade}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-mono font-extrabold text-[#0C2317] dark:text-white">
                RM {pricePerBag.toFixed(2)}
              </span>
              <span className="text-base text-black/50 dark:text-white/50">
                / {selectedBatch.bagSizeKg}kg bag
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-black/60 dark:text-white/60">
              <MapPinIcon className="size-4" />
              {producer.location}
            </div>

            <p className="text-base text-black/70 dark:text-white/70 leading-relaxed max-w-[60ch]">
              {producer.bio}
            </p>

            {/* Batch (variant) selector */}
            {producer.batches.length > 1 && (
              <div>
                <div className="text-xs uppercase tracking-wider text-black/50 dark:text-white/50 font-semibold mb-2">
                  Harvest Batch
                </div>
                <div className="flex flex-wrap gap-2">
                  {producer.batches.map((batch) => (
                    <button
                      key={batch.batchId}
                      onClick={() => handleSelectBatch(batch.batchId)}
                      className={`text-sm font-mono font-semibold px-4 py-2 rounded-full border transition-all cursor-pointer ${
                        batch.batchId === selectedBatch.batchId
                          ? "bg-[#0C2317] text-white border-[#0C2317] dark:bg-[#D4F63D] dark:text-black dark:border-[#D4F63D]"
                          : "bg-white dark:bg-white/5 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:border-[#0C2317] dark:hover:border-white/30"
                      }`}
                    >
                      {batch.batchId} &middot; {batch.grade}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Specs */}
            <dl className="border-t border-black/10 dark:border-white/10 pt-5 space-y-3.5">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-baseline justify-between gap-4"
                >
                  <dt className="text-xs uppercase tracking-wider text-black/50 dark:text-white/50 font-semibold shrink-0">
                    {spec.label}
                  </dt>
                  <dd className="text-sm font-medium text-[#0C2317] dark:text-white text-right">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>

            <Link
              href={`/verify/${selectedBatch.batchId}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0C2317] dark:text-[#D4F63D] hover:underline w-fit"
            >
              <CertificateIcon className="size-4" />
              View Certificate
            </Link>

            {/* Quantity + Buy */}
            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex items-center border border-black/10 dark:border-white/10 rounded-full bg-white dark:bg-white/5 w-fit shrink-0">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="size-11 flex items-center justify-center cursor-pointer text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                >
                  <MinusIcon className="size-4" />
                </button>
                <span className="w-8 text-center text-base font-mono font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(maxQuantity, q + 1))
                  }
                  aria-label="Increase quantity"
                  className="size-11 flex items-center justify-center cursor-pointer text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                >
                  <PlusIcon className="size-4" />
                </button>
              </div>

              <LimeButton
                onClick={handleBuy}
                className="flex-1 justify-center gap-2 text-base px-6 py-3.5"
              >
                <span>
                  Add to Cart &middot; RM {(pricePerBag * quantity).toFixed(2)}
                </span>
              </LimeButton>
            </div>

            {orderPlaced && (
              <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl px-4 py-3">
                <CheckCircleIcon weight="fill" className="size-4 shrink-0" />
                Order request sent for {quantity} bag
                {quantity > 1 ? "s" : ""}. {producer.name} will confirm stock
                and delivery.
              </div>
            )}
          </div>
        </section>

        {/* About the producer */}
        <section className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[28px] p-6 sm:p-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/70">
              Producer SBT {producer.sbtId}
            </span>
            <span className="text-xs text-black/50 dark:text-white/50">
              Elevation {producer.elevationMeters}m &middot; Farming since{" "}
              {producer.joinedYear}
            </span>
          </div>
          <h3 className="text-xl font-heading font-bold text-[#0C2317] dark:text-white">
            About {producer.name}
          </h3>
          <p className="text-base text-black/70 dark:text-white/70 leading-relaxed max-w-[65ch]">
            {producer.bio}
          </p>
        </section>

        {/* Reviews */}
        <section className="space-y-4 pb-10">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-[#0C2317] dark:text-white">
            Buyer Reviews
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {producer.reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[20px] p-5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-[#0C2317] dark:text-white">
                    {review.author}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400">
                    <StarIcon weight="fill" className="size-4" />
                    {review.rating}
                  </span>
                </div>
                <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
                  {review.comment}
                </p>
                <div className="text-xs text-black/40 dark:text-white/40">
                  {review.date}
                  {review.retailer && ` · ${review.retailer}`}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
