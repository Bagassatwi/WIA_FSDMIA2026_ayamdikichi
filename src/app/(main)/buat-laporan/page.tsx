"use client";

import { supabase } from "@/lib/supabase";

import React, { useState } from "react";
import {
  UploadCloud,
  ImagePlus,
  X,
  FileImage,
  CheckCircle2,
} from "lucide-react";
import LocationPicker, {
  type LocationValue,
} from "../_components/LocationPicker";

export default function BuatLaporanPage() {
  const [reporterName, setReporterName] = useState("");

  const [reporterContact, setReporterContact] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");

  const [reportId, setReportId] = useState<string | null>(null);

  const [photos, setPhotos] = useState<File[]>([]);

  const [photoError, setPhotoError] = useState("");

  const [location, setLocation] = useState<LocationValue | null>(null);

  const [step, setStep] = useState<number>(1);

  const [submitted, setSubmitted] = useState<boolean>(false);

  // Form State

  const [cat, setCat] = useState<string>("");

  const [title, setTitle] = useState<string>("");

  const [desc, setDesc] = useState<string>("");

  const [date, setDate] = useState<string>("");

  const [prov, setProv] = useState<string>("");

  const [city, setCity] = useState<string>("");

  const [dist, setDist] = useState<string>("");

  const [addr, setAddr] = useState<string>("");

  const [priv, setPriv] = useState<string>("");

  const [agree, setAgree] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");

    if (isSubmitting) return;

    // =========================================
    // 1. VALIDASI FORM
    // =========================================

    if (!reporterName.trim()) {
      setSubmitError("Nama pelapor wajib diisi.");
      return;
    }

    if (!location) {
      setSubmitError(
        "Lokasi laporan belum ditentukan. Silakan pilih titik pada peta.",
      );
      setStep(2);
      return;
    }

    if (!agree) {
      setSubmitError(
        "Silakan centang pernyataan bahwa informasi laporan benar.",
      );
      return;
    }

    if (
      !cat ||
      !title.trim() ||
      !desc.trim() ||
      !date ||
      !prov ||
      !city ||
      !dist ||
      !addr.trim()
    ) {
      setSubmitError("Mohon lengkapi seluruh informasi laporan.");
      setStep(1);
      return;
    }

    if (photos.length > 5) {
      setSubmitError("Maksimal 5 foto untuk setiap laporan.");
      setStep(3);
      return;
    }

    // Validasi ulang file sebelum upload
    const invalidFile = photos.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 5 * 1024 * 1024,
    );

    if (invalidFile) {
      setSubmitError(
        `${invalidFile.name}: format tidak sesuai atau ukuran melebihi 5 MB.`,
      );
      setStep(3);
      return;
    }

    setIsSubmitting(true);

    try {
      // =========================================
      // 2. SIMPAN LAPORAN MELALUI RPC
      // =========================================

      const { data, error } = await supabase.rpc("submit_report", {
        p_reporter_name: reporterName.trim(),
        p_reporter_contact: reporterContact.trim() || null,
        p_category: cat,
        p_title: title.trim(),
        p_description: desc.trim(),
        p_incident_date: date,
        p_province: prov,
        p_city: city,
        p_district: dist,
        p_address: addr.trim(),
        p_latitude: location.lat,
        p_longitude: location.lng,
        p_privacy: priv,
      });

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("ID laporan tidak ditemukan dari hasil RPC.");
      }

      // RPC mengembalikan UUID secara langsung
      const reportDbId = data as string;

      console.log("Laporan berhasil disimpan:", reportDbId);

      // =========================================
      // 3. UPLOAD FOTO KE SUPABASE STORAGE
      // =========================================

      const uploadedPhotos: Array<{
        report_id: string;
        storage_path: string;
        file_name: string;
        file_size: number;
        mime_type: string;
      }> = [];

      for (const photo of photos) {
        const extension = photo.name.split(".").pop()?.toLowerCase() || "jpg";

        const filePath = `${reportDbId}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("report-photo")
          .upload(filePath, photo, {
            contentType: photo.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(
            `Gagal mengunggah foto ${photo.name}: ${uploadError.message}`,
          );
        }

        uploadedPhotos.push({
          report_id: reportDbId,
          storage_path: filePath,
          file_name: photo.name,
          file_size: photo.size,
          mime_type: photo.type,
        });
      }

      // =========================================
      // 4. SIMPAN METADATA FOTO
      // =========================================

      if (uploadedPhotos.length > 0) {
        const { error: photoInsertError } = await supabase
          .from("report_photos")
          .insert(uploadedPhotos);

        if (photoInsertError) {
          throw new Error(
            `Foto berhasil diunggah, tetapi metadata gagal disimpan: ${photoInsertError.message}`,
          );
        }
      }

      // =========================================
      // 5. TAMPILKAN KONFIRMASI BERHASIL
      // =========================================

      setReportId(reportDbId);
      setSubmitted(true);
    } catch (error: unknown) {
      console.error("Gagal mengirim laporan (detail):", error);

      let message = "Terjadi kesalahan yang belum diketahui.";

      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === "object" && error !== null) {
        const err = error as {
          message?: unknown;
          details?: unknown;
          hint?: unknown;
          code?: unknown;
        };

        message = [
          err.message,
          err.details,
          err.hint,
          err.code ? `Kode: ${err.code}` : null,
        ]
          .filter((item) => item !== undefined && item !== null && item !== "")
          .map(String)
          .join(" | ");
      } else {
        message = String(error);
      }

      setSubmitError(message);

      console.error("Detail pesan error:", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main id="main">
      <div className="wrap">
        <div className="bh">
          <ol className="crumbs">
            <li>
              <a href="index.html">Beranda</a>
            </li>

            <li aria-current="page">Buat Laporan</li>
          </ol>

          <h1 style={{ fontSize: "clamp(30px,4vw,44px)" }}>Buat Laporan</h1>

          <p>
            Isi laporan dalam empat langkah. Pastikan informasi dan lokasi sudah
            benar sebelum dikirim.
          </p>
        </div>

        {/* Stepper Header */}

        <ol className="stepper" aria-label="Langkah pengisian">
          <li
            className={step > 1 ? "ok" : step === 1 ? "cur" : ""}
            aria-current={step === 1 ? "step" : undefined}
          >
            <b>{step > 1 ? "✓" : "1"}</b>

            <span>Informasi masalah</span>
          </li>

          <li
            className={step > 2 ? "ok" : step === 2 ? "cur" : ""}
            aria-current={step === 2 ? "step" : undefined}
          >
            <b>{step > 2 ? "✓" : "2"}</b>

            <span>Lokasi</span>
          </li>

          <li
            className={step > 3 ? "ok" : step === 3 ? "cur" : ""}
            aria-current={step === 3 ? "step" : undefined}
          >
            <b>{step > 3 ? "✓" : "3"}</b>

            <span>Dokumentasi</span>
          </li>

          <li
            className={step === 4 ? "cur" : ""}
            aria-current={step === 4 ? "step" : undefined}
          >
            <b>4</b>

            <span>Konfirmasi</span>
          </li>
        </ol>

        <div className="form-grid">
          <div>
            {!submitted ? (
              <form className="card" id="f" noValidate onSubmit={handleSubmit}>
                {submitError && (
                  <div
                    role="alert"
                    className="err"
                    style={{
                      margin: "0 0 16px",
                      padding: "12px",
                      border: "1px solid #fca5a5",
                      borderRadius: "8px",
                      background: "#fef2f2",
                      color: "#b91c1c",
                    }}
                  >
                    {submitError}
                  </div>
                )}

                {/* Step 1: Informasi masalah */}

                {step === 1 && (
                  <section className="panel">
                    <h2 tabIndex={-1}>Informasi masalah</h2>

                    <p className="lead">
                      Ceritakan masalahnya dengan singkat dan jelas.
                    </p>

                    <div className="errsum" id="sum1" role="alert"></div>

                    <div className="fields">
                      <div className="field">
                        <label htmlFor="cat">Kategori</label>

                        <select
                          className="select"
                          id="cat"
                          value={cat}
                          onChange={(e) => setCat(e.target.value)}
                        >
                          <option value="">Pilih kategori</option>

                          <option value="jalan">Infrastruktur Jalan</option>

                          <option value="bersih">Kebersihan</option>

                          <option value="drain">Drainase</option>

                          <option value="lampu">Penerangan Jalan</option>

                          <option value="fasum">Fasilitas Umum</option>

                          <option value="ling">Lingkungan</option>
                        </select>

                        <span className="err" id="e-cat"></span>
                      </div>

                      <div className="field">
                        <label htmlFor="title">Judul laporan</label>

                        <input
                          className="input"
                          id="title"
                          maxLength={100}
                          placeholder="Contoh: Lampu jalan mati di Jl. Ijen"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />

                        <span className="err" id="e-title"></span>
                      </div>

                      <div className="field">
                        <label htmlFor="desc">Deskripsi</label>

                        <textarea
                          className="textarea"
                          id="desc"
                          placeholder="Apa yang terjadi, sejak kapan, dan apa dampaknya?"
                          value={desc}
                          onChange={(e) => setDesc(e.target.value)}
                        />

                        <span className="err" id="e-desc"></span>
                      </div>

                      <div className="field">
                        <label htmlFor="date">Tanggal kejadian</label>

                        <input
                          className="input"
                          id="date"
                          type="date"
                          max="2026-10-28"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />

                        <span className="err" id="e-date"></span>
                      </div>
                    </div>

                    <div className="actions">
                      <span />

                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => setStep(2)}
                      >
                        Lanjut ke lokasi
                      </button>
                    </div>
                  </section>
                )}

                {/* Step 2: Lokasi */}

                {step === 2 && (
                  <section className="panel">
                    <h2>Lokasi</h2>

                    <p className="lead">
                      Wilayah demonstrasi dibatasi pada Malang Raya.
                    </p>

                    <div className="errsum" id="sum2" role="alert"></div>

                    <div className="fields">
                      <div className="field">
                        <label htmlFor="prov">Provinsi</label>

                        <select
                          className="select"
                          id="prov"
                          value={prov}
                          onChange={(e) => setProv(e.target.value)}
                        >
                          <option value="">Pilih provinsi</option>

                          <option value="Jawa Timur">Jawa Timur</option>
                        </select>

                        <span className="err" id="e-prov"></span>
                      </div>

                      <div className="two">
                        <div className="field">
                          <label htmlFor="city">Kota atau kabupaten</label>

                          <select
                            className="select"
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                          >
                            <option value="">Pilih kota atau kabupaten</option>

                            <option value="Kota Malang">Kota Malang</option>

                            <option value="Kabupaten Malang">
                              Kabupaten Malang
                            </option>

                            <option value="Kota Batu">Kota Batu</option>
                          </select>

                          <span className="err" id="e-city"></span>
                        </div>

                        <div className="field">
                          <label htmlFor="dist">Kecamatan</label>

                          <select
                            className="select"
                            id="dist"
                            value={dist}
                            onChange={(e) => setDist(e.target.value)}
                          >
                            <option value="">Pilih kecamatan</option>

                            <option value="Klojen">Klojen</option>

                            <option value="Lowokwaru">Lowokwaru</option>

                            <option value="Blimbing">Blimbing</option>

                            <option value="Sukun">Sukun</option>

                            <option value="Kedungkandang">Kedungkandang</option>
                          </select>

                          <span className="err" id="e-dist"></span>
                        </div>
                      </div>

                      <div className="field">
                        <label htmlFor="addr">Alamat atau patokan</label>

                        <input
                          className="input"
                          id="addr"
                          placeholder="Contoh: Jl. Ijen, depan gerbang SDN Kauman"
                          value={addr}
                          onChange={(e) => setAddr(e.target.value)}
                        />

                        <span className="err" id="e-addr"></span>
                      </div>
                    </div>

                    <div className="actions">
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => setStep(1)}
                      >
                        Kembali
                      </button>

                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => {
                          if (!location) {
                            alert(
                              "Silakan tentukan titik lokasi pada peta terlebih dahulu.",
                            );

                            return;
                          }

                          setStep(3);
                        }}
                      >
                        Lanjut ke dokumentasi
                      </button>
                    </div>
                  </section>
                )}

                {/* Step 3: Dokumentasi */}

                {step === 3 && (
                  <section className="panel">
                    <div className="mb-5">
                      <h2>Dokumentasi Foto</h2>
                      <p className="lead">
                        Foto membantu petugas memverifikasi laporan yang kamu
                        kirim.
                      </p>
                    </div>

                    <div className="rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 p-6 text-center">
                      <input
                        id="files"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        hidden
                        onChange={(e) => {
                          const selected = Array.from(e.target.files ?? []);

                          if (selected.length + photos.length > 5) {
                            setPhotoError("Maksimal 5 foto.");
                            e.target.value = "";
                            return;
                          }

                          const invalidFile = selected.find(
                            (file) =>
                              ![
                                "image/jpeg",
                                "image/png",
                                "image/webp",
                              ].includes(file.type) ||
                              file.size > 5 * 1024 * 1024,
                          );

                          if (invalidFile) {
                            setPhotoError(
                              `${invalidFile.name}: format tidak sesuai atau ukuran melebihi 5 MB.`,
                            );
                            e.target.value = "";
                            return;
                          }

                          setPhotoError("");
                          setPhotos((current) => [...current, ...selected]);
                          e.target.value = "";
                        }}
                      />

                      <label
                        htmlFor="files"
                        className="flex cursor-pointer flex-col items-center"
                      >
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                          <UploadCloud size={32} />
                        </div>

                        <h3 className="text-base font-semibold text-gray-800">
                          Unggah foto dokumentasi
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Klik tombol di bawah untuk memilih foto
                        </p>

                        <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800">
                          <ImagePlus size={17} />
                          Pilih Foto
                        </span>
                      </label>

                      <div className="mt-5 flex flex-wrap justify-center gap-3 border-t border-emerald-100 pt-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileImage size={14} />
                          JPG, PNG, WebP
                        </span>
                        <span>Maks. 5 MB/foto</span>
                        <span>Maks. 5 foto</span>
                      </div>
                    </div>

                    {photoError && (
                      <p className="mt-3 text-sm text-red-600" role="alert">
                        {photoError}
                      </p>
                    )}

                    <div className="mt-6">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800">
                            Foto terpilih
                          </h3>
                          <p className="mt-1 text-xs text-gray-500">
                            Daftar foto yang akan dilampirkan.
                          </p>
                        </div>

                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {photos.length}/5
                        </span>
                      </div>

                      {photos.length > 0 ? (
                        <ul className="space-y-2">
                          {photos.map((photo, index) => (
                            <li
                              key={`${photo.name}-${index}`}
                              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                                <FileImage size={21} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-800">
                                  {photo.name}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {(photo.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>

                              <CheckCircle2
                                size={18}
                                className="shrink-0 text-emerald-600"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  setPhotos((current) =>
                                    current.filter((_, i) => i !== index),
                                  )
                                }
                                aria-label={`Hapus ${photo.name}`}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                              >
                                <X size={17} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-7 text-center">
                          <ImagePlus size={28} className="text-gray-400" />
                          <p className="mt-2 text-sm font-medium text-gray-600">
                            Belum ada foto yang dipilih
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            Foto yang kamu pilih akan muncul di sini.
                          </p>
                        </div>
                      )}
                    </div>

                    <p
                      className="err"
                      id="e-files"
                      role="alert"
                      tabIndex={-1}
                      style={{ marginTop: "8px" }}
                    />

                    <div className="actions">
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => setStep(2)}
                      >
                        Kembali
                      </button>

                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => setStep(4)}
                      >
                        Lanjut ke konfirmasi
                      </button>
                    </div>
                  </section>
                )}

                {/* Step 4: Konfirmasi */}

                {step === 4 && (
                  <section className="panel">
                    <h2>Konfirmasi</h2>

                    <p className="lead">Periksa kembali sebelum mengirim.</p>

                    <div className="errsum" id="sum4" role="alert"></div>

                    <dl className="sumlist" id="sumlist">
                      <dt>Kategori</dt>
                      <dd>{cat || "-"}</dd>

                      <dt>Judul</dt>
                      <dd>{title || "-"}</dd>

                      <dt>Deskripsi</dt>
                      <dd>{desc || "-"}</dd>

                      <dt>Tanggal kejadian</dt>
                      <dd>
                        {date
                          ? new Date(`${date}T00:00:00`).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </dd>

                      <dt>Lokasi</dt>
                      <dd>
                        {addr || dist || city || prov
                          ? [addr, dist, city, prov].filter(Boolean).join(", ")
                          : "-"}
                      </dd>

                      <dt>Foto</dt>

                      <dd>{photos.length} berkas</dd>
                    </dl>

                    <div className="fields">
                      <div className="field">
                        <label htmlFor="reporterName">
                          Nama lengkap pelapor
                        </label>

                        <input
                          className="input"
                          id="reporterName"
                          type="text"
                          placeholder="Masukkan nama lengkap"
                          maxLength={100}
                          value={reporterName}
                          onChange={(e) => setReporterName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="field">
                        <label htmlFor="reporterContact">
                          Nomor WhatsApp atau Email
                          <span className="small"> (Opsional)</span>
                        </label>

                        <input
                          className="input"
                          id="reporterContact"
                          type="text"
                          placeholder="Contoh: 081234567890"
                          value={reporterContact}
                          onChange={(e) => setReporterContact(e.target.value)}
                          maxLength={150}
                        />

                        <p className="small">
                          Kontak digunakan untuk keperluan tindak lanjut
                          laporan.
                        </p>
                      </div>
                    </div>

                    <fieldset className="f">
                      <legend>Privasi nama pelapor</legend>

                      <label className="opt">
                        <input
                          type="radio"
                          name="priv"
                          checked={priv === "anonymous"}
                          onChange={() => setPriv("anonymous")}
                        />

                        <div>
                          <b>Samarkan nama saya</b>

                          <span>
                            Disarankan. Yang tampil hanya “Pelapor warga”.
                          </span>
                        </div>
                      </label>

                      <label className="opt">
                        <input
                          type="radio"
                          name="priv"
                          checked={priv === "named"}
                          onChange={() => setPriv("named")}
                        />

                        <div>
                          <b>Tampilkan nama saya</b>

                          <span>Nama akan terlihat di halaman laporan.</span>
                        </div>
                      </label>
                    </fieldset>

                    <label className="opt">
                      <input
                        type="checkbox"
                        id="agree"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                      />

                      <div>
                        <b>Saya menyatakan informasi ini benar</b>

                        <span>
                          Data laporan akan disimpan untuk proses verifikasi dan
                          tindak lanjut.
                        </span>
                      </div>
                    </label>

                    <p
                      className="err"
                      id="e-agree"
                      style={{ marginTop: "8px" }}
                    ></p>

                    <div className="actions">
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => setStep(3)}
                      >
                        Kembali
                      </button>

                      <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Mengirim laporan..." : "Kirim Laporan"}
                      </button>
                    </div>
                  </section>
                )}
              </form>
            ) : (
              <div className="card ok-box" id="ok">
                <span className="ok-ic">
                  <svg
                    className="ic"
                    data-i="check"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                </span>

                <h2 tabIndex={-1}>Laporan berhasil dikirim!</h2>

                <p className="track" id="trk">
                  {reportId}
                </p>

                <p className="lead" style={{ margin: 0 }}>
                  Laporan Anda sudah tersimpan di sistem JEJAKPUBLIK.
                </p>

                <div
                  className="cta-row"
                  style={{
                    display: "flex",

                    gap: "var(--s1)",

                    flexWrap: "wrap",

                    justifyContent: "center",
                  }}
                >
                  <a className="btn btn-primary" href="/laporan">
                    Lihat laporan lain
                  </a>

                  <a className="btn btn-secondary" href="/">
                    Kembali ke beranda
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Guide & Map Preview */}

          <aside className="aside" aria-label="Panduan">
            <div className="card">
              <h2>Pratinjau lokasi</h2>

              <div id="mp">
                <LocationPicker value={location} onChange={setLocation} />
              </div>

              <p className="small" id="mpn" style={{ marginTop: "8px" }}>
                {dist
                  ? `Penanda berada di pusat kecamatan ${dist} (perkiraan).`
                  : "Pilih kecamatan untuk menampilkan penanda."}
              </p>
            </div>

            <div className="card">
              <h2>Setelah dikirim</h2>

              <p className="small">
                Pada layanan nyata, laporan akan diverifikasi, ditugaskan, lalu
                dicatat di Jejak Penanganan.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
