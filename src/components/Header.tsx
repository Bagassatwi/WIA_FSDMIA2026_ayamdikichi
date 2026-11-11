"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMapPin, FiMenu, FiX, FiUser, FiPlusCircle } from "react-icons/fi";

export const Header = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: "Beranda", href: "/" },
    { label: "Jelajahi Laporan", href: "/laporan" },
    { label: "Peta", href: "/peta" },
    // { label: "Transparansi", href: "/transparansi" },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 lg:px-">
        <nav className="flex h-[72px] items-center justify-between">
          {/* LOGO */}
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex shrink-0 items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <FiMapPin size={22} strokeWidth={2.5} />
            </span>
            JEJAKPUBLIK
          </Link>

          {/* DESKTOP NAVIGATION */}
          <ul className="hidden h-full items-center gap-8 md:flex">
            {navLinks.map((item) => {
              const active = isActive(item.href);

              return (
                <li key={item.href} className="flex h-full items-center">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex h-full items-center text-sm font-semibold transition-colors
                      ${
                        active
                          ? "text-blue-700 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:rounded-t-full after:bg-blue-600"
                          : "text-slate-600 hover:text-blue-700"
                      }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* DESKTOP ACTIONS */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              <FiUser size={17} />
              Masuk
            </Link>

            <Link
              href="/buat-laporan"
              style={{ color: "#ffffff" }}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold  shadow-sm transition hover:bg-blue-700"
            >
              <FiPlusCircle size={17} />
              Buat Laporan
            </Link>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Tutup menu" : "Buka menu"}
            className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </nav>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div
          id="mobile-menu"
          className="border-t border-slate-100 bg-white px-5 py-4 shadow-lg md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {navLinks.map((item) => {
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-lg px-4 py-3 text-sm font-semibold transition
                      ${
                        active
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
                      }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <FiUser size={17} />
              Masuk
            </Link>

            <Link
              href="/buat-laporan"
              onClick={() => setIsOpen(false)}
              style={{ color: "#ffffff" }}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold transition hover:bg-blue-700"
            >
              <FiPlusCircle size={17} />
              Buat Laporan
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
