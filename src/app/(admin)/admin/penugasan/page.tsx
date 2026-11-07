"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  ClipboardList,
  MapPin,
  CalendarDays,
  UserRound,
  UserCheck,
  Loader2,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Clock3,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Report = {
  id: string;
  report_code: string | null;
  title: string;
  category: string;
  description: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
  incident_date: string | null;
  created_at: string;
  status: string;
};

type Officer = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  role: string;
};

type Assignment = {
  id: string;
  report_id: string;
  officer_id: string;
  assigned_by: string;
  priority: string;
  deadline: string | null;
  status: string;
  notes: string | null;
  assigned_at: string;
  updated_at: string;
};

type AssignmentForm = {
  officer_id: string;
  priority: string;
  deadline: string;
  notes: string;
};

const initialForm: AssignmentForm = {
  officer_id: "",
  priority: "medium",
  deadline: "",
  notes: "",
};

const formatDate = (value: string | null) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getLocation = (report: Report) => {
  return (
    [report.district, report.city, report.province]
      .filter(Boolean)
      .join(", ") ||
    report.address ||
    "-"
  );
};

export default function PenugasanPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AssignmentForm>(initialForm);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Ambil laporan yang sudah diverifikasi
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .select(
          `
          id,
          report_code,
          title,
          category,
          description,
          province,
          city,
          district,
          address,
          incident_date,
          created_at,
          status
        `,
        )
        .eq("status", "verified")
        .order("created_at", { ascending: false });

      if (reportError) throw reportError;

      const verifiedReports = (reportData ?? []) as Report[];
      setReports(verifiedReports);

      // 2. Ambil petugas yang masih aktif
      const { data: officerData, error: officerError } = await supabase
        .from("user_profiles")
        .select("id, full_name, email, phone, is_active, role")
        .eq("role", "petugas")
        .eq("is_active", true)
        .order("full_name", { ascending: true });

      if (officerError) throw officerError;

      setOfficers((officerData ?? []) as Officer[]);

      // 3. Ambil data penugasan untuk laporan yang ditampilkan
      if (verifiedReports.length > 0) {
        const reportIds = verifiedReports.map((report) => report.id);

        const { data: assignmentData, error: assignmentError } = await supabase
          .from("report_assignments")
          .select(
            `
            id,
            report_id,
            officer_id,
            assigned_by,
            priority,
            deadline,
            status,
            notes,
            assigned_at,
            updated_at
          `,
          )
          .in("report_id", reportIds)
          .order("assigned_at", { ascending: false });

        if (assignmentError) throw assignmentError;

        setAssignments((assignmentData ?? []) as Assignment[]);
      } else {
        setAssignments([]);
      }
    } catch (err) {
      console.error("Gagal mengambil data penugasan:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Ambil penugasan terbaru untuk setiap laporan
  const assignmentMap = useMemo(() => {
    const map = new Map<string, Assignment>();

    const sorted = [...assignments].sort(
      (a, b) =>
        new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime(),
    );

    sorted.forEach((assignment) => {
      if (!map.has(assignment.report_id)) {
        map.set(assignment.report_id, assignment);
      }
    });

    return map;
  }, [assignments]);

  const officerMap = useMemo(() => {
    return new Map(officers.map((officer) => [officer.id, officer]));
  }, [officers]);

  const filteredReports = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return reports.filter((report) => {
      const assignment = assignmentMap.get(report.id);

      const officer = assignment ? officerMap.get(assignment.officer_id) : null;

      const matchesSearch =
        !keyword ||
        [
          report.report_code,
          report.title,
          report.category,
          report.city,
          report.district,
          report.address,
          officer?.full_name,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(keyword));

      const matchesFilter =
        filter === "all" ||
        (filter === "assigned" && !!assignment) ||
        (filter === "unassigned" && !assignment);

      return matchesSearch && matchesFilter;
    });
  }, [reports, search, filter, assignmentMap, officerMap]);

  const assignedCount = reports.filter((report) =>
    assignmentMap.has(report.id),
  ).length;

  const unassignedCount = reports.length - assignedCount;

  const openAssignmentModal = (report: Report) => {
    const existingAssignment = assignmentMap.get(report.id);

    setSelectedReport(report);

    setForm({
      officer_id: existingAssignment?.officer_id ?? "",
      priority: existingAssignment?.priority ?? "medium",
      deadline: existingAssignment?.deadline ?? "",
      notes: existingAssignment?.notes ?? "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setSelectedReport(null);
    setForm(initialForm);
  };

  const handleSaveAssignment = async () => {
    if (!selectedReport) return;

    if (!form.officer_id) {
      alert("Silakan pilih petugas terlebih dahulu.");
      return;
    }

    try {
      setSaving(true);

      // Pastikan admin sedang login
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Sesi login tidak valid. Silakan login kembali.");
      }

      // Pastikan petugas yang dipilih masih aktif
      const selectedOfficer = officers.find(
        (officer) => officer.id === form.officer_id,
      );

      if (!selectedOfficer || !selectedOfficer.is_active) {
        throw new Error("Petugas tidak ditemukan atau sudah tidak aktif.");
      }

      const existingAssignment = assignmentMap.get(selectedReport.id);

      const payload = {
        report_id: selectedReport.id,
        officer_id: form.officer_id,
        assigned_by: user.id,
        priority: form.priority,
        deadline: form.deadline || null,
        notes: form.notes.trim() || null,
        status: "assigned",
        updated_at: new Date().toISOString(),
      };

      if (existingAssignment) {
        // Jika sudah pernah ditugaskan, perbarui penugasannya
        const { error: updateError } = await supabase
          .from("report_assignments")
          .update(payload)
          .eq("id", existingAssignment.id);

        if (updateError) throw updateError;
      } else {
        // Jika belum pernah ditugaskan, buat penugasan baru
        const { error: insertError } = await supabase
          .from("report_assignments")
          .insert({
            ...payload,
            assigned_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;
      }

      setShowModal(false);
      setSelectedReport(null);
      setForm(initialForm);

      await fetchData();

      alert(
        existingAssignment
          ? "Penugasan berhasil diperbarui."
          : "Laporan berhasil ditugaskan kepada petugas.",
      );
    } catch (err: any) {
      console.error("GAGAL MENYIMPAN PENUGASAN:", {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
        status: err?.status,
        fullError: err,
      });

      alert(
        [
          `Message: ${err?.message || "Tidak diketahui"}`,
          `Code: ${err?.code || "-"}`,
          `Details: ${err?.details || "-"}`,
          `Hint: ${err?.hint || "-"}`,
        ].join("\n"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Penugasan Petugas
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Kelola penugasan laporan terverifikasi kepada petugas lapangan.
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Laporan Terverifikasi</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {reports.length}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                <ClipboardList size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Sudah Ditugaskan</p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {assignedCount}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
                <UserCheck size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Belum Ditugaskan</p>
                <p className="mt-2 text-2xl font-bold text-amber-600">
                  {unassignedCount}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
                <Clock3 size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Gagal memuat data</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Main Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Daftar Laporan</h2>
              <p className="mt-1 text-sm text-slate-500">
                Menampilkan laporan dengan status verified.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari laporan..."
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
                />
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="all">Semua Laporan</option>
                <option value="unassigned">Belum Ditugaskan</option>
                <option value="assigned">Sudah Ditugaskan</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 size={30} className="animate-spin text-blue-600" />
              <p className="mt-3 text-sm">Memuat data laporan...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
              <ClipboardList size={38} className="text-slate-300" />
              <p className="mt-3 font-medium text-slate-700">
                Tidak ada laporan ditemukan
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Laporan terverifikasi yang sesuai pencarian akan muncul di sini.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Laporan</th>
                      <th className="px-5 py-4 font-semibold">Lokasi</th>
                      <th className="px-5 py-4 font-semibold">Tanggal</th>
                      <th className="px-5 py-4 font-semibold">Petugas</th>
                      <th className="px-5 py-4 font-semibold">Prioritas</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredReports.map((report) => {
                      const assignment = assignmentMap.get(report.id);
                      const officer = assignment
                        ? officerMap.get(assignment.officer_id)
                        : null;

                      return (
                        <tr
                          key={report.id}
                          className="transition hover:bg-slate-50/70"
                        >
                          <td className="max-w-xs px-5 py-4">
                            <p className="font-semibold text-slate-900">
                              {report.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {report.report_code || report.id.slice(0, 8)}
                              {" · "}
                              {report.category}
                            </p>
                          </td>

                          <td className="max-w-xs px-5 py-4">
                            <div className="flex items-start gap-2 text-slate-600">
                              <MapPin
                                size={15}
                                className="mt-0.5 shrink-0 text-slate-400"
                              />
                              <span className="line-clamp-2">
                                {getLocation(report)}
                              </span>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                            {formatDate(report.created_at)}
                          </td>

                          <td className="px-5 py-4">
                            {assignment && officer ? (
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                  <UserRound size={16} />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-800">
                                    {officer.full_name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {officer.phone || officer.email}
                                  </p>
                                </div>
                              </div>
                            ) : assignment ? (
                              <span className="text-sm text-slate-500">
                                Petugas tidak aktif / tidak ditemukan
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                Belum ditugaskan
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {assignment ? (
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                  assignment.priority === "high"
                                    ? "bg-red-50 text-red-700"
                                    : assignment.priority === "urgent"
                                      ? "bg-red-100 text-red-800"
                                      : assignment.priority === "low"
                                        ? "bg-slate-100 text-slate-600"
                                        : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {assignment.priority === "urgent"
                                  ? "Mendesak"
                                  : assignment.priority === "high"
                                    ? "Tinggi"
                                    : assignment.priority === "low"
                                      ? "Rendah"
                                      : "Normal"}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-right">
                            <button
                              onClick={() => openAssignmentModal(report)}
                              className="inline-flex items-center gap-2 rounded-lg cursor-pointer bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                            >
                              {assignment ? "Ubah Petugas" : "Tugaskan"}
                              <ArrowRight size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 p-4 md:hidden">
                {filteredReports.map((report) => {
                  const assignment = assignmentMap.get(report.id);
                  const officer = assignment
                    ? officerMap.get(assignment.officer_id)
                    : null;

                  return (
                    <div
                      key={report.id}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {report.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {report.report_code || report.id.slice(0, 8)}
                            {" · "}
                            {report.category}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                          Verified
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <div className="flex items-start gap-2">
                          <MapPin size={15} className="mt-0.5 shrink-0" />
                          <span>{getLocation(report)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <CalendarDays size={15} />
                          <span>{formatDate(report.created_at)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <UserRound size={15} />
                          <span>
                            {officer?.full_name ||
                              (assignment
                                ? "Petugas tidak ditemukan"
                                : "Belum ditugaskan")}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => openAssignmentModal(report)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        {assignment ? "Ubah Petugas" : "Tugaskan Petugas"}
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {!loading && filteredReports.length > 0 && (
            <div className="border-t border-slate-200 px-5 py-4 text-xs text-slate-500">
              Menampilkan {filteredReports.length} dari {reports.length} laporan
              terverifikasi.
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {assignmentMap.has(selectedReport.id)
                    ? "Ubah Penugasan"
                    : "Buat Penugasan"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Tentukan petugas yang menangani laporan.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 cursor-pointer text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {/* Report information */}
              <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Laporan yang dipilih
                </p>
                <p className="mt-2 font-semibold text-slate-900">
                  {selectedReport.title}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {selectedReport.report_code || selectedReport.id.slice(0, 8)}
                  {" · "}
                  {selectedReport.category}
                </p>
                <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-600">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  {getLocation(selectedReport)}
                </p>
              </div>

              {/* Officer */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Pilih Petugas <span className="text-red-500">*</span>
                </label>

                <select
                  value={form.officer_id}
                  onChange={(e) =>
                    setForm({ ...form, officer_id: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">-- Pilih petugas aktif --</option>
                  {officers.map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.full_name}
                      {officer.phone ? ` - ${officer.phone}` : ""}
                    </option>
                  ))}
                </select>

                {officers.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    Belum ada petugas aktif yang tersedia.
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Prioritas
                </label>

                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
              </div>

              {/* Deadline */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Batas Waktu Penanganan
                </label>

                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Catatan Penugasan
                </label>

                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Tambahkan instruksi atau catatan untuk petugas..."
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg border cursor-pointer border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                onClick={handleSaveAssignment}
                disabled={saving || officers.length === 0}
                className="inline-flex items-center cursor-pointer justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Simpan Penugasan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
