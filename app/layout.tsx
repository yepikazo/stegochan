import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="min-h-screen bg-[#14151a] text-[#ecedf1] antialiased">
        <nav className="border-b border-white/10 bg-[#14151a]/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4 md:px-8">
            <Link
              href="/"
              className="flex items-baseline gap-2 text-[1.05rem] font-semibold tracking-[-0.03em] text-white no-underline"
            >
              <span className="text-[#e8a33d]">Stego</span>Chan
            </Link>
            <div className="flex items-center gap-5 text-sm text-[#93969f]">
              <Link href="/embed" className="transition-colors hover:text-white">
                Sembunyikan
              </Link>
              <Link href="/extract" className="transition-colors hover:text-white">
                Ungkap
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
