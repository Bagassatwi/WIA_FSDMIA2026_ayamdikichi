"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPinned } from "lucide-react";
export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="wrap">
        <nav
          className={`nav ${isOpen ? "open" : ""}`}
          aria-label="Navigasi utama"
        >
          <Link
            href="/"
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <MapPinned size={21} strokeWidth={2.2} />
            </span>
            JEJAKPUBLIK
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={isOpen}
            aria-controls="menu"
            aria-label="Buka menu"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className="ic"
              data-i="menu"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16"></path>
            </svg>
          </button>
          <ul className="nav-links" id="menu">
            <li>
              <Link href="/" aria-current="page">
                Beranda
              </Link>
            </li>
            <li>
              <Link href="/laporan">Jelajahi Laporan</Link>
            </li>
            <li>
              <Link href="/peta">Peta Laporan</Link>
            </li>
            <li>
              <Link href="/transparansi">Transparansi</Link>
            </li>
          </ul>
          <div className="nav-actions">
            <Link className="btn btn-secondary btn-sm" href="/login">
              Masuk
            </Link>
            <Link className="btn btn-primary btn-sm" href="/buat-laporan">
              Buat Laporan
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};
