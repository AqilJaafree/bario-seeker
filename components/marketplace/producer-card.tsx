import Image from "next/image";
import Link from "next/link";
import { StarIcon, MapPinIcon, ShieldCheckIcon } from "@phosphor-icons/react";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { GradeBadge } from "@/components/marketplace/grade-badge";
import { Producer, getLatestBatch } from "@/lib/data/producers";

interface ProducerCardProps {
  producer: Producer;
}

export function ProducerCard({ producer }: ProducerCardProps) {
  const latest = getLatestBatch(producer);

  return (
    <Link
      href={`/marketplace/${producer.id}`}
      className="group flex flex-col bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[28px] overflow-hidden shadow-sm hover:border-[#0C2317] dark:hover:border-white/30 transition-all"
    >
      <div className="relative h-44 overflow-hidden">
        <Image
          src={producer.photo}
          alt={producer.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
        <GradeBadge grade={latest.grade} className="absolute top-3 left-3" />
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
          <span className="text-sm font-heading font-bold truncate">
            {producer.name}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium shrink-0 ml-2">
            <StarIcon weight="fill" className="size-3.5 text-[#D4F63D]" />
            {producer.rating}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-1.5 text-xs text-black/60 dark:text-white/60">
          <MapPinIcon className="size-3.5" />
          {producer.location}
        </div>

        <p className="text-xs text-black/70 dark:text-white/70 leading-relaxed line-clamp-2">
          {producer.bio}
        </p>

        <div className="mt-auto pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-black/50 dark:text-white/50 font-medium block">
              Price
            </span>
            <span className="font-mono text-sm font-bold text-[#0C2317] dark:text-white">
              RM {(latest.sellPriceRmKg * latest.bagSizeKg).toFixed(2)}{" "}
              <span className="font-normal text-black/50 dark:text-white/50">
                / {latest.bagSizeKg}kg
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              <ShieldCheckIcon weight="fill" className="size-3.5" />
              Verified
            </span>
            <ArrowCircle size="size-8" iconSize="size-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
