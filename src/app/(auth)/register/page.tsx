import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-[calc(100vh-72px)] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-[linear-gradient(160deg,rgba(15,23,42,0.98),rgba(30,41,59,0.94))] p-6 text-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="mb-6 flex items-center gap-3 text-lg font-extrabold tracking-[-0.02em] text-white">
            <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8">
              <rect width="32" height="32" rx="8" fill="#2563EB"></rect>
              <path
                d="M9 22l5-6 4 3 5-8"
                fill="none"
                stroke="#fff"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <circle cx="9" cy="22" r="2" fill="#fff"></circle>
              <circle cx="23" cy="11" r="2" fill="#fff"></circle>
            </svg>
            JEJAKPUBLIK
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200/40 bg-sky-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-sky-100">
            Bergabung bersama warga
          </span>

          <h1 className="mt-6 max-w-[420px] text-[clamp(2rem,3vw,3.25rem)] font-extrabold tracking-[-0.04em] text-white">
            Buat akun untuk mengawal laporanmu.
          </h1>

          <p className="mt-4 max-w-[440px] text-base text-slate-200">
            Dapatkan akses lengkap untuk mengirim laporan, memantau perkembangannya,
            dan melihat bukti penanganan dari setiap instansi terkait.
          </p>

          <ul className="mt-6 grid gap-3 text-sm text-slate-100">
            {[
              "Kirimi laporan baru dalam hitungan menit",
              "Ikuti perkembangan tiap tahap penanganan",
              "Jaga transparansi dengan dokumentasi yang jelas",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_0_4px_rgba(96,165,250,0.22)]" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="mb-6">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-blue-700">
              Daftar
            </p>
            <h2 className="text-[clamp(1.75rem,2vw,2.25rem)] font-extrabold tracking-[-0.04em] text-slate-900">
              Buat akun baru
            </h2>
          </div>

          <div className="space-y-5">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-semibold text-slate-900">
                Nama lengkap
              </label>
              <input
                id="name"
                type="text"
                placeholder="Nama Anda"
                className="h-[52px] w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-900">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="nama@email.com"
                className="h-[52px] w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-slate-900">
                Kata sandi
              </label>
              <input
                id="password"
                type="password"
                placeholder="Buat kata sandi"
                className="h-[52px] w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <Link
              href="/login"
              className="inline-flex h-[48px] w-full items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Daftar
            </Link>

            <div className="pt-2 text-center text-sm text-slate-600">
              Sudah punya akun? {" "}
              <Link href="/login" className="font-semibold text-blue-700 hover:text-blue-800">
                Masuk
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
