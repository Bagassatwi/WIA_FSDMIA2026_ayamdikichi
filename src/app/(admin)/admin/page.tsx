'use client';

import React from 'react';
import Link from 'next/link';
import Header from '../_components/Header';

const kpis = [
  {
    label: 'Total laporan',
    value: '12.480',
    note: 'Sejak 1 Jan 2026',
    icon: 'file',
    color: 'blue',
  },
  {
    label: 'Menunggu verifikasi',
    value: '3.168',
    note: '25,4% dari laporan masuk',
    icon: 'clock',
    color: 'amber',
  },
  {
    label: 'Sedang diproses',
    value: '2.214',
    note: '17,7% dari laporan masuk',
    icon: 'process',
    color: 'indigo',
  },
  {
    label: 'Laporan selesai',
    value: '6.874',
    note: '55,1% dari laporan masuk',
    icon: 'check',
    color: 'emerald',
  },
  {
    label: 'Melewati target',
    value: '312',
    note: 'Dari 5.606 laporan belum selesai',
    icon: 'alert',
    color: 'rose',
  },
  {
    label: 'Rata-rata respons',
    value: '3,2 hari',
    note: 'Target maksimal 4 hari',
    icon: 'calendar',
    color: 'sky',
  },
];

const priorities = [
  {
    title: 'Melewati target',
    badge: '4 contoh',
    color: 'rose',
    items: [
      {
        id: 'JP-2026-00351',
        title: 'Trotoar amblas di depan Alun-Alun Batu',
        info: 'Terlambat 15 hari dari target 13 Okt 2026',
      },
      {
        id: 'JP-2026-00386',
        title: 'Bau limbah dari selokan di Jl. Ahmad Yani',
        info: 'Terlambat 8 hari dari target 20 Okt 2026',
      },
      {
        id: 'JP-2026-00391',
        title: 'Genangan air tiap hujan di Perumahan Tlogomas',
        info: 'Terlambat 5 hari dari target 23 Okt 2026',
      },
      {
        id: 'JP-2026-00418',
        title: 'Lubang besar di Jl. Ijen depan SDN Kauman',
        info: 'Terlambat 2 hari dari target 26 Okt 2026',
      },
    ],
  },
  {
    title: 'Menunggu verifikasi',
    badge: '3 contoh',
    color: 'amber',
    items: [
      {
        id: 'JP-2026-00449',
        title: 'Pohon tua condong ke kabel listrik di Jl. Panglima Sudirman',
        info: 'Menunggu verifikasi 6 hari · Batu',
      },
      {
        id: 'JP-2026-00455',
        title: 'Lima lampu PJU mati di jalur Pandaan–Malang',
        info: 'Menunggu verifikasi 3 hari · Singosari',
      },
      {
        id: 'JP-2026-00458',
        title: 'Lampu taman kota padam di Taman Slamet',
        info: 'Menunggu verifikasi 2 hari · Klojen',
      },
    ],
  },
  {
    title: 'Perlu bukti',
    badge: '3 contoh',
    color: 'blue',
    items: [
      {
        id: 'JP-2026-00351',
        title: 'Trotoar amblas di depan Alun-Alun Batu',
        info: 'Pelapor meminta tindak lanjut; butuh bukti perbaikan',
      },
      {
        id: 'JP-2026-00391',
        title: 'Genangan air tiap hujan di Perumahan Tlogomas',
        info: 'Belum ada bukti baru selama 14 hari',
      },
      {
        id: 'JP-2026-00386',
        title: 'Bau limbah dari selokan di Jl. Ahmad Yani',
        info: 'Belum ada bukti baru selama 19 hari',
      },
    ],
  },
];

