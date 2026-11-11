
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import {
  FiArrowRight,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiSearch,
  FiShield,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import { supabase } from "@/lib/supabase";
import type { ReportWithPhotos } from "../page";

const PAGE_SIZE = 9;

// Warna status
const statusStyle: Record<string, string> = {
  verified: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-700",
  assigned: "bg-blue-50 text-blue-700",
  in_progress: "bg-violet-50 text-violet-700",
  completed: "bg-emerald-50 text-emerald-700",
};

// Label status
const statusLabels: Record<string, string> = {
  verified: "Terverifikasi",
  pending: "Belum diverifikasi",
  rejected: "Ditinjau — ditolak",
  assigned: "Telah Ditugaskan",
  in_progress: "Sedang Ditangani",
  completed: "Selesai",
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
  const [currentPage, setCurrentPage] = useState(1);

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

  // Reset halaman ketika hasil laporan berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredReports]);

  // Perhitungan pagination
  const totalPages = Math.ceil(filteredReports.length / PAGE_SIZE);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;

  const paginatedReports = filteredReports.slice(startIndex, endIndex);

  const startItem =
    filteredReports.length === 0 ? 0 : startIndex + 1;

  const endItem = Math.min(endIndex, filteredReports.length);

  // Menghasilkan nomor halaman
  const getPageNumbers = () => {
    const pages: number[] = [];

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 2) {
      end = Math.min(totalPages, 5);
    }

    if (currentPage >= totalPages - 1) {
      start = Math.max(1, totalPages - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <section aria-live="polite" className="min-w-0">

      {/* Header jumlah laporan dan sorting */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Menampilkan{" "}
          <span className="font-semibold text-slate-900">
            {startItem}–{endItem} dari {filteredReports.length} laporan
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
            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            <option value="baru">Terbaru</option>
            <option value="lama">Terlama</option>
          </select>
        </div>
      </div>

      {/* Grid laporan */}
      {filteredReports.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {paginatedReports.map((report) => {
            const firstPhoto = report.report_photos?.[0];

            const photoUrl = firstPhoto
              ? getPhoto(firstPhoto.storage_path)
              : null;

            const status = String(report.status);

            const detailUrl = `/laporan/${report.report_code ?? report.id}`;

            return (
              <Link
                key={report.id}
                href={detailUrl}
                aria-label={`Lihat detail laporan ${report.title}`}
                className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-slate-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
                      {categoryLabels[report.category] ?? report.category}
                    </span>

                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                        statusStyle[status] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {statusLabels[status] ?? status}
                    </span>
                  </div>

                  {/* Judul */}
                  <h3 className="min-h-[48px] text-base font-semibold leading-6 text-slate-900 transition-colors group-hover:text-blue-700">
                    {report.title}
                  </h3>

                  {/* Lokasi dan verifikasi */}
                  <div className="mt-3 space-y-2 text-sm text-slate-500">
                    <p className="flex items-start gap-2">
                      <FiMapPin
                        className="mt-0.5 shrink-0"
                        size={15}
                      />

                      <span>{getLocation(report)}</span>
                    </p>

                    <p className="flex items-center gap-2">
                      <FiShield className="shrink-0" size={15} />

                      {status === "verified"
                        ? "Terverifikasi"
                        : status === "rejected"
                          ? "Ditinjau — ditolak"
                          : status === "pending"
                            ? "Belum diverifikasi"
                            : status}
                    </p>
                  </div>

                  {/* Informasi pelapor */}
                  <div className="mt-3 flex items-start gap-2 text-sm">
                    <FiUser
                      size={15}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <div>
                      {report.privacy === "anonymous" ? (
                        <>
                          <p className="font-medium text-slate-500">
                            Pelapor warga
                          </p>

                          <p className="text-xs text-slate-400">
                            Identitas dirahasiakan oleh pelapor
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-slate-700">
                            {report.reporter_name ||
                              "Nama pelapor tidak tersedia"}
                          </p>

                          <p className="text-xs text-slate-400">
                            Pelapor
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Footer card */}
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <span className="flex items-center gap-2 text-xs text-slate-500">
                      <FiCalendar size={14} />
                      {formatDate(report.incident_date)}
                    </span>

                    <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-700 transition-colors group-hover:text-blue-900">
                      Lihat detail

                      <FiArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {filteredReports.length > 0 && totalPages > 1 && (
        <nav
          aria-label="Navigasi halaman laporan"
          className="mt-8 flex flex-wrap items-end justify-end gap-2"
        >
          {/* Sebelumnya */}
          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) => Math.max(1, page - 1))
            }
            disabled={currentPage === 1}
            aria-label="Halaman sebelumnya"
            className="flex h-10 cursor-pointer items-center gap-1 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiChevronLeft size={16} />
          </button>

          {/* Nomor halaman */}
          {getPageNumbers().map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              aria-current={currentPage === page ? "page" : undefined}
              className={`flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-medium transition ${
                currentPage === page
                  ? "border-blue-700 bg-blue-700 text-white shadow-sm"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Berikutnya */}
          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) =>
                Math.min(totalPages, page + 1),
              )
            }
            disabled={currentPage === totalPages}
            aria-label="Halaman berikutnya"
            className="flex h-10 cursor-pointer items-center gap-1 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiChevronRight size={16} />
          </button>
        </nav>
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
            className="mt-5 cursor-pointer rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            Atur ulang filter
          </button>
        </div>
      )}
    </section>
  );
}
