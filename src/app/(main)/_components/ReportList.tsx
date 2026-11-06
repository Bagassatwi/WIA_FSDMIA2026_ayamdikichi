import Link from "next/link";
import {
  FiMap,
  FiTrash2,
  FiDroplet,
  FiSun,
  FiHome,
  FiArrowRight,
  FiFeather,
} from "react-icons/fi";

const categories = [
  {
    title: "Infrastruktur Jalan",
    description: "Lubang, retak, jalan amblas",
    icon: FiMap,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Kebersihan",
    description: "Sampah menumpuk, TPS penuh",
    icon: FiTrash2,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Drainase",
    description: "Saluran tersumbat, genangan",
    icon: FiDroplet,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Penerangan Jalan",
    description: "Lampu mati atau rusak",
    icon: FiSun,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Fasilitas Umum",
    description: "Halte, taman, trotoar",
    icon: FiHome,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Lingkungan",
    description: "Pohon rawan tumbang, polusi",
    icon: FiFeather,
    color: "bg-emerald-100 text-emerald-700",
  },
];

function ReportList() {
  return (
    <section
      id="kategori-laporan"
      className="px-5 py-16 sm:px-8 lg:px-10 lg:py-20"
    >
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-9">
          <h2 className="text-2xl font-bold tracking-tight text-[#10244a] sm:text-3xl lg:text-[34px]">
            Apa yang ingin Anda laporkan?
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Pilih kategori permasalahan yang ingin Anda laporkan agar
            dapat ditangani oleh pihak terkait.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid-cols-2 lg:grid-cols-3">

          {categories.map((category, index) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.title}
                href="/laporan"
                className={`
                  group flex min-h-[125px] items-center gap-5
                  px-6 py-6 transition-all duration-200
                  hover:bg-blue-50/70
                  sm:px-7 sm:py-7
                  ${index % 2 !== 0 ? "sm:border-l sm:border-slate-200" : ""}
                  ${index >= 2 ? "sm:border-t sm:border-slate-200" : ""}
                  lg:border-t-0
                  ${index % 3 !== 2 ? "lg:border-r lg:border-slate-200" : ""}
                  ${index % 3 === 2 ? "lg:border-r-0" : ""}
                  ${index >= 3 ? "lg:border-t lg:border-slate-200" : ""}
                `}
              >
                {/* Icon */}
                <div
                  className={`
                    flex h-16 w-16 shrink-0 items-center
                    justify-center rounded-2xl
                    ${category.color}
                    transition-transform duration-200
                    group-hover:scale-105
                  `}
                >
                  <Icon size={30} strokeWidth={2.1} />
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold leading-snug tracking-tight text-[#10244a] sm:text-[17px]">
                    {category.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {category.description}
                  </p>
                </div>

                {/* Arrow */}
                <span className="shrink-0 text-slate-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-blue-600">
                  <FiArrowRight size={20} />
                </span>
              </Link>
            );
          })}

        </div>
      </div>
    </section>
  );
}

export default ReportList;