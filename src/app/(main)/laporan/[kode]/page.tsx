import Link from "next/link";
import type { ReactNode } from "react";

import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiImage,
  FiShield,
  FiFileText,
  FiActivity,
} from "react-icons/fi";

import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";

import PetaLaporan from "./PetaLaporan";

type PageProps = {
  params: Promise<{ kode: string }>;
};

type Report = {
  id: string;

  report_code: string | null;

  title: string | null;

  category: string | null;

  description: string | null;

  province: string | null;

  city: string | null;

  district: string | null;

  address: string | null;

  latitude: number | null;

  longitude: number | null;

  incident_date: string | null;

  created_at: string | null;

  status: string;
};

type Assignment = {
  id: string;

  officer_id: string;

  priority: string | null;

  deadline: string | null;

  status: string;

  assigned_at: string | null;
};

type HandlingResult = {
  id: string;

  assignment_id: string;

  description: string;

  status: string;

  activity_type: string;

  submitted_at: string;

  review_notes: string | null;
};

type HandlingPhoto = {
  id: string;

  result_id: string;

  storage_path: string;

  file_name: string | null;
};

type ReportPhoto = {
  report_id: string;

  file_name: string | null;

  storage_path: string;
};

type GalleryItem = {
  id: string;

  title: string;

  date: string;

  url: string;

  type: "initial" | "progress" | "completion";
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu Verifikasi",

  verified: "Terverifikasi",

  rejected: "Ditolak",

  assigned: "Telah Ditugaskan",

  in_progress: "Sedang Ditangani",

  completed: "Selesai Ditangani",

  closed: "Ditutup",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",

  verified: "bg-emerald-50 text-emerald-700 ring-emerald-200",

  rejected: "bg-rose-50 text-rose-700 ring-rose-200",

  assigned: "bg-blue-50 text-blue-700 ring-blue-200",

  in_progress: "bg-violet-50 text-violet-700 ring-violet-200",

  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",

  closed: "bg-slate-100 text-slate-600 ring-slate-200",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Belum tersedia";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Belum tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",

    month: "short",

    year: "numeric",

    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Belum tersedia";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Belum tersedia";

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
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
        STATUS_STYLES[status] || "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function SectionHeading({
  icon,

  title,

  description,
}: {
  icon: ReactNode;

  title: string;

  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">{icon}</div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>

        {description && (
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        )}
      </div>
    </div>
  );
}

function EvidenceCard({ item }: { item: GalleryItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-300 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}

        <img
          src={item.url}
          alt={item.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <span className="absolute right-3 top-3 rounded-full bg-slate-950/65 px-2.5 py-1 text-[10px] font-semibold text-white">
          {item.type === "initial"
            ? "Foto awal"
            : item.type === "progress"
              ? "Progres"
              : "Penyelesaian"}
        </span>
      </div>

      <div className="p-3">
        <p className="text-sm font-semibold text-slate-800">{item.title}</p>

        <p className="mt-1 text-xs text-slate-500">{item.date}</p>
      </div>
    </a>
  );
}

