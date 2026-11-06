"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FiSearch,
  FiMapPin,
  FiCalendar,
  FiShield,
  FiClock,
  FiArrowRight,
  FiRotateCcw,
  FiFileText,
} from "react-icons/fi";

const reports = [
  {
    id: 1,
    category: "Penerangan Jalan",
    title: "Lampu taman kota padam di Taman Slamet",
    location: "Klojen, Kota Malang",
    date: "26 Okt 2026",
    status: "Diterima",
    verification: "Belum diverifikasi",
    imageLabel: "Penerangan jalan",
  },
  {
    id: 2,
    category: "Penerangan Jalan",
    title: "Lima lampu PJU mati di jalur Pandaan–Malang",
    location: "Singosari, Kabupaten Malang",
    date: "25 Okt 2026",
    status: "Diterima",
    verification: "Belum diverifikasi",
    imageLabel: "Lampu PJU",
  },
  {
    id: 3,
    category: "Lingkungan",
    title: "Pohon tua condong ke kabel listrik di Jl. Panglima Sudirman",
    location: "Kota Malang",
    date: "22 Okt 2026",
    status: "Diterima",
    verification: "Belum diverifikasi",
    imageLabel: "Pohon dan lingkungan",
  },
  {
    id: 4,
    category: "Kebersihan",
    title: "Tumpukan sampah di TPS dekat Pasar Blimbing",
    location: "Blimbing, Kota Malang",
    date: "18 Okt 2026",
    status: "Diproses",
    verification: "Terverifikasi",
    imageLabel: "Kebersihan lingkungan",
  },
  {
    id: 5,
    category: "Fasilitas Umum",
    title: "Halte rusak di Jl. Raya Dieng",
    location: "Klojen, Kota Malang",
    date: "14 Okt 2026",
    status: "Diterima",
    verification: "Terverifikasi",
    imageLabel: "Fasilitas umum",
  },
  {
    id: 6,
    category: "Infrastruktur Jalan",
    title: "Lubang besar di Jl. Ijen depan SDN Kauman",
    location: "Klojen, Kota Malang",
    date: "12 Okt 2026",
    status: "Diproses",
    verification: "Terverifikasi",
    imageLabel: "Infrastruktur jalan",
  },
];

const categories = [
  "Infrastruktur Jalan",
  "Kebersihan",
  "Drainase",
  "Penerangan Jalan",
  "Fasilitas Umum",
  "Lingkungan",
];

const statusStyle = {
  Diterima: "bg-amber-50 text-amber-700",
  Diproses: "bg-blue-50 text-blue-700",
  Selesai: "bg-emerald-50 text-emerald-700",
};

