import Link from "next/link";
import { FiArrowUpRight, FiMapPin } from "react-icons/fi";

export const Footer = () => {
  return (
    <footer className="bg-blue-700 text-blue-50">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-10 border-b border-blue-500 pb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr] lg:gap-16">

          {/* Brand */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xl font-bold tracking-wide text-white"
            >
              <FiMapPin className="text-blue-200" size={21} />
              JEJAKPUBLIK
            </Link>

            <p className="mt-4 max-w-[340px] text-sm leading-7 text-blue-100">
              Platform pelaporan warga dengan jejak penanganan yang bisa
              dibuktikan.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">
              Platform
            </h4>

            <ul className="space-y-3 text-sm text-blue-100">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/laporan"
                  className="transition-colors hover:text-white"
                >
                  Jelajahi Laporan
                </Link>
              </li>
              <li>
                <Link
                  href="/peta"
                  className="transition-colors hover:text-white"
                >
                  Peta Laporan
                </Link>
              </li>
              <li>
                <Link
                  href="/transparansi"
                  className="transition-colors hover:text-white"
                >
                  Transparansi
                </Link>
              </li>
            </ul>
          </div>

          {/* Prototype */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">
              Tentang Prototipe
            </h4>

            <ul className="space-y-3 text-sm leading-6 text-blue-100">
              <li>Karya Multimedia In Action (MIA) 2026</li>
              <li>Seluruh data merupakan simulasi</li>
              <li>
                Tidak terhubung dengan layanan pemerintah resmi
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex flex-col gap-3 pt-6 text-xs leading-6 text-blue-200 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Prototipe desain untuk kompetisi. Laporan, lokasi, dan angka pada
            situs ini bersifat fiktif dan hanya untuk demonstrasi.
          </p>

          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-1 transition-colors hover:text-white"
          >
            Kembali ke atas
            <FiArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </footer>
  );
};