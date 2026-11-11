"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  Cell,
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
} from "recharts";

type Period = "Bulan Ini" | "7 Hari Terakhir" | "Tahun Ini";

type TrendItem = {
  day: string;
  total: number;
};

type Report = {
  status: string | null;
};

type Reportt = {
  category: string | null;
};

type StatusItem = {
  name: string;
  value: number;
  color: string;
};

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getLocalISOString(date: Date) {
  // Mengubah waktu lokal menjadi ISO UTC
  return date.toISOString();
}

function formatDay(date: Date) {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function formatMonth(date: Date) {
  return date.toLocaleDateString("id-ID", {
    month: "short",
  });
}

function getPeriodRange(period: Period) {
  const now = new Date();

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (period === "7 Hari Terakhir") {
    start.setDate(start.getDate() - 6);
  } else if (period === "Bulan Ini") {
    start.setDate(1);
  } else {
    start.setMonth(0, 1);
  }

  const end = new Date(now);
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 1);

  return { start, end, now };
}

const STATUS_CONFIG = [
  {
    name: "Selesai",
    color: "#10a66a",
    aliases: ["completed", "resolved", "selesai", "selesai_ditangani"],
  },
  {
    name: "Dalam Penanganan",
    color: "#1677f8",
    aliases: [
      "in_progress",
      "processing",
      "diproses",
      "dalam_penanganan",
      "assigned",
    ],
  },
  {
    name: "Menunggu Verifikasi",
    color: "#ffbd24",
    aliases: ["pending", "menunggu_verifikasi", "waiting", "submitted"],
  },
  {
    name: "Ditolak",
    color: "#ef4444",
    aliases: ["rejected", "ditolak"],
  },
];

function normalizeStatus(status: string | null) {
  return (status ?? "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");
}

const CATEGORY_CONFIG = [
  {
    name: "Infrastruktur Jalan",
    aliases: ["infrastruktur jalan", "jalan", "jalan rusak", "jalan berlubang"],
  },
  {
    name: "Kebersihan",
    aliases: ["kebersihan", "bersih", "sampah", "persampahan"],
  },
  {
    name: "Drainase",
    aliases: ["drainase", "saluran air", "selokan"],
  },
  {
    name: "Penerangan Jalan",
    aliases: ["penerangan jalan", "penerangan", "lampu jalan", "lampu mati"],
  },
  {
    name: "Fasilitas Umum",
    aliases: ["fasilitas umum", "fasilitas"],
  },
  {
    name: "Lingkungan",
    aliases: ["lingkungan", "lingkungan lainnya"],
  },
] as const;

