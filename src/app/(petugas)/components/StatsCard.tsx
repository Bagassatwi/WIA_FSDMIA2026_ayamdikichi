"use client";

import { CheckCircle2, Clock3, FileText, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type Report = {
  id: string;
  status: string | null;
};

const statsConfig = [
  {
    label: "Total Laporan",
    icon: FileText,
    iconStyle: "bg-blue-100 text-blue-600",
  },
  {
    label: "Menunggu Verifikasi",
    icon: Clock3,
    iconStyle: "bg-amber-100 text-amber-500",
  },
  {
    label: "Dalam Penanganan",
    icon: Settings2,
    iconStyle: "bg-blue-100 text-blue-600",
  },
  {
    label: "Selesai Ditangani",
    icon: CheckCircle2,
    iconStyle: "bg-emerald-100 text-emerald-600",
  },
];

const numberFormat = new Intl.NumberFormat("id-ID");

// Normalisasi status agar variasi penulisan bisa dikenali
function normalizeStatus(status: string | null) {
  return (status ?? "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");
}

export default function StatCards() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("reports")
          .select("id, status")
          .eq("status", "assigned");

        console.log("SUPABASE ERROR:", error);
        console.log("DATA REPORTS:", data);
        console.log("JUMLAH REPORT:", data?.length);

        if (error) throw error;

        console.log("DAFTAR STATUS:", [
          ...new Set(data?.map((item) => item.status)),
        ]);

        setReports(data ?? []);
      } catch (err) {
        console.error("Gagal mengambil statistik:", err);
        setError("Gagal memuat statistik laporan.");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  // Menghitung statistik berdasarkan status laporan
  const totalReports = reports.length;

  const pendingReports = reports.filter((report) => {
    const status = normalizeStatus(report.status);

    return ["pending", "menunggu_verifikasi"].includes(status);
  }).length;

  const processingReports = reports.filter((report) => {
    const status = normalizeStatus(report.status);

    return [
      "in_progress",
      "processing",
      "diproses",
      "dalam_penanganan",
    ].includes(status);
  }).length;

  const completedReports = reports.filter((report) => {
    const status = normalizeStatus(report.status);

    return ["completed", "resolved", "selesai", "selesai_ditangani"].includes(
      status,
    );
  }).length;

  const values = [
    totalReports,
    pendingReports,
    processingReports,
    completedReports,
  ];

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
      {statsConfig.map((item, index) => {
        const Icon = item.icon;

        return (
          <article
            key={item.label}
            className="flex min-h-[120px] items-start gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/40"
          >
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${item.iconStyle}`}
            >
              <Icon size={27} />
            </span>

            <div className="min-w-0">
              <p className="text-[25px] font-extrabold leading-7 tracking-tight text-[#102b59]">
                {loading
                  ? "..."
                  : error
                    ? "-"
                    : numberFormat.format(values[index])}
              </p>

              <p className="mt-1 text-xs text-slate-500">{item.label}</p>

              <p className="mt-2 text-[11px] text-slate-400">
                {loading
                  ? "Memuat data..."
                  : error
                    ? "Data tidak tersedia"
                    : "Data aktual dari database"}
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
