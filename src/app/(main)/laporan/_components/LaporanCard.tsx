import { Link } from "lucide-react";
import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import {
  FiArrowRight,
  FiCalendar,
  FiMapPin,
  FiSearch,
  FiShield,
} from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import type { ReportWithPhotos } from "../page";

const statusStyle = {
  verified: "bg-amber-50 text-amber-700",
  pending: "bg-blue-50 text-blue-700",
  Selesai: "bg-emerald-50 text-emerald-700",
};
export function LaporanCard({ sort, setSort, resetFilters, filteredReports }: {
  sort: string
  setSort: Dispatch<SetStateAction<string>>
  resetFilters: () => void
  filteredReports: ReportWithPhotos[]
}) {
  const getPhoto = (url: string) => {
    const { data } = supabase
      .storage
      .from('report-photo')
      .getPublicUrl(url)

    return data.publicUrl;
  }
  return (<section aria-live="polite" className="min-w-0">
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        Menampilkan{" "}
        <span className="font-semibold text-slate-900">
          {filteredReports.length} laporan
        </span>
      </p>

      <div className="flex items-center gap-3">
        <label htmlFor="sort" className="shrink-0 text-sm text-slate-600">
          Urutkan
        </label>
        <select id="sort" value={sort} onChange={event => setSort(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
          <option value="baru">Terbaru</option>
          <option value="lama">Terlama</option>
        </select>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {filteredReports.map(report => {
        let linkPhoto = null;

        if (report.report_photos.length !== 0) {
          linkPhoto = getPhoto(report.report_photos[0].storage_path);
        }

        return <article key={report.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-blue-300">
          { /* Illustration placeholder */}
          <div className="aspect-16/10 bg-slate-100  w-76.25 h-50 overflow-hidden flex justify-center">
            {linkPhoto && <Image src={linkPhoto} alt={report.title} width={305} height={200} className="object-cover" />}
            {
              /* <div className="text-center">
               <FiFileText
                 size={34}
                 className="mx-auto text-slate-400"
               />
               <p className="mt-2 text-xs text-slate-500">
                 Ilustrasi simulasi
               </p>
              </div> */
            }
          </div>

          <div className="p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {report.category}
              </span>
              <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${statusStyle[report.status]}`}>
                {report.status}
              </span>
            </div>

            <h3 className="min-h-[48px] text-base font-semibold leading-6 text-slate-900">
              {report.title}
            </h3>

            <div className="mt-3 space-y-2 text-sm text-slate-500">
              <p className="flex items-start gap-2">
                <FiMapPin className="mt-0.5 shrink-0" size={15} />
                {report.city}
              </p>
              <p className="flex items-center gap-2">
                <FiShield className="shrink-0" size={15} />
                {report.status === 'verified' && 'Terverifikasi'}
                {report.status === 'rejected' && 'Tidak terverifikasi'}
                {report.status === 'pending' && 'Belum terverifikasi'}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="flex items-center gap-2 text-xs text-slate-500">
                <FiCalendar size={14} />
                {report.incident_date}
              </span>

              <Link href="/laporan/detail" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 transition-colors hover:text-blue-800">
                Lihat detail
                <FiArrowRight size={15} />
              </Link>
            </div>
          </div>
        </article>;
      })}
    </div>

    {filteredReports.length === 0 && <div className="rounded-xl border border-slate-200 px-5 py-12 text-center">
      <FiSearch size={30} className="mx-auto text-slate-400" />
      <h2 className="mt-4 text-lg font-semibold text-slate-900">
        Tidak ada laporan yang cocok
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Coba kata kunci lain atau hapus beberapa filter.
      </p>
      <button type="button" onClick={resetFilters} className="mt-5 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800">
        Atur ulang filter
      </button>
    </div>}

    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Halaman">
      <button type="button" disabled aria-label="Halaman sebelumnya" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 disabled:cursor-not-allowed">
        ‹
      </button>
      <button type="button" aria-current="page" className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-blue-700 px-3 text-sm font-medium text-white">
        1
      </button>
      <button type="button" className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm text-slate-600 transition hover:bg-slate-50">
        2
      </button>
      <button type="button" aria-label="Halaman berikutnya" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50">
        ›
      </button>
    </nav>
  </section>);
}