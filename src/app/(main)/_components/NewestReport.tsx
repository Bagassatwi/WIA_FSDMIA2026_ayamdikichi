import Image from "next/image";
import Link from "next/link";
import {
  FiMapPin,
  FiCalendar,
  FiArrowRight,
} from "react-icons/fi";

const reports = [
  {
    image: "/assets/images/png/lubang.jpg",
    imageAlt: "Lubang besar pada permukaan jalan",
    category: "Infrastruktur Jalan",
    status: "Diproses",
    statusStyle: "bg-blue-100 text-blue-700",
    title: "Lubang besar di Jl. Ijen depan SDN Kauman",
    location: "Klojen, Kota Malang",
    date: "12 Okt 2025",
    href: "/detail-laporan",
  },
  {
    image: "/assets/images/png/saluran.jpg",
    imageAlt: "Sampah menumpuk di saluran drainase",
    category: "Drainase",
    status: "Selesai",
    statusStyle: "bg-emerald-100 text-emerald-700",
    title: "Saluran tersumbat sampah di Jl. Soekarno-Hatta",
    location: "Lowokwaru, Kota Malang",
    date: "3 Okt 2025",
    href: "/detail-laporan-selesai",
  },
  {
    image: "/assets/images/png/lampu.jpg",
    imageAlt: "Lampu penerangan jalan pada malam hari",
    category: "Penerangan Jalan",
    status: "Diterima",
    statusStyle: "bg-amber-100 text-amber-700",
    title: "Lima lampu PJU mati di jalur Pandaan–Malang",
    location: "Singosari, Kab. Malang",
    date: "25 Okt 2025",
    href: "/detail-laporan",
  },
];

function NewestReport() {
  return (
    <section className="px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-7xl">

        {/* Section Heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#10244a] sm:text-[26px]">
            Laporan terbaru dari warga
          </h2>

          <p className="mt-1.5 text-xs font-medium text-[#526174] sm:text-[13px]">
            Contoh laporan aktual lengkap dengan status penanganannya.
          </p>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {reports.map((report) => (
            <article
              key={report.title}
              className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#e2eaf2] bg-white shadow-[0_3px_12px_rgba(15,35,65,0.07)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(15,35,65,0.12)]"
            >

              {/* Report Image */}
              <Link
                href={report.href}
                className="relative block aspect-[16/9] overflow-hidden bg-slate-100"
              >
                <Image
                  src={report.image}
                  alt={report.imageAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>

              {/* Card Content */}
              <div className="flex flex-1 flex-col gap-2 px-3.5 py-3">

                {/* Category & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="max-w-[65%] truncate rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-semibold text-[#334155] sm:text-[10px]">
                    {report.category}
                  </span>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold ${report.statusStyle}`}
                  >
                    {report.status}
                  </span>
                </div>

                {/* Title */}
                <h3 className="line-clamp-2 min-h-[40px] text-[13px] font-bold leading-[1.4] tracking-tight text-[#10244a] sm:text-[14px]">
                  {report.title}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-[11px] text-[#526174]">
                  <FiMapPin
                    size={14}
                    className="shrink-0 fill-[#10244a] text-[#10244a]"
                  />
                  <span className="truncate">{report.location}</span>
                </div>

                {/* Footer */}
                <div className="mt-1 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">

                  <div className="flex items-center gap-1.5 text-[11px] text-[#526174]">
                    <FiCalendar
                      size={13}
                      className="shrink-0 text-[#10244a]"
                    />
                    <span className="whitespace-nowrap">
                      {report.date}
                    </span>
                  </div>

                  <Link
                    href={report.href}
                    className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-[#1471d4] transition-colors hover:text-[#0754a5]"
                  >
                    Lihat detail
                    <FiArrowRight size={13} />
                  </Link>

                </div>
              </div>
            </article>
          ))}

        </div>
      </div>
    </section>
  );
}

export default NewestReport;