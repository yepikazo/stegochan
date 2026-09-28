import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
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

function LockIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="16" height="12" x="4" y="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function ExtractIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4V2" />
      <path d="M12 22v-2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
    </svg>
  );
}

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
              <span className="text-[#f3b83f]">Stego</span>Chan
            </Link>

            <div className="flex items-center gap-3 max-[700px]:gap-2">
              <Link
                href="/embed"
                className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-lg border border-[#f3b83f] bg-[#f3b83f] px-5 text-[0.82rem] font-semibold text-[#19150b] no-underline transition hover:-translate-y-px hover:border-[#ffc95a] hover:bg-[#ffc95a] max-[700px]:min-h-10 max-[700px]:px-[13px]"
              >
                <span className="max-[700px]:hidden">Embed</span>
                <LockIcon />
              </Link>

              <Link
                href="/extract"
                className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-lg border border-[#303238] bg-transparent px-5 text-[0.82rem] font-semibold text-[#efeee9] no-underline transition hover:-translate-y-px hover:border-[#4a4c53] hover:bg-[#1d1f24] max-[700px]:min-h-10 max-[700px]:px-[13px]"
              >
                <span className="max-[700px]:hidden">Extract</span>
                <ExtractIcon />
              </Link>
            </div>
          </div>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  );
}