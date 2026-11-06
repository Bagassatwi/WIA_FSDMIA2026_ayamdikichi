import Link from "next/link";

export default function LoginPage() {
  return (
    <main className=" px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.08fr_0.92fr]">
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
            Akses warga
          </span>

          <h1 className="mt-6 max-w-[420px] text-[clamp(2rem,3vw,3.25rem)] font-extrabold tracking-[-0.04em] text-white">
            Laporkan masalah. Pantau progresnya.
          </h1>

          <p className="mt-4 max-w-[440px] text-base text-slate-200">
            Semua laporan warga terhubung ke proses penanganan yang transparan,
            lengkap bukti kerja, dan riwayat perkembangan yang bisa dipantau.
          </p>

          <ul className="mt-6 grid gap-3 text-sm text-slate-100">
            {[
              "Melacak status laporan secara real time",
              "Mengakses proses penanganan yang terdokumen",
              "Memastikan hasil kerja dapat dibuktikan",
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
              Selamat datang
            </p>
            <h2 className="font-extrabold tracking-[-0.04em] text-red-500 text-slate-900">
              Masuk ke akun
            </h2>
          </div>

          <div className="space-y-5">
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
                placeholder="Masukkan kata sandi"
                className="h-[52px] w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <label htmlFor="remember" className="flex items-center gap-2 text-sm text-slate-600">
                <input id="remember" type="checkbox" className="h-4 w-4 accent-blue-600" />
                Ingat saya
              </label>

              <Link href="/register" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
                Lupa kata sandi?
              </Link>
            </div>

            <Link
              href="/admin"
              className="inline-flex h-[48px] w-full items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Masuk
            </Link>

            <div className="pt-2 text-center text-sm text-slate-600">
              Belum punya akun? {" "}
              <Link href="/register" className="font-semibold text-blue-700 hover:text-blue-800">
                Daftar sekarang
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
