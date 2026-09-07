"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowCircle } from "@/components/ui/arrow-circle";
import { LimeButton } from "@/components/ui/lime-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
];

interface NavbarProps {
  onVerifyClick?: () => void;
}

export function Navbar({ onVerifyClick }: NavbarProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav className="w-full flex items-center justify-between gap-4 z-20">
      {/* Brand Logo */}
      <Link
        href="/"
        className={cn(
          "font-heading font-extrabold tracking-tight text-base sm:text-lg uppercase shrink-0",
          isHome ? "text-white drop-shadow-md" : "text-[#111813] dark:text-[#F5F6F1]"
        )}
      >
        Bario Seeker
      </Link>

      {/* Nav Links */}
      <div className="hidden sm:flex items-center gap-1 bg-[#0C2317] rounded-full p-1">
        {NAV_LINKS.map((link) => {
          const isActive =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#D4F63D] text-black font-semibold"
                  : "text-white/75 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Right Controls: Theme Toggle + CTA */}
      <div className="flex items-center gap-2 shrink-0">
        <ThemeToggle />

        {onVerifyClick ? (
          <LimeButton
            onClick={onVerifyClick}
            className="gap-2 text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5"
          >
            <span>Login</span>
            <ArrowCircle />
          </LimeButton>
        ) : (
          <LimeButton
            as="a"
            href="/"
            className="gap-2 text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5"
          >
            <span>Login</span>
            <ArrowCircle />
          </LimeButton>
        )}
      </div>
    </nav>
  );
}