const activities = [
  {
    type: 'Pembaruan status',
    id: 'JP-2026-00418',
    title: 'Lubang besar di Jl. Ijen depan SDN Kauman',
    date: '24 Okt 2026, 07.45 WIB',
    icon: 'clock',
    color: 'blue',
  },
  {
    type: 'Pembaruan status',
    id: 'JP-2026-00402',
    title: 'Tumpukan sampah di TPS dekat Pasar Blimbing',
    date: '21 Okt 2026, 07.45 WIB',
    icon: 'clock',
    color: 'blue',
  },
  {
    type: 'Penugasan',
    id: 'JP-2026-00402',
    title: 'Tumpukan sampah di TPS dekat Pasar Blimbing',
    date: '20 Okt 2026, 09.00 WIB',
    icon: 'user',
    color: 'indigo',
  },
  {
    type: 'Verifikasi',
    id: 'JP-2026-00402',
    title: 'Tumpukan sampah di TPS dekat Pasar Blimbing',
    date: '19 Okt 2026, 10.30 WIB',
    icon: 'shield',
    color: 'emerald',
  },
  {
    type: 'Verifikasi',
    id: 'JP-2026-00408',
    title: 'Halte rusak di Jl. Raya Dieng',
    date: '15 Okt 2026, 10.30 WIB',
    icon: 'shield',
    color: 'emerald',
  },
  {
    type: 'Unggah bukti',
    id: 'JP-2026-00391',
    title: 'Genangan air tiap hujan di Perumahan Tlogomas',
    date: '14 Okt 2026, 15.20 WIB',
    icon: 'image',
    color: 'violet',
  },
  {
    type: 'Penugasan',
    id: 'JP-2026-00418',
    title: 'Lubang besar di Jl. Ijen depan SDN Kauman',
    date: '14 Okt 2026, 09.00 WIB',
    icon: 'user',
    color: 'indigo',
  },
  {
    type: 'Verifikasi',
    id: 'JP-2026-00418',
    title: 'Lubang besar di Jl. Ijen depan SDN Kauman',
    date: '13 Okt 2026, 10.30 WIB',
    icon: 'shield',
    color: 'emerald',
  },
];

function Icon({ name, className = 'h-5 w-5' }) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  const paths = {
    file: <><path d="M7 3h8l4 4v14H7z" /><path d="M15 3v4h4M10 12h6M10 16h6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    process: <><path d="M4 12h4l3-8 4 16 3-8h2" /></>,
    check: <><path d="m5 12 4 4L19 6" /><circle cx="12" cy="12" r="9" /></>,
    alert: <><path d="M12 3 2.8 19h18.4L12 3Z" /><path d="M12 9v4M12 16h.01" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.5-4 3.5-6 8-6s7.5 2 8 6" /></>,
    shield: <><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" /><path d="m9 12 2 2 4-4" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-5-5L5 20" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  };

  return <svg {...common}>{paths[name] || paths.file}</svg>;
}

