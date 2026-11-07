"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  FiShield,
  FiUser,
  FiLock,
  FiMail,
  FiEye,
  FiLoader,
  FiEyeOff,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
  FiMapPin,
} from "react-icons/fi";

import { supabase } from "@/lib/supabase";

type UserRole = "admin" | "petugas";

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState<UserRole>("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Proses Login
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (loading) return;

      setLoading(true);
      setErrorMessage("");

      try {
        // 1. Autentikasi menggunakan Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (!data.user) {
          throw new Error("Data pengguna tidak ditemukan.");
        }

        // 2. Ambil data profil pengguna
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("role, is_active")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        // 3. Pastikan profil tersedia
        if (!profile) {
          await supabase.auth.signOut();

          throw new Error(
            "Profil pengguna tidak ditemukan. Hubungi administrator.",
          );
        }

        // 4. Periksa status akun
        if (!profile.is_active) {
          await supabase.auth.signOut();

          throw new Error(
            "Akun Anda sedang dinonaktifkan. Hubungi administrator.",
          );
        }

        // 5. Cocokkan pilihan role dengan role database
        if (profile.role !== role) {
          await supabase.auth.signOut();

          throw new Error(
            `Akun ini bukan akun ${
              role === "admin" ? "Admin" : "Petugas"
            }. Silakan pilih peran yang sesuai.`,
          );
        }

        // 6. Redirect sesuai role
        if (profile.role === "admin") {
          router.replace("/admin");
        } else if (profile.role === "petugas") {
          router.replace("/petugas");
        } else {
          await supabase.auth.signOut();

          throw new Error("Role akun tidak dikenali.");
        }

        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat login.";

        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto mt-10 grid w-full max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-2">
        {/* Panel Informasi */}
        <section className="flex flex-col justify-between bg-blue-700 p-7 text-white sm:p-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700">
                <FiMapPin size={22} />
              </span>

              <span className="text-lg font-bold tracking-tight">
                JEJAKPUBLIK
              </span>
            </Link>

            <div className="mt-16">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/40 bg-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-50">
                <FiLock size={13} />
                Akses internal
              </span>

              <h1 className="mt-6 max-w-md text-3xl font-bold leading-tight sm:text-4xl">
                Portal Pengelolaan Laporan Publik
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-blue-100 sm:text-base">
                Masuk untuk mengelola laporan warga, melakukan verifikasi,
                memantau proses penanganan, dan memperbarui bukti penyelesaian
                laporan.
              </p>
            </div>

            <div className="mt-10 space-y-5">
              {[
                {
                  title: "Verifikasi laporan",
                  description:
                    "Periksa informasi dan dokumentasi laporan warga.",
                },
                {
                  title: "Kelola penanganan",
                  description: "Pantau penugasan dan perkembangan pekerjaan.",
                },
                {
                  title: "Catat hasil pekerjaan",
                  description:
                    "Dokumentasikan hasil penanganan secara transparan.",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                    <FiCheckCircle size={15} />
                  </span>

                  <div>
                    <h3 className="text-sm font-semibold">{item.title}</h3>

                    <p className="mt-1 text-xs leading-5 text-blue-100">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-14 text-xs text-blue-200">
            JEJAKPUBLIK — Dari Laporan Menjadi Bukti.
          </p>
        </section>

        {/* Panel Login */}
        <section className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Portal internal
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Selamat Datang
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Silakan masuk menggunakan akun Admin atau Petugas. Portal ini
              tidak diperuntukkan bagi akun warga.
            </p>
          </div>

          {/* Pilihan Peran */}
          <div className="mb-7">
            <label className="mb-3 block text-sm font-semibold text-gray-800">
              Masuk sebagai
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRole("admin");
                  setErrorMessage("");
                }}
                className={`flex items-center cursor-pointer justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  role === "admin"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FiShield size={17} />
                Admin
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole("petugas");
                  setErrorMessage("");
                }}
                className={`flex items-center cursor-pointer justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  role === "petugas"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FiUser size={17} />
                Petugas
              </button>
            </div>
          </div>

          {/* Form Login */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Email
              </label>

              <div className="relative">
                <FiMail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Kata sandi
              </label>

              <div className="relative">
                <FiLock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-12 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* Pesan Error */}
            {errorMessage && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <FiAlertCircle
                  className="mt-0.5 shrink-0 text-red-500"
                  size={17}
                />

                <p className="text-sm leading-5 text-red-600">{errorMessage}</p>
              </div>
            )}

            {/* Remember Me dan Forgot Password */}
            <div className="flex items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded accent-blue-600"
                  disabled={loading}
                />
                Ingat saya
              </label>

              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Lupa kata sandi?
              </Link>
            </div>

            {/* Tombol Login */}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center cursor-pointer justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <FiLoader size={18} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk sebagai {role === "admin" ? "Admin" : "Petugas"}
                  <FiArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Informasi Akun */}
          <div className="mt-7 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <FiAlertCircle
                className="mt-0.5 shrink-0 text-gray-500"
                size={17}
              />

              <p className="text-xs leading-5 text-gray-500">
                Akun Admin dan Petugas diberikan oleh pengelola sistem. Jika
                belum memiliki akses, silakan hubungi administrator.
              </p>
            </div>
          </div>

          {/* Kembali ke Landing Page */}
          <div className="mt-8 border-t border-gray-100 pt-5 text-center">
            <Link
              href="/"
              className="text-sm font-medium text-gray-500 transition hover:text-blue-600"
            >
              ← Kembali ke halaman utama
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
