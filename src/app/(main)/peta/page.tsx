"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { getCategoryLabel } from "@/lib/category";
import { supabase } from "@/lib/supabase";
import type { Report } from "@/types/report";

import { FiSearch, FiRotateCcw } from "react-icons/fi";

import {
  MapPin,
  CalendarDays,
  ArrowUpRight,
  ImageOff,
  Images,
} from "lucide-react";

// ==========================================
// TYPE FOTO LAPORAN
// ==========================================

type ReportPhoto = {
  id: string;
  report_id: string;
  storage_path: string;
  file_name: string | null;
  photo_url: string | null;
};

// ==========================================
// PENGAMBILAN URL FOTO
// Menggunakan metode yang sama dengan Page Laporan
// ==========================================

const getPhoto = (storagePath: string) => {
  const { data } = supabase.storage
    .from("report-photo")
    .getPublicUrl(storagePath);

  return data.publicUrl;
};

// ==========================================
// DYNAMIC IMPORT LEAFLET
// ==========================================

const ReportMap = dynamic(() => import("../_components/peta/ReportMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] items-center justify-center rounded-xl bg-slate-100">
      Memuat peta...
    </div>
  ),
});

// ==========================================
// KATEGORI LAPORAN
// ==========================================

const categories = [
  { label: "Infrastruktur Jalan", value: "jalan" },
  { label: "Kebersihan", value: "bersih" },
  { label: "Drainase", value: "drain" },
  { label: "Penerangan Jalan", value: "lampu" },
  { label: "Lingkungan", value: "ling" },
];

// ==========================================
// STATUS LAPORAN
// ==========================================
const statuses = [
  { label: "Menunggu Verifikasi", value: "pending" },
  { label: "Terverifikasi", value: "verified" },
  { label: "Ditolak", value: "rejected" },
  { label: "Telah Ditugaskan", value: "assigned" },
  { label: "Sedang Ditangani", value: "in_progress" },
  { label: "Selesai", value: "completed" },
];

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  verified: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  assigned: "bg-blue-50 text-blue-700",
  in_progress: "bg-violet-50 text-violet-700",
  completed: "bg-emerald-50 text-emerald-700",
};

// ==========================================
// MAIN PAGE
// ==========================================

