import React from "react";
import { MapPin } from "lucide-react";

const mapStatuses = [
  {
    title: "Sedang diproses",
    description: "3 titik pada area ini",
    color: "text-blue-600",
  },
  {
    title: "Menunggu verifikasi",
    description: "2 titik pada area ini",
    color: "text-amber-500",
  },
  {
    title: "Selesai dengan bukti",
    description: "2 titik pada area ini",
    color: "text-emerald-600",
  },
  {
    title: "Melewati target waktu",
    description: "1 titik pada area ini",
    color: "text-red-600",
  },
];

function Maps() {
  return (
    <section className="section" id="peta">
      <div className="wrap">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Lihat sebaran laporan di sekitar Anda
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Pantau peta real-time dengan titik laporan terbaru.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-[1.25fr_0.95fr]">
          {/* Map Image */}
          <div className="h-[285px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-[250px]">
            <img
              src="/assets/images/png/maps.png"
              alt="Peta sebaran laporan masyarakat"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Map Legend */}
          <div className="grid grid-cols-1 grid-rows-4 gap-2">
            {mapStatuses.map((status) => (
              <div
                key={status.title}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
              >
                <MapPin
                  size={24}
                  strokeWidth={2.5}
                  className={`shrink-0 ${status.color}`}
                  fill="currentColor"
                />

                <div className="min-w-0 space-y-1">
                  <h3 className="text-sm font-semibold leading-tight text-slate-900">
                    {status.title}
                  </h3>

                  <p className="text-xs leading-tight text-slate-500">
                    {status.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Maps;
