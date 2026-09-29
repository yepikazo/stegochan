import { HomeDownloadIcon, HomeImageIcon, MessageIcon } from "@/components/icons";

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

export default function HowItWorksSection() {
  return (
    <section className="relative px-0 pt-[82px] pb-[54px] max-[700px]:pt-[65px]">
      <div className="mx-auto w-[min(100%_-_48px,1380px)] max-[700px]:w-[min(100%_-_32px,1380px)]">
        <div className="mb-[43px] max-w-[760px] max-[700px]:mb-[30px]">
          <h2 className="font-[var(--font-space-grotesk)] text-[clamp(2.25rem,4vw,3.2rem)] font-normal leading-none tracking-[-0.04em] text-[#f3b83f]">Cara Kerja</h2>

          <p className="mt-5 max-w-[680px] text-[0.92rem] leading-[1.65] text-[#98999e]">
            Steganografi menyisipkan data terenkripsi ke dalam variasi piksel yang nyaris tak terlihat tanpa mengubah
            tampilan gambar secara kasat mata.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-[18px] max-[900px]:grid-cols-1">
          <StepCard
            number="01"
            icon={<HomeImageIcon />}
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
            icon={<HomeDownloadIcon />}
            title="Unduh atau ungkap"
            description="Unduh gambar yang tampak sama. Penerima membukanya di mode Ungkap dengan kunci yang sesuai."
            meta="PROSES LOKAL · TANPA LOG"
          />
        </div>

        <div className="mt-[50px] flex items-center gap-[14px] font-mono text-[0.56rem] tracking-[0.02em] text-[#686a70] max-[700px]:items-start max-[700px]:text-[0.5rem] max-[700px]:leading-[1.6]">
          <span className="block h-px w-[54px] shrink-0 bg-[#f3b83f] max-[700px]:w-[35px]" />

          <span>
            PERUBAHAN VISUAL: TAK TERDETEKSI MATA · INTEGRITAS PESAN: TERVERIFIKASI OTOMATIS
          </span>
        </div>
      </div>
    </section>
  );
}
