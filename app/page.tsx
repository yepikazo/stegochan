import Link from "next/link";
import { TransitionLink } from "@/components/CinematicNavigation";

function SignalMark() {
  return (
    <div className="mb-[21px] flex h-[27px] w-[42px] items-end gap-[3px] max-[700px]:mb-[18px]" aria-hidden="true">
      <span className="h-2 w-1 rounded-t-[1px] bg-[#f3b83f]" />
      <span className="h-[14px] w-1 rounded-t-[1px] bg-[#f3b83f]" />
      <span className="h-[23px] w-1 rounded-t-[1px] bg-[#f3b83f]" />
      <span className="h-[27px] w-1 rounded-t-[1px] bg-[#f3b83f]" />
      <span className="h-5 w-1 rounded-t-[1px] bg-[#f3b83f]" />
      <span className="h-[14px] w-1 rounded-t-[1px] bg-[#f3b83f]" />
      <span className="h-2 w-1 rounded-t-[1px] bg-[#f3b83f]" />
    </div>
  );
}

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

function ImageIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function StepCard({
  number,
  icon,
  title,
  description,
  meta,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  meta: string;
}) {
  return (
    <article className="relative min-h-[285px] overflow-hidden rounded-xl border border-[#303238] bg-[#1d1f24] p-[22px] text-[#efeee9] transition-[transform,border-color,background-color] duration-200 before:absolute before:left-0 before:top-0 before:h-[3px] before:w-[35px] before:bg-[#f3b83f] before:content-[''] hover:-translate-y-[3px] hover:border-[rgba(243,184,63,0.65)] hover:bg-[#202227] max-[900px]:min-h-0">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#3a3d44] bg-[#25272d] text-[#f3b83f]">{icon}</div>
        <span className="font-mono text-[0.7rem] font-medium text-[#98999e]">{number}</span>
      </div>
      <div className="mt-[17px] h-px w-full bg-[#303238]" />
      <h3 className="mt-5 font-[var(--font-space-grotesk)] text-[1.3rem] font-medium leading-[1.2] tracking-[-0.025em] text-[#efeee9]">{title}</h3>
      <p className="mt-2.5 max-w-[330px] text-[0.79rem] leading-[1.65] text-[#98999e]">{description}</p>
      <div className="mt-5 flex items-center gap-[7px] font-mono text-[0.58rem] font-medium tracking-[0.02em] text-[#b8b9bd]">
        <span className="text-[0.52rem] text-[#f3b83f]">◉</span>
        {meta}
      </div>
    </article>
  );
}

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      {/* =====================================================
          HERO
          ===================================================== */}
      <section className="relative flex min-h-[590px] items-center max-[900px]:min-h-0">
        <div className="relative z-[2] mx-auto w-[min(100%_-_48px,1380px)] py-[78px] pb-[88px] max-[900px]:w-[min(100%_-_48px,1380px)] max-[900px]:pt-[70px] max-[900px]:pb-[78px] max-[700px]:w-[min(100%_-_32px,1380px)] max-[700px]:pt-[55px] max-[700px]:pb-[65px]">
          <SignalMark />

          <div className="relative mb-6 inline-flex items-center pl-[31px] font-mono text-[0.72rem] font-medium uppercase tracking-[0.08em] text-[#f3b83f] before:absolute before:top-1/2 before:left-0 before:h-px before:w-[23px] before:bg-[#f3b83f] before:content-['']">
            Covert Hiding of Assets in Noise
          </div>

          <h1 className="max-w-[930px] font-[var(--font-space-grotesk)] text-[clamp(3rem,5.5vw,5rem)] font-normal leading-[0.98] tracking-[-0.055em] text-[#efeee9] max-[900px]:text-[clamp(2.8rem,8vw,4.3rem)] max-[700px]:text-[clamp(2.45rem,12vw,3.6rem)] max-[700px]:leading-none">
            Sembunyikan sebuah pesan
            <br />
            <span className="text-[#f3b83f]">di dalam gambar biasa.</span>
          </h1>

          <p className="mt-[26px] max-w-[650px] text-base leading-[1.65] text-[#98999e] max-[700px]:text-[0.92rem]">
            StegoChan mengenkripsi pesan Anda lalu menyembunyikannya di
            bit-bit terkecil warna piksel — noise yang tidak kasat mata.
            Semua proses berjalan di browser Anda; gambar dan pesan tidak
            pernah dikirim ke server mana pun.
          </p>

          <div className="mt-7 flex items-center gap-2.5 max-[700px]:flex-wrap">
            <TransitionLink href="/embed" className="inline-flex min-h-11 items-center justify-center gap-[14px] rounded-lg border border-[#f3b83f] bg-[#f3b83f] px-8 text-[0.84rem] font-semibold text-[#19150b] no-underline transition hover:-translate-y-px hover:border-[#ffc95a] hover:bg-[#ffc95a]">
              <span>Embed</span>
              <LockIcon />
            </TransitionLink>

            <TransitionLink href="/extract" className="inline-flex min-h-11 items-center justify-center gap-[14px] rounded-lg border border-[#303238] bg-transparent px-8 text-[0.84rem] font-semibold text-[#efeee9] no-underline transition hover:-translate-y-px hover:border-[#4a4c53] hover:bg-[#1d1f24]">
              <span>Extract</span>
              <ExtractIcon />
            </TransitionLink>
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
          ===================================================== */}
      <section className="relative px-0 pt-[82px] pb-[54px] max-[700px]:pt-[65px]">
        <div className="mx-auto w-[min(100%_-_48px,1380px)] max-[700px]:w-[min(100%_-_32px,1380px)]">
          <div className="mb-[43px] max-w-[760px] max-[700px]:mb-[30px]">
            <h2 className="font-[var(--font-space-grotesk)] text-[clamp(2.25rem,4vw,3.2rem)] font-normal leading-none tracking-[-0.04em] text-[#f3b83f]">Cara Kerja</h2>

            <p className="mt-5 max-w-[680px] text-[0.92rem] leading-[1.65] text-[#98999e]">
              Steganografi menyisipkan data terenkripsi ke dalam variasi
              piksel yang nyaris tak terlihat tanpa mengubah tampilan
              gambar secara kasat mata.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-[18px] max-[900px]:grid-cols-1">
            <StepCard
              number="01"
              icon={<ImageIcon />}
              title="Pilih gambar penyamaran"
              description="Gunakan foto biasa dari perangkatmu. Sistem memeriksa kapasitas dan format secara otomatis."
              meta="PNG"
            />

            <StepCard
              number="02"
              icon={<MessageIcon />}
              title="Tulis pesan dan kunci"
              description="Masukkan teks rahasia, lalu tambahkan password opsional untuk lapisan proteksi tambahan."
              meta="AES-256-GCM · SALT UNIK"
            />

            <StepCard
              number="03"
              icon={<DownloadIcon />}
              title="Unduh atau ungkap"
              description="Unduh gambar yang tampak sama. Penerima membukanya di mode Ungkap dengan kunci yang sesuai."
              meta="PROSES LOKAL · TANPA LOG"
            />
          </div>

          <div className="mt-[50px] flex items-center gap-[14px] font-mono text-[0.56rem] tracking-[0.02em] text-[#686a70] max-[700px]:items-start max-[700px]:text-[0.5rem] max-[700px]:leading-[1.6]">
            <span className="block h-px w-[54px] shrink-0 bg-[#f3b83f] max-[700px]:w-[35px]" />

            <span>
              PERUBAHAN VISUAL: TAK TERDETEKSI MATA · INTEGRITAS PESAN:
              TERVERIFIKASI OTOMATIS
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}