"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FiMapPin,
  FiCalendar,
  FiSearch,
  FiRotateCcw,
  FiArrowRight,
  FiFileText,
} from "react-icons/fi";

const reports = [
  {
    id: "JP-2026-00377",
    title: "Saluran tersumbat sampah di Jl. Soekarno-Hatta",
    category: "Drainase",
    categoryKey: "drain",
    status: "Selesai",
    statusKey: "selesai",
    location: "Lowokwaru, Kota Malang",
    date: "3 Okt 2026",
    x: 324,
    y: 173,
  },
  {
    id: "JP-2026-00455",
    title: "Lima lampu PJU mati di jalur Pandaan–Malang",
    category: "Penerangan Jalan",
    categoryKey: "lampu",
    status: "Diterima",
    statusKey: "diterima",
    location: "Singosari, Kabupaten Malang",
    date: "25 Okt 2026",
    x: 428,
    y: 52,
  },
  {
    id: "JP-2026-00402",
    title: "Tumpukan sampah di TPS dekat Pasar Blimbing",
    category: "Kebersihan",
    categoryKey: "bersih",
    status: "Diproses",
    statusKey: "diproses",
    location: "Blimbing, Kota Malang",
    date: "18 Okt 2026",
    x: 500,
    y: 139,
  },
  {
    id: "JP-2026-00351",
    title: "Trotoar amblas di depan Alun-Alun Batu",
    category: "Infrastruktur Jalan",
    categoryKey: "jalan",
    status: "Diproses",
    statusKey: "diproses",
    location: "Batu, Kota Batu",
    date: "15 Okt 2026",
    x: 92,
    y: 108,
  },
  {
    id: "JP-2026-00449",
    title: "Pohon tua condong ke kabel listrik di Jl. Panglima Sudirman",
    category: "Lingkungan",
    categoryKey: "ling",
    status: "Diterima",
    statusKey: "diterima",
    location: "Kota Batu",
    date: "22 Okt 2026",
    x: 176,
    y: 92,
  },
  {
    id: "JP-2026-00391",
    title: "Genangan air tiap hujan di Perumahan Tlogomas",
    category: "Drainase",
    categoryKey: "drain",
    status: "Diproses",
    statusKey: "diproses",
    location: "Lowokwaru, Kota Malang",
    date: "10 Okt 2026",
    x: 312,
    y: 148,
  },
  {
    id: "JP-2026-00408",
    title: "Halte rusak di Jl. Raya Dieng",
    category: "Fasilitas Umum",
    categoryKey: "fasum",
    status: "Diterima",
    statusKey: "diterima",
    location: "Klojen, Kota Malang",
    date: "14 Okt 2026",
    x: 400,
    y: 235,
  },
  {
    id: "JP-2026-00322",
    title: "Jalan retak panjang di Jl. Raya Karanglo",
    category: "Infrastruktur Jalan",
    categoryKey: "jalan",
    status: "Selesai",
    statusKey: "selesai",
    location: "Singosari, Kabupaten Malang",
    date: "8 Okt 2026",
    x: 392,
    y: 69,
  },
  {
    id: "JP-2026-00458",
    title: "Lampu taman kota padam di Taman Slamet",
    category: "Penerangan Jalan",
    categoryKey: "lampu",
    status: "Diterima",
    statusKey: "diterima",
    location: "Klojen, Kota Malang",
    date: "26 Okt 2026",
    x: 352,
    y: 260,
  },
  {
    id: "JP-2026-00386",
    title: "Bau limbah dari selokan di Jl. Ahmad Yani",
    category: "Lingkungan",
    categoryKey: "ling",
    status: "Diproses",
    statusKey: "diproses",
    location: "Blimbing, Kota Malang",
    date: "9 Okt 2026",
    x: 548,
    y: 139,
  },
  {
    id: "JP-2026-00339",
    title: "Tong sampah publik hilang di Jl. Veteran",
    category: "Kebersihan",
    categoryKey: "bersih",
    status: "Selesai",
    statusKey: "selesai",
    location: "Klojen, Kota Malang",
    date: "6 Okt 2026",
    x: 300,
    y: 181,
  },
  {
    id: "JP-2026-00418",
    title: "Lubang besar di Jl. Ijen depan SDN Kauman",
    category: "Infrastruktur Jalan",
    categoryKey: "jalan",
    status: "Diproses",
    statusKey: "diproses",
    location: "Klojen, Kota Malang",
    date: "12 Okt 2026",
    x: 352,
    y: 235,
  },
];

const categories = [
  { label: "Infrastruktur Jalan", value: "jalan" },
  { label: "Kebersihan", value: "bersih" },
  { label: "Drainase", value: "drain" },
  { label: "Penerangan Jalan", value: "lampu" },
  { label: "Fasilitas Umum", value: "fasum" },
  { label: "Lingkungan", value: "ling" },
];

