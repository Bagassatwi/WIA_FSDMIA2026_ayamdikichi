"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  MapPin,
  CalendarDays,
  Clock3,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
  UserRound,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileText,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

// ==========================================
// TYPES
// ==========================================

type Report = {
  id: string;
  report_code: string | null;
  title: string;
  category: string;
  address: string | null;
  district: string | null;
  city: string | null;
  province: string | null;
  created_at: string;
  reporter_name: string | null;
  description: string;
  status: string;
  rejection_reason: string | null;
};

type ReportPhoto = {
  id: string;
  report_id: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  signedUrl?: string;
};

type ReportValidation = {
  duplicate_detected: boolean;
  spam_detected: boolean;
  spam_checked: boolean;
  validation_notes: string[];
  checked_at: string;
};

// ==========================================
// STATUS CONFIGURATION
// ==========================================

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  pending: {
    label: "Menunggu Verifikasi",
    style: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  verified: {
    label: "Terverifikasi",
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
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
    style: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  rejected: {
    label: "Ditolak",
    style: "bg-red-50 text-red-700 ring-red-200",
  },
};

function getStatus(status: string) {
  return (
    STATUS_CONFIG[status] ?? {
      label: status || "Tidak diketahui",
      style: "bg-slate-100 text-slate-600 ring-slate-200",
    }
  );
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getLocation(report: Report) {
  return (
    [report.address, report.district, report.city, report.province]
      .filter(Boolean)
      .join(", ") || "-"
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function VerifikasiPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [photos, setPhotos] = useState<ReportPhoto[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);

  const [validationResult, setValidationResult] =
    useState<ReportValidation | null>(null);

  const [validationLoading, setValidationLoading] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // ==========================================
  // FETCH REPORTS
  // ==========================================

  const fetchReports = useCallback(async () => {
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
        created_at,
        reporter_name,
        description,
        status,
        rejection_reason
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal mengambil laporan:", error);
      setError(error.message);
      setReports([]);
    } else {
      setReports((data ?? []) as Report[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);
  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("SESSION:", session);
      console.log("SESSION ERROR:", sessionError);

      const { data, error } = await supabase.rpc("is_active_admin");

      console.log("HASIL CEK ADMIN:", data);
      console.log("ERROR RPC:", error);
    };

    checkAdmin();
  }, []);

  // ==========================================
  // FETCH REPORT PHOTOS
  // ==========================================

  const fetchReportPhotos = async (reportId: string) => {
    setPhotosLoading(true);
    setPhotos([]);

    try {
      // ==========================================
      // 1. DEBUG SESSION ADMIN
      // ==========================================

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("SESSION ERROR:", sessionError);
      console.log("USER:", session?.user);
      console.log("APP METADATA:", session?.user?.app_metadata);

      // ==========================================
      // 2. AMBIL METADATA FOTO
      // ==========================================

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
        .eq("report_id", reportId);

      if (error) throw error;

      console.log("METADATA FOTO:", data);
      console.log("JUMLAH FOTO:", data?.length ?? 0);

      if (!data || data.length === 0) {
        setPhotos([]);
        return;
      }

      // ==========================================
      // 3. BUAT SIGNED URL STORAGE
      // ==========================================

      const photosWithUrl = await Promise.all(
        data.map(async (photo) => {
          console.log("STORAGE PATH:", photo.storage_path);

          const { data: signedData, error: signedError } =
            await supabase.storage
              .from("report-photo")
              .createSignedUrl(photo.storage_path, 3600);

          if (signedError) {
            console.error("SIGNED URL ERROR:", photo.file_name, signedError);

            return {
              ...photo,
              signedUrl: undefined,
              loadError: signedError.message,
            };
          }

          console.log(
            "SIGNED URL BERHASIL:",
            photo.file_name,
            signedData?.signedUrl,
          );

          return {
            ...photo,
            signedUrl: signedData?.signedUrl,
            loadError: undefined,
          };
        }),
      );

      // ==========================================
      // 4. SIMPAN KE STATE
      // ==========================================

      console.log("FINAL PHOTOS:", photosWithUrl);

      setPhotos(photosWithUrl);
    } catch (error) {
      console.error("GAGAL MENGAMBIL FOTO:", error);
      setPhotos([]);
    } finally {
      setPhotosLoading(false);
    }
  };

  // ==========================================
  // FETCH AUTOMATIC VALIDATION RESULT
  // ==========================================

  const fetchValidationResult = async (reportId: string) => {
    setValidationLoading(true);
    setValidationResult(null);
    setValidationError(null);

    try {
      const { data, error } = await supabase
        .from("report_validation_results")
        .select(
          `
        duplicate_detected,
        spam_detected,
        spam_checked,
        validation_notes,
        checked_at
      `,
        )
        .eq("report_id", reportId)
        .maybeSingle();

      if (error) throw error;

      setValidationResult(data as ReportValidation | null);
    } catch (error) {
      console.error("GAGAL MENGAMBIL HASIL VALIDASI:", error);

      setValidationError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil hasil validasi otomatis.",
      );
    } finally {
      setValidationLoading(false);
    }
  };
  // ==========================================
  // OPEN REPORT DETAIL
  // ==========================================

  const openReport = async (report: Report) => {
    setSelectedReport(report);

    setPhotos([]);
    setValidationResult(null);

    setShowRejectForm(false);
    setRejectionReason("");
    setActionError(null);

    await Promise.all([
      fetchReportPhotos(report.id),
      fetchValidationResult(report.id),
    ]);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {
    if (saving) return;

    setSelectedReport(null);
    setPhotos([]);

    setValidationResult(null);
    setValidationError(null);

    setShowRejectForm(false);
    setRejectionReason("");
    setActionError(null);
  };

  // ==========================================
  // UPDATE REPORT STATUS
  // ==========================================

  const updateReportStatus = async (
    newStatus: "verified" | "rejected",
    reason?: string,
  ) => {
    if (!selectedReport || saving) return;

    setSaving(true);
    setActionError(null);

    try {
      const updateData =
        newStatus === "rejected"
          ? {
              status: newStatus,
              rejection_reason: reason,
            }
          : {
              status: newStatus,
              rejection_reason: null,
            };

      const { data, error } = await supabase
        .from("reports")
        .update(updateData)
        .eq("id", selectedReport.id)
        .select("id, status, rejection_reason")
        .maybeSingle();

      if (error) throw error;

      // UPDATE tidak mengubah baris jika hasilnya null
      if (!data) {
        throw new Error(
          "Laporan tidak berhasil diperbarui. Periksa policy RLS UPDATE pada tabel reports.",
        );
      }

      console.log("Laporan berhasil diperbarui:", data);

      await fetchReports();

      setSelectedReport(null);
      setPhotos([]);
      setShowRejectForm(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Gagal memperbarui laporan:", error);

      setActionError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memperbarui laporan.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    await updateReportStatus("verified");
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setActionError("Alasan penolakan wajib diisi.");
      return;
    }

    await updateReportStatus("rejected", rejectionReason.trim());
  };

  // ==========================================
  // SEARCH & FILTER
  // ==========================================

  const filteredReports = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return reports.filter((report) => {
      const matchesSearch =
        !keyword ||
        (report.report_code ?? "").toLowerCase().includes(keyword) ||
        report.title.toLowerCase().includes(keyword) ||
        (report.reporter_name ?? "").toLowerCase().includes(keyword) ||
        getLocation(report).toLowerCase().includes(keyword);

      const matchesStatus =
        filterStatus === "all" || report.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [reports, search, filterStatus]);

  // ==========================================
  // STATISTICS
  // ==========================================

  const pendingCount = reports.filter(
    (report) => report.status === "pending",
  ).length;

  const verifiedCount = reports.filter(
    (report) => report.status === "verified",
  ).length;

  const rejectedCount = reports.filter(
    (report) => report.status === "rejected",
  ).length;

  const stats = [
    {
      label: "Menunggu Verifikasi",
      value: pendingCount,
      icon: Clock3,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Terverifikasi",
      value: verifiedCount,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Ditolak",
      value: rejectedCount,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="mx-auto max-w-[1700px] space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#102b59]">
            Verifikasi Laporan
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Periksa keabsahan laporan masyarakat sebelum diteruskan ke tahap
            penanganan.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReports}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      {/* REPORT TABLE */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-base font-bold text-slate-800">
            Daftar Pemeriksaan Laporan
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Pilih laporan untuk memeriksa detail dan menentukan keputusan.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
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

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
            >
              <option value="pending">Menunggu Verifikasi</option>
              <option value="all">Semua Status</option>
              <option value="verified">Terverifikasi</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Kode Laporan</th>
                <th className="px-5 py-4">Informasi Laporan</th>
                <th className="px-5 py-4">Pelapor</th>
                <th className="px-5 py-4">Tanggal Masuk</th>
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
                      Memuat laporan...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-red-600"
                  >
                    Gagal mengambil data: {error}
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
                            {formatDate(report.created_at)}
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
                            onClick={() => openReport(report)}
                            className="inline-flex items-center cursor-pointer gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Eye size={15} />
                            Periksa
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
                        Tidak ada laporan yang sesuai.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

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

      {/* DETAIL MODAL */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4"
          onClick={closeModal}
        >
          <div
            className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-xs font-semibold text-blue-600">
                  {selectedReport.report_code || "-"}
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-800">
                  Pemeriksaan Laporan
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 cursor-pointer text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
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

              <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-400">Kategori</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {selectedReport.category}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Tanggal Laporan</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {formatDate(selectedReport.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Nama Pelapor</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <UserRound size={15} />
                    {selectedReport.reporter_name || "Anonim"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Lokasi Kejadian</p>
                  <p className="mt-1 flex items-start gap-2 text-sm font-medium text-slate-700">
                    <MapPin size={15} className="mt-0.5 shrink-0" />
                    {getLocation(selectedReport)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Deskripsi Laporan
                </p>

                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {selectedReport.description || "-"}
                </p>
              </div>

              {/* ========================================== */}
              {/* HASIL VALIDASI OTOMATIS */}
              {/* ========================================== */}

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-4 flex items-center gap-2">
                  <ShieldCheck size={19} className="text-blue-600" />

                  <h3 className="text-sm font-bold text-slate-800">
                    Hasil Validasi Otomatis
                  </h3>
                </div>

                {validationLoading ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
                    <Loader2 size={17} className="animate-spin" />
                    Memuat hasil validasi...
                  </div>
                ) : validationError ? (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    Gagal mengambil hasil validasi: {validationError}
                  </div>
                ) : !validationResult ? (
                  <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                    Belum tersedia hasil validasi otomatis untuk laporan ini.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* DETEKSI DUPLIKAT */}
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-600">
                        Deteksi duplikat
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          validationResult.duplicate_detected
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {validationResult.duplicate_detected
                          ? "Potensi duplikat"
                          : "Tidak terindikasi"}
                      </span>
                    </div>

                    {/* CATATAN VALIDASI */}
                    {validationResult.validation_notes.length > 0 && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <p className="mb-2 flex items-center gap-2 text-xs font-bold text-amber-800">
                          <AlertCircle size={15} />
                          Catatan Sistem
                        </p>

                        <ul className="list-inside list-disc space-y-1 text-sm text-amber-700">
                          {validationResult.validation_notes.map(
                            (note, index) => (
                              <li key={index}>{note}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                    <p className="border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-400">
                      Diperiksa pada:{" "}
                      {new Date(validationResult.checked_at).toLocaleString(
                        "id-ID",
                        {
                          dateStyle: "long",
                          timeStyle: "short",
                          timeZone: "Asia/Jakarta",
                        },
                      )}
                    </p>
                  </div>
                )}

                <p className="mt-3 text-xs leading-relaxed text-slate-400">
                  Hasil validasi otomatis merupakan indikator awal. Keputusan
                  akhir penerimaan atau penolakan tetap berada pada admin.
                </p>
              </div>

              {/* FOTO BUKTI */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Bukti Foto
                </p>

                {photosLoading ? (
                  <div className="mt-2 flex min-h-32 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm text-slate-400">
                    <Loader2 size={18} className="animate-spin" />
                    Memuat foto...
                  </div>
                ) : photos.length > 0 ? (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {photos.map((photo) => (
                      <div key={photo.id}>
                        {photo.signedUrl ? (
                          <a
                            href={photo.signedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block overflow-hidden rounded-xl border border-slate-200"
                          >
                            <img
                              src={photo.signedUrl}
                              alt={photo.file_name || "Foto bukti laporan"}
                              onError={(e) => {
                                console.error(
                                  "GAMBAR GAGAL DITAMPILKAN:",
                                  photo.file_name,
                                  photo.signedUrl,
                                );

                                e.currentTarget.style.display = "none";
                              }}
                              className="h-36 w-full object-cover transition hover:scale-105"
                            />
                          </a>
                        ) : (
                          <div className="flex h-36 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                            Foto tidak dapat dimuat
                          </div>
                        )}

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {photo.file_name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                    <ImageIcon size={28} />
                    <p className="mt-2 text-sm">
                      Belum ada foto bukti laporan.
                    </p>
                  </div>
                )}
              </div>

              {/* ALASAN PENOLAKAN YANG SUDAH ADA */}
              {selectedReport.status === "rejected" &&
                selectedReport.rejection_reason && (
                  <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-red-700">
                      <AlertCircle size={16} />
                      Alasan Penolakan
                    </p>

                    <p className="mt-2 text-sm text-red-600">
                      {selectedReport.rejection_reason}
                    </p>
                  </div>
                )}

              {/* FORM PENOLAKAN */}
              {showRejectForm && selectedReport.status === "pending" && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <label className="text-sm font-semibold text-red-700">
                    Alasan Penolakan
                  </label>

                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    placeholder="Jelaskan alasan laporan ditolak..."
                    className="mt-2 w-full rounded-lg border border-red-200 bg-white p-3 text-sm text-slate-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />

                  <p className="mt-1 text-xs text-red-500">
                    Alasan penolakan wajib diisi.
                  </p>
                </div>
              )}

              {actionError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {actionError}
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 p-5 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg border cursor-pointer border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Tutup
              </button>

              {selectedReport.status === "pending" && (
                <div className="flex flex-col gap-2 sm:flex-row">
                  {!showRejectForm ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(true)}
                        disabled={saving}
                        className="flex items-center cursor-pointer justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Tolak Laporan
                      </button>

                      <button
                        type="button"
                        onClick={handleVerify}
                        disabled={saving}
                        className="flex items-center justify-center cursor-pointer gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        {saving ? "Menyimpan..." : "Terima Laporan"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectionReason("");
                          setActionError(null);
                        }}
                        disabled={saving}
                        className="rounded-lg border border-slate-200 px-4 cursor-pointer py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        Batal
                      </button>

                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={saving || !rejectionReason.trim()}
                        className="flex items-center justify-center cursor-pointer gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <XCircle size={16} />
                        )}
                        {saving ? "Menyimpan..." : "Konfirmasi Penolakan"}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
