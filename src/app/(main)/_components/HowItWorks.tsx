
import {
  MapPinned,
  ClipboardCheck,
  Camera,
  ArrowRight,
} from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Laporkan masalah',
    description:
      'Pilih kategori, tandai lokasi, dan lampirkan foto kejadian.',
    icon: MapPinned,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    number: '02',
    title: 'Pantau penanganan',
    description:
      'Ikuti perubahan status lewat nomor laporan Anda.',
    icon: ClipboardCheck,
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    number: '03',
    title: 'Buktikan hasilnya',
    description:
      'Lihat foto sesudah penanganan dan beri penilaian.',
    icon: Camera,
    color: 'bg-amber-50 text-amber-600',
  },
];

function HowItWorks() {
  return (
    <section className="section !pt-0">
      <div className="wrap">
        {/* Section Heading */}
        <div className="mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Proses pelaporan
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Cara kerja
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Tiga langkah mudah untuk menyampaikan dan memantau laporan Anda.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="group relative rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
              >
                {/* Card Header */}
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm font-bold tracking-widest text-slate-300">
                    {step.number}
                  </span>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${step.color}`}
                  >
                    <Icon size={22} strokeWidth={2} />
                  </div>
                </div>

                {/* Card Content */}
                <h3 className="text-base font-bold text-slate-900">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {step.description}
                </p>

                {/* Bottom Indicator */}
                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  Langkah {index + 1}
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
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
