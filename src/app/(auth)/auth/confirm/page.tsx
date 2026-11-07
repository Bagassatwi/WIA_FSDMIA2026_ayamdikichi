
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  LockKeyhole,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { FiMapPin } from "react-icons/fi";

export default function ConfirmInvitationPage() {
  const router = useRouter();

  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==================================================
  // CEK SESSION UNDANGAN SUPABASE
  // ==================================================

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error || !session) {
          setHasSession(false);
        } else {
          setHasSession(true);
        }
      } catch {
        if (mounted) setHasSession(false);
      } finally {
        if (mounted) setCheckingSession(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setHasSession(Boolean(session));
      setCheckingSession(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ==================================================
  // SIMPAN PASSWORD BARU
  // ==================================================

  const handleSetPassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error(
          "Sesi undangan tidak ditemukan. Silakan minta admin mengirim undangan baru."
        );
      }

      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) throw updateError;

      setSuccess(
        "Password berhasil dibuat. Mengarahkan ke dashboard petugas..."
      );

      // Beri waktu agar pesan sukses terbaca.
      setTimeout(() => {
        router.replace("/petugas");
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal membuat password."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOADING SESSION
  // ==================================================

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-9 h-9 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 text-sm">
            Memeriksa undangan...
          </p>
        </div>
      </main>
    );
  }

  // ==================================================
  // SESSION TIDAK VALID
  // ==================================================

  if (!hasSession) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>

          <h1 className="text-xl font-bold text-slate-800 mb-2">
            Undangan Tidak Valid
          </h1>

          <p className="text-sm text-slate-500 leading-relaxed">
            Sesi undangan tidak ditemukan atau tautan sudah
            kedaluwarsa. Silakan hubungi administrator untuk
            mendapatkan undangan baru.
          </p>

          <button
            onClick={() => router.replace("/login")}
            className="mt-6 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 transition"
          >
            Kembali ke Login
          </button>
        </div>
      </main>
    );
  }

  // ==================================================
  // FORM BUAT PASSWORD
  // ==================================================

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
      <div className="w-full max-w-md">

        {/* BRAND */}
        <div className="text-center mb-7">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
            <FiMapPin className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-slate-800">
            JEJAKPUBLIK
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Sistem Pelaporan dan Pengelolaan Lingkungan
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-7">
          <div className="mb-6">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <LockKeyhole className="w-5 h-5 text-blue-600" />
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              Buat Password
            </h2>

            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Selamat datang! Buat password untuk mengaktifkan
              akses akun petugas JEJAKPUBLIK.
            </p>
          </div>

          <form onSubmit={handleSetPassword} className="space-y-5">

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password Baru
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  minLength={8}
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Tampilkan password"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* KONFIRMASI PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Konfirmasi Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Masukkan ulang password"
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Tampilkan konfirmasi password"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="flex gap-2 items-start rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="flex gap-2 items-start rounded-xl bg-green-50 border border-green-100 p-3 text-sm text-green-700">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                <p>{success}</p>
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading || Boolean(success)}
              className="w-full flex items-center cursor-pointer justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 transition"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Menyimpan Password...
                </>
              ) : (
                "Aktifkan Akun"
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs text-center text-slate-400 leading-relaxed">
              Pastikan password hanya diketahui oleh pemilik
              akun. Jangan membagikan password kepada siapa pun.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 JEJAKPUBLIK
        </p>
      </div>
    </main>
  );
}
