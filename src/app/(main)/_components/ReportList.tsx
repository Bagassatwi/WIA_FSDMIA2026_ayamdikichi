
import Link from "next/link";
import {
  Route,
  Trash2,
  Droplet,
  Lamp,
  Building2,
  Leaf,
} from "lucide-react";

const categories = [
  {
    title: "Infrastruktur Jalan",
    description: "Lubang, retak, jalan amblas",
    icon: Route,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Kebersihan",
    description: "Sampah menumpuk, TPS penuh",
    icon: Trash2,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Drainase",
    description: "Saluran tersumbat, genangan",
    icon: Droplet,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Penerangan Jalan",
    description: "Lampu mati atau rusak",
    icon: Lamp,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Fasilitas Umum",
    description: "Halte, taman, trotoar",
    icon: Building2,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Lingkungan",
    description: "Pohon rawan tumbang, polusi",
    icon: Leaf,
    color: "bg-emerald-100 text-emerald-700",
  },
];

function ReportList() {
  return (
    <section
      id="kategori-laporan"
      className="section"
      style={{ paddingTop: 0 }}
    >
      {/* Tetap menggunakan wrap asli: max-width 1200px */}
      <div className="wrap">

        {/* Heading */}
        <div className="section-head">
          <h2 className="text-[#10244a]">
            Apa yang ingin Anda laporkan?
          </h2>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[#dce5ef] bg-white shadow-[0_1px_4px_rgba(15,35,65,0.04)] sm:grid-cols-2 lg:grid-cols-3">

          {categories.map((category, index) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.title}
                href="/laporan"
                className={`
                  group flex min-h-[98px] items-center gap-4
                  px-5 py-4 transition-colors
                  hover:bg-blue-50/60
                  sm:px-6
                  ${index % 2 === 0 ? "sm:border-r sm:border-[#e5ebf2]" : ""}
                  ${index >= 2 ? "sm:border-t sm:border-[#e5ebf2]" : ""}
                  lg:border-t-0
                  ${index % 3 !== 2 ? "lg:border-r lg:border-[#e5ebf2]" : "lg:border-r-0"}
                  ${index >= 3 ? "lg:border-t lg:border-[#e5ebf2]" : ""}
                `}
              >
                {/* Icon Container */}
                <div
                  className={`
                    flex h-14 w-14 shrink-0 items-center
                    justify-center rounded-xl
                    ${category.color}
                    transition-transform duration-200
                    group-hover:scale-105
                  `}
                >
                  <Icon size={28} strokeWidth={2.5} />
                </div>

                {/* Category Text */}
                <div className="min-w-0">
                  <h3 className="text-[14px] font-bold leading-snug tracking-tight text-[#10244a]">
                    {category.title}
                  </h3>

                  <p className="mt-1 text-[12px] leading-[1.5] text-[#526174]">
                    {category.description}
                  </p>
                </div>
              </Link>
            );
          })}

        </div>
      </div>
    </section>
  );
}

export default ReportList;
