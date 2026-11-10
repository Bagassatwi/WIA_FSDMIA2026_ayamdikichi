
"use client";

import Link from "next/link";
import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import {
  FiArrowRight,
  FiCalendar,
  FiMapPin,
  FiSearch,
  FiShield,
  FiFileText,
} from "react-icons/fi";

import { supabase } from "@/lib/supabase";
import type { ReportWithPhotos } from "../page";

// Warna status
const statusStyle: Record<string, string> = {
  verified: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-700",
  Selesai: "bg-emerald-50 text-emerald-700",
};

// Label status
const statusLabels: Record<string, string> = {
  verified: "Terverifikasi",
  pending: "Belum diverifikasi",
  rejected: "Ditinjau — ditolak",
  Selesai: "Selesai",
};

// Label kategori
const categoryLabels: Record<string, string> = {
  jalan: "Infrastruktur Jalan",
  bersih: "Kebersihan",
  drain: "Drainase",
  lampu: "Penerangan Jalan",
  ling: "Lingkungan",
};

// Format tanggal
function formatDate(value: string | null) {
  if (!value) return "Tanggal tidak tersedia";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak tersedia";
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function LaporanCard({
  sort,
  setSort,
  resetFilters,
  filteredReports,
}: {
  sort: string;
  setSort: Dispatch<SetStateAction<string>>;
  resetFilters: () => void;
  filteredReports: ReportWithPhotos[];
}) {
  // Mengambil URL foto dari Supabase Storage
  const getPhoto = (storagePath: string) => {
    const { data } = supabase.storage
      .from("report-photo")
      .getPublicUrl(storagePath);

    return data.publicUrl;
  };

  // Mengambil label lokasi
  const getLocation = (report: ReportWithPhotos) => {
    return report.city || "Lokasi tidak tersedia";
  };

  return (
    <section aria-live="polite" className="min-w-0">

      {/* Header jumlah laporan dan sorting */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <p className="text-sm text-slate-600">
          Menampilkan{" "}
          <span className="font-semibold text-slate-900">
            {filteredReports.length} laporan
          </span>
        </p>

        <div className="flex items-center gap-3">
          <label
            htmlFor="sort"
            className="shrink-0 text-sm text-slate-600"
          >
            Urutkan
          </label>

          <select
            id="sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            <option value="baru">Terbaru</option>
            <option value="lama">Terlama</option>
          </select>
        </div>
      </div>

      {/* Grid laporan */}
      {filteredReports.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

          {filteredReports.map((report) => {
            const firstPhoto =
              report.report_photos?.[0];

            const photoUrl = firstPhoto
              ? getPhoto(firstPhoto.storage_path)
              : null;

            const status = String(report.status);

            return (
              <article
                key={report.id}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-slate-200/60"
              >

                {/* Foto laporan */}
                <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-slate-100">

                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt={report.title}
                      width={1000}
                      height={625}
                      unoptimized
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-center">
                      <FiFileText
                        size={36}
                        className="mx-auto text-slate-400"
                      />

                      <p className="mt-2 text-xs text-slate-500">
                        Foto tidak tersedia
                      </p>
                    </div>
                  )}

                  {/* Jumlah foto */}
                  {report.report_photos?.length > 1 && (
                    <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                      {report.report_photos.length} foto
                    </span>
                  )}

                </div>

                {/* Informasi laporan */}
                <div className="p-4">

                  {/* Kategori dan status */}
                  <div className="mb-3 flex flex-wrap items-center gap-2">

                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {categoryLabels[report.category] ??
                        report.category}
                    </span>

                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                        statusStyle[status] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {statusLabels[status] ?? status}
                    </span>

                  </div>

                  {/* Judul */}
                  <h3 className="min-h-[48px] text-base font-semibold leading-6 text-slate-900 transition-colors group-hover:text-blue-700">
                    {report.title}
                  </h3>

                  {/* Detail lokasi dan verifikasi */}
                  <div className="mt-3 space-y-2 text-sm text-slate-500">

                    <p className="flex items-start gap-2">
                      <FiMapPin
                        className="mt-0.5 shrink-0"
                        size={15}
                      />

                      <span>{getLocation(report)}</span>
                    </p>

                    <p className="flex items-center gap-2">
                      <FiShield
                        className="shrink-0"
                        size={15}
                      />

                      {status === "verified"
                        ? "Terverifikasi"
                        : status === "rejected"
                          ? "Ditinjau — ditolak"
                          : status === "pending"
                            ? "Belum diverifikasi"
                            : status}
                    </p>

                  </div>
                  {/* Footer card */}
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <span className="flex items-center gap-2 text-xs text-slate-500">
                      <FiCalendar size={14} />
                      {formatDate(report.incident_date)}
                    </span>
                    <Link
                      href={`/laporan/${report.report_code ?? report.id}`}
                      className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-700 transition-colors hover:text-blue-900"
                    >
                      Lihat detail
                      <FiArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}

        </div>
      )}

      {/* Empty state */}
      {filteredReports.length === 0 && (
        <div className="rounded-xl border border-slate-200 px-5 py-12 text-center">

          <FiSearch
            size={30}
            className="mx-auto text-slate-400"
          />

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Tidak ada laporan yang cocok
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Coba kata kunci lain atau hapus beberapa filter.
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            Atur ulang filter
          </button>

        </div>
      )}

    </section>
  );
}
