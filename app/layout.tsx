import type { Metadata } from "next";
import { Space_Grotesk, Inter, Caveat } from "next/font/google";
// @ts-ignore 
import "@/app/globals.css"; 

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Inkboard — draw it, don't explain it",
  description:
    "A real-time, hand-drawn whiteboard for teams. No sign-up — just a link and a blank canvas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${caveat.variable}`}>
      <body className="font-body bg-ink-bg text-ink-text antialiased">{children}</body>
    </html>
  );
}
