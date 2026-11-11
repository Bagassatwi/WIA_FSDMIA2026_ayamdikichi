"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  MapPin,
  CalendarDays,
  FileText,
  Clock3,
  CheckCircle2,
  X,
  UserRound,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Report = {
  id: string;
  report_code: string | null;
  title: string;
  category: string;
  address: string | null;
  district: string | null;
  city: string | null;
  province: string | null;
  incident_date: string | null;
  created_at: string;
  reporter_name: string | null;
  status: string;
  description: string;
};

type ReportPhoto = {
  id: string;
  report_id: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  signedUrl?: string | null;
};

const statusConfig: Record<string, { label: string; style: string }> = {
  pending: {
    label: "Menunggu Verifikasi",
    style: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  verified: {
    label: "Terverifikasi",
    style: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  assigned: {
    label: "Ditugaskan",
    style: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
  in_progress: {
    label: "Dalam Penanganan",
    style: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  completed: {
    label: "Selesai",
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  rejected: {
    label: "Ditolak",
    style: "bg-red-50 text-red-700 ring-red-200",
  },
};

const categories = [
  "Infrastruktur Jalan",
  "Kebersihan",
  "Drainase",
  "Penerangan Jalan",
  "Fasilitas Umum",
  "Lingkungan",
];

function getStatus(status: string) {
  return (
    statusConfig[status?.toLowerCase()] ?? {
      label: status || "Tidak diketahui",
      style: "bg-slate-100 text-slate-600 ring-slate-200",
    }
  );
}

function getLocation(report: Report) {
  return (
    [report.address, report.district, report.city, report.province]
      .filter(Boolean)
      .join(", ") || "-"
  );
}

function formatDate(date: string | null) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

export default function LaporanPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua Status");
  const [category, setCategory] = useState("Semua Kategori");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [photos, setPhotos] = useState<ReportPhoto[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Mengambil data laporan dari Supabase
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("reports")
        .select(
          `
            id,
            report_code,
            title,
            category,
            address,
            district,
            city,
            province,
            incident_date,
            created_at,
            reporter_name,
            status,
            description
          `,
        )
        .eq("status", "assigned")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Gagal mengambil laporan:", error);
        setError(error.message);
        setReports([]);
      } else {
        setReports((data ?? []) as Report[]);
      }

      setLoading(false);
    };

    fetchReports();
  }, []);

  const handleUploadSolutionDocs = async () => {
    if (!selectedReport) return;

    if (selectedFiles.length === 0) {
      setUploadError("Pilih minimal satu foto atau file dokumentasi penanganan.");
      return;
    }

    setUploadingDocs(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const uploadedPaths: string[] = [];

      for (const file of selectedFiles) {
        const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
        console.log('niger');

        const { data: uploadedFile, error: uploadErrorData } = await supabase.storage
          .from("report-photo")
          .upload(safeName, file, {
            cacheControl: "3600",
            upsert: true,
            contentType: file.type || "application/octet-stream",
          });
        console.log('nighger ', safeName);

        if (uploadErrorData) {
          throw uploadErrorData;
        }

        if (!uploadedFile?.path) {
          throw new Error("Upload dokumentasi gagal dibuat.");
        }

        // const { error: insertError } = await supabase.from("report_photos").insert({
        //   report_id: selectedReport.id,
        //   storage_path: uploadedFile.path,
        //   file_name: file.name,
        //   file_size: file.size,
        //   mime_type: file.type || "application/octet-stream",
        // });

        // if (insertError) {
        //   throw insertError;
        // }

        uploadedPaths.push(uploadedFile.path);
      }

      const { error: updateError } = await supabase
        .from("reports")
        .update({ status: "completed" })
        .eq("id", selectedReport.id);

      if (updateError) {
        throw updateError;
      }

      setSelectedReport({
        ...selectedReport,
        status: "completed",
      });
      setSelectedFiles([]);
      setUploadSuccess(
        `Dokumentasi penanganan berhasil diunggah (${uploadedPaths.length} file).`,
      );
    } catch (error) {
      console.error("Gagal mengunggah dokumentasi penanganan:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Dokumentasi penanganan gagal diunggah.",
      );
    } finally {
      setUploadingDocs(false);
    }
  };

  useEffect(() => {
    if (!selectedReport) {
      setPhotos([]);
      setUploadError(null);
      setUploadSuccess(null);
      setSelectedFiles([]);
      return;
    }

    let isMounted = true;

    const fetchReportPhotos = async () => {
      setPhotosLoading(true);
      setPhotos([]);

      try {
        const { data, error } = await supabase
          .from("report_photos")
          .select(
            `
              id,
              report_id,
              storage_path,
              file_name,
              file_size,
              mime_type
            `,
          )
          .eq("report_id", selectedReport.id);

        if (error) throw error;

        if (!data || data.length === 0) {
          if (isMounted) setPhotos([]);
          return;
        }

        const photosWithUrl = await Promise.all(
          data.map(async (photo) => {
            const { data: signedData, error: signedError } =
              await supabase.storage
                .from("report-photo")
                .createSignedUrl(photo.storage_path, 3600);

            if (signedError) {
              return {
                ...photo,
                signedUrl: null,
              } as ReportPhoto;
            }

            return {
              ...photo,
              signedUrl: signedData?.signedUrl ?? null,
            } as ReportPhoto;
          }),
        );

        if (isMounted) {
          setPhotos(photosWithUrl.filter((photo) => photo.signedUrl));
        }
      } catch (err) {
        console.error("Gagal mengambil dokumentasi laporan:", err);
        if (isMounted) setPhotos([]);
      } finally {
        if (isMounted) setPhotosLoading(false);
      }
    };

    fetchReportPhotos();

    return () => {
      isMounted = false;
    };
  }, [selectedReport]);

  // Pencarian dan filter
  const filteredReports = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return reports.filter((report) => {
      const location = getLocation(report).toLowerCase();

      const matchesSearch =
        !keyword ||
        (report.report_code ?? "").toLowerCase().includes(keyword) ||
        report.title.toLowerCase().includes(keyword) ||
        location.includes(keyword) ||
        (report.reporter_name ?? "").toLowerCase().includes(keyword);

      const matchesStatus =
        status === "Semua Status" || getStatus(report.status).label === status;

      const matchesCategory =
        category === "Semua Kategori" || report.category === category;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [reports, search, status, category]);

  // Statistik berdasarkan seluruh data Supabase
  const stats = [
    {
      label: "Total Laporan",
      value: reports.length,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Menunggu Verifikasi",
      value: reports.filter((r) => r.status === "pending").length,
      icon: Clock3,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Dalam Penanganan",
      value: reports.filter((r) => r.status === "in_progress").length,
      icon: Clock3,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Selesai",
      value: reports.filter((r) => r.status === "completed").length,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="mx-auto max-w-[1700px] space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#102b59]">
          Laporan Masuk
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Daftar laporan yang dikirim oleh masyarakat melalui JEJAKPUBLIK.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-800">
                    {stat.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${stat.bg}`}>
                  <Icon size={22} className={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Daftar Laporan Masyarakat
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Pantau seluruh laporan yang telah dikirimkan oleh masyarakat.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mt-5 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kode laporan, judul, pelapor, atau lokasi..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
              >
                <option>Semua Status</option>
                <option>Menunggu Verifikasi</option>
                <option>Terverifikasi</option>
                <option>Ditugaskan</option>
                <option>Dalam Penanganan</option>
                <option>Selesai</option>
                <option>Ditolak</option>
              </select>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
              >
                <option>Semua Kategori</option>
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-250 text-left">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Kode Laporan</th>
                <th className="px-5 py-4">Informasi Laporan</th>
                <th className="px-5 py-4">Pelapor</th>
                <th className="px-5 py-4">Tanggal</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                      <Loader2 size={18} className="animate-spin" />
                      Memuat data laporan...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-red-600">
                      <AlertCircle size={18} />
                      Gagal memuat laporan: {error}
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {filteredReports.map((report) => {
                    const reportStatus = getStatus(report.status);

                    return (
                      <tr
                        key={report.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <span className="whitespace-nowrap text-xs font-semibold text-blue-600">
                            {report.report_code || "-"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {report.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {report.category}
                          </p>
                          <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                            <MapPin size={13} />
                            {getLocation(report)}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {report.reporter_name || "Anonim"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CalendarDays
                              size={15}
                              className="text-slate-400"
                            />
                            {formatDate(
                              report.incident_date || report.created_at,
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${reportStatus.style}`}
                          >
                            {reportStatus.label}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            title="Lihat detail laporan"
                            onClick={() => setSelectedReport(report)}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Eye size={17} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredReports.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-sm text-slate-500"
                      >
                        Tidak ada laporan yang sesuai dengan pencarian.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="border-t border-slate-200 px-5 py-4">
          <p className="text-sm text-slate-500">
            Menampilkan{" "}
            <span className="font-semibold text-slate-700">
              {filteredReports.length}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-slate-700">
              {reports.length}
            </span>{" "}
            laporan
          </p>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          role="presentation"
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-xs font-semibold text-blue-600">
                  {selectedReport.report_code || "-"}
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-800">
                  Detail Laporan
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Tutup detail"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {selectedReport.title}
                </h3>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatus(selectedReport.status).style}`}
                >
                  {getStatus(selectedReport.status).label}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-400">Kode Laporan</p>
                  <p className="mt-1 text-sm font-semibold text-blue-600">
                    {selectedReport.report_code || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Kategori</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {selectedReport.category}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Tanggal Laporan</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {formatDate(
                      selectedReport.incident_date || selectedReport.created_at,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Nama Pelapor</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <UserRound size={15} />
                    {selectedReport.reporter_name || "Anonim"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-400">Lokasi</p>
                  <p className="mt-1 flex items-start gap-2 text-sm font-medium text-slate-700">
                    <MapPin size={15} className="mt-0.5 shrink-0" />
                    {getLocation(selectedReport)}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Deskripsi Laporan
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {selectedReport.description || "-"}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Dokumentasi Insiden
                </p>

                {photosLoading ? (
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 size={16} className="animate-spin" />
                    Memuat dokumentasi...
                  </div>
                ) : photos.length > 0 ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {photos.map((photo) => (
                      <a
                        key={photo.id}
                        href={photo.signedUrl ?? undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition hover:border-blue-200 hover:bg-blue-50"
                        style={{
                          backgroundImage: photo.signedUrl
                            ? `url(${photo.signedUrl})`
                            : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        <div className="flex min-h-32 items-end bg-slate-950/20 p-3">
                          <span className="rounded-md bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-700">
                            {photo.file_name}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    Belum ada dokumentasi insiden yang diunggah untuk laporan ini.
                  </p>
                )}

                <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Unggah Dokumentasi Penanganan
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Lampirkan foto hasil penanganan untuk bukti penyelesaian masalah.
                      </p>
                    </div>
                  </div>

                  <label className="mt-4 flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const files = Array.from(event.target.files ?? []);
                        setSelectedFiles(files);
                        setUploadError(null);
                        setUploadSuccess(null);
                      }}
                    />
                    Pilih foto bukti penyelesaian
                  </label>

                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-1 text-xs text-slate-600">
                      {selectedFiles.map((file) => (
                        <div key={`${file.name}-${file.size}`} className="flex items-center justify-between rounded-md bg-white px-2 py-1.5 ring-1 ring-slate-200">
                          <span className="truncate">{file.name}</span>
                          <span className="text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadError && (
                    <p className="mt-3 text-sm text-red-600">{uploadError}</p>
                  )}

                  {uploadSuccess && (
                    <p className="mt-3 text-sm text-emerald-600">{uploadSuccess}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleUploadSolutionDocs}
                    disabled={uploadingDocs || selectedFiles.length === 0}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {uploadingDocs ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Mengunggah...
                      </>
                    ) : (
                      "Unggah dokumentasi penyelesaian"
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 p-5">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
