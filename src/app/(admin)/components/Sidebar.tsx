
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  UserCheck,
  ClipboardList,
  Users,
  ExternalLink,
} from "lucide-react";

import { FiMapPin } from "react-icons/fi";

export default function Sidebar() {
  const pathname = usePathname();

  const [counts, setCounts] = useState({
    laporan: 0,
    verifikasi: 0,
    penugasan: 0,
  });

  useEffect(() => {
    async function fetchCounts() {
      const [laporanResult, verifikasiResult] = await Promise.all([
        supabase
          .from("reports")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("reports")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);

      if (laporanResult.error || verifikasiResult.error) {
        console.error(
          "Gagal mengambil jumlah data:",
          laporanResult.error || verifikasiResult.error
        );
        return;
      }

      setCounts({
        laporan: laporanResult.count ?? 0,
        verifikasi: verifikasiResult.count ?? 0,
        penugasan: 0,
      });
    }

    fetchCounts();
  }, []);

  const menus = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Laporan",
      href: "/admin/laporan",
      icon: FileText,
      badge: counts.laporan,
    },
    {
      label: "Verifikasi",
      href: "/admin/verifikasi",
      icon: ClipboardCheck,
      badge: counts.verifikasi,
    },
    {
      label: "Manajemen Petugas",
      href: "/admin/petugas",
      icon: Users,
    },
    {
      label: "Penugasan",
      href: "/admin/penugasan",
      icon: UserCheck,
      badge: counts.penugasan,
    },
    {
      label: "Hasil Penanganan",
      href: "/admin/hasil-penanganan",
      icon: ClipboardList,
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] flex-col bg-[#06234b] text-white lg:flex">
      {/* Logo */}
      <Link href="/admin" className="flex h-[72px] items-center gap-3 px-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
          <FiMapPin size={22} strokeWidth={2.5} />
        </div>

        <div>
          <h1 className="text-[19px] font-extrabold tracking-tight">
            JEJAK<span className="text-blue-400">PUBLIK</span>
          </h1>
          <p className="text-[10px] text-blue-100">
            Dari Laporan Menjadi Bukti
          </p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-semibold tracking-wider text-blue-200/60">
          MENU UTAMA
        </p>

        <div className="space-y-1">
          {menus.map((menu) => {
            const Icon = menu.icon;

            const isActive = menu.exact
              ? pathname === menu.href
              : pathname === menu.href ||
                pathname.startsWith(`${menu.href}/`);

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`
                  relative flex min-h-11 items-center gap-3 rounded-lg px-3
                  text-[13px] font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <Icon size={19} className="shrink-0" />

                <span className="flex-1">{menu.label}</span>

                {menu.badge !== undefined && menu.badge > 0 && (
                  <span
                    className={`
                      rounded-full px-2 py-0.5 text-[10px] font-semibold
                      ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-blue-500 text-white"
                      }
                    `}
                  >
                    {menu.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Public Website */}
      {/* <div className="p-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-lg border border-blue-200/50 px-3 py-3 text-xs font-medium text-blue-50 transition hover:bg-white/10"
        >
          <ExternalLink size={15} />
          Lihat Situs Publik
        </Link>
      </div> */}
    </aside>
  );
}
