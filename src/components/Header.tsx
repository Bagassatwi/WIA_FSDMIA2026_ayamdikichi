"use client";

import Link from "next/link";
import { useState } from "react";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="wrap">
        <nav className={`nav ${isOpen ? "open" : ""}`} aria-label="Navigasi utama">
          <Link className="logo" href="/">
            <svg viewBox="0 0 32 32" aria-hidden="true">
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
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={isOpen}
            aria-controls="menu"
            aria-label="Buka menu"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="ic" data-i="menu" viewBox="0 0 24 24" aria-hidden="true">
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
}