const statuses = [
  { label: "Diterima", value: "diterima", color: "#D97706" },
  { label: "Diproses", value: "diproses", color: "#2563EB" },
  { label: "Selesai", value: "selesai", color: "#059669" },
];

const statusColors = {
  diterima: "#D97706",
  diproses: "#2563EB",
  selesai: "#059669",
};

const statusClasses = {
  Diterima: "bg-amber-50 text-amber-700",
  Diproses: "bg-blue-50 text-blue-700",
  Selesai: "bg-emerald-50 text-emerald-700",
};

export default function PetaLaporan() {
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedReport, setSelectedReport] = useState(reports[11]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesKeyword =
        report.title.toLowerCase().includes(keyword.toLowerCase()) ||
        report.location.toLowerCase().includes(keyword.toLowerCase());

      const matchesCategory =
        selectedCategory.length === 0 ||
        selectedCategory.includes(report.categoryKey);

      const matchesStatus =
        selectedStatus.length === 0 ||
        selectedStatus.includes(report.statusKey);

      return matchesKeyword && matchesCategory && matchesStatus;
    });
  }, [keyword, selectedCategory, selectedStatus]);

  const toggleFilter = (value, selected, setSelected) => {
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const resetFilters = () => {
    setKeyword("");
    setSelectedCategory([]);
    setSelectedStatus([]);
  };

  return (
    <main id="main" className="min-h-screen bg-white text-slate-800">
      {/* Header */}
      <section className="border-b border-slate-200 bg-slate-50 px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <ol className="mb-5 flex items-center gap-2 text-sm text-slate-500">
            <li>
              <Link href="/" className="transition hover:text-blue-700">
                Beranda
              </Link>
            </li>
            <li>/</li>
            <li aria-current="page" className="font-medium text-slate-700">
              Peta Laporan
            </li>
          </ol>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Peta Laporan
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Pilih titik di peta untuk melihat laporan dan jejak penanganannya.
            Data dan peta bersifat simulasi.
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            {/* Filter */}
            <aside className="rounded-xl border border-slate-200 bg-white">
              <details open className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between border-b border-slate-200 px-5 py-4 font-semibold text-slate-900">
                  Cari dan filter laporan
                  <span className="text-slate-400 transition group-open:rotate-180">
                    ↓
                  </span>
                </summary>

                <div className="space-y-6 p-5">
                  <div>
                    <label
                      htmlFor="q"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Cari lokasi
                    </label>
                    <div className="relative">
                      <FiSearch
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="q"
                        type="search"
                        list="location-list"
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        placeholder="Kecamatan atau nama jalan"
                        className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                      <datalist id="location-list">
                        <option value="Klojen" />
                        <option value="Lowokwaru" />
                        <option value="Blimbing" />
                        <option value="Sukun" />
                        <option value="Kedungkandang" />
                        <option value="Singosari" />
                        <option value="Batu" />
                      </datalist>
                    </div>
                  </div>

                  <fieldset>
                    <legend className="mb-3 text-sm font-medium text-slate-700">
                      Kategori
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((item) => {
                        const active = selectedCategory.includes(item.value);

                        return (
                          <button
                            key={item.value}
                            type="button"
                            aria-pressed={active}
                            onClick={() =>
                              toggleFilter(
                                item.value,
                                selectedCategory,
                                setSelectedCategory
                              )
                            }
                            className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                              active
                                ? "border-blue-700 bg-blue-700 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="mb-3 text-sm font-medium text-slate-700">
                      Status penanganan
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {statuses.map((item) => {
                        const active = selectedStatus.includes(item.value);

                        return (
                          <button
                            key={item.value}
                            type="button"
                            aria-pressed={active}
                            onClick={() =>
                              toggleFilter(
                                item.value,
                                selectedStatus,
                                setSelectedStatus
                              )
                            }
                            className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                              active
                                ? "border-blue-700 bg-blue-700 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className="border-t border-slate-100 pt-4">
                    <p
                      className="text-sm text-slate-500"
                      aria-live="polite"
                    >
                      <span className="font-semibold text-slate-900">
                        {filteredReports.length}
                      </span>{" "}
                      laporan di peta
                    </p>

                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <FiRotateCcw size={15} />
                      Atur ulang filter
                    </button>
                  </div>
                </div>
              </details>
            </aside>

            {/* Map and preview */}
            <div className="min-w-0 space-y-6">
              {/* Map */}
              <section
                aria-label="Peta laporan"
                className="overflow-hidden rounded-xl border border-slate-200"
              >
                <div className="relative">
                  <div className="w-full overflow-hidden bg-slate-100">
                    <svg
                      viewBox="0 0 800 520"
                      role="img"
                      aria-label="Peta skematis wilayah demonstrasi Malang Raya"
                      className="block h-auto w-full"
                    >
                      <rect width="800" height="520" fill="#EEF2F6" />

                      <g fill="#D8E8D3">
                        <rect x="40" y="60" width="150" height="110" rx="14" />
                        <rect x="560" y="400" width="190" height="80" rx="14" />
                        <rect x="330" y="215" width="70" height="55" rx="10" />
                      </g>

                      <path
                        d="M0 360C150 330 230 400 380 360S620 300 800 340"
                        fill="none"
                        stroke="#BCD6EE"
                        strokeWidth="22"
                      />

                      <g
                        fill="none"
                        stroke="#fff"
                        strokeLinecap="round"
                      >
                        <path d="M0 150H800" strokeWidth="12" />
                        <path d="M270 0V520" strokeWidth="12" />
                        <path d="M0 60 800 300" strokeWidth="9" />
                        <path d="M520 0V520" strokeWidth="7" />
                        <path d="M0 280H800" strokeWidth="7" />
                        <path d="M120 520 400 0" strokeWidth="6" />
                      </g>

                      <g
                        fill="none"
                        stroke="#94A3B8"
                        strokeWidth="1.5"
                        strokeDasharray="6 6"
                      >
                        <path d="M150 0V210L400 250L640 160V0" />
                        <path d="M80 380 400 310 700 380" />
                      </g>

                      <g
                        fill="#475569"
                        stroke="#EEF2F6"
                        strokeWidth="4"
                        paintOrder="stroke"
                        textAnchor="middle"
                        fontSize="14"
                        fontWeight="600"
                      >
                        <text x="416" y="18">Singosari</text>
                        <text x="128" y="47">Batu</text>
                        <text x="288" y="114">Lowokwaru</text>
                        <text x="512" y="114">Blimbing</text>
                        <text x="400" y="224">Klojen</text>
                        <text x="256" y="322">Sukun</text>
                        <text x="576" y="312">Kedungkandang</text>
                      </g>

                      <rect
                        x="16"
                        y="474"
                        width="318"
                        height="30"
                        rx="8"
                        fill="#fff"
                        stroke="#E2E8F0"
                      />
                      <text
                        x="30"
                        y="494"
                        fill="#475569"
                        fontSize="13"
                      >
                        Wilayah demonstrasi: Malang Raya (peta skematis)
                      </text>

                      {/* Report markers */}
                      {filteredReports.map((report) => {
                        const selected = selectedReport?.id === report.id;
                        const color = statusColors[report.statusKey];

                        return (
                          <g
                            key={report.id}
                            role="button"
                            tabIndex={0}
                            aria-label={`${report.title}, ${report.status}`}
                            aria-pressed={selected}
                            onClick={() => setSelectedReport(report)}
                            onKeyDown={(event) => {
                              if (
                                event.key === "Enter" ||
                                event.key === " "
                              ) {
                                event.preventDefault();
                                setSelectedReport(report);
                              }
                            }}
                            className="cursor-pointer outline-none"
                          >
                            {selected && (
                              <circle
                                cx={report.x}
                                cy={report.y}
                                r="23"
                                fill={color}
                                fillOpacity="0.18"
                                stroke={color}
                                strokeWidth="2"
                              />
                            )}

                            <circle
                              cx={report.x}
                              cy={report.y}
                              r="12"
                              fill={color}
                              stroke="#fff"
                              strokeWidth="3"
                            />

                            <circle
                              cx={report.x}
                              cy={report.y}
                              r="4"
                              fill="#fff"
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200 bg-white px-4 py-3">
                    {statuses.map((item) => (
                      <div
                        key={item.value}
                        className="flex items-center gap-2 text-xs text-slate-600"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.label}
                      </div>
                    ))}

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="h-4 w-4 rounded-full border-2 border-blue-500" />
                      Laporan terpilih
                    </div>
                  </div>
                </div>
              </section>

              {/* Selected report */}
              <aside
                aria-label="Laporan terpilih"
                aria-live="polite"
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                {selectedReport ? (
                  <div className="grid grid-cols-1 sm:grid-cols-[180px_minmax(0,1fr)]">
                    <div className="flex min-h-40 items-center justify-center bg-slate-100 p-5">
                      <FiFileText size={42} className="text-slate-400" />
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold tracking-wide text-slate-500">
                          {selectedReport.id}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {selectedReport.category}
                        </span>
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-medium ${statusClasses[selectedReport.status]}`}
                        >
                          {selectedReport.status}
                        </span>
                      </div>

                      <h2 className="text-lg font-semibold leading-6 text-slate-900">
                        {selectedReport.title}
                      </h2>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-2">
                          <FiMapPin size={15} />
                          {selectedReport.location}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <FiCalendar size={15} />
                          {selectedReport.date}
                        </span>
                      </div>

                      <Link
                        href={`/laporan/${selectedReport.id}`}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-800"
                      >
                        Lihat Jejak Penanganan
                        <FiArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <FiSearch
                      size={28}
                      className="mx-auto text-slate-400"
                    />
                    <p className="mt-3 font-medium text-slate-800">
                      Tidak ada laporan yang ditemukan
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Coba ubah kata kunci atau filter pencarian.
                    </p>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}