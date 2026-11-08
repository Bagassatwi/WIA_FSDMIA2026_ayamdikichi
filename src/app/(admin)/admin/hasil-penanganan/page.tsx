"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  ClipboardCheck,
  Clock3,
  CheckCircle2,
  Eye,
  MapPin,
  CalendarDays,
  UserRound,
  X,
  Image as ImageIcon,
  FileText,
  AlertCircle,
  RefreshCw,
  Loader2,
  Check,
  RotateCcw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type ResultStatus = "pending_review" | "approved" | "revision_requested";

type AssignmentStatus =
  | "assigned"
  | "in_progress"
  | "submitted"
  | "completed"
  | "cancelled";

type ReportStatus = "Dalam Penanganan" | "Menunggu Pemeriksaan" | "Selesai";

type HandlingPhoto = {
  id: string;
  storage_path: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  signed_url?: string;
};

type Report = {
  id: string;
  reportId: string;
  reportCode: string;
  title: string;
  category: string;
  location: string;
  officer: string;
  officerId: string;
  assignmentId: string;
  assignedDate: string;
  deadline: string;
  status: ReportStatus;
  assignmentStatus: AssignmentStatus;
  resultId: string | null;
  resultStatus: ResultStatus | null;
  result?: string;
  submittedDate?: string;
  completedDate?: string;
  photos: HandlingPhoto[];
  reviewNotes?: string | null;
};

