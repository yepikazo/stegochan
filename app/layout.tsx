import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import {
  CinematicNavigationProvider,
  TransitionLink,
} from "@/components/CinematicNavigation";
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
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          <svg className="absolute top-[12%] right-[-110px] w-[min(39vw,440px)] text-[rgba(235,228,209,0.13)] opacity-[0.72] [filter:drop-shadow(0_0_12px_rgba(243,184,63,0.035))] max-[700px]:top-[18%] max-[700px]:right-[-145px] max-[700px]:w-[300px] max-[700px]:opacity-[0.58]" viewBox="0 0 440 440" fill="none">
            <path d="M220 220 42 28 184 12 255 105Z" fill="rgba(243,184,63,0.035)" />
            <path d="M220 220 255 105 402 54 380 198Z" fill="rgba(235,228,209,0.025)" />
            <path d="M220 220 380 198 426 334 287 300Z" fill="rgba(243,184,63,0.025)" />
            <path d="M220 220 287 300 228 428 105 362Z" fill="rgba(235,228,209,0.025)" />
            <path d="M220 220 105 362 18 245 42 28Z" fill="rgba(235,228,209,0.02)" />
            <path d="M42 28 220 220 255 105M402 54 220 220 380 198M426 334 220 220 287 300M228 428 220 220 105 362M18 245 220 220" fill="none" className="stroke-current [stroke-width:1] [stroke-linecap:round] [stroke-linejoin:round]" />
            <path d="m42 28 73 83-34 93m321-150-91 66 24 78m91 136-113-34-27 78M18 245l87 117 17-93" fill="none" className="stroke-[rgba(243,184,63,0.1)] [stroke-width:0.7] [stroke-linecap:round] [stroke-linejoin:round]" />
          </svg>
          <svg className="absolute bottom-[-100px] left-[-85px] w-[min(30vw,340px)] text-[rgba(235,228,209,0.13)] opacity-[0.55] [filter:drop-shadow(0_0_12px_rgba(243,184,63,0.035))] max-[700px]:bottom-[-70px] max-[700px]:left-[-120px] max-[700px]:w-[260px] max-[700px]:opacity-[0.42]" viewBox="0 0 340 340" fill="none">
            <path d="M168 172 28 34 139 12 210 92Z" fill="rgba(235,228,209,0.025)" />
            <path d="M168 172 210 92 322 48 301 177Z" fill="rgba(243,184,63,0.03)" />
            <path d="M168 172 301 177 326 294 218 267Z" fill="rgba(235,228,209,0.02)" />
            <path d="M168 172 218 267 158 328 66 278Z" fill="rgba(243,184,63,0.025)" />
            <path d="M168 172 66 278 18 196 28 34ZM28 34l140 138 42-80m112-44L168 172l133 5m25 117L168 172l50 95m-60 61 10-156L66 278M18 196l150-24" fill="none" className="stroke-current [stroke-width:1] [stroke-linecap:round] [stroke-linejoin:round]" />
          </svg>
        </div>
        <div className="relative z-10">
          <CinematicNavigationProvider>
            <nav className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#151619]/[0.92] backdrop-blur-[14px]">
              <div className="mx-auto flex min-h-[72px] w-[min(100%_-_48px,1380px)] items-center justify-between max-[700px]:min-h-16 max-[700px]:w-[min(100%_-_32px,1380px)]">
                <TransitionLink
                  href="/"
                  className="inline-flex items-baseline font-[var(--font-space-grotesk)] text-[1.05rem] font-semibold tracking-[-0.035em] text-[#efeee9] no-underline"
                >
                  <span className="text-[#f3b83f]">Stego</span>CHAN
                </TransitionLink>

                <NavActions />
              </div>
            </nav>

            <main>{children}</main>
          </CinematicNavigationProvider>
        </div>
      </body>
    </html>
  );
}