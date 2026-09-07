import { RiceGrade } from "@/lib/data/malaysia-prices";
import { cn } from "@/lib/utils";

interface GradeBadgeProps {
  grade: RiceGrade;
  className?: string;
}

export function GradeBadge({ grade, className }: GradeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-bold bg-[#D4F63D] text-black px-3 py-1 rounded-full",
        className
      )}
    >
      Grade {grade}
    </span>
  );
}
