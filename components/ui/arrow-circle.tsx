import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface ArrowCircleProps {
  size?: string;
  iconSize?: string;
  variant?: "dark" | "light";
  animated?: boolean;
  stroke?: boolean;
}

export function ArrowCircle({
  size = "size-5",
  iconSize = "size-3",
  variant = "dark",
  animated = true,
  stroke = true,
}: ArrowCircleProps) {
  return (
    <span
      className={cn(
        size,
        "rounded-full flex items-center justify-center",
        variant === "dark"
          ? "bg-black text-[#D4F63D]"
          : "bg-[#D4F63D] text-black",
        animated &&
          "transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      )}
    >
      <ArrowUpRightIcon className={cn(iconSize, stroke && "stroke-[2.5]")} />
    </span>
  );
}
