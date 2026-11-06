import {
  FiMapPin,
  FiClipboard,
  FiCamera,
  FiArrowRight,
} from "react-icons/fi";

const steps = [
  {
    number: "01",
    title: "Laporkan masalah",
    description:
      "Pilih kategori, tandai lokasi, dan lampirkan foto kejadian.",
    icon: FiMapPin,
  },
  {
    number: "02",
    title: "Pantau penanganan",
    description:
      "Ikuti perubahan status lewat nomor laporan Anda.",
    icon: FiClipboard,
  },
  {
    number: "03",
    title: "Buktikan hasilnya",
    description:
      "Lihat foto sesudah penanganan dan beri penilaian.",
    icon: FiCamera,
  },
];

function HowItWorks() {
  return (
    <section className="px-5 pb-16 pt-4 sm:px-8 lg:px-10 lg:pb-20">
      <div className="mx-auto max-w-7xl">

        {/* Section Heading */}
        <div className="mb-9 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Proses pelaporan
          </span>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#10244a] sm:text-3xl">
            Cara kerja
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Tiga langkah mudah untuk menyampaikan dan memantau laporan Anda.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-7">

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative flex gap-5 border-b border-slate-200 pb-7 last:border-b-0 last:pb-0 md:border-b-0 md:pb-0"
              >

                {/* Step Number & Icon */}
                <div className="flex shrink-0 flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600">
                    <Icon size={22} strokeWidth={1.9} />
                  </div>

                  <span className="mt-3 text-xs font-bold tracking-widest text-slate-400">
                    {step.number}
                  </span>
                </div>

                {/* Step Content */}
                <div className="min-w-0 flex-1 pt-1">
                  <h3 className="text-base font-bold tracking-tight text-[#10244a] sm:text-lg">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {step.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-600">
                    Langkah {index + 1}
                    <FiArrowRight size={14} />
                  </div>
                </div>

              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}

export default HowItWorks;