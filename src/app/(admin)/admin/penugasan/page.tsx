
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
  ChevronLeft,
  ChevronRight,
  Activity,
  CheckCircle,
  Lock,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

// =====================================================
// TYPES
// =====================================================

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

// =====================================================
// STATUS CONFIGURATION
// =====================================================

const reportStatusConfig: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  verified: {
    label: "Terverifikasi",
    className: "bg-emerald-50 text-emerald-700",
  },
  assigned: {
    label: "Telah Ditugaskan",
    className: "bg-blue-50 text-blue-700",
  },
  in_progress: {
    label: "Sedang Ditangani",
    className: "bg-amber-50 text-amber-700",
  },
  completed: {
    label: "Selesai Ditangani",
    className: "bg-green-50 text-green-700",
  },
  closed: {
    label: "Ditutup",
    className: "bg-slate-100 text-slate-700",
  },
};

const visibleStatuses = [
  "verified",
  "assigned",
  "in_progress",
  "completed",
  "closed",
];

const isActionDisabled = (status: string) => {
  return ["in_progress", "completed", "closed"].includes(status);
};

// =====================================================
// HELPERS
// =====================================================

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

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "Mendesak";
    case "high":
      return "Tinggi";
    case "low":
      return "Rendah";
    default:
      return "Normal";
  }
};

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800";
    case "high":
      return "bg-red-50 text-red-700";
    case "low":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-blue-50 text-blue-700";
  }
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function PenugasanPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal
  const [selectedReport, setSelectedReport] =
    useState<Report | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AssignmentForm>(initialForm);

  // =====================================================
  // FETCH DATA
  // =====================================================

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Ambil laporan yang sudah diverifikasi
      // beserta seluruh tahap penanganan berikutnya.

      const {
        data: reportData,
        error: reportError,
      } = await supabase
        .from("reports")
        .select(`
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
        `)
        .in("status", visibleStatuses)
        .order("created_at", { ascending: false });

      if (reportError) throw reportError;

      const reportList = (reportData ?? []) as Report[];

      setReports(reportList);

      // 2. Ambil petugas aktif

      const {
        data: officerData,
        error: officerError,
      } = await supabase
        .from("user_profiles")
        .select("id, full_name, email, phone, is_active, role")
        .eq("role", "petugas")
        .eq("is_active", true)
        .order("full_name", { ascending: true });

      if (officerError) throw officerError;

      setOfficers((officerData ?? []) as Officer[]);

      // 3. Ambil seluruh data penugasan laporan

      if (reportList.length > 0) {
        const reportIds = reportList.map((report) => report.id);

        const {
          data: assignmentData,
          error: assignmentError,
        } = await supabase
          .from("report_assignments")
          .select(`
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
          `)
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
          : "Terjadi kesalahan saat mengambil data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =====================================================
  // ASSIGNMENT MAP
  // =====================================================

  const assignmentMap = useMemo(() => {
    const map = new Map<string, Assignment>();

    const sorted = [...assignments].sort(
      (a, b) =>
        new Date(b.assigned_at).getTime() -
        new Date(a.assigned_at).getTime()
    );

    sorted.forEach((assignment) => {
      if (!map.has(assignment.report_id)) {
        map.set(assignment.report_id, assignment);
      }
    });

    return map;
  }, [assignments]);

  const officerMap = useMemo(() => {
    return new Map(
      officers.map((officer) => [officer.id, officer])
    );
  }, [officers]);

  // =====================================================
  // FILTER REPORTS
  // =====================================================

  const filteredReports = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return reports.filter((report) => {
      const assignment = assignmentMap.get(report.id);

      const officer = assignment
        ? officerMap.get(assignment.officer_id)
        : null;

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
          .some((value) =>
            String(value).toLowerCase().includes(keyword)
          );

      let matchesFilter = true;

      if (filter === "unassigned") {
        matchesFilter = report.status === "verified";
      } else if (filter === "assigned") {
        matchesFilter = report.status === "assigned";
      } else if (filter === "in_progress") {
        matchesFilter = report.status === "in_progress";
      } else if (filter === "completed") {
        matchesFilter = report.status === "completed";
      } else if (filter === "closed") {
        matchesFilter = report.status === "closed";
      }

      return matchesSearch && matchesFilter;
    });
  }, [reports, search, filter, assignmentMap, officerMap]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const verifiedCount = reports.filter(
    (report) => report.status === "verified"
  ).length;

  const assignedCount = reports.filter(
    (report) => report.status === "assigned"
  ).length;

  const inProgressCount = reports.filter(
    (report) => report.status === "in_progress"
  ).length;

  const completedCount = reports.filter(
    (report) =>
      report.status === "completed" ||
      report.status === "closed"
  ).length;

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.ceil(
    filteredReports.length / itemsPerPage
  );

  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;

    return filteredReports.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredReports, currentPage]);

  const startItem =
    filteredReports.length === 0
      ? 0
      : (currentPage - 1) * itemsPerPage + 1;

  const endItem = Math.min(
    currentPage * itemsPerPage,
    filteredReports.length
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // =====================================================
  // MODAL
  // =====================================================

  const openAssignmentModal = (report: Report) => {
    // Hanya laporan verified dan assigned yang boleh diubah.

    if (!["verified", "assigned"].includes(report.status)) {
      return;
    }

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

  // =====================================================
  // SAVE ASSIGNMENT
  // =====================================================

  const handleSaveAssignment = async () => {
    if (!selectedReport) return;

    if (!["verified", "assigned"].includes(selectedReport.status)) {
      alert("Laporan ini tidak dapat diubah penugasannya.");
      return;
    }

    if (!form.officer_id) {
      alert("Silakan pilih petugas terlebih dahulu.");
      return;
    }

    try {
      setSaving(true);

      const selectedOfficer = officers.find(
        (officer) => officer.id === form.officer_id
      );

      if (!selectedOfficer || !selectedOfficer.is_active) {
        throw new Error(
          "Petugas tidak ditemukan atau sudah tidak aktif."
        );
      }

      const { error: assignmentError } = await supabase.rpc(
        "save_report_assignment",
        {
          p_report_id: selectedReport.id,
          p_officer_id: form.officer_id,
          p_priority: form.priority,
          p_deadline: form.deadline || null,
          p_notes: form.notes.trim() || null,
        }
      );

      if (assignmentError) throw assignmentError;

      setShowModal(false);
      setSelectedReport(null);
      setForm(initialForm);

      await fetchData();

      alert(
        "Penugasan berhasil disimpan dan status laporan diperbarui."
      );
    } catch (err: any) {
      console.error("GAGAL MENYIMPAN PENUGASAN:", err);

      alert(
        err?.message ||
          "Terjadi kesalahan saat menyimpan penugasan."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const renderStatus = (status: string) => {
    const config = reportStatusConfig[status];

    return (
      <span
        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
          config?.className ?? "bg-slate-100 text-slate-600"
        }`}
      >
        {config?.label ?? status}
      </span>
    );
  };

  // =====================================================
  // ACTION BUTTON
  // =====================================================

  const renderActionButton = (report: Report, mobile = false) => {
    const disabled = isActionDisabled(report.status);

    const label =
      report.status === "verified"
        ? mobile
          ? "Tugaskan Petugas"
          : "Tugaskan"
        : report.status === "assigned"
          ? "Ubah Petugas"
          : report.status === "in_progress"
            ? "Sedang Ditangani"
            : report.status === "completed"
              ? "Selesai"
              : "Ditutup";

    return (
      <button
        type="button"
        onClick={() => openAssignmentModal(report)}
        disabled={disabled}
        title={
          disabled
            ? "Penugasan tidak dapat diubah pada tahap ini."
            : "Kelola penugasan petugas"
        }
        className={`
          inline-flex items-center justify-center gap-2 rounded-lg
          px-3 py-2 text-xs font-semibold transition
          ${
            disabled
              ? "cursor-not-allowed bg-slate-100 text-slate-400"
              : "cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
          }
          ${mobile ? "mt-4 w-full py-2.5 text-sm" : ""}
        `}
      >
        {label}

        {disabled ? (
          <Lock size={14} />
        ) : (
          <ArrowRight size={14} />
        )}
      </button>
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Penugasan Petugas
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Kelola penugasan dan pantau perkembangan penanganan laporan.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh Data
        </button>
      </div>

      {/* STATISTICS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Belum Ditugaskan
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {verifiedCount}
              </p>
            </div>

            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <ClipboardList size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Telah Ditugaskan
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-600">
                {assignedCount}
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <UserCheck size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Sedang Ditangani
              </p>
              <p className="mt-2 text-2xl font-bold text-amber-600">
                {inProgressCount}
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
              <Activity size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Selesai / Ditutup
              </p>
              <p className="mt-2 text-2xl font-bold text-green-600">
                {completedCount}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-3 text-green-600">
              <CheckCircle size={22} />
            </div>
          </div>
        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">
              Gagal memuat data
            </p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* MAIN TABLE */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* TABLE HEADER */}

        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Daftar Laporan
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Menampilkan laporan mulai dari tahap verifikasi selesai.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            {/* SEARCH */}

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

            {/* FILTER */}

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="all">Semua Laporan</option>
              <option value="unassigned">Belum Ditugaskan</option>
              <option value="assigned">Telah Ditugaskan</option>
              <option value="in_progress">Sedang Ditangani</option>
              <option value="completed">Selesai Ditangani</option>
              <option value="closed">Ditutup</option>
            </select>

          </div>
        </div>

        {/* TABLE CONTENT */}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 size={30} className="animate-spin text-blue-600" />
            <p className="mt-3 text-sm">
              Memuat data laporan...
            </p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
            <ClipboardList size={38} className="text-slate-300" />

            <p className="mt-3 font-medium text-slate-700">
              Tidak ada laporan ditemukan
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Laporan sesuai pencarian atau filter akan muncul di sini.
            </p>
          </div>
        ) : (
          <>

            {/* DESKTOP TABLE */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">

                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">
                      Laporan
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Lokasi
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Tanggal
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Status Laporan
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Prioritas
                    </th>

                    <th className="px-5 py-4 text-right font-semibold">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedReports.map((report) => {
                    const assignment = assignmentMap.get(report.id);

                    return (
                      <tr
                        key={report.id}
                        className="transition hover:bg-slate-50/70"
                      >

                        {/* LAPORAN */}

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

                        {/* LOKASI */}

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

                        {/* TANGGAL */}

                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {formatDate(report.created_at)}
                        </td>

                        {/* STATUS LAPORAN */}

                        <td className="px-5 py-4">
                          {renderStatus(report.status)}
                        </td>

                        {/* PRIORITAS */}

                        <td className="px-5 py-4">
                          {assignment ? (
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityClass(
                                assignment.priority
                              )}`}
                            >
                              {getPriorityLabel(assignment.priority)}
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              -
                            </span>
                          )}
                        </td>

                        {/* ACTION */}

                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          {renderActionButton(report)}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>

            {/* MOBILE CARDS */}

            <div className="space-y-3 p-4 md:hidden">
              {paginatedReports.map((report) => {
                const assignment = assignmentMap.get(report.id);

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

                      {renderStatus(report.status)}
                    </div>

                    <div className="mt-4 space-y-3 text-sm text-slate-600">

                      <div className="flex items-start gap-2">
                        <MapPin
                          size={15}
                          className="mt-0.5 shrink-0"
                        />
                        <span>{getLocation(report)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CalendarDays size={15} />
                        <span>{formatDate(report.created_at)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <UserRound size={15} />

                        <span>
                          {assignment
                            ? officerMap.get(assignment.officer_id)?.full_name ??
                              "Petugas tidak ditemukan"
                            : "Belum ada petugas"}
                        </span>
                      </div>

                      {assignment && (
                        <div className="flex items-center gap-2">
                          <Clock3 size={15} />
                          <span>
                            Deadline: {formatDate(assignment.deadline)}
                          </span>
                        </div>
                      )}

                      {assignment && (
                        <div>
                          Prioritas:{" "}
                          <span className="font-medium">
                            {getPriorityLabel(assignment.priority)}
                          </span>
                        </div>
                      )}

                    </div>

                    {renderActionButton(report, true)}

                  </div>
                );
              })}
            </div>

          </>
        )}

        {/* PAGINATION */}

        {!loading && filteredReports.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-xs text-slate-500">
              Menampilkan{" "}
              <span className="font-semibold text-slate-700">
                {startItem}-{endItem}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-slate-700">
                {filteredReports.length}
              </span>{" "}
              laporan
            </p>

            <div className="flex items-center justify-end gap-2">

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="min-w-16 text-center text-xs font-medium text-slate-600">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, totalPages)
                  )
                }
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight size={17} />
              </button>

            </div>
          </div>
        )}

      </div>

      {/* ASSIGNMENT MODAL */}

      {showModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">

          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">

            {/* MODAL HEADER */}

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
                className="rounded-lg p-2 cursor-pointer text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL FORM */}

            <div className="space-y-5 p-6">

              {/* REPORT INFORMATION */}

              <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Laporan yang dipilih
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {selectedReport.title}
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  {selectedReport.report_code ||
                    selectedReport.id.slice(0, 8)}
                  {" · "}
                  {selectedReport.category}
                </p>

                <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-600">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  {getLocation(selectedReport)}
                </p>
              </div>

              {/* OFFICER */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Pilih Petugas <span className="text-red-500">*</span>
                </label>

                <select
                  value={form.officer_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      officer_id: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    -- Pilih petugas aktif --
                  </option>

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

              {/* PRIORITY */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Prioritas
                </label>

                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      priority: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                  <option value="urgent">Mendesak</option>
                </select>
              </div>

              {/* DEADLINE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Batas Waktu Penanganan
                </label>

                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      deadline: e.target.value,
                    })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* NOTES */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Catatan Penugasan
                </label>

                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Tambahkan instruksi atau catatan untuk petugas..."
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg border border-slate-200 cursor-pointer bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                onClick={handleSaveAssignment}
                disabled={saving || officers.length === 0}
                className="inline-flex items-center justify-center cursor-pointer gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
