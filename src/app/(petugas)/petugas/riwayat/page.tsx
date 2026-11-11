"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  History,
  CheckCircle2,
  CalendarDays,
  MapPin,
  ClipboardCheck,
  X,
  Image as ImageIcon,
  Filter,
  ArrowUpRight,
  Clock3,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type HistoryPhoto = {
  id: string;
  file_name: string;
  storage_path: string;
  url: string;
};

type HistoryTask = {
  id: string;
  resultId: string;
  title: string;
  category: string;
  location: string;
  address: string;
  assignedDate: string;
  completedDate: string;
  assignedAt: string;
  completedAt: string;
  description: string;
  result: string;
  duration: string;
  activityType: string;
  documentation: HistoryPhoto[];
};

const formatDate = (value: string | null) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const calculateDuration = (start: string | null, end: string | null) => {
  if (!start || !end) return "-";

  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();

  const difference = Math.max(0, endDate - startDate);

  const days = Math.ceil(difference / (1000 * 60 * 60 * 24));

  return days <= 1 ? "1 hari" : `${days} hari`;
};

export default function RiwayatPetugasPage() {
  const [historyData, setHistoryData] = useState<HistoryTask[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua Kategori");
  const [period, setPeriod] = useState("all");
  const [selectedTask, setSelectedTask] = useState<HistoryTask | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // AMBIL RIWAYAT DARI SUPABASE
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    async function fetchHistory() {
      try {
        setLoading(true);
        setError("");

        // 1. Ambil petugas yang sedang login
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
        }

        // 2. Ambil hasil penanganan yang sudah disetujui admin
        const { data: results, error: resultError } = await supabase
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
      reviewed_at,
      activity_type
    `,
          )
          .eq("officer_id", user.id)
          .eq("status", "approved")
          .order("reviewed_at", {
            ascending: false,
            nullsFirst: false,
          });

        if (resultError) throw resultError;

        // Ambil satu hasil terbaru untuk setiap laporan
        const uniqueResults = Array.from(
          new Map(
            (results || []).map((item) => [item.report_id, item]),
          ).values(),
        );

        if (!uniqueResults.length) {
          if (!cancelled) {
            setHistoryData([]);
          }
          return;
        }

        const assignmentIds = [
          ...new Set(
            uniqueResults.map((item) => item.assignment_id).filter(Boolean),
          ),
        ];

        const reportIds = [
          ...new Set(
            uniqueResults.map((item) => item.report_id).filter(Boolean),
          ),
        ];

        const resultIds = uniqueResults.map((item) => item.id);

        // 4. Ambil data penugasan dan laporan
        const [
          { data: assignments, error: assignmentError },
          { data: reports, error: reportError },
          { data: photos, error: photoError },
        ] = await Promise.all([
          supabase
            .from("report_assignments")
            .select(
              `
              id,
              report_id,
              officer_id,
              assigned_at
            `,
            )
            .eq("officer_id", user.id)
            .in("id", assignmentIds),

          supabase
            .from("reports")
            .select(
              `
              id,
              report_code,
              title,
              category,
              city,
              district,
              address
            `,
            )
            .in("id", reportIds),

          supabase
            .from("report_handling_photos")
            .select(
              `
              id,
              result_id,
              storage_path,
              file_name
            `,
            )
            .in("result_id", resultIds),
        ]);

        if (assignmentError) throw assignmentError;
        if (reportError) throw reportError;
        if (photoError) throw photoError;

        // 5. Buat map agar relasi mudah dicocokkan
        const assignmentMap = new Map(
          (assignments || []).map((item) => [item.id, item]),
        );

        const reportMap = new Map(
          (reports || []).map((item) => [item.id, item]),
        );

        const photoMap = new Map<string, HistoryPhoto[]>();

        // 6. Buat URL dokumentasi dari Supabase Storage
        (photos || []).forEach((photo) => {
          const { data } = supabase.storage
            .from("report-photo")
            .getPublicUrl(photo.storage_path);

          const item: HistoryPhoto = {
            id: photo.id,
            file_name: photo.file_name,
            storage_path: photo.storage_path,
            url: data.publicUrl,
          };

          const existing = photoMap.get(photo.result_id) || [];

          existing.push(item);

          photoMap.set(photo.result_id, existing);
        });

        // 7. Gabungkan data menjadi riwayat petugas
        const formattedHistory: HistoryTask[] = results
          .map((result) => {
            const assignment = assignmentMap.get(result.assignment_id);

            const report = reportMap.get(result.report_id);

            if (!assignment || !report) return null;

            const completedAt = result.reviewed_at || result.submitted_at;

            const location = [report.district, report.city]
              .filter(Boolean)
              .join(", ");

            return {
              id: report.report_code || report.id,
              resultId: result.id,
              title: report.title || "Tanpa judul",
              category: report.category || "-",
              location: location || "-",
              address: report.address || "-",
              assignedDate: formatDate(assignment.assigned_at),
              completedDate: formatDate(completedAt),
              assignedAt: assignment.assigned_at,
              completedAt: completedAt,
              description: result.description || "-",
              result: result.description || "-",
              duration: calculateDuration(
                assignment.assigned_at,
                result.submitted_at,
              ),
              activityType: result.activity_type || "-",
              documentation: photoMap.get(result.id) || [],
            };
          })
          .filter((item): item is HistoryTask => item !== null);

        if (!cancelled) {
          setHistoryData(formattedHistory);
        }
      } catch (err) {
        console.error("Gagal mengambil riwayat:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Terjadi kesalahan saat mengambil data riwayat.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================
  // FILTER KATEGORI
  // ==========================================

  const categories = useMemo(() => {
    return [
      "Semua Kategori",
      ...new Set(historyData.map((item) => item.category)),
    ];
  }, [historyData]);

  // ==========================================
  // FILTER PENCARIAN DAN PERIODE
  // ==========================================

  const filteredHistory = useMemo(() => {
    return historyData.filter((task) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        task.id.toLowerCase().includes(keyword) ||
        task.title.toLowerCase().includes(keyword) ||
        task.category.toLowerCase().includes(keyword) ||
        task.location.toLowerCase().includes(keyword);

      const matchesCategory =
        category === "Semua Kategori" || task.category === category;

      const completed = task.completedAt ? new Date(task.completedAt) : null;

      const now = new Date();

      let matchesPeriod = true;

      if (period !== "all" && completed) {
        const days = period === "7days" ? 7 : 30;

        const start = new Date();
        start.setDate(start.getDate() - days);
        start.setHours(0, 0, 0, 0);

        matchesPeriod = completed >= start && completed <= now;
      } else if (period !== "all" && !completed) {
        matchesPeriod = false;
      }

      return matchesSearch && matchesCategory && matchesPeriod;
    });
  }, [historyData, search, category, period]);

  // ==========================================
  // STATISTIK DINAMIS
  // ==========================================

  const totalCompleted = historyData.length;

  const categoryCount = new Set(historyData.map((item) => item.category)).size;

  const latestCompletion = historyData.length
    ? formatDate(
        historyData
          .map((item) => item.completedAt)
          .filter(Boolean)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0],
      )
    : "-";

  const stats = [
    {
      label: "Total Kasus Selesai",
      value: totalCompleted,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Kategori Ditangani",
      value: categoryCount,
      icon: ClipboardCheck,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Penyelesaian Terakhir",
      value: latestCompletion,
      icon: CalendarDays,
      color: "bg-indigo-50 text-indigo-600",
    },
  ];

  // ==========================================
  // TAMPILAN
  // ==========================================

  return (
    <main className="min-h-screen space-y-7 bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <section>
        <p className="text-sm font-semibold text-blue-600">
          PANEL PETUGAS LAPANGAN
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-800">
          Riwayat Penanganan
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Dokumentasi pekerjaan yang telah diselesaikan dan disetujui oleh
          admin.
        </p>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {stat.label}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-800">
                    {stat.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Search & Filters */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={18} className="text-blue-600" />
          <h2 className="text-sm font-bold text-slate-800">
            Cari Riwayat Penanganan
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode atau judul laporan..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-emerald-500"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Periode</option>
            <option value="7days">7 Hari Terakhir</option>
            <option value="30days">30 Hari Terakhir</option>
          </select>
        </div>
      </section>

      {/* History List */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">
              Daftar Pekerjaan Selesai
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Menampilkan {filteredHistory.length} dari {totalCompleted} kasus.
            </p>
          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={13} className="mr-1 inline" />
            Disetujui
          </span>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
            <Loader2
              size={30}
              className="mx-auto animate-spin text-emerald-600"
            />
            <p className="mt-3 text-sm text-slate-500">
              Memuat riwayat penanganan...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle size={30} className="mx-auto text-red-500" />
            <p className="mt-3 text-sm font-semibold text-red-700">
              Gagal memuat riwayat
            </p>
            <p className="mt-1 text-xs text-red-600">{error}</p>
          </div>
        ) : filteredHistory.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredHistory.map((task) => (
              <article
                key={task.resultId}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-emerald-700">
                    {task.id}
                  </span>

                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                    <CheckCircle2 size={12} />
                    Disetujui
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-800">
                  {task.title}
                </h3>

                <p className="mt-1 text-xs text-slate-500">{task.category}</p>

                <div className="mt-4 space-y-2">
                  <p className="flex items-start gap-2 text-xs text-slate-500">
                    <MapPin
                      size={15}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                    {task.address}
                  </p>

                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays size={15} className="text-emerald-600" />
                    Disetujui: {task.completedDate}
                  </p>

                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock3 size={15} className="text-emerald-600" />
                    Durasi penanganan: {task.duration}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-medium text-slate-400">
                    Dokumentasi & hasil pekerjaan
                  </span>

                  <button
                    onClick={() => setSelectedTask(task)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Lihat Detail
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center">
            <History size={32} className="mx-auto text-slate-300" />

            <h3 className="mt-3 font-semibold text-slate-700">
              Riwayat Tidak Ditemukan
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Belum ada hasil penanganan yang disetujui atau tidak ada data yang
              sesuai filter.
            </p>
          </div>
        )}
      </section>

      {/* Detail Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
              <div>
                <h2 className="font-bold text-slate-800">
                  Detail Hasil Penanganan
                </h2>

                <p className="mt-1 text-xs text-emerald-600">
                  {selectedTask.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Tutup detail"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={13} className="mr-1 inline" />
                  Berhasil Diselesaikan
                </span>

                <h3 className="mt-3 text-lg font-bold text-slate-800">
                  {selectedTask.title}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedTask.category}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[10px] text-slate-400">
                    Tanggal Penugasan
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-700">
                    {selectedTask.assignedDate}
                  </p>
                </div>

                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-[10px] text-emerald-600">
                    Tanggal Persetujuan
                  </p>

                  <p className="mt-1 text-xs font-semibold text-emerald-800">
                    {selectedTask.completedDate}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Lokasi Penanganan
                </h4>

                <p className="mt-2 flex items-start gap-2 text-sm text-slate-500">
                  <MapPin
                    size={16}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                  {selectedTask.address}
                </p>

                <p className="mt-1 pl-6 text-xs text-slate-400">
                  {selectedTask.location}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Hasil Penanganan
                </h4>

                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {selectedTask.result}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Jenis Aktivitas
                </h4>

                <p className="mt-2 text-sm text-slate-500">
                  {selectedTask.activityType}
                </p>
              </div>

              {/* Dokumentasi */}
              <div>
                <div className="flex items-center gap-2">
                  <ImageIcon size={17} className="text-slate-600" />

                  <h4 className="text-sm font-bold text-slate-800">
                    Dokumentasi Pekerjaan
                  </h4>
                </div>

                {selectedTask.documentation.length > 0 ? (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {selectedTask.documentation.map((photo) => (
                      <a
                        key={photo.id}
                        href={photo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group overflow-hidden rounded-xl border border-slate-200"
                      >
                        <img
                          src={photo.url}
                          alt={photo.file_name || "Dokumentasi pekerjaan"}
                          className="aspect-video w-full object-cover transition group-hover:scale-105"
                        />

                        <p className="truncate px-2 py-2 text-xs text-slate-600">
                          {photo.file_name}
                        </p>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 flex aspect-video flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                    <ImageIcon size={25} />
                    <p className="mt-2 text-xs font-medium">
                      Belum ada dokumentasi
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 px-5 py-4">
              <button
                onClick={() => setSelectedTask(null)}
                className="w-full rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
        JEJAKPUBLIK © 2026 · Panel Petugas Lapangan
      </div>
    </main>
  );
}
