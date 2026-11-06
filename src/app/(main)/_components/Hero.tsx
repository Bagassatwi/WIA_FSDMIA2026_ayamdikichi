import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Send,
  Check,
  MapPin,
  CircleCheck,
  Circle,
} from "lucide-react";

const reportSteps = [
  {
    title: "Laporan diterima",
    description: "12 Okt, 09.14 · Sistem",
    completed: true,
  },
  {
    title: "Terverifikasi petugas",
    description: "13 Okt · Sarana & Kebersihan",
    completed: true,
  },
  {
    title: "Penambalan dimulai",
    description: "26 Okt · Tim jalan, foto progres dilampirkan",
    completed: true,
  },
  {
    title: "Bukti selesai",
    description: "Menunggu foto sesudah",
    completed: false,
  },
];

export default function Hero() {
  return (
    <section className="relative isolate min-h-[680px] overflow-hidden bg-[#f8fbff]">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-[#f4f9ff] to-[#e8f3ff]" />

      <div className="absolute -left-40 bottom-[-220px] -z-10 h-[450px] w-[700px] rounded-[50%] bg-[#d7ebff]/70 blur-2xl" />

      <div className="absolute -right-40 bottom-[-260px] -z-10 h-[420px] w-[700px] rounded-[50%] bg-[#c4e3ff]/80 blur-2xl" />

      {/* Main content */}
      <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-[1fr_1fr] lg:px-12">
        {/* Left content */}
        <div className="relative z-10 max-w-xl">
          <div className="mb-7 flex items-center gap-4">
            <span className="text-[13px] font-extrabold tracking-[0.25em] text-[#152b50]">
              JEJAKPUBLIK
            </span>
            <span className="h-[2px] w-12 bg-[#aab9cc]" />
          </div>

          <h1 className="text-[clamp(2.5rem,5vw,3.8rem)] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#10244a]">
            Laporkan
            <br />
            Masalahnya.
            <br />
            Pantau Prosesnya.
            <br />
            <span className="text-[#1471d4]">Buktikan Hasilnya.</span>
          </h1>

          <p className="mt-6 max-w-[440px] text-[15px] leading-[1.7] text-[#34445d]">
            Setiap laporan warga punya jejak penanganan yang terbuka: siapa
            menangani, kapan, dan bukti apa yang ditunjukkan sebelum laporan
            dinyatakan selesai.
          </p>

          {/* CTA */}
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/buat-laporan"
              className="!text-white inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#0754a5] px-6 py-3 text-sm font-bold shadow-[0_5px_14px_rgba(7,84,165,0.16)] transition hover:-translate-y-0.5 hover:bg-[#06488e]"
            >
              <Send size={16} className="text-white" />
              Buat Laporan
            </Link>

            <Link
              href="/laporan"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cbd8e8] bg-white/70 px-6 py-3 text-sm font-bold text-[#172d50] transition hover:border-[#1471d4] hover:bg-white"
            >
              Jelajahi Laporan
              <ArrowUpRight size={15} />
            </Link>
          </div>

          {/* Benefits */}
          <div className="mt-7 space-y-3">
            {[
              "Laporan diverifikasi sebelum diproses",
              "Bukti foto sebelum dan sesudah",
              "Riwayat jelas, dapat ditelusuri",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-[13px] font-medium text-[#34445d]"
              >
                <Check
                  size={17}
                  strokeWidth={3}
                  className="shrink-0 text-[#1471d4]"
                />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Right report card */}
        <div className="relative z-10 mx-auto w-full max-w-[480px] lg:ml-auto">
          <div className="rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-[0_15px_50px_rgba(32,71,117,0.14)] backdrop-blur-xl sm:p-6">
            {/* Card header */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-semibold text-[#718096]">
                JP-2025-30418 · Data terbuka
              </span>

              <span className="rounded-full bg-[#e1efff] px-3 py-1 text-[10px] font-bold text-[#1767c4]">
                Sedang diproses
              </span>
            </div>

            {/* Report title */}
            <h2 className="mt-3 text-[16px] font-bold leading-snug tracking-tight text-[#172943]">
              Lubang besar di Jl. Ijen depan SDN Kauman
            </h2>

            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#59677b]">
              <MapPin size={14} className="fill-red-500 text-red-500" />
              Kota Malang, Kec. Klojen
            </div>

            {/* Before and progress images */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="overflow-hidden rounded-xl bg-[#edf2f7]">
                <div className="relative h-[105px]">
                  <Image
                    src="/assets/images/png/jalanbolong.png"
                    alt="Kondisi jalan sebelum perbaikan"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 220px"
                  />
                </div>
                <p className="px-2 py-2 text-[10px] font-semibold text-[#526174]">
                  Sebelum · 12 Okt
                </p>
              </div>

              <div className="overflow-hidden rounded-xl bg-[#edf2f7]">
                <div className="relative h-[105px]">
                  <Image
                    src="/assets/images/png/after.png"
                    alt="Kondisi jalan sebelum perbaikan"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 220px"
                  />
                </div>
                <p className="px-2 py-2 text-[10px] font-semibold text-[#526174]">
                  Progres · 27 Okt
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-5 space-y-4">
              {reportSteps.map((step, index) => (
                <div key={step.title} className="flex gap-3">
                  <div className="relative flex w-8 shrink-0 justify-center">
                    {index !== reportSteps.length - 1 && (
                      <span className="absolute left-1/2 top-7 h-[calc(100%+8px)] w-px -translate-x-1/2 bg-[#dce5ed]" />
                    )}

                    {step.completed ? (
                      <span className="relative z-10 flex h-[23px] w-[23px] items-center justify-center rounded-full bg-[#16a34a] text-white shadow-sm">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="relative z-10 flex h-[23px] w-[23px] items-center justify-center rounded-full bg-[#a6adb6] text-white">
                        <Circle size={10} fill="currentColor" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 pb-1">
                    <p className="text-[12px] font-bold leading-snug text-[#24344c]">
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-[#738196]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom landscape */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-0 h-[175px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#b8ddf8]/70 via-[#dceeff]/30 to-transparent" />
      </div>
    </section>
  );
}
