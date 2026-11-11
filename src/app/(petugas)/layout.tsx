
import type React from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/TopBar";
import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Proteksi khusus Admin

  return (
    <html lang="id" className={poppins.variable}>
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-[#f2f7fd]">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Area */}
          <div className="min-h-screen lg:ml-[252px]">
            {/* Topbar */}
            <Topbar />

            {/* Page Content */}
            <main className="p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
