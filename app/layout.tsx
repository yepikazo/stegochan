import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import NavActions from "@/components/NavActions";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "StegoChan — Covert Hiding of Assets in Noise",
  description:
    "Sembunyikan dan enkripsi pesan di dalam gambar, sepenuhnya di browser Anda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable}`}
    >
      <body className="min-h-screen bg-[#151619] font-[var(--font-inter)] leading-6 text-[#efeee9]">
        <nav className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#151619]/[0.92] backdrop-blur-[14px]">
          <div className="mx-auto flex min-h-[72px] w-[min(100%_-_48px,1380px)] items-center justify-between max-[700px]:min-h-16 max-[700px]:w-[min(100%_-_32px,1380px)]">
            <Link
              href="/"
              className="inline-flex items-baseline font-[var(--font-space-grotesk)] text-[1.05rem] font-semibold tracking-[-0.035em] text-[#efeee9] no-underline"
            >
              <span className="text-[#f3b83f]">Stego</span>CHAN
            </Link>

            <NavActions />
          </div>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  );
}