export default function LaporanPage() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [verification, setVerification] = useState("");
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("baru");

  const filteredReports = useMemo(() => {
    let result = reports.filter((report) => {
      const matchesKeyword =
        report.title.toLowerCase().includes(keyword.toLowerCase()) ||
        report.location.toLowerCase().includes(keyword.toLowerCase());

      const matchesCategory =
        !category || report.category === category;

      const matchesVerification =
        !verification ||
        (verification === "1" &&
          report.verification === "Terverifikasi") ||
        (verification === "0" &&
          report.verification === "Belum diverifikasi");

      const matchesStatus = !status || report.status === status;

      const matchesLocation =
        !location || report.location.includes(location);

      return (
        matchesKeyword &&
        matchesCategory &&
        matchesVerification &&
        matchesStatus &&
        matchesLocation
      );
    });

    if (sort === "lama") {
      result = [...result].reverse();
    }

    return result;
  }, [keyword, category, verification, status, location, sort]);

  const resetFilters = () => {
    setKeyword("");
    setCategory("");
    setVerification("");
    setStatus("");
    setLocation("");
    setSort("baru");
  };

  return (
    <main className="min-h-screen bg-white text-slate-800">
      {/* Page heading */}
      <section className="border-b border-slate-200 bg-slate-50 px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex items-center gap-2 text-sm text-slate-500">
              <li>
                <Link href="/" className="transition-colors hover:text-blue-700">
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-medium text-slate-700">
                Jelajahi Laporan
              </li>
            </ol>
          </nav>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Jelajahi Laporan
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Cari laporan warga dan lihat sejauh mana penanganannya.
          </p>

          <p className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500">
            <FiFileText size={15} />
            Seluruh laporan di halaman ini adalah data simulasi.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Filters */}
          <aside>
            <form
              onSubmit={(event) => event.preventDefault()}
              className="rounded-xl border border-slate-200 bg-white p-5"
              role="search"
              aria-label="Filter laporan"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">
                  Filter
                </h2>
                <FiSearch className="text-slate-400" size={18} />
              </div>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="q"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Cari laporan
                  </label>
                  <input
                    id="q"
                    type="search"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="Misalnya: lampu, Klojen"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cat"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Kategori
                  </label>
                  <select
                    id="cat"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Semua kategori</option>
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="ver"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Verifikasi
                  </label>
                  <select
                    id="ver"
                    value={verification}
                    onChange={(event) => setVerification(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Semua</option>
                    <option value="1">Terverifikasi</option>
                    <option value="0">Belum diverifikasi</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="sta"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Status penanganan
                  </label>
                  <select
                    id="sta"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Semua status</option>
                    <option value="Diterima">Diterima</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="loc"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Lokasi
                  </label>
                  <select
                    id="loc"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Semua lokasi</option>
                    <option value="Kota Malang">Kota Malang</option>
                    <option value="Kabupaten Malang">Kabupaten Malang</option>
                    <option value="Kota Batu">Kota Batu</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <FiRotateCcw size={15} />
                Atur ulang filter
              </button>
            </form>
          </aside>

          {/* Report list */}
          <section aria-live="polite" className="min-w-0">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                Menampilkan{" "}
                <span className="font-semibold text-slate-900">
                  {filteredReports.length} laporan
                </span>
              </p>

              <div className="flex items-center gap-3">
                <label
                  htmlFor="sort"
                  className="shrink-0 text-sm text-slate-600"
                >
                  Urutkan
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="baru">Terbaru</option>
                  <option value="lama">Terlama</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredReports.map((report) => (
                <article
                  key={report.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-blue-300"
                >
                  {/* Illustration placeholder */}
                  <div className="flex aspect-[16/10] items-center justify-center bg-slate-100">
                    <div className="text-center">
                      <FiFileText
                        size={34}
                        className="mx-auto text-slate-400"
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Ilustrasi simulasi
                      </p>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {report.category}
                      </span>
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                          statusStyle[report.status]
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>

                    <h3 className="min-h-[48px] text-base font-semibold leading-6 text-slate-900">
                      {report.title}
                    </h3>

                    <div className="mt-3 space-y-2 text-sm text-slate-500">
                      <p className="flex items-start gap-2">
                        <FiMapPin className="mt-0.5 shrink-0" size={15} />
                        {report.location}
                      </p>
                      <p className="flex items-center gap-2">
                        <FiShield className="shrink-0" size={15} />
                        {report.verification}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="flex items-center gap-2 text-xs text-slate-500">
                        <FiCalendar size={14} />
                        {report.date}
                      </span>

                      <Link
                        href="/laporan/detail"
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 transition-colors hover:text-blue-800"
                      >
                        Lihat detail
                        <FiArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredReports.length === 0 && (
              <div className="rounded-xl border border-slate-200 px-5 py-12 text-center">
                <FiSearch
                  size={30}
                  className="mx-auto text-slate-400"
                />
                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                  Tidak ada laporan yang cocok
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Coba kata kunci lain atau hapus beberapa filter.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
                >
                  Atur ulang filter
                </button>
              </div>
            )}

            <nav
              className="mt-8 flex items-center justify-center gap-2"
              aria-label="Halaman"
            >
              <button
                type="button"
                disabled
                aria-label="Halaman sebelumnya"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              <button
                type="button"
                aria-current="page"
                className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-blue-700 px-3 text-sm font-medium text-white"
              >
                1
              </button>
              <button
                type="button"
                className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm text-slate-600 transition hover:bg-slate-50"
              >
                2
              </button>
              <button
                type="button"
                aria-label="Halaman berikutnya"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              >
                ›
              </button>
            </nav>
          </section>
        </div>
      </section>
    </main>
  );
}