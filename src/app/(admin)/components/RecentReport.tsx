"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  UserRound,
  MapPin,
  Road,
  Trash2,
  Droplets,
  Lightbulb,
  Building2,
  Leaf,
  FileText,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

// ==========================================
// TYPES
// ==========================================

type Report = {
  id: string;
  report_code: string;
  title: string | null;
  category: string | null;
  reporter_name: string | null;
  address: string | null;
  district: string | null;
  city: string | null;
  province: string | null;
  status: string | null;
  created_at: string;
};

type StatusFilter =
  | "all"
  | "pending"
  | "in_progress"
  | "completed"
  | "rejected";

// ==========================================
// STATUS CONFIG
// ==========================================

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  pending: {
    label: "Menunggu Verifikasi",
    style: "bg-amber-100 text-amber-700",
  },
  menunggu_verifikasi: {
    label: "Menunggu Verifikasi",
    style: "bg-amber-100 text-amber-700",
  },
  submitted: {
    label: "Menunggu Verifikasi",
    style: "bg-amber-100 text-amber-700",
  },
  in_progress: {
    label: "Dalam Penanganan",
    style: "bg-blue-100 text-blue-700",
  },
  processing: {
    label: "Dalam Penanganan",
    style: "bg-blue-100 text-blue-700",
  },
  diproses: {
    label: "Dalam Penanganan",
    style: "bg-blue-100 text-blue-700",
  },
  assigned: {
    label: "Dalam Penanganan",
    style: "bg-blue-100 text-blue-700",
  },
  completed: {
    label: "Selesai",
    style: "bg-emerald-100 text-emerald-700",
  },
  resolved: {
    label: "Selesai",
    style: "bg-emerald-100 text-emerald-700",
  },
  rejected: {
    label: "Ditolak",
    style: "bg-red-100 text-red-700",
  },
  ditolak: {
    label: "Ditolak",
    style: "bg-red-100 text-red-700",
  },
};

function normalize(value: string | null) {
  return (value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");
}

// ==========================================
// CATEGORY CONFIG
// ==========================================

const CATEGORY_CONFIG = [
  {
    name: "Infrastruktur Jalan",
    aliases: ["jalan", "jalan rusak", "infrastruktur jalan"],
    icon: Road,
  },
  {
    name: "Kebersihan",
    aliases: ["bersih", "sampah", "kebersihan", "persampahan"],
    icon: Trash2,
  },
  {
    name: "Drainase",
    aliases: ["drainase", "saluran air", "selokan"],
    icon: Droplets,
  },
  {
    name: "Penerangan Jalan",
    aliases: ["penerangan", "penerangan jalan", "lampu jalan"],
    icon: Lightbulb,
  },
  {
    name: "Fasilitas Umum",
    aliases: ["fasilitas umum", "fasilitas"],
    icon: Building2,
  },
  {
    name: "Lingkungan",
    aliases: ["lingkungan", "lingkungan lainnya"],
    icon: Leaf,
  },
];

function getCategory(category: string | null) {
  const value = normalize(category);

  const found = CATEGORY_CONFIG.find((item) =>
    item.aliases.some((alias) => normalize(alias) === value),
  );

  return (
    found ?? {
      name: category || "Tidak Dikategorikan",
      icon: FileText,
    }
  );
}

// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(date: string) {
  const value = new Date(date);

  return {
    date: value.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }),
    time: value.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    }),
  };
}

// ==========================================
// COMPONENT
// ==========================================

