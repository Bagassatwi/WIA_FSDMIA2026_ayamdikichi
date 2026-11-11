
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock3,
  CheckCircle2,
  BriefcaseBusiness,
  ArrowRight,
  MapPin,
  CalendarDays,
  AlertCircle,
  PlayCircle,
  ListTodo,
  ShieldCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

// ============================================
// TYPES
// ============================================

type ReportInfo = {
  id: string;
  report_code: string | null;
  title: string;
  category: string;
  description: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
};

type AssignmentRow = {
  id: string;
  report_id: string;
  officer_id: string;
  priority: string;
  deadline: string | null;
  notes: string | null;
  status: string;
  assigned_at: string;
  updated_at: string;
  report: ReportInfo | null;
};

type OfficerProfile = {
  full_name: string;
};

// ============================================
// HELPERS
// ============================================

const formatDate = (value: string | null) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

const getLocation = (report: ReportInfo | null) => {
  if (!report) return "-";

  return [
    report.address,
    report.district,
    report.city,
    report.province,
  ]
    .filter(Boolean)
    .join(", ") || "-";
};

const getPriorityLabel = (priority: string) => {
  const value = priority.toLowerCase();

  if (value === "high" || value === "tinggi") return "Tinggi";
  if (value === "medium" || value === "sedang") return "Sedang";
  if (value === "low" || value === "rendah") return "Rendah";

  return priority;
};

const getPriorityColor = (priority: string) => {
  const value = priority.toLowerCase();

  if (value === "high" || value === "tinggi") {
    return "bg-red-50 text-red-600";
  }

  if (value === "medium" || value === "sedang") {
    return "bg-amber-50 text-amber-600";
  }

  return "bg-emerald-50 text-emerald-600";
};

// ============================================
// DASHBOARD
// ============================================

