import Link from "next/link";
import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiImage,
  FiShield,
  FiMap,
  FiFileText,
  FiActivity,
} from "react-icons/fi";

const timeline = [
  {
    date: "12 Okt 2026, 08.14 WIB",
    title: "Laporan diterima",
    description: "Laporan masuk dan mendapat nomor pelacakan.",
    role: "Sistem JEJAKPUBLIK",
    status: "Selesai",
    done: true,
    evidence: "Kondisi awal",
  },
  {
    date: "13 Okt 2026, 10.30 WIB",
    title: "Laporan diverifikasi",
    description:
      "Petugas memeriksa lokasi, kelengkapan foto, dan kemungkinan laporan ganda.",
    role: "Verifikator",
    status: "Selesai",
    done: true,
  },
  {
    date: "14 Okt 2026, 09.00 WIB",
    title: "Diteruskan ke petugas",
    description:
      "Laporan ditugaskan ke tim terkait dengan target penyelesaian.",
    role: "Koordinator layanan",
    status: "Selesai",
    done: true,
  },
  {
    date: "24 Okt 2026, 07.45 WIB",
    title: "Penanganan dimulai",
    description: "Petugas tiba di lokasi dan mulai bekerja.",
    role: "Petugas lapangan",
    status: "Sedang berlangsung",
    current: true,
    evidence: "Progres penanganan",
  },
  {
    date: "Belum ada",
    title: "Dokumentasi perkembangan",
    description: "Foto perkembangan dilampirkan sebagai bukti kerja.",
    role: "Petugas lapangan",
    status: "Menunggu",
  },
  {
    date: "Belum ada",
    title: "Penyelesaian diajukan",
    description:
      "Petugas mengajukan penyelesaian beserta foto sesudah penanganan.",
    role: "Petugas lapangan",
    status: "Menunggu",
  },
  {
    date: "Belum ada",
    title: "Konfirmasi masyarakat",
    description: "Pelapor menilai apakah hasil penanganan sudah sesuai.",
    role: "Pelapor",
    status: "Menunggu",
  },
];

const relatedReports = [
  {
    title: "Jalan retak panjang di Jl. Raya Karanglo",
    category: "Infrastruktur Jalan",
    location: "Singosari",
    status: "Selesai",
  },
  {
    title: "Lampu taman kota padam di Taman Slamet",
    category: "Penerangan Jalan",
    location: "Klojen",
    status: "Diterima",
  },
  {
    title: "Tumpukan sampah di TPS dekat Pasar Blimbing",
    category: "Kebersihan",
    location: "Blimbing",
    status: "Diproses",
  },
];

function StatusBadge({ children, type = "default" }) {
  const styles = {
    success: "bg-green-50 text-green-700 ring-green-200",
    info: "bg-blue-50 text-blue-700 ring-blue-200",
    warning: "bg-orange-50 text-orange-700 ring-orange-200",
    default: "bg-slate-100 text-slate-600 ring-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${styles[type]}`}
    >
      {children}
    </span>
  );
}

function EvidenceCard({ title, date, type }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex aspect-[16/10] items-center justify-center bg-slate-100">
        <div className="text-center">
          <FiImage className="mx-auto mb-2 text-3xl text-slate-400" />
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-1 text-xs text-slate-400">
            Ilustrasi simulasi
          </p>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{date}</p>
      </div>
    </div>
  );
}

