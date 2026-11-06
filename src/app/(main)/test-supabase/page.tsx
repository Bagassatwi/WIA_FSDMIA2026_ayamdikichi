
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestSupabasePage() {
  const [status, setStatus] = useState("Belum diuji");
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus("Menghubungkan ke Supabase...");

    try {
      const { error } = await supabase
        .from("reports")
        .select("id")
        .limit(1);

      if (error) {
        throw error;
      }

      setStatus("Koneksi berhasil! Supabase terhubung.");
    } catch (error) {
      console.error("Supabase error:", error);

      setStatus(
        error instanceof Error
          ? `Gagal: ${error.message}`
          : "Koneksi gagal."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-lg rounded-xl border bg-white p-6">
        <h1 className="text-xl font-bold text-slate-800">
          Supabase Connection Test
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Menguji koneksi Next.js dengan database Supabase.
        </p>

        <button
          onClick={testConnection}
          disabled={loading}
          className="mt-6 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Menguji..." : "Test Connection"}
        </button>

        <div className="mt-4 rounded-lg bg-slate-100 p-4 text-sm">
          {status}
        </div>
      </div>
    </main>
  );
}
