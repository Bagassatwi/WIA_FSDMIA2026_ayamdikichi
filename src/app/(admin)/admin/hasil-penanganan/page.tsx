
"use client";

import { useMemo, useState } from "react";
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
} from "lucide-react";

type ReportStatus =
  | "Dalam Penanganan"
  | "Menunggu Pemeriksaan"
  | "Selesai";

type Report = {
  id: string;
  title: string;
  category: string;
  location: string;
  officer: string;
  assignedDate: string;
  deadline: string;
  status: ReportStatus;
  result?: string;
  completedDate?: string;
  evidence?: string;
};

const initialReports: Report[] = [
  {
    id: "LAP-2026-011",
    title: "Saluran Drainase Tersumbat",
    category: "Drainase",
    location: "Jl. Panglima Sudirman, Bangil",
    officer: "Andi Pratama",
    assignedDate: "06 Nov 2026",
    deadline: "2026-11-12",
    status: "Menunggu Pemeriksaan",
    result:
      "Petugas telah membersihkan saluran drainase dari sampah dan endapan lumpur. Aliran air sudah kembali lancar.",
    completedDate: "07 Nov 2026",
    evidence: "Foto dokumentasi pembersihan drainase",
  },
  {
    id: "LAP-2026-012",
    title: "Sampah Menumpuk di Pinggir Jalan",
    category: "Persampahan",
    location: "Jl. Raya Beji, Pasuruan",
    officer: "Rizky Maulana",
    assignedDate: "06 Nov 2026",
    deadline: "2026-11-14",
    status: "Dalam Penanganan",
  },
  {
    id: "LAP-2026-013",
    title: "Lampu Penerangan Jalan Tidak Menyala",
    category: "Penerangan Jalan",
    location: "Jl. Dr. Sutomo, Pandaan",
    officer: "Dimas Saputra",
    assignedDate: "05 Nov 2026",
    deadline: "2026-11-10",
    status: "Selesai",
    result:
      "Petugas telah melakukan pemeriksaan dan mengganti komponen lampu yang rusak. Lampu penerangan kini berfungsi kembali.",
    completedDate: "06 Nov 2026",
    evidence: "Foto kondisi lampu setelah perbaikan",
  },
];

const statusStyles: Record<ReportStatus, string> = {
  "Dalam Penanganan": "bg-blue-50 text-blue-700",
  "Menunggu Pemeriksaan": "bg-amber-50 text-amber-700",
  Selesai: "bg-emerald-50 text-emerald-700",
};

export default function HasilPenangananPage() {
  const [reports, setReports] = useState(initialReports);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        report.id.toLowerCase().includes(keyword) ||
        report.title.toLowerCase().includes(keyword) ||
        report.officer.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "Semua Status" ||
        report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);

  const totalInProgress = reports.filter(
    (report) => report.status === "Dalam Penanganan"
  ).length;

  const totalReview = reports.filter(
    (report) => report.status === "Menunggu Pemeriksaan"
  ).length;

  const totalCompleted = reports.filter(
    (report) => report.status === "Selesai"
  ).length;

  const handleComplete = (id: string) => {
    setReports((current) =>
      current.map((report) =>
        report.id === id
          ? { ...report, status: "Selesai" as ReportStatus }
          : report
      )
    );

    setSelectedReport((current) =>
      current?.id === id
        ? { ...current, status: "Selesai" as ReportStatus }
        : current
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Hasil Penanganan
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Pantau dan periksa hasil penanganan laporan oleh petugas.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Dalam Penanganan
              </p>
              <h2 className="mt-2 text-2xl font-bold text-blue-700">
                {totalInProgress}
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
              <p className="text-sm text-slate-500">
                Menunggu Pemeriksaan
              </p>
              <h2 className="mt-2 text-2xl font-bold text-amber-600">
                {totalReview}
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
              <p className="text-sm text-slate-500">
                Selesai
              </p>
              <h2 className="mt-2 text-2xl font-bold text-emerald-600">
                {totalCompleted}
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
                <th className="px-5 py-4 text-center font-semibold">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
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
                      {report.id} • {report.category}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="h-3.5 w-3.5" />
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
                      onClick={() => setSelectedReport(report)}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
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
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="font-semibold text-slate-800">
                  Detail Hasil Penanganan
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedReport.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
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
                  <p className="text-xs text-slate-400">Tanggal Penyelesaian</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {selectedReport.completedDate || "-"}
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

              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Hasil Penanganan Petugas
                </h4>

                {selectedReport.result ? (
                  <p className="rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">
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

              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <ImageIcon className="h-4 w-4 text-blue-600" />
                  Bukti Dokumentasi
                </h4>

                {selectedReport.evidence ? (
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                    <div className="rounded-lg bg-blue-50 p-3">
                      <ImageIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {selectedReport.evidence}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Dokumentasi contoh
                      </p>
                    </div>
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

              {selectedReport.status === "Menunggu Pemeriksaan" && (
                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Tutup
                  </button>

                  <button
                    onClick={() => handleComplete(selectedReport.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Konfirmasi Selesai
                  </button>
                </div>
              )}

              {selectedReport.status !== "Menunggu Pemeriksaan" && (
                <div className="flex justify-end border-t border-slate-200 pt-5">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
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
