
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  ClipboardList,
  History,
} from "lucide-react";

import { FiMapPin } from "react-icons/fi";

export default function SidebarPetugas() {
  const pathname = usePathname();

  const menus = [
    {
      label: "Dashboard",
      href: "/petugas",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Tugas Saya",
      href: "/petugas/tugas",
      icon: ClipboardList,
    },
    {
      label: "Riwayat Penanganan",
      href: "/petugas/riwayat",
      icon: History,
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] flex-col bg-[#06234b] text-white lg:flex">

      {/* Logo */}
      <Link
        href="/petugas"
        className="flex h-[72px] items-center gap-3 px-5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
          <FiMapPin size={22} strokeWidth={2.5} />
        </div>

        <div>
          <h1 className="text-[19px] font-extrabold tracking-tight">
            JEJAK<span className="text-blue-400">PUBLIK</span>
          </h1>
          <p className="text-[10px] text-blue-100">
            Panel Petugas Lapangan
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
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Public Website */}
    </aside>
  );
}
