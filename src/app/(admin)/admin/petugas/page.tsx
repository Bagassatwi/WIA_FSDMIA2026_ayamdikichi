"use client";

import { useCallback, useEffect, useState } from "react";
import {
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  Mail,
  Save,
  Phone,
  X,
  Loader2,
  CheckCircle2,
  Pencil,
  AlertCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Officer = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
};

type ApiResponse<T> = {
  users?: T;
  message?: string;
  error?: string;
};

async function readApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const responseText = await response.text();

  try {
    return JSON.parse(responseText) as ApiResponse<T>;
  } catch {
    console.error("RESPONS API BUKAN JSON:", responseText);

    throw new Error(
      `Server mengembalikan respons yang bukan JSON. HTTP ${response.status}. Periksa lokasi API route dan terminal Next.js.`,
    );
  }
}

export default function ManajemenPetugasPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);

  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
  });

  const [savingEdit, setSavingEdit] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // FETCH DATA PETUGAS
  // =====================================================

  const fetchOfficers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.access_token) {
        throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
      }

      const response = await fetch("/api/admin/petugas", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const result = await readApiResponse<Officer[]>(response);

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengambil data petugas.");
      }

      setOfficers(result.users ?? []);
    } catch (err) {
      console.error("FETCH PETUGAS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOfficers();
  }, [fetchOfficers]);

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setShowForm(false);
  };

  // =====================================================
  // INVITE PETUGAS
  // =====================================================

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.access_token) {
        throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
      }

      const response = await fetch("/api/admin/petugas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
        }),
      });

      const result = await readApiResponse<Officer[]>(response);

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengundang petugas.");
      }

      setMessage(result.message || "Undangan berhasil dikirim.");

      resetForm();

      await fetchOfficers();
    } catch (err) {
      console.error("INVITE PETUGAS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengirim undangan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // FILTER DATA
  // =====================================================

  const filteredOfficers = officers.filter((officer) => {
    const keyword = search.toLowerCase().trim();

    return (
      officer.full_name.toLowerCase().includes(keyword) ||
      officer.email.toLowerCase().includes(keyword) ||
      (officer.phone ?? "").toLowerCase().includes(keyword)
    );
  });

  const activeCount = officers.filter((item) => item.is_active).length;

  const inactiveCount = officers.length - activeCount;

  // =====================================================
  // FORMAT TANGGAL
  // =====================================================

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    });

  // =====================================================
  // RENDER
  // =====================================================

  const handleEditOfficer = (officer: Officer) => {
    setSelectedOfficer(officer);

    setEditForm({
      full_name: officer.full_name || "",
      phone: officer.phone || "",
    });

    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedOfficer) return;

    if (!editForm.full_name.trim()) {
      alert("Nama lengkap wajib diisi.");
      return;
    }

    try {
      setSavingEdit(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Sesi login tidak valid.");
      }

      // Update langsung ke tabel user_profiles
      const { error } = await supabase
        .from("user_profiles")
        .update({
          full_name: editForm.full_name.trim(),
          phone: editForm.phone.trim() || null,
        })
        .eq("id", selectedOfficer.id)
        .eq("role", "petugas");

      if (error) {
        throw error;
      }

      setShowEditModal(false);
      setSelectedOfficer(null);

      await fetchOfficers();

      alert("Data petugas berhasil diperbarui.");
    } catch (error) {
      console.error("EDIT PETUGAS ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui data petugas.",
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleOfficer = async (officer: Officer) => {
    const nextStatus = !officer.is_active;

    const confirmed = window.confirm(
      nextStatus
        ? `Aktifkan kembali akun ${officer.full_name}?`
        : `Nonaktifkan akun ${officer.full_name}?`,
    );

    if (!confirmed) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Sesi login tidak ditemukan.");
      }

      const response = await fetch("/api/admin/petugas", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: officer.id,
          action: "toggle_status",
          is_active: nextStatus,
        }),
      });

      const result = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengubah status petugas.");
      }

      alert(
        nextStatus
          ? "Akun petugas berhasil diaktifkan."
          : "Akun petugas berhasil dinonaktifkan.",
      );

      await fetchOfficers();
    } catch (error) {
      console.error("STATUS PETUGAS ERROR:", error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan.");
    }
  };
  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#102b59]">
            Manajemen Petugas
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Kelola akun petugas dan akses sistem JEJAKPUBLIK.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setMessage("");
            setError("");
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <UserPlus size={17} />
          Tambah Petugas
        </button>
      </div>

      {/* NOTIFICATION */}

      {message && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <p>{message}</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* STATISTICS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Petugas"
          value={officers.length}
          icon={<Users size={22} />}
          color="blue"
        />

        <StatCard
          label="Petugas Aktif"
          value={activeCount}
          icon={<UserCheck size={22} />}
          color="emerald"
        />

        <StatCard
          label="Petugas Nonaktif"
          value={inactiveCount}
          icon={<UserX size={22} />}
          color="red"
        />
      </div>

      {/* OFFICER TABLE */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-800">Daftar Petugas</h2>

            <p className="mt-1 text-xs text-slate-500">
              Data akun petugas yang terdaftar di sistem.
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari petugas..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 sm:w-64"
              />
            </div>

            <button
              type="button"
              onClick={fetchOfficers}
              disabled={loading}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
              title="Refresh data"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Petugas</th>
                <th className="px-5 py-4">Kontak</th>
                <th className="px-5 py-4">Tanggal Ditambahkan</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2
                      size={22}
                      className="mx-auto animate-spin text-blue-600"
                    />

                    <p className="mt-2 text-sm text-slate-500">
                      Memuat data petugas...
                    </p>
                  </td>
                </tr>
              ) : filteredOfficers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-sm text-slate-500"
                  >
                    Belum ada data petugas.
                  </td>
                </tr>
              ) : (
                filteredOfficers.map((officer) => (
                  <tr key={officer.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {officer.full_name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ID: {officer.id.slice(0, 8)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        {officer.email}
                      </p>

                      <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <Phone size={13} className="text-slate-400" />
                        {officer.phone || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {officer.created_at
                        ? formatDate(officer.created_at)
                        : "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          officer.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {officer.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        Petugas
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditOfficer(officer)}
                          className="rounded-lg border border-blue-200 p-2 text-blue-600 cursor-pointer transition hover:bg-blue-50"
                          title="Edit petugas"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleOfficer(officer)}
                          className={`rounded-lg border cursor-pointer p-2 transition ${
                            officer.is_active
                              ? "border-red-200 text-red-600 hover:bg-red-50"
                              : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={
                            officer.is_active
                              ? "Nonaktifkan petugas"
                              : "Aktifkan petugas"
                          }
                        >
                          {officer.is_active ? (
                            <UserX size={16} />
                          ) : (
                            <UserCheck size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-4">
          <p className="text-xs text-slate-500">
            Menampilkan {filteredOfficers.length} dari {officers.length}{" "}
            petugas.
          </p>
        </div>
      </div>

      {/* INVITE MODAL */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <div className="my-auto w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="font-bold text-slate-800">Tambah Petugas</h2>

                <p className="mt-1 text-xs text-slate-500">
                  Undang petugas melalui alamat email.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="rounded-lg p-2 text-slate-400 cursor-pointer hover:bg-slate-100"
                aria-label="Tutup"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Nama Lengkap
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama petugas"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="petugas@email.com"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Nomor Telepon
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                <p className="text-xs leading-relaxed text-blue-700">
                  Undangan akan dikirim ke email petugas. Petugas akan membuat
                  password sendiri melalui tautan undangan. Admin tidak
                  mengetahui password tersebut.
                </p>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Mail size={16} />
                  )}

                  {submitting ? "Mengirim..." : "Kirim Undangan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT PETUGAS */}
      {showEditModal && selectedOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Edit Data Petugas
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Perbarui informasi akun petugas.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                disabled={savingEdit}
                className="rounded-lg p-2 cursor-pointer text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}
            <div className="space-y-5 px-6 py-6">
              {/* NAMA */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nama Lengkap
                </label>

                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      full_name: e.target.value,
                    }))
                  }
                  placeholder="Masukkan nama lengkap"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* EMAIL (READ ONLY) */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={selectedOfficer.email}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Email tidak dapat diubah melalui formulir ini.
                </p>
              </div>

              {/* NOMOR TELEPON */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nomor Telepon
                </label>

                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="Masukkan nomor telepon"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                disabled={savingEdit}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 cursor-pointer text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit || !editForm.full_name.trim()}
                className="flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingEdit ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// STATISTIC CARD
// =====================================================

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "red";
}) {
  const colorStyles = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      value: "text-blue-700",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      value: "text-emerald-700",
    },
    red: {
      icon: "bg-red-50 text-red-600",
      value: "text-red-700",
    },
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>

          <p className={`mt-2 text-2xl font-bold ${colorStyles[color].value}`}>
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorStyles[color].icon}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