export default function RecentReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FILTER
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState("desc");

  // PAGINATION
  const [page, setPage] = useState(1);

  const pageSize = 5;

  // ========================================
  // FETCH REPORTS
  // ========================================

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("reports")
        .select(
          "id, report_code, title, category, reporter_name, address, district, city, province, status, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        setError(error.message);
        setReports([]);
      } else {
        setReports(data ?? []);
      }

      setLoading(false);
    };

    fetchReports();
  }, []);

  // ========================================
  // FILTER HANDLER
  // ========================================

  function handleStatusChange(value: StatusFilter) {
    setStatus(value);
    setPage(1);
  }

  function handleSortChange(value: string) {
    setSort(value);
    setPage(1);
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <section className="overflow-hidden rounded-xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/40">
      {/* HEADER */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#102b59]">
            Daftar Laporan Terbaru
          </h2>

          <p className="mt-1 text-[11px] text-slate-400">
            Data laporan masyarakat dari database
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-2">
          {/* STATUS FILTER */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) =>
                handleStatusChange(e.target.value as StatusFilter)
              }
              className="appearance-none rounded-md border border-slate-200 bg-white py-2 pl-3 pr-8 text-[10px] text-slate-600 outline-none transition focus:border-blue-400"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu Verifikasi</option>
              <option value="in_progress">Dalam Penanganan</option>
              <option value="completed">Selesai</option>
              <option value="rejected">Ditolak</option>
            </select>

            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          {/* SORT FILTER */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none rounded-md border border-slate-200 bg-white py-2 pl-3 pr-8 text-[10px] text-slate-600 outline-none transition focus:border-blue-400"
            >
              <option value="desc">Terbaru</option>
              <option value="asc">Terlama</option>
            </select>

            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] border-collapse text-left text-[11px]">
          <thead>
            <tr className="bg-blue-50/70 text-slate-600">
              <th className="rounded-l-md px-3 py-3">Kode Laporan</th>

              <th className="px-3 py-3">Judul & Lokasi</th>

              <th className="px-3 py-3">Kategori</th>

              <th className="px-3 py-3">Pelapor</th>

              <th className="px-3 py-3">Tanggal</th>

              <th className="rounded-r-md px-3 py-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  Memuat data laporan...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  Tidak ada laporan ditemukan.
                </td>
              </tr>
            ) : (
              reports.map((report) => {
                const category = getCategory(report.category);
                const Icon = category.icon;

                const normalizedStatus = normalize(report.status);
                const statusInfo = STATUS_CONFIG[normalizedStatus];

                const date = formatDate(report.created_at);

                const location = [
                  report.address,
                  report.district,
                  report.city,
                  report.province,
                ]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <tr
                    key={report.id}
                    className="border-b border-slate-100 text-slate-600 transition hover:bg-slate-50/70 last:border-0"
                  >
                    {/* ID */}
                    <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-500">
                      #{report.report_code?.toUpperCase()}
                    </td>

                    {/* TITLE & LOCATION */}
                    <td className="max-w-[280px] px-3 py-3">
                      <p className="truncate font-semibold text-[#183765]">
                        {report.title || "Tanpa judul"}
                      </p>

                      <p
                        className="mt-1 flex items-center gap-1 text-[10px] text-slate-400"
                        title={location}
                      >
                        <MapPin size={10} className="shrink-0" />

                        <span className="truncate">
                          {location || "Lokasi tidak tersedia"}
                        </span>
                      </p>
                    </td>

                    {/* CATEGORY */}
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className="flex items-center gap-2">
                        <Icon size={16} className="shrink-0 text-blue-600" />

                        {category.name}
                      </span>
                    </td>

                    {/* REPORTER */}
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className="flex items-center gap-2">
                        <UserRound size={15} className="text-slate-400" />

                        {report.reporter_name || "Anonim"}
                      </span>
                    </td>

                    {/* DATE */}
                    <td className="whitespace-nowrap px-3 py-3">
                      <p>{date.date}</p>

                      <p className="mt-1 text-slate-400">{date.time} WIB</p>
                    </td>

                    {/* STATUS */}
                    <td className="px-3 py-3">
                      <span
                        className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-[10px] font-medium ${
                          statusInfo?.style ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {statusInfo?.label ??
                          report.status ??
                          "Belum diketahui"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