export default function DashboardPetugas() {
  const [profile, setProfile] = useState<OfficerProfile | null>(null);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Ambil user yang sedang login
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
      }

      // 2. Ambil profil petugas
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("full_name")
        .eq("id", user.id)
        .eq("role", "petugas")
        .eq("is_active", true)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData as OfficerProfile);

      // 3. Ambil semua penugasan milik petugas login
      const { data: assignmentData, error: assignmentError } =
        await supabase
          .from("report_assignments")
          .select(`
            id,
            report_id,
            officer_id,
            priority,
            deadline,
            notes,
            status,
            assigned_at,
            updated_at,
            report:reports (
              id,
              report_code,
              title,
              category,
              description,
              province,
              city,
              district,
              address
            )
          `)
          .eq("officer_id", user.id)
          .order("assigned_at", { ascending: false });

      if (assignmentError) throw assignmentError;

      setAssignments(
        (assignmentData || []) as unknown as AssignmentRow[]
      );
    } catch (err) {
      console.error("Dashboard petugas error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalTasks = assignments.length;

  const waitingTasks = assignments.filter(
    (item) => item.status === "assigned"
  );

  const activeTasks = assignments.filter(
    (item) => item.status === "in_progress"
  );

  const completedTasks = assignments.filter(
    (item) => item.status === "completed"
  );

  const activeTask = activeTasks[0] || null;

  const recentCompleted = completedTasks.slice(0, 3);

  const stats = [
    {
      label: "Total Penugasan",
      value: totalTasks,
      description: "Seluruh tugas Anda",
      icon: BriefcaseBusiness,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Menunggu Giliran",
      value: waitingTasks.length,
      description: "Belum mulai ditangani",
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Sedang Ditangani",
      value: activeTasks.length,
      description: "Tugas yang sedang aktif",
      icon: PlayCircle,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Selesai",
      value: completedTasks.length,
      description: "Berhasil diselesaikan",
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">
            Memuat dashboard petugas...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />

          <h2 className="mt-4 font-bold text-slate-800">
            Gagal Memuat Dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchDashboard}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>
        </div>
      </main>
    );
  }

  // ==========================================
  // MAIN DASHBOARD
  // ==========================================

  return (
    <main className="min-h-screen space-y-7 bg-slate-50 p-4 sm:p-6 lg:p-8">

      {/* HEADER */}

      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            PANEL PETUGAS LAPANGAN
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Selamat datang kembali,{" "}
            <span className="font-semibold text-slate-700">
              {profile?.full_name || "Petugas"}
            </span>.
            Berikut ringkasan pekerjaan Anda.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <CalendarDays size={18} className="text-blue-600" />

          <span className="text-sm font-medium text-slate-600">
            {formatDate(new Date().toISOString())}
          </span>
        </div>
      </section>

      {/* STATISTICS */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>

                  <h2 className="mt-3 text-3xl font-bold text-slate-800">
                    {stat.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={22} />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                {stat.description}
              </p>
            </div>
          );
        })}
      </section>

      {/* ACTIVE TASK */}

      <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <PlayCircle size={19} className="text-indigo-600" />

              <h2 className="font-bold text-slate-800">
                Penanganan Aktif
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Kasus yang sedang menjadi tanggung jawab Anda.
            </p>
          </div>

          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {activeTasks.length} Kasus Aktif
          </span>
        </div>

        <div className="p-5 sm:p-6">
          {activeTask ? (
            <div className="flex flex-col justify-between gap-5 lg:flex-row">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-blue-700">
                    {activeTask.report?.report_code || activeTask.report_id}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getPriorityColor(
                      activeTask.priority
                    )}`}
                  >
                    Prioritas {getPriorityLabel(activeTask.priority)}
                  </span>

                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700">
                    Sedang Ditangani
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-bold text-slate-800">
                  {activeTask.report?.title || "Laporan tanpa judul"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {activeTask.report?.category || "-"}
                </p>

                <div className="mt-4 space-y-2">
                  <p className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />
                    {getLocation(activeTask.report)}
                  </p>

                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarDays size={17} className="text-blue-600" />
                    Ditugaskan: {formatDate(activeTask.assigned_at)}
                  </p>

                  {activeTask.deadline && (
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock3 size={17} className="text-amber-600" />
                      Tenggat: {formatDate(activeTask.deadline)}
                    </p>
                  )}
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
                  {activeTask.report?.description ||
                    "Tidak ada deskripsi laporan."}
                </p>
              </div>

              <div className="flex shrink-0 flex-col justify-center gap-3 lg:w-48">
                <Link
                  href="/petugas/tugas"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Lanjutkan Tugas
                  <ArrowRight size={17} />
                </Link>

                <p className="text-center text-xs text-slate-400">
                  Selesaikan kasus ini sebelum memulai tugas berikutnya.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto h-11 w-11 text-emerald-500" />

              <h3 className="mt-3 font-semibold text-slate-700">
                Tidak Ada Penanganan Aktif
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {waitingTasks.length > 0
                  ? "Anda memiliki tugas yang menunggu giliran."
                  : "Saat ini belum ada laporan yang sedang Anda tangani."}
              </p>

              <Link
                href="/petugas/tugas"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Lihat Tugas Saya
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* QUEUE AND INFORMATION */}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* TASK QUEUE */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
            <div>
              <h2 className="font-bold text-slate-800">
                Antrean Penugasan
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Tugas berikutnya yang menunggu giliran.
              </p>
            </div>

            <Link
              href="/petugas/tugas"
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Lihat Semua
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {waitingTasks.length > 0 ? (
              waitingTasks.slice(0, 5).map((task, index) => (
                <div
                  key={task.id}
                  className="flex flex-col gap-3 px-5 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <ListTodo size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-blue-700">
                        {task.report?.report_code || task.report_id}
                      </p>

                      <h3 className="mt-1 truncate text-sm font-semibold text-slate-800">
                        {task.report?.title || "Laporan tanpa judul"}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {task.report?.category || "-"} •{" "}
                        {getLocation(task.report)}
                      </p>

                      <p className="mt-2 text-[11px] text-slate-400">
                        Ditugaskan {formatDate(task.assigned_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-semibold text-amber-700">
                      Menunggu Giliran
                    </span>

                    <span className="text-[10px] text-slate-400">
                      Antrean #{index + 1}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center">
                <ListTodo className="mx-auto h-9 w-9 text-slate-300" />

                <p className="mt-3 text-sm font-medium text-slate-600">
                  Tidak ada antrean penugasan
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Semua tugas Anda sudah diproses.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RULES AND COMPLETED */}

        <div className="space-y-6">

          {/* WORK RULES */}

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-blue-700" />

              <h2 className="font-bold text-blue-900">
                Aturan Penanganan
              </h2>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-blue-900">
              <p className="flex gap-2">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                Satu petugas hanya boleh memiliki satu kasus aktif.
              </p>

              <p className="flex gap-2">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                Tugas lainnya menunggu hingga tugas aktif selesai.
              </p>

              <p className="flex gap-2">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                Unggah bukti pekerjaan sebelum menyelesaikan tugas.
              </p>
            </div>
          </div>

          {/* RECENT COMPLETED */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800">
                Terakhir Diselesaikan
              </h2>

              <CheckCircle2 size={19} className="text-emerald-600" />
            </div>

            <div className="mt-4 space-y-4">
              {recentCompleted.length > 0 ? (
                recentCompleted.map((task) => (
                  <div key={task.id}>
                    <p className="text-[10px] font-bold text-blue-700">
                      {task.report?.report_code || task.report_id}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {task.report?.title || "Laporan tanpa judul"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Selesai {formatDate(task.updated_at)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-xs text-slate-400">
                  Belum ada tugas yang diselesaikan.
                </p>
              )}
            </div>

            <Link
              href="/petugas/riwayat"
              className="mt-5 flex items-center justify-center gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Lihat Riwayat
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER NOTICE */}

      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <AlertCircle
          size={19}
          className="mt-0.5 shrink-0 text-blue-600"
        />

        <p className="text-xs leading-relaxed text-blue-800">
          Informasi dashboard ditampilkan berdasarkan penugasan yang
          tercatat pada akun petugas yang sedang login.
        </p>
      </div>

    </main>
  );
}