const statusStyles: Record<ReportStatus, string> = {
  "Dalam Penanganan": "bg-blue-50 text-blue-700",
  "Menunggu Pemeriksaan": "bg-amber-50 text-amber-700",
  Selesai: "bg-emerald-50 text-emerald-700",
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatFileSize = (bytes?: number | null) => {
  if (!bytes) return "-";

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getDisplayStatus = (
  assignmentStatus: AssignmentStatus,
  resultStatus?: ResultStatus | null,
): ReportStatus => {
  if (assignmentStatus === "completed" || resultStatus === "approved") {
    return "Selesai";
  }

  if (assignmentStatus === "submitted" || resultStatus === "pending_review") {
    return "Menunggu Pemeriksaan";
  }

  return "Dalam Penanganan";
};

export default function HasilPenangananPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  // =====================================================
  // FETCH DATA SUPABASE
  // =====================================================

  const fetchReports = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage("");

      // 1. Ambil data penugasan
      const { data: assignments, error: assignmentError } = await supabase
        .from("report_assignments")
        .select(
          `
          id,
          report_id,
          officer_id,
          deadline,
          status,
          assigned_at
        `,
        )
        .neq("status", "cancelled")
        .order("assigned_at", { ascending: false });

      if (assignmentError) throw assignmentError;

      if (!assignments || assignments.length === 0) {
        setReports([]);
        setSelectedReport(null);
        return;
      }

      const reportIds = [...new Set(assignments.map((item) => item.report_id))];

      const officerIds = [
        ...new Set(assignments.map((item) => item.officer_id)),
      ];

      const assignmentIds = assignments.map((item) => item.id);

      // 2. Ambil data laporan
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .select(
          `
          id,
          report_code,
          title,
          category,
          province,
          city,
          district,
          address
        `,
        )
        .in("id", reportIds);

      if (reportError) throw reportError;

      // 3. Ambil nama petugas
      const { data: officerData, error: officerError } = await supabase
        .from("user_profiles")
        .select("id, full_name")
        .in("id", officerIds);

      if (officerError) throw officerError;

      // 4. Ambil hasil penanganan
      const { data: resultData, error: resultError } = await supabase
        .from("report_handling_results")
        .select(
          `
          id,
          assignment_id,
          report_id,
          officer_id,
          description,
          status,
          submitted_at,
          reviewed_by,
          review_notes,
          reviewed_at
        `,
        )
        .in("assignment_id", assignmentIds);

      if (resultError) throw resultError;

      const resultIds = (resultData || []).map((item) => item.id);

      // 5. Ambil metadata foto
      let photoData: any[] = [];

      if (resultIds.length > 0) {
        const { data, error: photoError } = await supabase
          .from("report_handling_photos")
          .select(
            `
            id,
            result_id,
            storage_path,
            file_name,
            file_size,
            mime_type
          `,
          )
          .in("result_id", resultIds);

        if (photoError) throw photoError;

        photoData = data || [];
      }

      // 6. Buat signed URL untuk foto private
      const photosWithUrls = await Promise.all(
        photoData.map(async (photo) => {
          const { data: signedData, error: signedError } =
            await supabase.storage
              .from("handling-results")
              .createSignedUrl(photo.storage_path, 3600);

          if (signedError) {
            console.error(
              "Gagal membuat signed URL:",
              photo.storage_path,
              signedError,
            );
          }

          return {
            ...photo,
            signed_url: signedData?.signedUrl || "",
          };
        }),
      );

      // 7. Gabungkan seluruh data
      const mappedReports: Report[] = assignments.map((assignment) => {
        const report = reportData?.find(
          (item) => item.id === assignment.report_id,
        );

        const officer = officerData?.find(
          (item) => item.id === assignment.officer_id,
        );

        const result = resultData?.find(
          (item) => item.assignment_id === assignment.id,
        );

        const photos = result
          ? photosWithUrls.filter((photo) => photo.result_id === result.id)
          : [];

        const location = [
          report?.address,
          report?.district,
          report?.city,
          report?.province,
        ]
          .filter(Boolean)
          .join(", ");

        const displayStatus = getDisplayStatus(
          assignment.status as AssignmentStatus,
          result?.status as ResultStatus | null,
        );

        return {
          id: assignment.id,
          assignmentId: assignment.id,
          reportId: assignment.report_id,
          reportCode: report?.report_code || assignment.report_id,
          title: report?.title || "Laporan tanpa judul",
          category: report?.category || "-",
          location: location || "-",
          officer: officer?.full_name || "Petugas",
          officerId: assignment.officer_id,
          assignedDate: formatDate(assignment.assigned_at),
          deadline: formatDate(assignment.deadline),
          assignmentStatus: assignment.status as AssignmentStatus,
          status: displayStatus,
          resultId: result?.id || null,
          resultStatus: (result?.status as ResultStatus) || null,
          result: result?.description || "",
          submittedDate: result?.submitted_at
            ? formatDate(result.submitted_at)
            : undefined,
          completedDate:
            result?.status === "approved" && result?.reviewed_at
              ? formatDate(result.reviewed_at)
              : undefined,
          photos,
          reviewNotes: result?.review_notes || "",
        };
      });

      setReports(mappedReports);

      // Perbarui data modal jika sedang terbuka
      setSelectedReport((current) => {
        if (!current) return null;

        return mappedReports.find((item) => item.id === current.id) || null;
      });
    } catch (error: any) {
      console.error("FETCH HASIL PENANGANAN ERROR:", error);

      setErrorMessage(
        error?.message || "Gagal mengambil data hasil penanganan.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // =====================================================
  // SEARCH DAN FILTER
  // =====================================================

  const filteredReports = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return reports.filter((report) => {
      const matchesSearch =
        report.reportCode.toLowerCase().includes(keyword) ||
        report.title.toLowerCase().includes(keyword) ||
        report.officer.toLowerCase().includes(keyword) ||
        report.category.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "Semua Status" || report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);

  const totalInProgress = reports.filter(
    (report) => report.status === "Dalam Penanganan",
  ).length;

  const totalReview = reports.filter(
    (report) => report.status === "Menunggu Pemeriksaan",
  ).length;

  const totalCompleted = reports.filter(
    (report) => report.status === "Selesai",
  ).length;

  // =====================================================
  // REVIEW HASIL PENANGANAN
  // =====================================================

  const handleReview = async (decision: "approved" | "revision_requested") => {
    if (!selectedReport?.resultId) {
      alert("Hasil penanganan belum tersedia.");
      return;
    }

    if (selectedReport.resultStatus !== "pending_review") {
      alert(
        "Hasil ini sudah diperiksa atau tidak sedang menunggu pemeriksaan.",
      );
      return;
    }

    if (decision === "revision_requested" && !reviewNotes.trim()) {
      alert("Catatan revisi wajib diisi.");
      return;
    }

    const confirmation =
      decision === "approved"
        ? "Apakah kamu yakin ingin menyetujui hasil penanganan ini?"
        : "Apakah kamu yakin ingin meminta petugas melakukan revisi?";

    if (!window.confirm(confirmation)) return;

    try {
      setSaving(true);

      // Ambil admin yang sedang login
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Sesi login tidak valid.");
      }

      // Update hasil penanganan
      const { error: resultUpdateError } = await supabase
        .from("report_handling_results")
        .update({
          status: decision,
          reviewed_by: user.id,
          review_notes: reviewNotes.trim() || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedReport.resultId)
        .eq("status", "pending_review");

      if (resultUpdateError) throw resultUpdateError;

      // Jika disetujui, selesaikan penugasan
      if (decision === "approved") {
        const { error: assignmentUpdateError } = await supabase
          .from("report_assignments")
          .update({
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedReport.assignmentId);

        if (assignmentUpdateError) {
          throw assignmentUpdateError;
        }
      }

      alert(
        decision === "approved"
          ? "Hasil penanganan berhasil disetujui."
          : "Permintaan revisi berhasil dikirim.",
      );

      setReviewNotes("");
      setSelectedReport(null);

      await fetchReports(true);
    } catch (error: any) {
      console.error("REVIEW HASIL ERROR:", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        fullError: error,
      });

      alert(
        [
          "Gagal memproses hasil penanganan.",
          `Message: ${error?.message || "-"}`,
          `Code: ${error?.code || "-"}`,
          `Details: ${error?.details || "-"}`,
          `Hint: ${error?.hint || "-"}`,
        ].join("\n"),
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // BUKA DETAIL
  // =====================================================

  const openDetail = (report: Report) => {
    setSelectedReport(report);
    setReviewNotes(report.reviewNotes || "");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Hasil Penanganan
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pantau dan periksa hasil penanganan laporan oleh petugas.
          </p>
        </div>

        <button
          onClick={() => fetchReports(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Muat Ulang
        </button>
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Gagal memuat data</p>
            <p className="mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Dalam Penanganan</p>
              <h2 className="mt-2 text-2xl font-bold text-blue-700">
                {loading ? "-" : totalInProgress}
              </h2>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <Clock3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Menunggu Pemeriksaan</p>
              <h2 className="mt-2 text-2xl font-bold text-amber-600">
                {loading ? "-" : totalReview}
              </h2>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <ClipboardCheck className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Selesai</p>
              <h2 className="mt-2 text-2xl font-bold text-emerald-600">
                {loading ? "-" : totalCompleted}
              </h2>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">
              Daftar Hasil Penanganan
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Laporan yang sedang dan telah ditangani petugas.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari laporan atau petugas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
            >
              <option>Semua Status</option>
              <option>Dalam Penanganan</option>
              <option>Menunggu Pemeriksaan</option>
              <option>Selesai</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Laporan</th>
                <th className="px-5 py-4 font-semibold">Petugas</th>
                <th className="px-5 py-4 font-semibold">Tenggat</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-600" />
                    <p className="mt-3 text-sm text-slate-500">
                      Memuat data hasil penanganan...
                    </p>
                  </td>
                </tr>
              ) : (
                <>
                  {filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {report.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {report.reportCode} • {report.category}
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {report.location}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <UserRound className="h-4 w-4 text-slate-400" />
                          {report.officer}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays className="h-4 w-4 text-slate-400" />
                          {report.deadline}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[report.status]}`}
                        >
                          {report.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => openDetail(report)}
                          className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                          Periksa
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredReports.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-sm text-slate-400"
                      >
                        Tidak ada data hasil penanganan.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-4 text-xs text-slate-500">
          Menampilkan {filteredReports.length} dari {reports.length} laporan
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="font-semibold text-slate-800">
                  Detail Hasil Penanganan
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedReport.reportCode}
                </p>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                disabled={saving}
                className="rounded-lg p-2 cursor-pointer text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {/* Report Info */}
              <div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[selectedReport.status]}`}
                >
                  {selectedReport.status}
                </span>

                <h3 className="mt-3 text-lg font-semibold text-slate-800">
                  {selectedReport.title}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedReport.category}
                </p>
              </div>

              {/* Assignment Information */}
              <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-400">Petugas</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {selectedReport.officer}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Tanggal Penugasan</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {selectedReport.assignedDate}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Tenggat Penanganan</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {selectedReport.deadline}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Tanggal Pengiriman Hasil
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {selectedReport.submittedDate || "-"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-400">Lokasi</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {selectedReport.location}
                  </p>
                </div>
              </div>

              {/* Result Description */}
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Hasil Penanganan Petugas
                </h4>

                {selectedReport.result ? (
                  <p className="whitespace-pre-wrap rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">
                    {selectedReport.result}
                  </p>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center">
                    <AlertCircle className="mx-auto h-6 w-6 text-slate-400" />
                    <p className="mt-2 text-sm text-slate-500">
                      Petugas belum mengirimkan hasil penanganan.
                    </p>
                  </div>
                )}
              </div>

              {/* Evidence Photos */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <ImageIcon className="h-4 w-4 text-blue-600" />
                  Bukti Dokumentasi
                  <span className="text-xs font-normal text-slate-400">
                    ({selectedReport.photos.length} foto)
                  </span>
                </h4>

                {selectedReport.photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {selectedReport.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="overflow-hidden rounded-xl border border-slate-200"
                      >
                        {photo.signed_url ? (
                          <a
                            href={photo.signed_url}
                            target="_blank"
                            rel="noreferrer"
                            className="block"
                          >
                            <img
                              src={photo.signed_url}
                              alt={photo.file_name || "Bukti penanganan"}
                              className="h-36 w-full object-cover transition hover:opacity-90"
                            />
                          </a>
                        ) : (
                          <div className="flex h-36 items-center justify-center bg-slate-100">
                            <AlertCircle className="h-7 w-7 text-slate-400" />
                          </div>
                        )}

                        <div className="p-2">
                          <p className="truncate text-xs font-medium text-slate-700">
                            {photo.file_name || "Foto bukti"}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {formatFileSize(photo.file_size)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center">
                    <ImageIcon className="mx-auto h-6 w-6 text-slate-400" />
                    <p className="mt-2 text-sm text-slate-500">
                      Belum ada bukti dokumentasi.
                    </p>
                  </div>
                )}
              </div>

              {/* Review Notes */}
              {selectedReport.resultStatus === "pending_review" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Catatan Pemeriksaan
                  </label>

                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                    placeholder="Isi catatan jika ada revisi yang perlu dilakukan petugas..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Catatan wajib diisi apabila meminta revisi.
                  </p>
                </div>
              )}

              {/* Previous Review Note */}
              {selectedReport.resultStatus === "revision_requested" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-800">
                    Hasil Memerlukan Revisi
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-amber-700">
                    {selectedReport.reviewNotes || "Tidak ada catatan."}
                  </p>
                </div>
              )}

              {/* Review Actions */}
              {selectedReport.resultStatus === "pending_review" && (
                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                  <button
                    onClick={() => setSelectedReport(null)}
                    disabled={saving}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Tutup
                  </button>

                  <button
                    onClick={() => handleReview("revision_requested")}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 px-4 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-50 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}
                    Minta Revisi
                  </button>

                  <button
                    onClick={() => handleReview("approved")}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Setujui Hasil
                  </button>
                </div>
              )}

              {/* Other Status */}
              {selectedReport.resultStatus !== "pending_review" && (
                <div className="flex justify-end border-t border-slate-200 pt-5">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="rounded-lg border border-slate-200  cursor-pointer  px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
