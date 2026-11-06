import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import './globals.css';

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--ff-b",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--ff-h",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Masuk & Daftar | JEJAKPUBLIK",
  description:
    "Akses akun warga untuk melihat laporan serta mengelola proses penanganan secara transparan.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${plusJakartaSans.variable}`}
    >
      <body className="flex justify-center items-center min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
