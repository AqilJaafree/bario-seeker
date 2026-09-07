import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree, Raleway } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const figtreeHeading = Figtree({ subsets: ["latin"], variable: "--font-heading" });

const raleway = Raleway({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bario Seeker - Provenance, Grading & Price Transparency for Bario Rice",
  description:
    "Cryptographic provenance, audited grading, and transparent farm-to-shelf pricing for genuine Bario rice from the Sarawak highlands.",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", raleway.variable, figtreeHeading.variable)}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
