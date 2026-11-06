
import {
  ClipboardList,
  CircleCheck,
  Layers,
  Clock3,
} from "lucide-react";

const statistics = [
  {
    label: "Total laporan",
    value: "12.480",
    icon: ClipboardList,
  },
  {
    label: "Laporan tervalidasi",
    value: "9.312",
    icon: CircleCheck,
  },
  {
    label: "Laporan selesai",
    value: "6.874",
    icon: Layers,
  },
  {
    label: "Rata-rata waktu respons",
    value: "3,2 hari",
    icon: Clock3,
  },
];

function Statistics() {
  return (
    <section
      id="statistik"
      className="section"
      style={{ paddingTop: 0 }}
    >
      {/* Mengikuti lebar section asli */}
      <div className="wrap">

        {/* Statistics Banner */}
        <div className="grid mt-12 grid-cols-1 gap-7 rounded-2xl border border-blue-300/20 bg-gradient-to-r from-[#0754a5] to-[#063968] px-6 py-8 text-white shadow-sm sm:px-8 lg:grid-cols-[1.4fr_2fr] lg:items-center lg:gap-8 lg:px-10 lg:py-8">

          {/* Heading */}
          <div className="flex flex-col justify-center">
            <h2 className="max-w-[360px] text-2xl font-bold leading-[1.35] tracking-tight text-white sm:text-[26px]">
              Kinerja layanan, terbuka untuk dibaca
            </h2>

            <p className="mt-2 text-[12px] leading-relaxed text-blue-100 sm:text-[13px]">
              Angka berikut adalah data akumulatif untuk periode ini.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:gap-y-0">
            {statistics.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className={`
                    flex flex-col justify-center px-3
                    sm:px-4 lg:px-5
                    ${index !== 0
                      ? "sm:border-l sm:border-blue-400/40"
                      : ""
                    }
                    ${index % 2 !== 0
                      ? "border-l border-blue-400/40 sm:border-l"
                      : ""
                    }
                  `}
                >
                  <Icon
                    size={25}
                    strokeWidth={2}
                    className="mb-3 text-blue-100"
                  />

                  <strong className="text-[21px] font-bold leading-tight tracking-tight text-white sm:text-[22px]">
                    {stat.value}
                  </strong>

                  <span className="mt-1.5 text-[10px] font-medium leading-snug text-blue-100 sm:text-[11px]">
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}

export default Statistics;
