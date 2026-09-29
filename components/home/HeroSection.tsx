import { ExtractIcon, LockIcon } from "@/components/icons";
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

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[590px] items-center max-[900px]:min-h-0">
      <div className="pointer-events-none absolute -right-[90px] -bottom-[150px] h-[370px] w-[370px] max-[900px]:-right-[190px] max-[900px]:-bottom-[180px] max-[900px]:opacity-70 max-[700px]:-right-[230px] max-[700px]:-bottom-[150px] max-[700px]:h-[330px] max-[700px]:w-[330px]" aria-hidden="true">
        <div className="absolute inset-0 rounded-full border border-[rgba(243,184,63,0.18)] after:absolute after:-inset-px after:scale-[1.15] after:rounded-full after:border after:border-dashed after:border-[rgba(243,184,63,0.15)] after:content-['']" />
        <div className="absolute top-[45px] left-[45px] h-[280px] w-[280px] rounded-full border border-[rgba(243,184,63,0.11)]" />
      </div>

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
          StegoChan mengenkripsi pesan Anda lalu menyembunyikannya di bit-bit terkecil warna piksel — noise yang
          tidak kasat mata. Semua proses berjalan di browser Anda; gambar dan pesan tidak pernah dikirim ke server
          mana pun.
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
  );
}
