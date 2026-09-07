import { ArrowCircle } from "@/components/ui/arrow-circle";
import { LimeButton } from "@/components/ui/lime-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface NavbarProps {
  onVerifyClick: () => void;
}

export function Navbar({ onVerifyClick }: NavbarProps) {
  return (
    <nav className="w-full flex items-center justify-between gap-4 z-20">
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5">
        <span className="font-heading font-extrabold tracking-tight text-lg sm:text-xl text-white uppercase drop-shadow-md">
          Bario Seeker
        </span>
      </div>

      {/* Right Controls: Theme Toggle + CTA */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        <LimeButton
          onClick={onVerifyClick}
          className="gap-2 text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 shadow-md"
        >
          <span>Login</span>
          <ArrowCircle />
        </LimeButton>
      </div>
    </nav>
  );
}
