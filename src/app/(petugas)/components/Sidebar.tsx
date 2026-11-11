
"use client";

import { FileText, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMapPin } from "react-icons/fi";
import { supabase } from "@/lib/supabase";



export default function Sidebar() {
  const pathname = usePathname();

  const [counts, setCounts] = useState({
    laporan: 0,
  });

  useEffect(() => {
    async function fetchCounts() {
      const { count, error } = await supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "verified");

      if (error) {
        console.error("Gagal mengambil jumlah laporan terverifikasi:", error);
        return;
      }

      setCounts({
        laporan: count ?? 0,
      });
    }

    fetchCounts();
  }, []);

  const menus = [
    {
      label: "Dashboard",
      href: "/petugas",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Laporan",
      href: "/petugas/laporan",
      icon: FileText,
      badge: counts.laporan,
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-63 flex-col bg-[#06234b] text-white lg:flex">
      {/* Logo */}
      <Link href="/petugas" className="flex h-18 items-center gap-3 px-5">
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
                  ${isActive
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
                      ${isActive
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
