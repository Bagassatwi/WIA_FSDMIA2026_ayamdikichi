import {
  FiCheck,
  FiClock,
  FiClipboard,
  FiSearch,
  FiUsers,
  FiTool,
  FiCamera,
} from "react-icons/fi";

const steps = [
  {
    title: "Diterima",
    date: "12 Okt, 08.14",
    description: "Laporan masuk dan mendapat nomor pelacakan.",
    status: "Selesai",
    icon: FiClipboard,
    state: "completed",
  },
  {
    title: "Diverifikasi",
    date: "13 Okt, 10.30",
    description: "Petugas memeriksa lokasi dan kelengkapan foto.",
    status: "Selesai",
    icon: FiSearch,
    state: "completed",
  },
  {
    title: "Ditugaskan",
    date: "14 Okt, 09.00",
    description: "Diteruskan ke tim jalan dengan target 14 hari.",
    status: "Selesai",
    icon: FiUsers,
    state: "completed",
  },
  {
    title: "Dikerjakan",
    date: "24 Okt, 07.45",
    description: "Foto progres dilampirkan oleh pelaksana.",
    status: "Berjalan",
    icon: FiTool,
    state: "current",
  },
  {
    title: "Bukti selesai",
    date: "Belum ada",
    description: "Warga dapat menilai hasil sebelum ditutup.",
    status: "Menunggu",
    icon: FiCamera,
    state: "pending",
  },
];

function Transparency() {
  return (
    <section id="transparansi" className="px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-10 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-[#10244a] sm:text-3xl">
            Jejak Penanganan: setiap langkah tercatat
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Laporan tidak berhenti di “terkirim”. Setiap tindakan penting
            dicatat lengkap dengan waktu, pelaksana, dan bukti.
          </p>
        </div>
        {/* Timeline */}
        <div className="relative">
          {/* Horizontal Connector - Desktop */}
          <div className="absolute left-0 right-0 top-[21px] hidden h-[2px] bg-slate-200 lg:block" />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const completed = step.state === "completed";
              const current = step.state === "current";

              return (
                <div
                  key={step.title}
                  className="relative flex gap-4 lg:flex-col lg:gap-5"
                >
                  {/* Timeline Point */}
                  <div className="relative z-10 flex shrink-0 flex-col items-center lg:items-start">
                    <div
                      className={`
                flex h-[44px] w-[44px] items-center justify-center
                rounded-full border-[2px]
                ${
                  completed
                    ? "border-blue-600 bg-blue-600 text-white"
                    : current
                      ? "border-blue-600 bg-white text-blue-600"
                      : "border-slate-300 bg-white text-slate-400"
                }
              `}
                    >
                      {completed ? (
                        <FiCheck size={21} strokeWidth={2.5} />
                      ) : (
                        <Icon size={19} strokeWidth={2} />
                      )}
                    </div>

                    {/* Vertical Connector - Mobile */}
                    {index !== steps.length - 1 && (
                      <div
                        className={`
                  absolute left-1/2 top-[44px] h-[calc(100%+32px)]
                  w-[2px] -translate-x-1/2 lg:hidden
                  ${completed ? "bg-blue-600" : "bg-slate-200"}
                `}
                      />
                    )}
                  </div>

                  {/* Timeline Content */}
                  <div className="min-w-0 flex-1 lg:pr-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-[#10244a]">
                        {step.title}
                      </h3>

                      <span
                        className={`text-[10px] font-semibold ${
                          completed
                            ? "text-emerald-600"
                            : current
                              ? "text-blue-600"
                              : "text-slate-400"
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <FiClock size={13} />
                      {step.date}
                    </div>

                    <p className="mt-3 text-[13px] leading-relaxed text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Note */}
        <div className="mt-10 border-t border-slate-200 pt-5">
          <p className="text-xs leading-relaxed text-slate-500 sm:text-sm">
            Setiap perubahan status laporan tercatat dalam sistem sehingga warga
            dapat memantau perkembangan penanganan secara transparan.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Transparency;
