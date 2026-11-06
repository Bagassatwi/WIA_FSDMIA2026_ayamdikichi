import {
  FiMapPin,
} from "react-icons/fi";

const mapStatuses = [
  {
    title: "Sedang diproses",
    description: "3 titik pada area ini",
    color: "bg-blue-600",
  },
  {
    title: "Menunggu verifikasi",
    description: "2 titik pada area ini",
    color: "bg-amber-500",
  },
  {
    title: "Selesai dengan bukti",
    description: "2 titik pada area ini",
    color: "bg-emerald-600",
  },
  {
    title: "Melewati target waktu",
    description: "1 titik pada area ini",
    color: "bg-red-600",
  },
];

function Maps() {
  return (
    <section
      id="peta"
      className="px-5 py-16 sm:px-8 lg:px-10 lg:py-20"
    >
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-[#10244a] sm:text-3xl">
            Lihat sebaran laporan di sekitar Anda
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Pantau peta real-time dengan titik laporan terbaru.
          </p>
        </div>

        {/* Map and Legend */}
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-[1.5fr_0.8fr] lg:gap-8">

          {/* Map Image */}
          <div className="relative min-h-[280px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:min-h-[350px] lg:min-h-[390px]">
            <img
              src="/assets/images/png/maps.png"
              alt="Peta sebaran laporan masyarakat"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          {/* Map Legend */}
          <div className="flex flex-col">

            <h3 className="mb-4 text-base font-bold text-[#10244a]">
              Status laporan
            </h3>

            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {mapStatuses.map((status) => (
                <div
                  key={status.title}
                  className="flex items-center gap-4 py-5"
                >

                  {/* Status Indicator */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                    <span
                      className={`h-3.5 w-3.5 rounded-full ${status.color}`}
                    />
                  </div>

                  {/* Status Text */}
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-[#10244a]">
                      {status.title}
                    </h4>

                    <p className="mt-1 text-xs text-slate-500">
                      {status.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Map Information */}
            <div className="mt-auto flex items-start gap-2 pt-5 text-xs leading-relaxed text-slate-500">
              <FiMapPin
                size={16}
                className="mt-0.5 shrink-0 text-blue-600"
              />
              <p>
                Lokasi dan status laporan ditampilkan berdasarkan data
                yang tercatat dalam sistem.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default Maps;