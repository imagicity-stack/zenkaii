import type { Metadata, Viewport } from "next";
import { Cinzel, Space_Mono, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "600", "800", "900"], variable: "--f-cinzel" });
const zen = Zen_Kaku_Gothic_New({ subsets: ["latin"], weight: ["300", "400", "500", "700", "900"], variable: "--f-zen" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--f-mono" });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ZENKAII — Spirit-forged apparel",
  description: "Nine tails, nine oaths. Anime-folklore merch struck once, numbered, and sealed with the fox's mark.",
  openGraph: { title: "ZENKAII", description: "Wear the mask you were owed.", images: ["/zenkaii-logo.png"] },
};

export const viewport: Viewport = { themeColor: "#08070A" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${zen.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
