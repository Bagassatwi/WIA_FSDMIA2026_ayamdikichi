'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: (
        <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
        </svg>
      ),
    },
    {
      href: '/admin/laporan',
      label: 'Manajemen Laporan',
      icon: (
        <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6" />
        </svg>
      ),
    },
    {
      href: '/admin/verifikasi',
      label: 'Verifikasi',
      icon: (
        <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6zM9 12l2 2 4-4" />
        </svg>
      ),
    },
    {
      href: '/admin/penanganan',
      label: 'Penanganan',
      icon: (
        <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-2.7 2.7-2.3-.7-.7-2.3z" />
        </svg>
      ),
    },
    {
      href: '/admin/analitik',
      label: 'Analitik',
      icon: (
        <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Sidebar */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-100 px-6">
          <Link
            href="/"
            className="flex items-center gap-3 text-lg font-bold tracking-tight text-slate-800"
            onClick={() => setIsOpen(false)}
          >
            <svg aria-hidden="true" viewBox="0 0 32 32" className="h-9 w-9 shrink-0">
              <rect fill="#2563EB" height="32" rx="8" width="32" />
              <path
                d="M9 22l5-6 4 3 5-8"
                fill="none"
                stroke="#fff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.4"
              />
              <circle cx="9" cy="22" fill="#fff" r="2" />
              <circle cx="23" cy="11" fill="#fff" r="2" />
            </svg>
            JEJAKPUBLIK
          </Link>

          <button
            type="button"
            aria-controls="snav"
            aria-expanded={isOpen}
            aria-label="Tutup menu admin"
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          >
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m18 6-12 12M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigasi */}
        <nav id="snav" aria-label="Menu admin" className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Menu Utama
          </p>

          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-blue-700'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>

                    {isActive && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </Link>
                </li>
              );
            })}

            <li className="pt-2">
              <div
                aria-disabled="true"
                title="Belum tersedia di prototipe"
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400"
              >
                <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4" />
                </svg>

                <span>Pengaturan</span>

                <span className="ml-auto rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  Segera
                </span>
              </div>
            </li>
          </ul>
        </nav>

        {/* Informasi Sidebar */}
        <div className="border-t border-slate-100 p-5">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs leading-relaxed text-slate-500">
              Panel demonstrasi. Seluruh data adalah simulasi dan tidak terhubung dengan layanan pemerintah.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
