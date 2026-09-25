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
      <body>
        <nav className="nav">
          <div className="nav-inner">
            <Link href="/" className="brand">
              <span className="brand-mark">Stego</span>Chan
            </Link>
            <div className="nav-links">
              <Link href="/embed">Sembunyikan</Link>
              <Link href="/extract">Ungkap</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