// TREND CHART
export function TrendChart() {
  const [period, setPeriod] = useState<Period>("Bulan Ini");
  const [trendData, setTrendData] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchTrendData() {
      try {
        setLoading(true);
        setError(null);

        const { start, end, now } = getPeriodRange(period);

        // Mengambil data laporan berdasarkan created_at
        const reports: { created_at: string }[] = [];

        let from = 0;
        const pageSize = 1000;

        while (true) {
          const { data, error } = await supabase
            .from("reports")
            .select("created_at")
            .eq("status", "verified")
            .gte("created_at", getLocalISOString(start))
            .lt("created_at", getLocalISOString(end))
            .order("created_at", { ascending: true })
            .range(from, from + pageSize - 1);

          if (error) throw error;

          const rows = data ?? [];

          reports.push(...rows);

          if (rows.length < pageSize) break;

          from += pageSize;
        }

        if (!active) return;

        // Mengelompokkan laporan berdasarkan tanggal
        const grouped: Record<string, number> = {};

        if (period === "Tahun Ini") {
          for (let month = 0; month <= now.getMonth(); month++) {
            const date = new Date(now.getFullYear(), month, 1);

            const key = `${date.getFullYear()}-${String(
              date.getMonth() + 1,
            ).padStart(2, "0")}`;

            grouped[key] = 0;
          }
        } else {
          const current = new Date(start);

          while (current < end) {
            grouped[getLocalDateKey(current)] = 0;
            current.setDate(current.getDate() + 1);
          }
        }

        // Menghitung setiap laporan
        reports.forEach((report) => {
          const date = new Date(report.created_at);

          if (Number.isNaN(date.getTime())) return;

          const key =
            period === "Tahun Ini"
              ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
                2,
                "0",
              )}`
              : getLocalDateKey(date);

          if (key in grouped) {
            grouped[key]++;
          }
        });

        // Mengubah hasil menjadi format Recharts
        const result = Object.entries(grouped).map(([key, total]) => {
          if (period === "Tahun Ini") {
            const [year, month] = key.split("-").map(Number);

            return {
              day: formatMonth(new Date(year, month - 1, 1)),
              total,
            };
          }

          const [year, month, day] = key.split("-").map(Number);

          return {
            day: formatDay(new Date(year, month - 1, day)),
            total,
          };
        });

        setTrendData(result);
      } catch (err) {
        console.error("Gagal mengambil tren laporan:", err);

        if (active) {
          setError("Gagal memuat tren laporan.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchTrendData();

    return () => {
      active = false;
    };
  }, [period]);

  return (
    <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/40">
      {/* HEADER */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-[#102b59]">Tren Laporan Masuk</h2>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[10px] text-slate-600 outline-none"
        >
          <option>Bulan Ini</option>
          <option>7 Hari Terakhir</option>
          <option>Tahun Ini</option>
        </select>
      </div>

      {/* CHART */}
      <div className="h-[190px] w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            Memuat data laporan...
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-xs text-red-500">
            {error}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{
                top: 8,
                right: 8,
                left: -22,
                bottom: 0,
              }}
            >
              <CartesianGrid stroke="#e9eff7" vertical />

              <XAxis
                dataKey="day"
                tick={{
                  fontSize: 9,
                  fill: "#7183a5",
                }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />

              <YAxis
                allowDecimals={false}
                domain={[0, "auto"]}
                tick={{
                  fontSize: 9,
                  fill: "#7183a5",
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 11,
                }}
                formatter={(value) => [value, "Jumlah laporan"]}
              />

              <Line
                type="monotone"
                dataKey="total"
                name="Jumlah laporan"
                stroke="#1677f8"
                strokeWidth={2.5}
                dot={{
                  r: 3.5,
                  fill: "#1677f8",
                  stroke: "white",
                  strokeWidth: 1.5,
                }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  );
}
// STATUS CHART
export function StatusChart() {
  const [statusData, setStatusData] = useState<StatusItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // FETCH DATA FROM SUPABASE
  // ========================================

  useEffect(() => {
    let active = true;

    async function fetchStatus() {
      try {
        setLoading(true);
        setError(null);

        const reports: Report[] = [];

        let from = 0;
        const pageSize = 1000;

        // Mengambil seluruh status laporan
        while (true) {
          const { data, error } = await supabase
            .from("reports")
            .select("status")
            .eq("status", "verified")
            .range(from, from + pageSize - 1);

          if (error) throw error;

          const rows = data ?? [];

          reports.push(...rows);

          if (rows.length < pageSize) break;

          from += pageSize;
        }

        if (!active) return;

        // ==================================
        // COUNT STATUS
        // ==================================

        const result = STATUS_CONFIG.map((config) => {
          const value = reports.filter((report) => {
            const status = normalizeStatus(report.status);

            return config.aliases.includes(status);
          }).length;

          return {
            name: config.name,
            value,
            color: config.color,
          };
        });

        setStatusData(result);
        setTotal(reports.length);
      } catch (err) {
        console.error("Gagal mengambil status laporan:", err);

        if (active) {
          setError("Gagal memuat status laporan.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchStatus();

    return () => {
      active = false;
    };
  }, []);

  // ========================================
  // RENDER
  // ========================================

  return (
    <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/40">
      <h2 className="mb-2 text-sm font-bold text-[#102b59]">Status Laporan</h2>

      {loading ? (
        <div className="flex min-h-[190px] items-center justify-center text-xs text-slate-400">
          Memuat statistik...
        </div>
      ) : error ? (
        <div className="flex min-h-[190px] items-center justify-center text-xs text-red-500">
          {error}
        </div>
      ) : (
        <div className="flex min-h-[190px] items-center gap-2">
          {/* DONUT CHART */}
          <div className="relative h-[175px] min-w-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="62%"
                  outerRadius="88%"
                  paddingAngle={total > 0 ? 2 : 0}
                  stroke="none"
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 11,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* CENTER TOTAL */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <strong className="text-xl text-[#102b59]">
                {total.toLocaleString("id-ID")}
              </strong>

              <span className="text-[10px] text-slate-500">Total Laporan</span>
            </div>
          </div>

          {/* STATUS LEGEND */}
          <div className="w-[45%] space-y-3">
            {statusData.map((item) => {
              const percentage =
                total > 0 ? Math.round((item.value / total) * 100) : 0;

              return (
                <div
                  key={item.name}
                  className="flex items-start gap-2 text-[10px]"
                >
                  <span
                    className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />

                  <span className="min-w-0 flex-1 text-slate-500">
                    {item.name}
                  </span>

                  <span className="shrink-0 font-medium text-slate-600">
                    {item.value.toLocaleString("id-ID")}{" "}
                    <span className="text-slate-400">({percentage}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}

function normalizeCategory(category: string | null) {
  return (category ?? "").toLowerCase().trim().replace(/\s+/g, " ");
}

// CATEGORY CHART
export function CategoryBreakdown() {
  const [reports, setReports] = useState<Reportt[]>([]);
  const [category, setCategory] = useState("Semua Kategori");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // FETCH DATA FROM SUPABASE
  // ========================================

  useEffect(() => {
    let active = true;

    async function fetchCategories() {
      try {
        setLoading(true);
        setError(null);

        const allReports: Reportt[] = [];

        let from = 0;
        const pageSize = 1000;

        while (true) {
          const { data, error } = await supabase
            .from("reports")
            .select("category")
            .eq("status", "verified")
            .order("category", { ascending: true })
            .range(from, from + pageSize - 1);

          if (error) throw error;

          const rows = data ?? [];

          allReports.push(...rows);

          if (rows.length < pageSize) break;

          from += pageSize;
        }

        if (active) {
          setReports(allReports);
        }
      } catch (err) {
        console.error("Gagal mengambil kategori laporan:", err);

        if (active) {
          setError("Gagal memuat kategori laporan.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchCategories();

    return () => {
      active = false;
    };
  }, []);

  // ========================================
  // GET AVAILABLE CATEGORIES
  // ========================================

  const availableCategories = CATEGORY_CONFIG.map((item) => item.name);

  const categoryData = useMemo(() => {
    return CATEGORY_CONFIG.filter((item) =>
      category === "Semua Kategori" ? true : item.name === category,
    ).map((item) => {
      const value = reports.filter((report) => {
        const dbCategory = normalizeCategory(report.category);

        return item.aliases.some(
          (alias) => normalizeCategory(alias) === dbCategory,
        );
      }).length;

      return {
        name: item.name,
        value,
      };
    });
  }, [reports, category]);

  const maxValue = Math.max(...categoryData.map((item) => item.value), 1);

  // ========================================
  // RENDER
  // ========================================

  return (
    <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/40">
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-[#102b59]">
          Laporan per Kategori
        </h2>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={loading || availableCategories.length === 0}
          className="max-w-[150px] rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[10px] text-slate-600 outline-none disabled:opacity-50"
        >
          <option value="Semua Kategori">Semua Kategori</option>

          {availableCategories.map((item) => (
            <option key={item} value={item}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex min-h-[120px] items-center justify-center text-xs text-slate-400">
          Memuat kategori laporan...
        </div>
      ) : error ? (
        <div className="flex min-h-[120px] items-center justify-center text-xs text-red-500">
          {error}
        </div>
      ) : categoryData.length === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center text-xs text-slate-400">
          Belum ada data kategori.
        </div>
      ) : (
        <div className="space-y-[14px]">
          {categoryData.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2 text-[10px]"
            >
              {/* CATEGORY NAME */}
              <span className="w-[102px] shrink-0 truncate text-slate-500">
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </span>

              {/* PROGRESS BAR */}
              <div className="h-3 flex-1 overflow-hidden rounded-sm bg-slate-100">
                <div
                  className="h-full rounded-sm bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                  }}
                />
              </div>

              {/* TOTAL */}
              <span className="w-10 text-right font-medium text-slate-600">
                {item.value.toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER */}
      {!loading && !error && (
        <div className="mt-4 border-t border-slate-100 pt-3 text-[10px] text-slate-400">
          Total kategori: {availableCategories.length}
          {" • "}
          Total laporan berkategori:{" "}
          {reports
            .filter((r) => r.category?.trim())
            .length.toLocaleString("id-ID")}
        </div>
      )}
    </article>
  );
}