const colorStyles = {
  blue: {
    icon: 'bg-blue-50 text-blue-600',
    badge: 'bg-blue-50 text-blue-700',
    dot: 'bg-blue-500',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600',
    badge: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  indigo: {
    icon: 'bg-indigo-50 text-indigo-600',
    badge: 'bg-indigo-50 text-indigo-700',
    dot: 'bg-indigo-500',
  },
  emerald: {
    icon: 'bg-emerald-50 text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  rose: {
    icon: 'bg-rose-50 text-rose-600',
    badge: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
  sky: {
    icon: 'bg-sky-50 text-sky-600',
    badge: 'bg-sky-50 text-sky-700',
    dot: 'bg-sky-500',
  },
  violet: {
    icon: 'bg-violet-50 text-violet-600',
    badge: 'bg-violet-50 text-violet-700',
    dot: 'bg-violet-500',
  },
};

function KpiCard({ item }) {
  const style = colorStyles[item.color];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{item.label}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {item.value}
          </p>
        </div>

        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.icon}`}>
          <Icon name={item.icon} className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-400">
        {item.note}
      </p>
    </div>
  );
}

function PrioritySection({ section }) {
  const style = colorStyles[section.color];

  return (
    <section className="border-b border-slate-100 py-5 last:border-b-0 last:pb-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">
          {section.title}
        </h3>

        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${style.badge}`}>
          {section.badge}
        </span>
      </div>

      <ul className="space-y-1">
        {section.items.map((item, index) => (
          <li
            key={`${item.id}-${index}`}
            className="group rounded-xl px-3 py-3 transition hover:bg-slate-50"
          >
            <div className="flex items-start gap-3">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />

              <div className="min-w-0 flex-1">
                <p className="text-sm leading-relaxed text-slate-700">
                  <Link
                    href="/admin/laporan"
                    className="font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                  >
                    {item.id}
                  </Link>
                  <span className="text-slate-400"> · </span>
                  {item.title}
                </p>

                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {item.info}
                </p>
              </div>

              <Link
                href="/admin/laporan"
                aria-label={`Lihat laporan ${item.id}`}
                className="mt-1 shrink-0 text-slate-300 transition group-hover:text-blue-600"
              >
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ActivityItem({ activity }) {
  const style = colorStyles[activity.color];

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      <div className="absolute bottom-0 left-5 top-11 w-px bg-slate-100 last:hidden" />

      <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.icon}`}>
        <Icon name={activity.icon} className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1 border-b border-slate-100 pb-5 last:border-0 last:pb-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-800">
            {activity.type}
          </p>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            {activity.id}
          </span>
        </div>

        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          {activity.title}
        </p>

        <p className="mt-2 text-xs text-slate-400">
          {activity.date}
        </p>
      </div>
    </li>
  );
}

export default function AdminDashboardPage() {
  return (
    <>
      <Header title="Dashboard" />

      <main id="main" className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px] space-y-7">

          {/* Page Introduction */}
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Ringkasan aktivitas
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Dashboard Admin
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Pantau laporan masyarakat dan perkembangan penanganannya.
              </p>
            </div>

            <Link
              href="/admin/laporan"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Icon name="file" className="h-4 w-4" />
              Lihat semua laporan
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>

          {/* KPI Cards */}
          <section aria-label="Statistik laporan">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">
                Ikhtisar laporan
              </h2>
              <span className="text-xs text-slate-400">
                Data simulasi · 2026
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              {kpis.map((item) => (
                <KpiCard key={item.label} item={item} />
              ))}
            </div>
          </section>

          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">

            {/* Priority Reports */}
            <section
              aria-labelledby="priority-heading"
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-7"
            >
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 id="priority-heading" className="text-lg font-bold text-slate-900">
                      Laporan prioritas
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Laporan yang membutuhkan perhatian lebih lanjut.
                    </p>
                  </div>

                  <Link
                    href="/admin/laporan"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Semua laporan
                  </Link>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    312 melewati target
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    3.168 menunggu verifikasi
                  </span>
                </div>
              </div>

              <div className="px-3 py-1 sm:px-4">
                {priorities.map((section) => (
                  <PrioritySection key={section.title} section={section} />
                ))}
              </div>
            </section>

            {/* Latest Activities */}
            <section
              aria-labelledby="activity-heading"
              id="aktivitas"
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-5"
            >
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 id="activity-heading" className="text-lg font-bold text-slate-900">
                      Aktivitas terbaru
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Riwayat dari Jejak Penanganan.
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon name="clock" className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="px-5 py-5 sm:px-6">
                <ul>
                  {activities.map((activity, index) => (
                    <ActivityItem
                      key={`${activity.id}-${activity.type}-${index}`}
                      activity={activity}
                    />
                  ))}
                </ul>
              </div>
            </section>
          </div>

          {/* Demo Notice */}
          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-4">
            <div className="mt-0.5 text-blue-600">
              <Icon name="file" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Informasi data dashboard
              </p>
              <p className="mt-1 text-xs leading-relaxed text-blue-800/80">
                Panel demonstrasi. Seluruh data yang ditampilkan merupakan data simulasi dan tidak terhubung dengan layanan pemerintah.
              </p>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