function TimelineItem({
  title,

  description,

  date,

  role,

  state,

  note,

  photos,
}: {
  title: string;

  description: string;

  date: string | null;

  role: string;

  state: "done" | "current" | "waiting" | "revision";

  note?: string | null;

  photos?: GalleryItem[];
}) {
  const styles = {
    done: "bg-emerald-100 text-emerald-700",

    current: "bg-blue-600 text-white",

    waiting: "bg-slate-100 text-slate-400",

    revision: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="relative flex gap-4 pb-7 last:pb-0">
      <div className="flex flex-col items-center">
        <div
          className={`z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${styles[state]}`}
        >
          {state === "done" ? (
            <FiCheckCircle size={18} />
          ) : state === "revision" ? (
            <FiAlertCircle size={18} />
          ) : state === "current" ? (
            <FiActivity size={18} />
          ) : (
            <FiClock size={17} />
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-400">
          {formatDateTime(date)}
        </p>

        <h3 className="mt-1 font-semibold text-slate-900">{title}</h3>

        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>

        <p className="mt-2 text-xs text-slate-500">Peran: {role}</p>

        {note && (
          <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50 p-3">
            <p className="text-xs font-bold text-rose-800">Catatan perbaikan</p>

            <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-rose-700">
              {note}
            </p>
          </div>
        )}

        {photos && photos.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo) => (
              <EvidenceCard key={photo.id} item={photo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NotFound({ kode }: { kode: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <FiFileText size={27} />
        </div>

        <h1 className="mt-5 text-xl font-bold text-slate-900">
          Laporan tidak ditemukan
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Kami tidak menemukan laporan dengan kode{" "}
          <strong className="text-slate-700">{kode}</strong>. Periksa kembali
          kode laporan yang kamu masukkan.
        </p>

        <Link
          href="/laporan"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          <FiArrowLeft />
          Kembali ke daftar laporan
        </Link>
      </div>
    </main>
  );
}

export default async function DetailLaporanPage({ params }: PageProps) {
  await connection();
  const { kode } = await params;

  const decodedKode = decodeURIComponent(kode);

  const supabase = await createClient();

  // 1. Ambil laporan berdasarkan kode publik.

  const reportColumns = `
  id,

  report_code,

  title,

  category,

  description,

  province,

  city,

  district,

  address,

  latitude,

  longitude,

  incident_date,

  created_at,

  status

`;

  let reportData: Report | null = null;

  // Cari berdasarkan kode laporan terlebih dahulu.

  const { data: codeData, error: codeError } = await supabase

    .from("reports")

    .select(reportColumns)

    .eq("report_code", decodedKode)

    .maybeSingle();

  if (codeError) {
    console.error("Pencarian berdasarkan report_code:", codeError);
  }

  reportData = codeData as Report | null;

  // Jika tidak ditemukan, cari berdasarkan UUID.

  if (!reportData) {
    const { data: idData, error: idError } = await supabase

      .from("reports")

      .select(reportColumns)

      .eq("id", decodedKode)

      .maybeSingle();

    if (idError) {
      console.error("Pencarian berdasarkan id:", idError);
    }

    reportData = idData as Report | null;
  }
  if (!reportData) {
    return <NotFound kode={decodedKode} />;
  }

  const report = reportData as Report;

  // 2. Foto awal laporan.

  const { data: initialPhotosData } = await supabase

    .from("report_photos")

    .select("report_id, file_name, storage_path")

    .eq("report_id", report.id);

  const initialPhotos = (initialPhotosData || []) as ReportPhoto[];

  // 3. Penugasan laporan.

  const { data: assignmentsData, error: assignmentError } = await supabase

    .from("report_assignments")

    .select(
      `

      id,

      officer_id,

      priority,

      deadline,

      status,

      assigned_at

    `,
    )

    .eq("report_id", report.id)

    .order("assigned_at", { ascending: false });

  if (assignmentError) {
    console.error("Data penugasan:", assignmentError);
  }

  const assignments = (assignmentsData || []) as Assignment[];

  const assignment = assignments[0] || null;

  // 4. Hasil penanganan.

  let results: HandlingResult[] = [];

  if (assignments.length > 0) {
    const assignmentIds = assignments.map((item) => item.id);

    const { data: resultsData, error: resultsError } = await supabase

      .from("report_handling_results")

      .select(
        `

        id,

        assignment_id,

        description,

        status,

        activity_type,

        submitted_at,

        review_notes

      `,
      )

      .eq("report_id", report.id)

      .in("assignment_id", assignmentIds)

      .order("submitted_at", { ascending: true });

    if (resultsError) {
      console.error("Data hasil penanganan:", resultsError);
    }

    results = (resultsData || []) as HandlingResult[];
  }

  // 5. Foto hasil penanganan.

  const resultIds = results.map((item) => item.id);

  let handlingPhotos: HandlingPhoto[] = [];

  if (resultIds.length > 0) {
    const { data: handlingPhotosData, error: handlingPhotosError } =
      await supabase

        .from("report_handling_photos")

        .select("id, result_id, storage_path, file_name")

        .in("result_id", resultIds);

    if (handlingPhotosError) {
      console.error("Foto hasil penanganan:", handlingPhotosError);
    }

    handlingPhotos = (handlingPhotosData || []) as HandlingPhoto[];
  }

  // 6. Siapkan foto untuk ditampilkan tepat di bawah aktivitas timeline.
  const initialGallery: GalleryItem[] = initialPhotos.map((photo) => {
    const { data } = supabase.storage
      .from("report-photo")
      .getPublicUrl(photo.storage_path);

    return {
      id: photo.storage_path,
      title: photo.file_name || "Foto kondisi awal laporan",
      date: formatDateTime(report.created_at),
      url: data.publicUrl,
      type: "initial",
    };
  });

  const photosByResult: Record<string, GalleryItem[]> = {};

  for (const photo of handlingPhotos) {
    const result = results.find((item) => item.id === photo.result_id);
    if (!result) continue;

    // Dokumentasi progres dan penyelesaian hanya dipublikasikan setelah disetujui admin.
    const isPublic =
      (result.activity_type === "progress" ||
        result.activity_type === "completion") &&
      result.status === "approved";

    if (!isPublic) continue;

    const { data, error } = await supabase.storage
      .from("handling-results")
      .createSignedUrl(photo.storage_path, 3600);

    if (error || !data?.signedUrl) {
      console.error("Signed URL foto:", error);
      continue;
    }

    const item: GalleryItem = {
      id: photo.id,
      title:
        photo.file_name ||
        (result.activity_type === "completion"
          ? "Dokumentasi penyelesaian"
          : "Dokumentasi progres"),
      date: formatDateTime(result.submitted_at),
      url: data.signedUrl,
      type: result.activity_type === "completion" ? "completion" : "progress",
    };

    if (!photosByResult[result.id]) photosByResult[result.id] = [];
    photosByResult[result.id].push(item);
  }

  // 7. Susun timeline dari kejadian yang memiliki tanggal nyata.

  const timeline: {
    id: string;

    title: string;

    description: string;

    date: string | null;

    role: string;

    state: "done" | "current" | "waiting" | "revision";

    note?: string | null;

    photos?: GalleryItem[];
  }[] = [];

  timeline.push({
    id: "created",

    title: "Laporan diterima",

    description: "Laporan berhasil masuk ke sistem JEJAKPUBLIK.",

    date: report.created_at,

    role: "Sistem JEJAKPUBLIK",

    state: "done",

    photos: initialGallery,
  });

  if (
    ["verified", "assigned", "in_progress", "completed", "closed"].includes(
      report.status,
    )
  ) {
    timeline.push({
      id: "verified",

      title: "Laporan terverifikasi",

      description: "Laporan telah melewati proses verifikasi.",

      date: null,

      role: "Admin / Verifikator",

      state: "done",
    });
  }

  if (assignment) {
    timeline.push({
      id: "assigned",

      title: "Laporan ditugaskan",

      description: "Laporan telah diteruskan kepada petugas lapangan.",

      date: assignment.assigned_at,

      role: "Admin",

      state: "done",
    });
  }

  for (const result of results) {
    if (result.activity_type === "progress" && result.status === "approved") {
      timeline.push({
        id: result.id,

        title: "Perkembangan penanganan",

        description: result.description,

        date: result.submitted_at,

        role: "Petugas lapangan",

        state: "done",

        photos: photosByResult[result.id] || [],
      });
    }

    if (result.activity_type === "completion") {
      if (result.status === "approved") {
        timeline.push({
          id: result.id,

          title: "Penyelesaian disetujui",

          description: result.description,

          date: result.submitted_at,

          role: "Petugas lapangan / Admin",

          state: "done",

          photos: photosByResult[result.id] || [],
        });
      } else if (result.status === "revision_requested") {
        timeline.push({
          id: result.id,

          title: "Perlu perbaikan",

          description:
            "Admin meminta perbaikan terhadap pengajuan penyelesaian.",

          date: result.submitted_at,

          role: "Admin",

          state: "revision",

          note: result.review_notes,
        });
      } else if (result.status === "pending_review") {
        timeline.push({
          id: result.id,

          title: "Penyelesaian diajukan",

          description:
            "Hasil penanganan telah diajukan dan menunggu pemeriksaan admin.",

          date: result.submitted_at,

          role: "Petugas lapangan",

          state: "current",
        });
      }
    }
  }

  const latestResult = results[results.length - 1] || null;

  const isRejected = report.status === "rejected";

  const location = [
    report.address,

    report.district,

    report.city,

    report.province,
  ]

    .filter(Boolean)

    .join(", ");

  const locationText = location || "Lokasi belum tersedia";

  const durationDays = report.created_at
    ? Math.max(
        0,

        Math.floor(
          (Date.now() - new Date(report.created_at).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  const latestUpdate =
    latestResult?.submitted_at || assignment?.assigned_at || report.created_at;

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      {/* HEADER */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="transition hover:text-blue-700">
              Beranda
            </Link>

            <span>/</span>

            <Link href="/laporan" className="transition hover:text-blue-700">
              Jelajahi Laporan
            </Link>

            <span>/</span>

            <span className="font-medium text-slate-800">
              {report.report_code || decodedKode}
            </span>
          </nav>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-sm font-semibold text-slate-700">
              {report.report_code || decodedKode}
            </span>

            <StatusBadge status={report.status} />
          </div>

          <h1 className="max-w-3xl text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {report.title || "Laporan masyarakat"}
          </h1>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <FiActivity className="text-blue-600" />

              {report.category || "Kategori tidak tersedia"}
            </span>

            <span className="flex items-center gap-2">
              <FiMapPin className="text-blue-600" />

              {report.city || "Lokasi tidak tersedia"}
            </span>

            <span className="flex items-center gap-2">
              <FiCalendar className="text-blue-600" />
              Dilaporkan {formatDate(report.incident_date)}
            </span>
          </div>
        </div>
      </section>

      {/* KONTEN */}

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <div className="min-w-0 space-y-8">
          {/* RINGKASAN */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Ringkasan laporan
            </h2>

            <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {report.description || "Tidak ada deskripsi laporan."}
            </p>
          </section>

          {/* TIMELINE */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <SectionHeading
              icon={<FiActivity size={21} />}
              title="Jejak Penanganan"
              description="Riwayat proses laporan berdasarkan aktivitas yang tercatat di sistem."
            />

            <div className="relative mt-8 space-y-0 before:absolute before:bottom-3 before:left-[17px] before:top-3 before:w-px before:bg-slate-200">
              {timeline.map((item) => (
                <TimelineItem key={item.id} {...item} />
              ))}
            </div>

            {isRejected && (
              <div className="mt-5 rounded-xl border border-rose-100 bg-rose-50 p-4">
                <p className="text-sm font-bold text-rose-800">
                  Laporan tidak dapat dilanjutkan
                </p>

                <p className="mt-1 text-xs leading-5 text-rose-700">
                  Status laporan saat ini ditolak. Silakan periksa informasi
                  atau hubungi pengelola jika membutuhkan penjelasan lebih
                  lanjut.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* SIDEBAR */}

        <aside className="space-y-5">
          {/* RINGKASAN PENANGANAN */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-900">Ringkasan penanganan</h2>

            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="mb-1 text-slate-500">Status laporan</dt>

                <dd>
                  <StatusBadge status={report.status} />
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Status penugasan</dt>

                <dd className="mt-1 font-medium text-slate-800">
                  {assignment
                    ? assignment.status === "in_progress"
                      ? "Sedang ditangani"
                      : assignment.status === "completed"
                        ? "Selesai"
                        : assignment.status === "assigned"
                          ? "Menunggu petugas"
                          : assignment.status
                    : "Belum ditugaskan"}
                </dd>
              </div>

              {assignment && (
                <>
                  <div>
                    <dt className="text-slate-500">Tanggal penugasan</dt>

                    <dd className="mt-1 font-medium text-slate-800">
                      {formatDateTime(assignment.assigned_at)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-slate-500">Target penyelesaian</dt>

                    <dd className="mt-1 font-medium text-slate-800">
                      {formatDate(assignment.deadline)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-slate-500">Prioritas</dt>

                    <dd className="mt-1 font-medium capitalize text-slate-800">
                      {assignment.priority || "Tidak ditentukan"}
                    </dd>
                  </div>
                </>
              )}

              <div>
                <dt className="text-slate-500">Pembaruan terakhir</dt>

                <dd className="mt-1 font-medium text-slate-800">
                  {formatDateTime(latestUpdate)}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Durasi sejak dilaporkan</dt>

                <dd className="mt-1 font-medium text-slate-800">
                  {durationDays === null
                    ? "Belum tersedia"
                    : `${durationDays} hari`}
                </dd>
              </div>
            </dl>

            {latestResult?.activity_type === "completion" &&
              latestResult.status === "pending_review" && (
                <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-3">
                  <p className="text-xs font-bold text-amber-800">
                    Penyelesaian menunggu pemeriksaan
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    Petugas telah mengajukan hasil penanganan. Status laporan
                    belum dinyatakan selesai.
                  </p>
                </div>
              )}
          </section>

          {/* LOKASI */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-900">Lokasi laporan</h2>

            <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-600">
              <FiMapPin className="mt-1 shrink-0 text-blue-600" />

              {locationText}
            </p>

            {report.latitude !== null && report.longitude !== null ? (
              <div className="mt-4 overflow-hidden rounded-xl">
                <PetaLaporan
                  latitude={report.latitude}
                  longitude={report.longitude}
                  title={report.title || "Lokasi laporan"}
                />
              </div>
            ) : (
              <div className="mt-4 flex aspect-[4/3] flex-col items-center justify-center rounded-xl bg-slate-100 p-5 text-center">
                <FiMapPin className="text-3xl text-slate-400" />

                <p className="mt-3 text-sm font-semibold text-slate-600">
                  Koordinat belum tersedia
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Peta akan ditampilkan jika koordinat laporan tersedia.
                </p>
              </div>
            )}
          </section>

          {/* PRIVASI */}
          {/* <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <FiShield className="text-lg text-blue-600" />

              <h2 className="font-bold text-slate-900">Privasi pelapor</h2>
            </div>

            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <FiCheckCircle className="mt-0.5 shrink-0 text-emerald-600" />

                {report.privacy === "anonymous"
                  ? "Identitas pelapor dirahasiakan sesuai pilihan pelapor."
                  : "Nama pelapor ditampilkan sesuai persetujuan pelapor."}
              </li>

              <li className="flex items-start gap-2">
                <FiCheckCircle className="mt-0.5 shrink-0 text-emerald-600" />
                Informasi kontak tidak dipublikasikan.
              </li>

              <li className="flex items-start gap-2">
                <FiCheckCircle className="mt-0.5 shrink-0 text-emerald-600" />
                Informasi publik dibatasi pada data laporan dan penanganan.
              </li>
            </ul>
          </section> */}

          {/* KEMBALI */}

          <Link
            href="/laporan"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            <FiArrowLeft size={16} />
            Kembali ke daftar laporan
          </Link>
        </aside>
      </div>
    </main>
  );
}
