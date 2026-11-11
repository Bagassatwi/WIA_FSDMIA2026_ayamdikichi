"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, Menu, Search, LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createPortal } from "react-dom";

type UserProfile = {
  full_name: string;
  role: string;
};

export default function Topbar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  useEffect(() => {
    const getProfile = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setProfile(null);
          return;
        }

        const { data, error } = await supabase
          .from("user_profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setProfile(data);
      } catch (error) {
        console.error("Gagal mengambil profil:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  const roleLabel =
    profile?.role === "admin"
      ? "Administrator"
      : profile?.role === "petugas"
        ? "Petugas Lapangan"
        : "Pengguna";

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Gagal logout:", error);
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-[64px] items-center gap-4 border-b border-slate-200/70 bg-white/90 px-5 backdrop-blur lg:px-8">
      {/* Mobile Menu */}
      <button aria-label="Buka menu" className="text-slate-500 lg:hidden">
        <Menu size={21} />
      </button>

      {/* Search */}
      {/* <div className="relative w-full max-w-[575px]">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={17}
        />

        <input
          placeholder="Cari laporan (judul, ID, lokasi, atau pelapor)..."
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
        />
      </div> */}

      {/* Profile */}
      <div className="ml-auto flex items-center gap-5">
        {/* Notification */}
        <button
          type="button"
          aria-label="Notifikasi"
          onClick={() => setShowComingSoon(true)}
          className="relative cursor-pointer text-slate-600 transition-colors hover:text-blue-600"
          style={{ cursor: "pointer" }}
        >
          <Bell size={19} className="pointer-events-none" />
          <span className="pointer-events-none absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
        {/* Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-expanded={showProfileMenu}
            className="flex items-center gap-2.5 text-left"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {profile?.full_name?.charAt(0).toUpperCase() || "U"}
            </span>

            <span className="hidden sm:block">
              <span className="block text-xs font-bold text-slate-800">
                {loading ? "Memuat..." : profile?.full_name || "Pengguna"}
              </span>

              <span className="block text-[10px] text-slate-500">
                {loading ? " " : roleLabel}
              </span>
            </span>

            <ChevronDown
              size={15}
              className={`hidden text-slate-500 cursor-pointer transition-transform sm:block ${
                showProfileMenu ? "rotate-180 cursor-pointer" : "cursor-pointer"
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <>
              {/* Click outside */}
              <button
                type="button"
                aria-label="Tutup menu profil"
                className="fixed inset-0 z-40 cursor-pointer"
                onClick={() => setShowProfileMenu(false)}
              />

              <div className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                {/* Account Info */}
                <div className="border-b border-slate-100 px-4 py-4">
                  <p className="text-xs font-semibold text-slate-400">
                    AKUN SAYA
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-800">
                    {profile?.full_name || "Pengguna"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">{roleLabel}</p>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowComingSoon(true);
                    }}
                    className="flex w-full items-center cursor-pointer gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    <User size={16} />
                    Informasi Profil
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <LogOut size={16} />
                    {loggingOut ? "Sedang keluar..." : "Logout"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {mounted &&
        showComingSoon &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-md">
            <div className="relative w-full max-w-sm rounded-2xl border border-white/60 bg-white p-7 text-center shadow-2xl">
              {/* Icon */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <User size={30} strokeWidth={1.8} />
              </div>


              {/* Content */}
              <div className="mt-5">
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Coming Soon
                </span>

                <h3 className="mt-3 text-lg font-bold text-slate-800">
                  Fitur Segera Hadir!
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Halaman informasi profil sedang dalam tahap pengembangan.
                  Fitur ini akan segera tersedia untuk memudahkan pengelolaan
                  akun Anda.
                </p>
              </div>

              {/* Button */}
              <button
                type="button"
                onClick={() => setShowComingSoon(false)}
                className="mt-6 w-full rounded-xl bg-blue-600 px-4 cursor-pointer py-3 text-xs font-semibold text-white shadow-lg shadow-blue-200/60 transition hover:bg-blue-700 active:scale-[0.98]"
              >
                Mengerti
              </button>
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}
