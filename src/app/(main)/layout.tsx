
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "JEJAKPUBLIK - Laporkan Masalahnya. Pantau Prosesnya. Buktikan Hasilnya.",
  description:
    "Setiap laporan warga punya jejak penanganan yang terbuka: siapa menangani, kapan, dan bukti apa yang ditunjukkan sebelum laporan dinyatakan selesai.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={poppins.variable}>
      <body className="font-sans antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
