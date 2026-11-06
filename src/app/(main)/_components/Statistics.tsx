import { FiClipboard, FiCheckCircle, FiLayers, FiClock } from "react-icons/fi";

const statistics = [
  {
    label: "Total laporan",
    value: "12.480",
    icon: FiClipboard,
  },
  {
    label: "Laporan tervalidasi",
    value: "9.312",
    icon: FiCheckCircle,
  },
  {
    label: "Laporan selesai",
    value: "6.874",
    icon: FiLayers,
  },
  {
    label: "Rata-rata waktu respons",
    value: "3,2 hari",
    icon: FiClock,
  },
];

function Statistics() {
  return (
    <section id="statistik" className="px-5 pt-0">
      <div className="mx-auto max-w-7xl">
        {/* Statistics Banner */}
        <div className="mt-12 grid grid-cols-1 items-center gap-8 rounded-2xl border border-blue-300/20 bg-gradient-to-r from-[#0754a5] to-[#063968] px-8 py-9 text-white shadow-sm sm:px-10 lg:grid-cols-[1.4fr_2fr] lg:gap-8 lg:px-10 lg:py-10">
          {/* Heading */}
          <div className="flex flex-col justify-center">
            <h2 className="max-w-[370px] text-2xl font-bold leading-[1.3] tracking-tight text-white sm:text-[27px]">
              Kinerja layanan, terbuka untuk dibaca
            </h2>

            <p className="mt-3 text-xs leading-relaxed text-blue-100 sm:text-[13px]">
              Angka berikut adalah data akumulatif untuk periode ini.
            </p>
          </div>

          {/* Statistics Items */}
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {statistics.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className={`
            flex min-w-0 flex-col justify-center px-4 py-3
            sm:px-4 lg:px-5
            ${index !== 0 ? "sm:border-l sm:border-blue-300/40" : ""}
            ${index % 2 !== 0 ? "border-l border-blue-300/40 sm:border-l" : ""}
          `}
                >
                  <Icon
                    size={25}
                    strokeWidth={2.2}
                    className="mb-3 shrink-0 text-blue-100"
                  />

                  <strong className="whitespace-nowrap text-xl font-bold leading-tight tracking-tight text-white sm:text-[25px]">
                    {stat.value}
                  </strong>

                  <span className="mt-2 text-[10px] font-medium leading-snug text-blue-100 sm:text-[11px]">
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