export default function DetailLaporan() {
  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      {/* Header laporan */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="transition hover:text-blue-700">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/laporan" className="transition hover:text-blue-700">
              Jelajahi Laporan
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-800">
              JP-2026-00418
            </span>
          </nav>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-sm font-semibold text-slate-700">
              JP-2026-00418
            </span>
            <StatusBadge type="info">Diproses</StatusBadge>
            <StatusBadge type="warning">
              Melewati target waktu
            </StatusBadge>
            <StatusBadge type="success">Terverifikasi</StatusBadge>
          </div>

          <h1 className="max-w-3xl text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Lubang besar di Jl. Ijen depan SDN Kauman
          </h1>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <FiActivity className="text-blue-600" />
              Infrastruktur Jalan
            </span>
            <span className="flex items-center gap-2">
              <FiMapPin className="text-blue-600" />
              Klojen, Kota Malang
            </span>
            <span className="flex items-center gap-2">
              <FiCalendar className="text-blue-600" />
              Dilaporkan 12 Okt 2026
            </span>
          </div>
        </div>
      </section>

      {/* Konten utama */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <div className="min-w-0 space-y-8">
          {/* Ringkasan */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Ringkasan laporan
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Lubang sekitar 80 cm di depan gerbang sekolah membahayakan
              pengendara motor dan anak yang menyeberang.
            </p>
          </section>

          {/* Timeline */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                <FiActivity className="text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Jejak Penanganan
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Setiap tindakan penting tercatat dengan waktu, peran
                  pelaksana, dan bukti. Data pada halaman ini adalah simulasi.
                </p>
              </div>
            </div>

            <div className="mt-8">
              {timeline.map((item, index) => (
                <div key={item.title} className="relative flex gap-4 pb-8 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div
                      className={`z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        item.done
                          ? "bg-green-100 text-green-700"
                          : item.current
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.done ? (
                        <FiCheckCircle className="text-lg" />
                      ) : (
                        <span className="text-sm font-semibold">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {index !== timeline.length - 1 && (
                      <div
                        className={`absolute mt-9 h-full w-px ${
                          item.done ? "bg-green-200" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pb-1">
                    <p className="text-xs font-medium text-slate-400">
                      {item.date}
                    </p>
                    <h3 className="mt-1 font-semibold text-slate-900">
                      {item.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge
                        type={
                          item.done
                            ? "success"
                            : item.current
                              ? "info"
                              : "default"
                        }
                      >
                        {item.status}
                      </StatusBadge>
                      <span className="text-xs text-slate-500">
                        Peran: {item.role}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>

                    {item.evidence && (
                      <div className="mt-4 max-w-sm">
                        <EvidenceCard
                          title={item.evidence}
                          date={
                            item.done
                              ? "Diunggah 12 Okt 2026, 08.14 WIB"
                              : "Diunggah 24 Okt 2026, 07.45 WIB"
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Galeri bukti */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                <FiImage className="text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Galeri bukti
                </h2>
                <p className="text-sm text-slate-500">
                  Dokumentasi kondisi dan proses penanganan.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <EvidenceCard
                title="Sebelum"
                date="12 Okt 2026, 08.14 WIB"
              />
              <EvidenceCard
                title="Selama penanganan"
                date="24 Okt 2026, 07.45 WIB"
              />
              <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <FiImage className="mb-3 text-2xl text-slate-400" />
                <p className="text-sm font-semibold text-slate-600">
                  Dokumentasi sesudah
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Belum ada dokumentasi setelah penanganan.
                </p>
              </div>
            </div>
          </section>

          {/* Konfirmasi */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Konfirmasi masyarakat
            </h2>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <StatusBadge>Belum dibuka</StatusBadge>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Konfirmasi dibuka setelah petugas mengajukan penyelesaian.
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Ringkasan penanganan */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-900">
              Ringkasan penanganan
            </h2>

            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="mb-1 text-slate-500">Status</dt>
                <dd>
                  <StatusBadge type="info">Diproses</StatusBadge>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Tim</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  Tim Pemeliharaan Jalan
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Pembaruan terakhir</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  24 Okt 2026
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Durasi</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  16 hari sejak dilaporkan
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Target selesai</dt>
                <dd className="mt-1 font-medium text-orange-600">
                  26 Okt 2026 (terlewat)
                </dd>
              </div>
            </dl>
          </section>

          {/* Lokasi */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-900">Lokasi</h2>

            <div className="mt-4 flex aspect-[4/3] flex-col items-center justify-center rounded-xl bg-slate-100 p-5 text-center">
              <div className="rounded-full bg-blue-100 p-4 text-blue-700">
                <FiMapPin className="text-2xl" />
              </div>
              <p className="mt-3 font-semibold text-slate-800">
                Klojen, Kota Malang
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Wilayah demonstrasi Malang Raya
              </p>
              <span className="mt-3 rounded-full bg-white px-3 py-1 text-xs text-slate-500">
                Peta skematis
              </span>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Tampilan lokasi ini hanya ilustrasi wilayah, bukan peta
              navigasi atau titik koordinat aktual.
            </p>
          </section>

          {/* Privasi */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <FiShield className="text-lg text-blue-600" />
              <h2 className="font-bold text-slate-900">
                Privasi pelapor
              </h2>
            </div>

            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex gap-2">
                <FiCheckCircle className="mt-0.5 shrink-0 text-green-600" />
                Nama pelapor disamarkan.
              </li>
              <li className="flex gap-2">
                <FiCheckCircle className="mt-0.5 shrink-0 text-green-600" />
                Kontak pelapor tidak dipublikasikan.
              </li>
              <li className="flex gap-2">
                <FiCheckCircle className="mt-0.5 shrink-0 text-green-600" />
                Lokasi ditampilkan sebatas kecamatan.
              </li>
            </ul>
          </section>

          {/* Laporan terkait */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-900">Laporan terkait</h2>

            <div className="mt-4 divide-y divide-slate-100">
              {relatedReports.map((report) => (
                <Link
                  key={report.title}
                  href="/laporan"
                  className="block py-4 first:pt-0 last:pb-0"
                >
                  <p className="text-sm font-semibold leading-5 text-slate-800 transition hover:text-blue-700">
                    {report.title}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {report.category} · {report.location} · {report.status}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* Kembali */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/laporan"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 transition hover:text-blue-800"
        >
          <FiArrowLeft />
          Kembali ke daftar laporan
        </Link>
      </div>
    </main>
  );
}

