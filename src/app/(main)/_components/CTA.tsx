import Link from "next/link";

function CTA() {
  return (
    <section className="bg-white px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-7xl rounded-xl bg-blue-700 px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
            Mulai dari satu laporan.
          </h2>

          <p className="mt-3 text-sm leading-7 text-blue-100 sm:text-base">
            Laporan yang jelas dan terdokumentasi membuat penanganan
            masalah bisa dipantau bersama.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/buat-laporan"
              className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
            >
              Buat Laporan
            </Link>

            <Link
              href="/laporan"
              className="inline-flex items-center justify-center rounded-md border border-blue-200 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
            >
              Jelajahi Laporan
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTA;