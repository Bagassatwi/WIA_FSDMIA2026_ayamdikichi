"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Wrench,
  X,
  Loader2,
  ClipboardList,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type TaskStatus = "assigned" | "in_progress" | "completed";

type Report = {
  id: string;
  report_code: string | null;
  title: string | null;
  category: string | null;
  description: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
};

type Task = {
  id: string;
  report_id: string;
  title: string;
  category: string;
  location: string;
  address: string;
  assigned_at: string;
  deadline: string | null;
  description: string;
  status: TaskStatus;
  priority: string;
  report: Report | null;
};

const statusMeta: Record<TaskStatus, { label: string; badge: string; dot: string }> = {
  assigned: {
    label: "Menunggu diterima",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    dot: "bg-amber-500",
  },
  in_progress: {
    label: "Sedang ditangani",
    badge: "border-blue-200 bg-blue-50 text-blue-800",
    dot: "bg-blue-600",
  },
  completed: {
    label: "Selesai ditangani",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-500",
  },
};

const formatDate = (value: string | null) => {
  if (!value) return "-";
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

function mapTask(row: any): Task {
  const rawReport = Array.isArray(row.report) ? row.report[0] : row.report;
  const report: Report | null = rawReport
    ? {
        id: rawReport.id,
        report_code: rawReport.report_code ?? null,
        title: rawReport.title ?? null,
        category: rawReport.category ?? null,
        description: rawReport.description ?? null,
        province: rawReport.province ?? null,
        city: rawReport.city ?? null,
        district: rawReport.district ?? null,
        address: rawReport.address ?? null,
      }
    : null;

  return {
    id: row.id,
    report_id: row.report_id,
    report,
    title: report?.title || "Laporan tanpa judul",
    category: report?.category || "Kategori tidak tersedia",
    location: report?.city || report?.district || "Lokasi tidak tersedia",
    address:
      [report?.address, report?.district, report?.city, report?.province]
        .filter(Boolean)
        .join(", ") || "Alamat belum tersedia",
    assigned_at: row.assigned_at,
    deadline: row.deadline,
    description: report?.description || "Tidak ada deskripsi laporan.",
    status: row.status,
    priority: row.priority || "Normal",
  };
}

export default function TugasPetugasPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Task | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);

  const fetchTasks = useCallback(async (quiet = false) => {
    try {
      if (quiet) setRefreshing(true);
      else setLoading(true);
      setError("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");

      const { data, error: queryError } = await supabase
        .from("report_assignments")
        .select(`
          id, report_id, officer_id, priority, deadline, status, assigned_at,
          report:reports!report_assignments_report_id_fkey (
            id, report_code, title, category, description,
            address, district, city, province
          )
        `)
        .eq("officer_id", user.id)
        .in("status", ["assigned", "in_progress", "completed"])
        .order("assigned_at", { ascending: false });

      if (queryError) throw queryError;
      setTasks((data || []).map(mapTask));
    } catch (err: any) {
      console.error("Fetch tugas petugas:", err);
      setError(err?.message || "Gagal memuat daftar tugas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const activeCount = tasks.filter((task) => task.status === "in_progress").length;
  const waitingCount = tasks.filter((task) => task.status === "assigned").length;
  const completedCount = tasks.filter((task) => task.status === "completed").length;

  const filteredTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesKeyword =
        !keyword ||
        [
          task.report?.report_code,
          task.title,
          task.category,
          task.location,
          task.address,
        ].some((value) => value?.toLowerCase().includes(keyword));

      return matchesKeyword && (filter === "all" || task.status === filter);
    });
  }, [tasks, search, filter]);

  const acceptTask = async (task: Task) => {
    if (activeCount > 0) {
      window.alert("Anda masih memiliki tugas yang sedang ditangani. Selesaikan tugas tersebut terlebih dahulu.");
      return;
    }

    if (task.status !== "assigned") return;

    const confirmed = window.confirm(
      `Terima penugasan ${task.report?.report_code || task.id}?`
    );
    if (!confirmed) return;

    try {
      setAccepting(task.id);
      const { error: rpcError } = await supabase.rpc(
        "accept_report_assignment",
        { p_assignment_id: task.id }
      );

      if (rpcError) throw rpcError;

      window.alert("Tugas berhasil diterima. Silakan lanjutkan melalui Kelola Penanganan.");
      setSelected(null);
      await fetchTasks(true);
    } catch (err: any) {
      console.error("ACCEPT TASK ERROR:", err);
      window.alert(err?.message || "Gagal menerima tugas.");
      await fetchTasks(true);
    } finally {
      setAccepting(null);
    }
  };

  const renderAction = (task: Task, compact = false) => {
    if (task.status === "assigned") {
      return (
        <button
          onClick={() => void acceptTask(task)}
          disabled={activeCount > 0 || accepting === task.id}
          className="inline-flex min-h-10 items-center justify-center cursor-pointer gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-900/10 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          {accepting === task.id ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          {accepting === task.id ? "Memproses..." : "Terima Tugas"}
        </button>
      );
    }

    if (task.status === "in_progress") {
      return (
        <Link
          href={`/petugas/tugas/${task.id}/penanganan`}
          className="inline-flex min-h-10 items-center justify-center cursor-pointer  gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-900/10 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
        >
          <Wrench size={16} />
          Kelola Penanganan
          {!compact && <ArrowUpRight size={15} />}
        </Link>
      );
    }

    return (
      <span className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
        <CheckCircle2 size={16} />
        Selesai
      </span>
    );
  };

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-700" />
          <p className="mt-3 text-sm font-medium text-slate-500">Memuat daftar tugas...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[70vh] bg-slate-50 p-5 sm:p-8">
        <div className="mx-auto max-w-lg rounded-2xl border border-red-100 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle size={24} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Tugas gagal dimuat</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{error}</p>
          <button
            onClick={() => void fetchTasks()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <RefreshCw size={15} /> Coba lagi
          </button>
        </div>
      </main>
    );
  }

  const statCards = [
    {
      label: "Total penugasan",
      value: tasks.length,
      icon: BriefcaseBusiness,
      tone: "bg-slate-100 text-slate-700",
      note: "Seluruh tugas Anda",
    },
    {
      label: "Menunggu diterima",
      value: waitingCount,
      icon: Clock3,
      tone: "bg-amber-50 text-amber-700",
      note: "Perlu tindakan Anda",
    },
    {
      label: "Sedang ditangani",
      value: activeCount,
      icon: Wrench,
      tone: "bg-blue-50 text-blue-700",
      note: "Tugas yang sedang aktif",
    },
    {
      label: "Selesai",
      value: completedCount,
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-700",
      note: "Penanganan diselesaikan",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-8xl space-y-7">
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#082b5b] via-[#0b3d78] to-[#1459a0] px-6 py-7 text-white shadow-lg shadow-blue-950/10 sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border-[35px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-28 right-40 h-64 w-64 rounded-full bg-cyan-300/10 blur-2xl" />
          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
                <ShieldCheck size={14} /> Panel petugas lapangan
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Tugas Saya</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-blue-100 sm:text-base">
                Pantau penugasan dan dokumentasikan proses penanganan laporan masyarakat dalam satu tempat.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.15)]" />
              Data penugasan terbaru
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <article key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
                    <p className="mt-1 text-xs text-slate-400">{stat.note}</p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.tone}`}>
                    <Icon size={21} />
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {activeCount > 0 && (
          <section className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-white p-2 text-blue-700 shadow-sm">
                <Wrench size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-950">Anda memiliki tugas yang sedang berjalan</p>
                <p className="mt-1 text-xs leading-relaxed text-blue-800">
                  Selesaikan dokumentasi dan proses penanganan sebelum menerima penugasan berikutnya.
                </p>
              </div>
            </div>
            <span className="w-fit rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-800">
              {activeCount} tugas aktif
            </span>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Daftar penugasan</h2>
              <p className="mt-1 text-xs text-slate-500">
                {filteredTasks.length} dari {tasks.length} penugasan ditampilkan
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative sm:w-72">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari kode, judul, atau lokasi..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>
              <div className="relative sm:w-52">
                <SlidersHorizontal size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                >
                  <option value="all">Semua status</option>
                  <option value="assigned">Menunggu diterima</option>
                  <option value="in_progress">Sedang ditangani</option>
                  <option value="completed">Selesai</option>
                </select>
                <Filter size={13} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <button
                onClick={() => void fetchTasks(true)}
                disabled={refreshing}
                title="Muat ulang daftar"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                <span className="sm:hidden">Muat ulang</span>
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {filteredTasks.map((task) => {
              const meta = statusMeta[task.status];
              return (
                <article key={task.id} className="group rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-md hover:shadow-slate-900/[0.04] sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold tracking-wide text-blue-800">
                          {task.report?.report_code || task.report_id.slice(0, 8)}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </div>
                      <h3 className="mt-3 truncate text-base font-bold text-slate-900 sm:text-lg">{task.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        <span>{task.category}</span>
                        <span className="inline-flex items-center gap-1"><MapPin size={13} />{task.location}</span>
                        <span className="inline-flex items-center gap-1"><CalendarDays size={13} />Ditugaskan {formatDate(task.assigned_at)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between lg:border-0 lg:pt-0">
                      <button
                        onClick={() => setSelected(task)}
                        className="inline-flex min-h-10 items-center cursor-pointer justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Lihat detail <ChevronRight size={15} />
                      </button>
                      {renderAction(task)}
                    </div>
                  </div>
                </article>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                  <ClipboardList size={25} />
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-800">Tidak ada penugasan ditemukan</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Coba ubah kata kunci pencarian atau filter status.
                </p>
                {(search || filter !== "all") && (
                  <button onClick={() => { setSearch(""); setFilter("all"); }} className="mt-4 text-xs font-semibold text-blue-700 hover:underline">
                    Hapus filter
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        <footer className="pb-2 text-center text-xs text-slate-400">
          JEJAKPUBLIK · Panel Petugas Lapangan
        </footer>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">Detail penugasan</p>
                <h2 className="mt-1 text-base font-bold text-slate-900">Informasi laporan</h2>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Tutup detail">
                <X size={19} />
              </button>
            </div>
            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800">{selected.report?.report_code || selected.report_id}</span>
                <h3 className="mt-3 text-xl font-bold leading-snug text-slate-900">{selected.title}</h3>
                <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusMeta[selected.status].badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusMeta[selected.status].dot}`} />
                  {statusMeta[selected.status].label}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[11px] font-medium text-slate-400">Kategori</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{selected.category}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[11px] font-medium text-slate-400">Tanggal penugasan</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{formatDate(selected.assigned_at)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-[11px] font-medium text-slate-400">Lokasi laporan</p>
                  <p className="mt-1 flex items-start gap-2 text-sm font-semibold leading-relaxed text-slate-800"><MapPin size={16} className="mt-0.5 shrink-0 text-blue-700" />{selected.address}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-[11px] font-medium text-slate-400">Deskripsi laporan</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{selected.description}</p>
                </div>
                {selected.deadline && (
                  <div className="rounded-xl bg-amber-50 p-4 sm:col-span-2">
                    <p className="text-[11px] font-medium text-amber-700">Tenggat penanganan</p>
                    <p className="mt-1 text-sm font-semibold text-amber-900">{formatDate(selected.deadline)}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button onClick={() => setSelected(null)} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  Tutup
                </button>
                {renderAction(selected)}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
