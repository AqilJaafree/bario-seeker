export function Footer() {
  return (
    <footer className="max-w-7xl mx-auto pt-8 pb-12 border-t border-black/10 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-black/60 dark:text-white/60">
      <div className="flex items-center gap-2">
        <span className="font-bold text-black dark:text-white">Bario Seeker</span>
        <span>barioseeker.my</span>
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px]">
        <span>DOA Sarawak Traceability Partner</span>
        <span>PDPA 2010 Compliant</span>
        <span>Exempt from Paddy & Rice Control Act 1994</span>
      </div>
    </footer>
  );
}
