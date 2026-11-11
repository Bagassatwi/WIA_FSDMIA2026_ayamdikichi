
"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock3,
  FileCheck2,
  ImagePlus,
  Images,
  Loader2,
  MapPin,
  RefreshCw,
  Send,
  ShieldCheck,
  Trash2,
  UploadCloud,
  UserRound,
  X,
  CalendarDays,
  ClipboardCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Assignment = {
  id: string;
  report_id: string;
  officer_id: string;
  status: string;
  assigned_at: string;
  report: {
    report_code: string | null;
    title: string | null;
    category: string | null;
    description: string | null;
    address: string | null;
    district: string | null;
    city: string | null;
    province: string | null;
  } | null;
};

type Result = {
  id: string;
  assignment_id: string;
  report_id: string;
  officer_id: string;
  description: string;
  status: "pending_review" | "approved" | "revision_requested";
  activity_type: "progress" | "completion";
  submitted_at: string;
  review_notes: string | null;
};

type Photo = {
  id: string;
  result_id: string;
  storage_path: string;
  file_name: string | null;
  photo_url: string;
};

type SelectedFile = {
  file: File;
  preview: string;
};

const BUCKET = "handling-results";
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return (
    new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(date) + " WIB"
  );
};

const formatBytes = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export default function KelolaPenangananPage() {
  const { id: assignmentId } = useParams<{ id: string }>();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);

  const [description, setDescription] = useState("");
  const [activityType, setActivityType] = useState<
    "progress" | "completion"
  >("progress");

  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);

  // =====================================================
  // FETCH DATA
  // =====================================================

  const fetchData = useCallback(async (quiet = false) => {
    try {
      if (quiet) setRefreshing(true);
      else setLoading(true);

      setError("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) {
        throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
      }

      const { data: assignmentData, error: assignmentError } =
        await supabase
          .from("report_assignments")
          .select(`
            id,
            report_id,
            officer_id,
            status,
            assigned_at,
            report:reports!report_assignments_report_id_fkey (
              report_code,
              title,
              category,
              description,
              address,
              district,
              city,
              province
            )
          `)
          .eq("id", assignmentId)
          .eq("officer_id", user.id)
          .single();

      if (assignmentError) throw assignmentError;

      if (assignmentData.status !== "in_progress") {
        throw new Error(
          "Tugas ini tidak sedang berstatus Sedang Ditangani.",
        );
      }

      const { data: resultData, error: resultError } = await supabase
        .from("report_handling_results")
        .select(`
          id,
          assignment_id,
          report_id,
          officer_id,
          description,
          status,
          activity_type,
          submitted_at,
          review_notes
        `)
        .eq("assignment_id", assignmentId)
        .order("submitted_at", { ascending: true });

      if (resultError) throw resultError;

      const resultIds = (resultData || []).map((item) => item.id);
      let photoData: Photo[] = [];

      if (resultIds.length > 0) {
        const { data: photosData, error: photosError } = await supabase
          .from("report_handling_photos")
          .select("id, result_id, storage_path, file_name")
          .in("result_id", resultIds);

        if (photosError) throw photosError;

        photoData = (photosData || []).map((photo) => ({
          ...photo,
          photo_url: supabase.storage
            .from(BUCKET)
            .getPublicUrl(photo.storage_path).data.publicUrl,
        }));
      }

      setAssignment(assignmentData as unknown as Assignment);
      setResults((resultData || []) as Result[]);
      setPhotos(photoData);
    } catch (err: any) {
      console.error("Fetch penanganan:", err);
      setError(err?.message || "Gagal memuat data penanganan.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Bersihkan preview foto ketika komponen dilepas.
  useEffect(() => {
    return () => {
      selectedFiles.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, [selectedFiles]);

  // =====================================================
  // STATUS PENGAJUAN
  // =====================================================

  const completionResults = useMemo(
    () =>
      results.filter((item) => item.activity_type === "completion"),
    [results],
  );

  const waitingReview = useMemo(
    () =>
      completionResults.some(
        (item) => item.status === "pending_review",
      ),
    [completionResults],
  );

  const completionApproved = useMemo(
    () =>
      completionResults.some(
        (item) => item.status === "approved",
      ),
    [completionResults],
  );

  const latestCompletion = useMemo(
    () => completionResults[completionResults.length - 1] || null,
    [completionResults],
  );

  const latestCompletionRevision =
    latestCompletion?.status === "revision_requested"
      ? latestCompletion
      : null;

  const canResubmitCompletion =
    !!latestCompletionRevision &&
    !waitingReview &&
    !completionApproved;

  const progressCount = results.filter(
    (item) => item.activity_type === "progress",
  ).length;

  // =====================================================
  // PILIH FOTO
  // =====================================================

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const incoming = Array.from(fileList);
    const remaining = MAX_FILES - selectedFiles.length;

    if (remaining <= 0) {
      window.alert(`Maksimal ${MAX_FILES} foto dalam satu pengajuan.`);
      return;
    }

    const validFiles: SelectedFile[] = [];

    for (const file of incoming) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        window.alert(
          `${file.name}: format tidak didukung. Gunakan JPG, PNG, atau WEBP.`,
        );
        continue;
      }

      if (file.size > MAX_BYTES) {
        window.alert(
          `${file.name}: ukuran foto melebihi 10 MB.`,
        );
        continue;
      }

      if (selectedFiles.length + validFiles.length >= MAX_FILES) {
        window.alert(`Maksimal ${MAX_FILES} foto dalam satu pengajuan.`);
        break;
      }

      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setSelectedFiles((current) => [...current, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((current) => {
      const target = current[index];

      if (target) URL.revokeObjectURL(target.preview);

      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const clearSelectedFiles = () => {
    selectedFiles.forEach((item) => URL.revokeObjectURL(item.preview));
    setSelectedFiles([]);
  };

  // =====================================================
  // MODE PENGAJUAN ULANG
  // =====================================================

  const startResubmission = () => {
    if (!canResubmitCompletion) return;

    setActivityType("completion");
    setDescription("");
    clearSelectedFiles();

    document
      .getElementById("form-penanganan")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  // =====================================================
  // SUBMIT DOKUMENTASI
  // =====================================================

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!assignment || !description.trim()) {
      window.alert("Deskripsi kegiatan wajib diisi.");
      return;
    }

    if (selectedFiles.length === 0) {
      window.alert("Unggah minimal satu foto dokumentasi.");
      return;
    }

    if (activityType === "completion" && (waitingReview || completionApproved)) {
      window.alert(
        "Pengajuan penyelesaian masih menunggu pemeriksaan atau sudah disetujui.",
      );
      return;
    }

    if (
      activityType === "completion" &&
      latestCompletionRevision &&
      !canResubmitCompletion
    ) {
      window.alert("Pengajuan ulang belum dapat dilakukan.");
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Sesi login tidak ditemukan.");

      // Setiap pengajuan membuat baris baru.
      // Riwayat pengajuan sebelumnya tidak ditimpa.
      const { data: result, error: insertError } = await supabase
        .from("report_handling_results")
        .insert({
          assignment_id: assignment.id,
          report_id: assignment.report_id,
          officer_id: user.id,
          description: description.trim(),
          status:
            activityType === "progress"
              ? "approved"
              : "pending_review",
          activity_type: activityType,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      const uploadedPaths: string[] = [];

      try {
        for (const selected of selectedFiles) {
          const file = selected.file;
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

          const storagePath =
            `${user.id}/${assignment.id}/${result.id}/` +
            `${crypto.randomUUID()}-${safeName}`;

          const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, file, {
              contentType: file.type,
              upsert: false,
            });

          if (uploadError) throw uploadError;

          uploadedPaths.push(storagePath);

          const { error: photoError } = await supabase
            .from("report_handling_photos")
            .insert({
              result_id: result.id,
              storage_path: storagePath,
              file_name: file.name,
              file_size: file.size,
              mime_type: file.type,
            });

          if (photoError) throw photoError;
        }
      } catch (uploadError) {
        if (uploadedPaths.length > 0) {
          await supabase.storage.from(BUCKET).remove(uploadedPaths);
        }

        await supabase
          .from("report_handling_results")
          .delete()
          .eq("id", result.id);

        throw uploadError;
      }

      clearSelectedFiles();
      setDescription("");

      window.alert(
        activityType === "progress"
          ? "Dokumentasi perkembangan berhasil disimpan."
          : canResubmitCompletion
            ? "Pengajuan ulang penyelesaian berhasil dikirim dan menunggu pemeriksaan admin."
            : "Penyelesaian berhasil diajukan dan menunggu pemeriksaan admin.",
      );

      await fetchData(true);
    } catch (err: any) {
      console.error("Simpan dokumentasi:", err);
      window.alert(err?.message || "Gagal menyimpan dokumentasi.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING DAN ERROR
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f5f7fb]">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-700" />
          <p className="mt-3 text-sm font-medium text-slate-500">
            Memuat data penanganan...
          </p>
        </div>
      </main>
    );
  }

  if (error || !assignment) {
    return (
      <main className="min-h-[70vh] bg-[#f5f7fb] p-5 sm:p-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-100 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle size={24} />
          </div>

          <h1 className="mt-4 text-lg font-bold text-slate-900">
            Tidak dapat membuka penanganan
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {error || "Penugasan tidak ditemukan."}
          </p>

          <Link
            href="/petugas/tugas"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <ArrowLeft size={16} />
            Kembali ke Tugas Saya
          </Link>
        </div>
      </main>
    );
  }

  const report = assignment.report;

  const location =
    [
      report?.address,
      report?.district,
      report?.city,
      report?.province,
    ]
      .filter(Boolean)
      .join(", ") || "Alamat belum tersedia";

  const isCompletionMode = activityType === "completion";

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        <Link
          href="/petugas/tugas"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
        >
          <ArrowLeft size={17} />
          Kembali ke Tugas Saya
        </Link>

        {/* HEADER */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#082b5b] via-[#0b3d78] to-[#1459a0] px-6 py-7 text-white shadow-lg shadow-blue-950/10 sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[32px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-24 right-44 h-56 w-56 rounded-full bg-cyan-300/10 blur-2xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
              <ShieldCheck size={14} />
              Panel petugas lapangan
            </div>

            <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                  Kelola penanganan
                </p>

                <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                  {report?.title || "Penanganan Laporan"}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-blue-100">
                  <span className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 font-semibold">
                    {report?.report_code || assignment.report_id}
                  </span>
                  <span>
                    {report?.category || "Kategori tidak tersedia"}
                  </span>
                </div>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Sedang ditangani
              </div>
            </div>
          </div>
        </header>

        {/* STATISTIK */}
        <section className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Dokumentasi progres"
            value={progressCount}
            icon={<ClipboardCheck size={19} />}
            color="blue"
          />

          <StatCard
            label="Menunggu pemeriksaan"
            value={waitingReview ? 1 : 0}
            icon={<Clock3 size={19} />}
            color="amber"
          />

          <StatCard
            label="Penyelesaian disetujui"
            value={completionApproved ? "Ya" : "Belum"}
            icon={<CheckCircle2 size={19} />}
            color="emerald"
          />
        </section>

        {/* INFORMASI LAPORAN */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Informasi laporan
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                Detail lokasi dan laporan
              </h2>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
              <CalendarDays size={15} />
              Ditugaskan {formatDateTime(assignment.assigned_at)}
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.5fr]">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Lokasi laporan
              </p>
              <p className="mt-2 flex items-start gap-2 text-sm font-semibold leading-relaxed text-slate-800">
                <MapPin size={17} className="mt-0.5 shrink-0 text-blue-700" />
                {location}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Deskripsi laporan
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {report?.description || "Tidak ada deskripsi laporan."}
              </p>
            </div>
          </div>
        </section>

        {/* STATUS DAN CATATAN ADMIN */}
        {(waitingReview || completionApproved || latestCompletionRevision) && (
          <section
            className={`flex items-start gap-3 rounded-2xl border p-4 ${
              completionApproved
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : latestCompletionRevision
                  ? "border-rose-200 bg-rose-50 text-rose-900"
                  : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            {completionApproved ? (
              <CheckCircle2 className="mt-0.5 shrink-0" size={19} />
            ) : latestCompletionRevision ? (
              <AlertTriangle className="mt-0.5 shrink-0" size={19} />
            ) : (
              <Clock3 className="mt-0.5 shrink-0" size={19} />
            )}

            <div className="flex-1">
              <p className="text-sm font-bold">
                {completionApproved
                  ? "Penyelesaian telah disetujui"
                  : latestCompletionRevision
                    ? "Pengajuan perlu diperbaiki"
                    : "Pengajuan penyelesaian sedang diperiksa"}
              </p>

              <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed opacity-80">
                {completionApproved
                  ? "Admin telah menyetujui hasil penanganan yang Anda ajukan."
                  : latestCompletionRevision
                    ? latestCompletionRevision.review_notes ||
                      "Silakan perbaiki pekerjaan sesuai arahan admin."
                    : "Pengajuan akhir sudah diterima dan sedang menunggu pemeriksaan admin."}
              </p>

              {canResubmitCompletion && (
                <button
                  type="button"
                  onClick={startResubmission}
                  className="mt-4 inline-flex items-center cursor-pointer gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700"
                >
                  <RefreshCw size={15} />
                  Ajukan Ulang Penyelesaian
                </button>
              )}
            </div>
          </section>
        )}

        {/* FORM DAN RIWAYAT */}
        <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">

          {/* FORM */}
          <form
            id="form-penanganan"
            onSubmit={submit}
            className="scroll-mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <Camera size={20} />
                </span>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Tambah dokumentasi
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Catat pekerjaan dan lampirkan bukti foto.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">

              {/* MODE AKTIVITAS */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Jenis aktivitas
                </label>

                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setActivityType("progress")}
                    disabled={canResubmitCompletion}
                    className={`rounded-lg px-3 py-3 text-xs font-semibold  cursor-pointer transition sm:text-sm ${
                      activityType === "progress"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <Camera size={15} className="mr-1.5 inline" />
                    Progres
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivityType("completion")}
                    disabled={waitingReview || completionApproved}
                    className={`rounded-lg px-3 py-3 text-xs font-semibold  cursor-pointer  transition sm:text-sm ${
                      activityType === "completion"
                        ? "bg-white text-emerald-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <FileCheck2 size={15} className="mr-1.5 inline" />
                    Penyelesaian
                  </button>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {isCompletionMode
                    ? canResubmitCompletion
                      ? "Anda sedang mengirim ulang hasil penyelesaian setelah memperbaiki catatan admin."
                      : "Gunakan saat pekerjaan selesai. Pengajuan akan diperiksa admin sebelum status laporan diperbarui."
                    : "Gunakan untuk mencatat perkembangan pekerjaan selama proses penanganan."}
                </p>
              </div>

              {/* DESKRIPSI */}
              <div>
                <label
                  htmlFor="handling-description"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  {isCompletionMode
                    ? "Hasil penanganan"
                    : "Catatan perkembangan"}{" "}
                  <span className="text-rose-500">*</span>
                </label>

                <textarea
                  id="handling-description"
                  required
                  rows={5}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={
                    isCompletionMode
                      ? "Jelaskan tindakan yang telah dilakukan, hasil pekerjaan, dan kondisi akhir lokasi..."
                      : "Contoh: Tim telah tiba di lokasi dan mulai membersihkan saluran drainase..."
                  }
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />

                <p className="mt-1.5 text-right text-[11px] text-slate-400">
                  {description.length} karakter
                </p>
              </div>

              {/* FOTO */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Foto dokumentasi <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {selectedFiles.length}/{MAX_FILES} foto
                  </span>
                </div>

                <label className="group flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/80 px-4 py-7 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm transition group-hover:scale-105">
                    <UploadCloud size={24} />
                  </span>

                  <span className="mt-3 text-sm font-semibold text-slate-800">
                    Pilih foto dari perangkat
                  </span>

                  <span className="mt-1 text-xs text-slate-500">
                    JPG, PNG, WEBP · Maksimal 10 MB per foto
                  </span>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={selectedFiles.length >= MAX_FILES}
                    className="hidden"
                    onChange={(event) => {
                      addFiles(event.target.files);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>

                {selectedFiles.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {selectedFiles.map((item, index) => (
                      <div
                        key={`${item.file.name}-${index}`}
                        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.preview}
                          alt={item.file.name}
                          className="h-28 w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          aria-label={`Hapus ${item.file.name}`}
                          className="absolute right-2 top-2 rounded-lg bg-slate-950/70 p-1.5 cursor-pointer  text-white transition hover:bg-rose-600"
                        >
                          <X size={14} />
                        </button>

                        <div className="p-2">
                          <p className="truncate text-[11px] font-medium text-slate-700">
                            {item.file.name}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {formatBytes(item.file.size)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* TOMBOL SUBMIT */}
              <button
                type="submit"
                disabled={
                  saving ||
                  (isCompletionMode &&
                    (waitingReview || completionApproved))
                }
                className={`inline-flex min-h-12 w-full items-center justify-center  cursor-pointer  gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-sm transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none ${
                  isCompletionMode
                    ? "bg-emerald-600 shadow-emerald-900/10 hover:bg-emerald-700 focus:ring-emerald-100"
                    : "bg-indigo-600 shadow-indigo-900/10 hover:bg-indigo-700 focus:ring-indigo-100"
                }`}
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : isCompletionMode ? (
                  <Send size={17} />
                ) : (
                  <Camera size={17} />
                )}

                {saving
                  ? "Mengunggah dokumentasi..."
                  : isCompletionMode
                    ? canResubmitCompletion
                      ? "Kirim Ulang Penyelesaian"
                      : "Ajukan penyelesaian"
                    : "Simpan dokumentasi progres"}
              </button>

              <p className="text-center text-[11px] leading-relaxed text-slate-400">
                Dengan mengirim dokumentasi, Anda menyatakan foto dan catatan
                sesuai kondisi penanganan di lapangan.
              </p>
            </div>
          </form>

          {/* RIWAYAT */}
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Images size={20} />
                </span>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Riwayat penanganan
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {results.length} catatan dokumentasi
                  </p>
                </div>
              </div>

              <button
                onClick={() => void fetchData(true)}
                disabled={refreshing}
                title="Muat ulang riwayat"
                className="rounded-xl border border-slate-200 p-2.5 text-slate-500  cursor-pointer  transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              {results.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-12 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center  cursor-pointer  rounded-2xl bg-white text-slate-400 shadow-sm">
                    <ImagePlus size={23} />
                  </span>

                  <h3 className="mt-4 text-sm font-bold text-slate-800">
                    Belum ada dokumentasi
                  </h3>

                  <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
                    Catatan dan foto yang Anda unggah akan muncul di bagian ini.
                  </p>
                </div>
              ) : (
                <div className="relative space-y-6 before:absolute before:bottom-3 before:left-[9px] before:top-3 before:w-px before:bg-slate-200">
                  {results.map((result) => {
                    const resultPhotos = photos.filter(
                      (photo) => photo.result_id === result.id,
                    );

                    const isCompletion =
                      result.activity_type === "completion";

                    const isApproved = result.status === "approved";
                    const isRevision =
                      result.status === "revision_requested";

                    return (
                      <article
                        key={result.id}
                        className="relative pl-8"
                      >
                        <span
                          className={`absolute left-0 top-1.5 z-10 h-[19px] w-[19px] rounded-full border-4 border-white ${
                            isApproved
                              ? "bg-emerald-500"
                              : isRevision
                                ? "bg-rose-500"
                                : "bg-amber-500"
                          }`}
                        />

                        <div className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h3 className="text-sm font-bold text-slate-900">
                                {isCompletion
                                  ? "Pengajuan penyelesaian"
                                  : "Dokumentasi perkembangan"}
                              </h3>

                              <p className="mt-1 text-[11px] text-slate-400">
                                {formatDateTime(result.submitted_at)}
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                isApproved
                                  ? "bg-emerald-50 text-emerald-700"
                                  : isRevision
                                    ? "bg-rose-50 text-rose-700"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {isApproved
                                ? "Disetujui"
                                : isRevision
                                  ? "Perlu revisi"
                                  : "Menunggu pemeriksaan"}
                            </span>
                          </div>

                          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                            {result.description}
                          </p>

                          {result.review_notes && (
                            <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50 p-3">
                              <p className="text-[11px] font-bold text-rose-800">
                                Catatan admin
                              </p>

                              <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-rose-700">
                                {result.review_notes}
                              </p>
                            </div>
                          )}

                          {resultPhotos.length > 0 && (
                            <div className="mt-4">
                              <p className="mb-2 text-[11px] font-semibold text-slate-500">
                                {resultPhotos.length} foto dokumentasi
                              </p>

                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {resultPhotos.map((photo) => (
                                  <button
                                    key={photo.id}
                                    type="button"
                                    onClick={() => setPreviewPhoto(photo)}
                                    className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 text-left"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={photo.photo_url}
                                      alt={photo.file_name || "Foto penanganan"}
                                      className="h-24 w-full object-cover transition duration-300 group-hover:scale-105"
                                    />

                                    <span className="block truncate px-2 py-1.5 text-[10px] text-slate-500">
                                      {photo.file_name || "Foto dokumentasi"}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </section>

        <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-400">
          JEJAKPUBLIK · Dokumentasi Penanganan
        </footer>
      </div>

      {/* PREVIEW FOTO */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPreviewPhoto(null);
            }
          }}
        >
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -right-2 -top-12 rounded-xl  cursor-pointer  bg-white/10 p-2 text-white transition hover:bg-white/20"
              aria-label="Tutup foto"
            >
              <X size={20} />
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewPhoto.photo_url}
              alt={previewPhoto.file_name || "Foto penanganan"}
              className="max-h-[80vh] w-full rounded-xl object-contain"
            />

            <p className="mt-3 text-center text-xs text-white/75">
              {previewPhoto.file_name || "Foto dokumentasi"}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

// =====================================================
// KOMPONEN STATISTIK
// =====================================================

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "amber" | "emerald";
}) {
  const backgrounds = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };

  const values = {
    blue: "text-blue-700",
    amber: "text-amber-600",
    emerald: "text-emerald-600",
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${backgrounds[color]}`}
        >
          {icon}
        </span>

        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className={`text-xl font-bold ${values[color]}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}