export default function PetaLaporan() {
  const [reports, setReports] = useState<Report[]>([]);

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [reportPhotos, setReportPhotos] = useState<ReportPhoto[]>([]);

  const [photosLoading, setPhotosLoading] = useState(false);
  const [photosError, setPhotosError] = useState<string | null>(null);

  const [keyword, setKeyword] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);

  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==========================================
  // MENGAMBIL DATA LAPORAN
  // ==========================================

  useEffect(() => {
    let active = true;

    async function fetchReports() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("reports_public")
        .select(
          `
          id,
          report_code,
          title,
          description,
          category,
          incident_date,
          province,
          city,
          district,
          address,
          latitude,
          longitude,
          status,
          created_at
        `,
        )
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        console.error("Gagal mengambil laporan:", error);

        setError("Gagal memuat data laporan.");
        setLoading(false);

        return;
      }

      const validReports = (data ?? []).filter(
        (report) =>
          typeof report.latitude === "number" &&
          typeof report.longitude === "number" &&
          Number.isFinite(report.latitude) &&
          Number.isFinite(report.longitude),
      ) as Report[];

      setReports(validReports);
      setLoading(false);
    }

    fetchReports();

    return () => {
      active = false;
    };
  }, []);

  // ==========================================
  // MENGAMBIL FOTO LAPORAN
  // Menggunakan getPublicUrl seperti Page Laporan
  // ==========================================

  useEffect(() => {
    let active = true;

    async function fetchReportPhotos() {
      if (!selectedReport) {
        setReportPhotos([]);
        setPhotosError(null);
        return;
      }

      setPhotosLoading(true);
      setPhotosError(null);
      setReportPhotos([]);

      try {
        const { data, error } = await supabase
          .from("report_photos")
          .select("id, report_id, storage_path, file_name")
          .eq("report_id", selectedReport.id);

        if (error) throw error;

        // Membuat URL foto menggunakan getPublicUrl
        const photosWithUrls: ReportPhoto[] = (data ?? []).map((photo) => ({
          ...photo,
          photo_url: getPhoto(photo.storage_path),
        }));

        if (active) {
          setReportPhotos(photosWithUrls);
        }
      } catch (err) {
        console.error("Gagal mengambil foto laporan:", err);

        if (active) {
          setPhotosError(
            "Foto laporan belum dapat dimuat. Periksa izin akses tabel dan bucket.",
          );
        }
      } finally {
        if (active) {
          setPhotosLoading(false);
        }
      }
    }

    fetchReportPhotos();

    return () => {
      active = false;
    };
  }, [selectedReport?.id]);

  // ==========================================
  // FILTER LAPORAN
  // ==========================================

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const searchText = [
        report.title,
        report.address,
        report.district,
        report.city,
        report.report_code,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesKeyword = searchText.includes(keyword.toLowerCase());

      const matchesCategory =
        selectedCategory.length === 0 ||
        selectedCategory.includes(report.category);

      const matchesStatus =
        selectedStatus.length === 0 || selectedStatus.includes(report.status);

      return matchesKeyword && matchesCategory && matchesStatus;
    });
  }, [reports, keyword, selectedCategory, selectedStatus]);

  // ==========================================
  // TOGGLE FILTER
  // ==========================================

  function toggleFilter(
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) {
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  // ==========================================
  // RESET FILTER
  // ==========================================

  function resetFilters() {
    setKeyword("");
    setSelectedCategory([]);
    setSelectedStatus([]);
    setSelectedReport(null);
    setReportPhotos([]);
    setPhotosError(null);
  }

  // ==========================================
  // RENDER PAGE
  // ==========================================

  return (
    <main className="min-h-screen bg-white text-slate-800">
      {/* HEADER */}

      <section className="border-b border-slate-200 bg-slate-50 px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 text-sm text-slate-500">
            Beranda / Peta Laporan
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Peta Laporan
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Pilih titik di peta untuk melihat laporan dan jejak penanganannya.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}

      <section className="px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            {/* ==================================
                SIDEBAR FILTER
            ================================== */}

            <aside className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-5 font-semibold text-slate-900">
                Cari dan filter laporan
              </h2>

              {/* SEARCH */}

              <label className="mb-2 block text-sm font-medium">
                Cari lokasi atau laporan
              </label>

              <div className="relative mb-6">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Kecamatan atau nama jalan"
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-600"
                />
              </div>

              {/* FILTER KATEGORI */}

              <fieldset className="mb-6">
                <legend className="mb-3 text-sm font-medium">Kategori</legend>

                <div className="flex flex-wrap gap-2">
                  {categories.map((item) => {
                    const active = selectedCategory.includes(item.value);

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                          toggleFilter(item.value, setSelectedCategory)
                        }
                        className={`rounded-md border px-3 py-2 text-xs transition ${
                          active
                            ? "border-blue-700 bg-blue-700 text-white"
                            : "border-slate-200 text-slate-600 hover:border-blue-300"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* FILTER STATUS */}

              <fieldset className="mb-6">
                <legend className="mb-3 text-sm font-medium">
                  Status laporan
                </legend>

                <div className="space-y-3">
                  {statuses.map((item) => {
                    const active = selectedStatus.includes(item.value);

                    return (
                      <label
                        key={item.value}
                        className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() =>
                            toggleFilter(item.value, setSelectedStatus)
                          }
                          className="accent-blue-700"
                        />

                        {item.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* JUMLAH LAPORAN DAN RESET */}

              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-500">
                  <strong className="text-slate-900">
                    {filteredReports.length}
                  </strong>{" "}
                  laporan di peta
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition hover:bg-slate-50"
                >
                  <FiRotateCcw size={15} />
                  Atur ulang filter
                </button>
              </div>
            </aside>

            {/* ==================================
                MAP AND DETAIL
            ================================== */}

            <div className="min-w-0 space-y-6">
              {/* MAP */}

              <section>
                {loading ? (
                  <div className="flex h-[520px] items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">
                    Memuat data laporan...
                  </div>
                ) : error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                    {error}
                  </div>
                ) : (
                  <ReportMap
                    reports={filteredReports}
                    onSelectReport={setSelectedReport}
                  />
                )}

                {/* LEGEND */}

                <div className="mt-3 flex flex-wrap gap-5 rounded-lg border border-slate-200 p-4 text-xs text-slate-600">
                  {statuses.map((item) => {
                    const colors: Record<string, string> = {
                      pending: "#D97706",
                      verified: "#059669",
                      rejected: "#DC2626",
                      assigned: "#2563EB",
                      in_progress: "#7C3AED",
                      completed: "#059669",
                    };

                    return (
                      <div key={item.value} className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: colors[item.value],
                          }}
                        />

                        {item.label}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ==================================
                  SELECTED REPORT DETAIL
              ================================== */}

              {selectedReport && (
                <aside
                  aria-label="Laporan terpilih"
                  aria-live="polite"
                  className="mx-auto w-full max-w-6xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-[180px_minmax(0,1fr)]">
                    {/* FOTO LAPORAN */}

                    <div className="relative min-h-40 overflow-hidden bg-slate-100 sm:min-h-0">
                      {photosLoading ? (
                        <div className="flex h-40 items-center justify-center text-xs text-slate-500 sm:h-full">
                          Memuat foto...
                        </div>
                      ) : reportPhotos.filter((photo) => photo.photo_url)
                          .length > 0 ? (
                        <div className="grid h-40 grid-cols-2 gap-0.5 sm:absolute sm:inset-0 sm:h-full">
                          {reportPhotos
                            .filter((photo) => photo.photo_url)
                            .slice(0, 1)
                            .map((photo) => (
                              <div
                                key={photo.id}
                                className="relative col-span-2 min-h-0 overflow-hidden"
                              >
                                <img
                                  src={photo.photo_url!}
                                  alt={
                                    photo.file_name ??
                                    `Foto laporan ${selectedReport.title}`
                                  }
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />

                                {/* JUMLAH FOTO */}

                                {reportPhotos.filter((item) => item.photo_url)
                                  .length > 1 && (
                                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                                    <Images size={14} />
                                    {
                                      reportPhotos.filter(
                                        (item) => item.photo_url,
                                      ).length
                                    }{" "}
                                    foto
                                  </span>
                                )}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="flex h-40 flex-col items-center justify-center gap-2 text-slate-400 sm:h-full">
                          <ImageOff size={28} strokeWidth={1.5} />

                          <span className="text-xs text-center px-2">
                            {photosError ?? "Foto tidak tersedia"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* INFORMASI LAPORAN */}

                    <div className="min-w-0 p-4 sm:p-5">
                      {/* METADATA */}

                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold tracking-wide text-slate-500">
                          {selectedReport.report_code ?? "Laporan publik"}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-600">
                          {getCategoryLabel(selectedReport.category)}
                        </span>

                        <span
                          className={`rounded-md px-2 py-1 text-xs font-semibold ${
                            statusColors[selectedReport.status] ??
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {statuses.find(
                            (item) => item.value === selectedReport.status,
                          )?.label ?? selectedReport.status}
                        </span>
                      </div>

                      {/* JUDUL */}

                      <h2 className="text-lg font-semibold leading-snug text-slate-900">
                        {selectedReport.title}
                      </h2>

                      {/* LOKASI DAN TANGGAL */}

                      <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500">
                        <div className="flex items-start gap-2">
                          <MapPin
                            size={16}
                            className="mt-0.5 shrink-0 text-emerald-600"
                          />

                          <span className="min-w-0">
                            {[
                              selectedReport.address,
                              selectedReport.district,
                              selectedReport.city,
                            ]
                              .filter(Boolean)
                              .join(", ") || "Lokasi tidak tersedia"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <CalendarDays
                            size={16}
                            className="shrink-0 text-slate-400"
                          />

                          <span>
                            {selectedReport.incident_date
                              ? new Date(
                                  `${selectedReport.incident_date}T00:00:00`,
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "Tanggal tidak tersedia"}
                          </span>
                        </div>
                      </div>

                      {/* DESKRIPSI */}

                      {selectedReport.description && (
                        <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600">
                          {selectedReport.description}
                        </p>
                      )}

                      {/* TOMBOL DETAIL */}

                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <a
                          href={`/laporan/${selectedReport.report_code ?? selectedReport.id}`}
                          className="group inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                        >
                          Lihat Jejak Penanganan
                          <ArrowUpRight
                            size={17}
                            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                </aside>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
