import Link from "next/link";
import {
  FiHome,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiUsers,
  FiArrowRight,
  FiInfo,
} from "react-icons/fi";

const statistics = [
  {
    label: "Total laporan masuk",
    value: "12.480",
    description: "Seluruh laporan warga",
    icon: FiFileText,
  },
  {
    label: "Laporan terverifikasi",
    value: "9.312",
    description: "74,6% dari total laporan",
    icon: FiCheckCircle,
  },
  {
    label: "Laporan selesai",
    value: "6.874",
    description: "55,1% dari total laporan",
    icon: FiCheckCircle,
  },
  {
    label: "Belum selesai melewati target",
    value: "312",
    description: "Lebih dari 14 hari",
    icon: FiAlertCircle,
  },
];

const progress = [
  {
    label: "Laporan terverifikasi",
    value: "9.312",
    percentage: 74.6,
    color: "bg-blue-600",
  },
  {
    label: "Laporan selesai",
    value: "6.874",
    percentage: 55.1,
    color: "bg-emerald-600",
  },
  {
    label: "Dikonfirmasi warga",
    value: "5.120",
    percentage: 74.5,
    color: "bg-sky-500",
  },
];

export default function Transparansi() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/"
              className="flex items-center gap-2 transition hover:text-blue-600"
            >
              <FiHome />
              Beranda
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-800">
              Transparansi
            </span>
          </div>

          <div className="max-w-3xl">
            <span className="text-sm font-semibold text-blue-600">
              TRANSPARANSI PUBLIK
            </span>

            <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Transparansi Penanganan Laporan
            </h1>

            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Pantau perkembangan laporan masyarakat melalui informasi
              yang terbuka, ringkas, dan mudah dipahami.
            </p>
          </div>

          <div className="mt-8 grid gap-5 border-t border-slate-200 pt-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">Periode pelaporan</p>
              <p className="mt-1 font-semibold text-slate-800">
                1 Januari – 28 Oktober 2026
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Cakupan data</p>
              <p className="mt-1 font-semibold text-slate-800">
                7 kecamatan di Malang Raya
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Pembaruan terakhir</p>
              <p className="mt-1 font-semibold text-slate-800">
                28 Oktober 2026, 08.00 WIB
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <FiInfo className="mt-0.5 shrink-0 text-blue-600" />
            <p className="text-sm leading-relaxed text-blue-800">
              Data pada halaman ini merupakan data demonstrasi untuk
              prototipe MIA 2026 dan belum terhubung dengan layanan
              atau data pemerintah.
            </p>
          </div>
        </div>
      </section>

      {/* Statistik */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Ringkasan statistik
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Gambaran umum laporan masyarakat selama periode pelaporan.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statistics.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">
                    {item.label}
                  </span>
                  <Icon className="text-xl text-blue-600" />
                </div>

                <p className="mt-4 text-3xl font-bold text-slate-900">
                  {item.value}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Progres laporan */}
      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="mb-7">
            <h2 className="text-xl font-bold text-slate-900">
              Progres penanganan laporan
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Persentase berdasarkan total 12.480 laporan masuk.
            </p>
          </div>

          <div className="space-y-7">
            {progress.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    {item.label}
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {item.value}{" "}
                    <span className="font-normal text-slate-500">
                      ({String(item.percentage).replace(".", ",")}%)
                    </span>
                  </span>
                </div>

                <div
                  className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label={item.label}
                  aria-valuenow={item.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <FiClock className="mt-1 shrink-0 text-lg text-blue-600" />
              <div>
                <p className="text-sm text-slate-500">
                  Rata-rata waktu respons
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  3,2 hari
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Sejak laporan diterima sampai ditugaskan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FiCheckCircle className="mt-1 shrink-0 text-lg text-emerald-600" />
              <div>
                <p className="text-sm text-slate-500">
                  Rata-rata waktu penyelesaian
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  9,7 hari
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Sejak laporan diterima sampai diajukan selesai.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Informasi tambahan */}
      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <FiUsers className="text-xl text-blue-600" />
              <h2 className="font-bold text-slate-900">
                Konfirmasi masyarakat
              </h2>
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              5.120
            </p>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Laporan selesai yang telah dikonfirmasi oleh warga.
              Jumlah ini setara dengan 74,5% dari seluruh laporan selesai.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <FiAlertCircle className="text-xl text-amber-600" />
              <h2 className="font-bold text-slate-900">
                Laporan melewati target
              </h2>
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              312
            </p>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Laporan yang belum selesai lebih dari 14 hari sejak
              tanggal pelaporan.
            </p>
          </div>
        </div>
      </section>

      {/* Metodologi */}
      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Tentang data
          </h2>

          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-800">
                Sumber dan definisi
              </h3>

              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
                <li>
                  • Seluruh angka dibuat untuk prototipe MIA 2026.
                </li>
                <li>
                  • Tingkat penyelesaian dihitung dari laporan selesai
                  dibagi total laporan masuk.
                </li>
                <li>
                  • Waktu respons dihitung sejak laporan diterima
                  sampai ditugaskan.
                </li>
                <li>
                  • Waktu penyelesaian dihitung sejak laporan diterima
                  sampai diajukan selesai.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800">
                Keterbatasan data
              </h3>

              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
                <li>• Data bersifat fiktif dan statis.</li>
                <li>• Data tidak diperbarui secara otomatis.</li>
                <li>• Belum terintegrasi dengan sistem pemerintah.</li>
                <li>• Angka tidak dapat digunakan sebagai data resmi.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-700">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              Ingin melihat laporan lebih detail?
            </h2>
            <p className="mt-2 text-sm text-blue-100">
              Jelajahi daftar laporan dan pantau status penanganannya.
            </p>
          </div>

          <Link
            href="/laporan"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Jelajahi laporan
            <FiArrowRight />
          </Link>
        </div>
      </section>
    </main>
  );
}