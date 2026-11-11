
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import {
  FiMapPin,
  FiCalendar,
  FiArrowRight,
  FiImage,
  FiFileText,
  FiAlertCircle,
} from "react-icons/fi";

import { createClient } from "@/lib/supabase/server";

type ReportPhoto = {
  id: string;
  storage_path: string;
  file_name: string | null;
};

type Report = {
  id: string;
  report_code: string | null;
  title: string | null;
  category: string | null;
  status: string;
  city: string | null;
  district: string | null;
  address: string | null;
  incident_date: string | null;
  created_at: string | null;
  report_photos: ReportPhoto[] | null;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; style: string; dot: string }
> = {
  pending: {
    label: "Menunggu Verifikasi",
    style: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
  verified: {
    label: "Terverifikasi",
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Ditolak",
    style: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
  },
  assigned: {
    label: "Telah Ditugaskan",
    style: "bg-blue-50 text-blue-700 ring-blue-200",
    dot: "bg-blue-500",
  },
  in_progress: {
    label: "Sedang Ditangani",
    style: "bg-violet-50 text-violet-700 ring-violet-200",
    dot: "bg-violet-500",
  },
  completed: {
    label: "Selesai Ditangani",
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "Ditutup",
    style: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-500",
  },
};

function formatDate(value: string | null) {
  if (!value) return "Tanggal tidak tersedia";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function getLocation(report: Report) {
  return [report.district, report.city]
    .filter(Boolean)
    .join(", ") || "Lokasi belum tersedia";
}

async function NewestReport() {
  await connection();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reports")
    .select(`
      id,
      report_code,
      title,
      category,
      status,
      city,
      district,
      address,
      incident_date,
      created_at,
      report_photos (
        id,
        storage_path,
        file_name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Gagal mengambil laporan terbaru:", error);
  }

  const reports = (data || []) as unknown as Report[];

  return (
    <section className="relative overflow-hidden bg-slate-50 px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Transparansi laporan publik
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-[#10244a] sm:text-3xl">
              Laporan terbaru dari warga
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Pantau laporan masyarakat dan perkembangan penanganannya
              secara transparan melalui JEJAKPUBLIK.
            </p>
          </div>

          <Link
            href="/laporan"
            className="group inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#10244a] shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Jelajahi semua laporan
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Error state */}
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center">
            <FiAlertCircle className="mx-auto text-3xl text-rose-500" />
            <h3 className="mt-3 font-bold text-slate-800">
              Laporan belum dapat dimuat
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Silakan coba kembali beberapa saat lagi.
            </p>
          </div>
        ) : reports.length === 0 ? (
          /* Empty state */
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <FiFileText size={28} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-800">
              Belum ada laporan
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Laporan masyarakat yang masuk akan ditampilkan di sini.
            </p>
          </div>
        ) : (
          /* Report cards */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => {
              const status =
                STATUS_CONFIG[report.status] || {
                  label: report.status,
                  style: "bg-slate-100 text-slate-600 ring-slate-200",
                  dot: "bg-slate-500",
                };

              const firstPhoto = report.report_photos?.[0];

              const imageUrl = firstPhoto
                ? supabase.storage
                    .from("report-photo")
                    .getPublicUrl(firstPhoto.storage_path).data.publicUrl
                : null;

              const detailHref = `/laporan/${report.report_code || report.id}`;

              return (
                <article
                  key={report.id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(15,35,65,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_15px_35px_rgba(15,35,65,0.10)]"
                >
                  {/* Image */}
                  <Link
                    href={detailHref}
                    className="relative block aspect-[16/10] overflow-hidden bg-slate-100"
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={firstPhoto?.file_name || report.title || "Foto laporan"}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-emerald-50 text-slate-400">
                        <FiImage size={34} />
                        <span className="mt-2 text-xs font-medium">
                          Foto belum tersedia
                        </span>
                      </div>
                    )}

                    {/* Image overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-70" />

                    {/* Report code */}
                    <div className="absolute bottom-3 left-3">
                      <span className="rounded-lg border border-white/20 bg-slate-950/60 px-2.5 py-1.5 font-mono text-[10px] font-semibold tracking-wide text-white backdrop-blur-md">
                        {report.report_code || "LAPORAN"}
                      </span>
                    </div>

                    {/* Photo count */}
                    {report.report_photos && report.report_photos.length > 0 && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-slate-950/60 px-2.5 py-1.5 text-[10px] font-medium text-white backdrop-blur-md">
                        <FiImage size={12} />
                        {report.report_photos.length} foto
                      </div>
                    )}
                  </Link>

                  {/* Card content */}
                  <div className="flex flex-1 flex-col p-5">
                    {/* Category and status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="max-w-[55%] truncate rounded-lg bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-600">
                        {report.category || "Umum"}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold ring-1 ring-inset ${status.style}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>

                    {/* Title */}
                    <Link href={detailHref}>
                      <h3 className="mt-4 line-clamp-2 min-h-[3.5rem] text-base font-bold leading-7 text-[#10244a] transition-colors group-hover:text-emerald-700">
                        {report.title || "Laporan masyarakat"}
                      </h3>
                    </Link>

                    {/* Location */}
                    <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">
                      <FiMapPin className="mt-0.5 shrink-0 text-emerald-600" />
                      <span className="line-clamp-2">
                        {getLocation(report)}
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 mt-5">
                      <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
                        <FiCalendar className="shrink-0 text-slate-400" />
                        <span className="truncate">
                          {formatDate(report.incident_date || report.created_at)}
                        </span>
                      </div>

                      <Link
                        href={detailHref}
                        className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-emerald-700 transition hover:text-emerald-900"
                      >
                        Detail
                        <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom information */}
        <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center sm:flex-row">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <p className="text-xs text-slate-500">
            Data laporan ditampilkan berdasarkan informasi yang tercatat
            dalam sistem JEJAKPUBLIK.
          </p>
        </div>
      </div>
    </section>
  );
}

export default NewestReport;
