"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FiUploadCloud,
  FiImage,
  FiX,
  FiCheckCircle,
  FiMapPin,
  FiFileText,
  FiUser,
  FiArrowRight,
  FiArrowLeft,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";

import { supabase } from "@/lib/supabase";
import LocationPicker, {
  type LocationValue,
} from "../_components/LocationPicker";

const steps = [
  { number: 1, label: "Informasi", icon: FiFileText },
  { number: 2, label: "Lokasi", icon: FiMapPin },
  { number: 3, label: "Dokumentasi", icon: FiImage },
  { number: 4, label: "Konfirmasi", icon: FiCheckCircle },
];

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass = "mb-2 block text-sm font-medium text-gray-700";

export default function BuatLaporanPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [reportId, setReportId] = useState<string | null>(null);

  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");

  const [cat, setCat] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");

  const [prov, setProv] = useState("");
  const [city, setCity] = useState("");
  const [dist, setDist] = useState("");
  const [addr, setAddr] = useState("");

  const [location, setLocation] = useState<LocationValue | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);

  const [priv, setPriv] = useState("anonymous");
  const [agree, setAgree] = useState(false);

  const today = new Date();
  const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  const handlePhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selected = Array.from(e.target.files ?? []);

    if (photos.length + selected.length > 5) {
      setPhotoError("Maksimal 5 foto untuk setiap laporan.");
      e.target.value = "";
      return;
    }

    const invalidFile = selected.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 5 * 1024 * 1024
    );

    if (invalidFile) {
      setPhotoError(
        `${invalidFile.name}: format tidak sesuai atau ukuran melebihi 5 MB.`
      );
      e.target.value = "";
      return;
    }

    setPhotoError("");
    setPhotos((current) => [...current, ...selected]);
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((current) => current.filter((_, i) => i !== index));
    setPhotoError("");
  };

  const validateForm = () => {
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
      return false;
    }

    if (!location) {
      setSubmitError(
        "Lokasi laporan belum ditentukan. Silakan pilih titik pada peta."
      );
      setStep(2);
      return false;
    }

    if (photos.length > 5) {
      setSubmitError("Maksimal 5 foto untuk setiap laporan.");
      setStep(3);
      return false;
    }

    const invalidFile = photos.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 5 * 1024 * 1024
    );

    if (invalidFile) {
      setSubmitError(
        `${invalidFile.name}: format tidak sesuai atau ukuran melebihi 5 MB.`
      );
      setStep(3);
      return false;
    }

    if (!reporterName.trim()) {
      setSubmitError("Nama pelapor wajib diisi.");
      setStep(4);
      return false;
    }

    if (!priv) {
      setSubmitError("Silakan pilih pengaturan privasi nama.");
      setStep(4);
      return false;
    }

    if (!agree) {
      setSubmitError(
        "Silakan centang pernyataan bahwa informasi laporan benar."
      );
      setStep(4);
      return false;
    }

    return true;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setSubmitError("");

    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // 1. Simpan data laporan melalui RPC
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
        p_latitude: location!.lat,
        p_longitude: location!.lng,
        p_privacy: priv,
      });

      if (error) throw error;

      if (!data) {
        throw new Error("ID laporan tidak ditemukan dari hasil RPC.");
      }

      const reportDbId = data as string;

      // 2. Upload foto ke Supabase Storage
      const uploadedPhotos: Array<{
        report_id: string;
        storage_path: string;
        file_name: string;
        file_size: number;
        mime_type: string;
      }> = [];

      for (const photo of photos) {
        const extension =
          photo.name.split(".").pop()?.toLowerCase() || "jpg";

        const filePath = `${reportDbId}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("report-photo")
          .upload(filePath, photo, {
            contentType: photo.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(
            `Gagal mengunggah foto ${photo.name}: ${uploadError.message}`
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

      // 3. Simpan metadata foto
      if (uploadedPhotos.length > 0) {
        const { error: photoInsertError } = await supabase
          .from("report_photos")
          .insert(uploadedPhotos);

        if (photoInsertError) {
          throw new Error(
            `Foto berhasil diunggah, tetapi metadata gagal disimpan: ${photoInsertError.message}`
          );
        }
      }

      // 4. Tampilkan konfirmasi
      setReportId(reportDbId);
      setSubmitted(true);
    } catch (error: unknown) {
      console.error("Gagal mengirim laporan:", error);

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
          .filter(
            (item) => item !== undefined && item !== null && item !== ""
          )
          .map(String)
          .join(" | ");
      } else {
        message = String(error);
      }

      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (value: string) => {
    if (!value) return "-";

    return new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="transition hover:text-blue-600">
              Beranda
            </Link>
            <span>/</span>
            <span className="font-medium text-gray-800">
              Buat Laporan
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Buat Laporan
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Sampaikan masalah di lingkungan sekitar agar dapat
            ditindaklanjuti. Pastikan informasi dan lokasi sudah benar
            sebelum laporan dikirim.
          </p>
        </div>

        {submitted ? (
          /* Success State */
          <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
              <FiCheck size={32} />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Laporan berhasil dikirim!
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Laporan Anda sudah tersimpan di sistem JEJAKPUBLIK.
              Simpan ID berikut untuk keperluan penelusuran laporan.
            </p>

            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                ID Laporan
              </p>
              <p className="mt-2 break-all font-mono text-sm font-semibold text-gray-900">
                {reportId}
              </p>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/laporan"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Lihat laporan lain
                <FiArrowRight />
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Kembali ke beranda
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stepper */}
            <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
              <ol className="grid grid-cols-4 gap-2">
                {steps.map((item) => {
                  const Icon = item.icon;
                  const isCompleted = step > item.number;
                  const isActive = step === item.number;

                  return (
                    <li key={item.number}>
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitError("");
                          setStep(item.number);
                        }}
                        className="flex w-full flex-col items-center gap-2 text-center"
                      >
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-full transition sm:h-11 sm:w-11 ${
                            isCompleted
                              ? "bg-green-100 text-green-700"
                              : isActive
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {isCompleted ? (
                            <FiCheck size={19} />
                          ) : (
                            <Icon size={19} />
                          )}
                        </span>

                        <span
                          className={`text-[11px] font-medium sm:text-sm ${
                            isActive
                              ? "text-blue-700"
                              : isCompleted
                                ? "text-green-700"
                                : "text-gray-400"
                          }`}
                        >
                          {item.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full bg-blue-600 transition-all duration-300 ${
                    step === 1
                      ? "w-1/4"
                      : step === 2
                        ? "w-2/4"
                        : step === 3
                          ? "w-3/4"
                          : "w-full"
                  }`}
                />
              </div>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
              >
                {submitError && (
                  <div
                    role="alert"
                    className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    <FiAlertCircle className="mt-0.5 shrink-0" size={18} />
                    <p>{submitError}</p>
                  </div>
                )}

                {/* Step 1 */}
                {step === 1 && (
                  <section>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        Informasi Masalah
                      </h2>
                      <p className="mt-2 text-sm text-gray-500">
                        Ceritakan masalah yang ditemukan dengan singkat
                        dan jelas.
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label htmlFor="cat" className={labelClass}>
                          Kategori masalah
                        </label>
                        <select
                          id="cat"
                          value={cat}
                          onChange={(e) => setCat(e.target.value)}
                          className={inputClass}
                          required
                        >
                          <option value="">Pilih kategori</option>
                          <option value="jalan">Infrastruktur Jalan</option>
                          <option value="bersih">Kebersihan</option>
                          <option value="drain">Drainase</option>
                          <option value="lampu">Penerangan Jalan</option>
                          <option value="fasum">Fasilitas Umum</option>
                          <option value="ling">Lingkungan</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="title" className={labelClass}>
                          Judul laporan
                        </label>
                        <input
                          id="title"
                          type="text"
                          maxLength={100}
                          placeholder="Contoh: Lampu jalan mati di Jl. Ijen"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className={inputClass}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="desc" className={labelClass}>
                          Deskripsi masalah
                        </label>
                        <textarea
                          id="desc"
                          rows={5}
                          placeholder="Jelaskan apa yang terjadi, sejak kapan, dan apa dampaknya..."
                          value={desc}
                          onChange={(e) => setDesc(e.target.value)}
                          className={`${inputClass} resize-y`}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="date" className={labelClass}>
                          Tanggal kejadian
                        </label>
                        <input
                          id="date"
                          type="date"
                          max={localToday}
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>
                  </section>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <section>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        Lokasi Masalah
                      </h2>
                      <p className="mt-2 text-sm text-gray-500">
                        Masukkan wilayah dan alamat, lalu tentukan titik
                        lokasi pada peta.
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label htmlFor="prov" className={labelClass}>
                          Provinsi
                        </label>
                        <select
                          id="prov"
                          value={prov}
                          onChange={(e) => setProv(e.target.value)}
                          className={inputClass}
                          required
                        >
                          <option value="">Pilih provinsi</option>
                          <option value="Jawa Timur">Jawa Timur</option>
                        </select>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="city" className={labelClass}>
                            Kota atau kabupaten
                          </label>
                          <select
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className={inputClass}
                            required
                          >
                            <option value="">Pilih wilayah</option>
                            <option value="Kota Malang">Kota Malang</option>
                            <option value="Kabupaten Malang">
                              Kabupaten Malang
                            </option>
                            <option value="Kota Batu">Kota Batu</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="dist" className={labelClass}>
                            Kecamatan
                          </label>
                          <select
                            id="dist"
                            value={dist}
                            onChange={(e) => setDist(e.target.value)}
                            className={inputClass}
                            required
                          >
                            <option value="">Pilih kecamatan</option>
                            <option value="Klojen">Klojen</option>
                            <option value="Lowokwaru">Lowokwaru</option>
                            <option value="Blimbing">Blimbing</option>
                            <option value="Sukun">Sukun</option>
                            <option value="Kedungkandang">
                              Kedungkandang
                            </option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="addr" className={labelClass}>
                          Alamat atau patokan
                        </label>
                        <input
                          id="addr"
                          type="text"
                          placeholder="Contoh: Jl. Ijen, depan gerbang sekolah"
                          value={addr}
                          onChange={(e) => setAddr(e.target.value)}
                          className={inputClass}
                          required
                        />
                      </div>

                      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                          <FiMapPin
                            className="mt-0.5 shrink-0 text-blue-600"
                            size={20}
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              Tentukan titik lokasi
                            </p>
                            <p className="mt-1 text-xs leading-5 text-gray-600">
                              Pilih titik yang paling mendekati lokasi
                              masalah pada peta di samping.
                            </p>
                          </div>
                        </div>

                        <p className="mt-3 text-sm font-medium text-blue-700">
                          {location
                            ? `Koordinat: ${location.lat}, ${location.lng}`
                            : "Lokasi belum dipilih."}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <section>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        Dokumentasi Foto
                      </h2>
                      <p className="mt-2 text-sm text-gray-500">
                        Lampirkan foto kondisi di lokasi agar laporan
                        lebih mudah diverifikasi.
                      </p>
                    </div>

                    <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-7 text-center transition hover:border-blue-300">
                      <input
                        id="files"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        hidden
                        onChange={handlePhotoChange}
                      />

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <FiUploadCloud size={28} />
                      </div>

                      <h3 className="mt-4 text-base font-semibold text-gray-800">
                        Unggah foto dokumentasi
                      </h3>

                      <p className="mt-2 text-sm text-gray-500">
                        Pilih foto dari perangkat Anda.
                      </p>

                      <label
                        htmlFor="files"
                        className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        <FiImage size={17} />
                        Pilih Foto
                      </label>

                      <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-gray-500">
                        <span>JPG, PNG, WebP</span>
                        <span>Maks. 5 MB/foto</span>
                        <span>Maks. 5 foto</span>
                      </div>
                    </div>

                    {photoError && (
                      <p
                        role="alert"
                        className="mt-3 text-sm text-red-600"
                      >
                        {photoError}
                      </p>
                    )}

                    <div className="mt-7">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800">
                            Foto terpilih
                          </h3>
                          <p className="mt-1 text-xs text-gray-500">
                            Foto yang akan dilampirkan pada laporan.
                          </p>
                        </div>

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {photos.length}/5
                        </span>
                      </div>

                      {photos.length > 0 ? (
                        <ul className="space-y-3">
                          {photos.map((photo, index) => (
                            <li
                              key={`${photo.name}-${index}`}
                              className="flex items-center gap-3 rounded-xl border border-gray-200 p-3"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <FiImage size={20} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-800">
                                  {photo.name}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {(photo.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>

                              <FiCheckCircle
                                className="shrink-0 text-green-600"
                                size={18}
                              />

                              <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                aria-label={`Hapus ${photo.name}`}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                              >
                                <FiX size={18} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center">
                          <FiImage
                            className="mx-auto text-gray-400"
                            size={28}
                          />
                          <p className="mt-3 text-sm font-medium text-gray-600">
                            Belum ada foto yang dipilih
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            Foto yang dipilih akan muncul di sini.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Step 4 */}
                {step === 4 && (
                  <section>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        Konfirmasi Laporan
                      </h2>
                      <p className="mt-2 text-sm text-gray-500">
                        Periksa kembali informasi sebelum mengirim
                        laporan.
                      </p>
                    </div>

                    <div className="mb-7 rounded-xl border border-gray-200 bg-gray-50 p-5">
                      <h3 className="mb-4 text-sm font-semibold text-gray-800">
                        Ringkasan laporan
                      </h3>

                      <dl className="space-y-4 text-sm">
                        <div>
                          <dt className="text-gray-500">Kategori</dt>
                          <dd className="mt-1 font-medium text-gray-800">
                            {cat || "-"}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-gray-500">Judul laporan</dt>
                          <dd className="mt-1 font-medium text-gray-800">
                            {title || "-"}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-gray-500">Deskripsi</dt>
                          <dd className="mt-1 whitespace-pre-line leading-6 text-gray-800">
                            {desc || "-"}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-gray-500">
                            Tanggal kejadian
                          </dt>
                          <dd className="mt-1 font-medium text-gray-800">
                            {formatDate(date)}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-gray-500">Lokasi</dt>
                          <dd className="mt-1 font-medium text-gray-800">
                            {[addr, dist, city, prov]
                              .filter(Boolean)
                              .join(", ") || "-"}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-gray-500">Dokumentasi</dt>
                          <dd className="mt-1 font-medium text-gray-800">
                            {photos.length} foto
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label
                          htmlFor="reporterName"
                          className={labelClass}
                        >
                          Nama lengkap pelapor
                        </label>
                        <input
                          id="reporterName"
                          type="text"
                          maxLength={100}
                          placeholder="Masukkan nama lengkap"
                          value={reporterName}
                          onChange={(e) =>
                            setReporterName(e.target.value)
                          }
                          className={inputClass}
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="reporterContact"
                          className={labelClass}
                        >
                          Nomor WhatsApp atau Email{" "}
                          <span className="font-normal text-gray-400">
                            (Opsional)
                          </span>
                        </label>
                        <input
                          id="reporterContact"
                          type="text"
                          maxLength={150}
                          placeholder="Contoh: 081234567890"
                          value={reporterContact}
                          onChange={(e) =>
                            setReporterContact(e.target.value)
                          }
                          className={inputClass}
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Kontak digunakan untuk keperluan tindak lanjut
                          laporan.
                        </p>
                      </div>

                      <fieldset>
                        <legend className="mb-3 text-sm font-medium text-gray-700">
                          Privasi nama pelapor
                        </legend>

                        <div className="space-y-3">
                          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-blue-300">
                            <input
                              type="radio"
                              name="privacy"
                              value="anonymous"
                              checked={priv === "anonymous"}
                              onChange={() => setPriv("anonymous")}
                              className="mt-1 accent-blue-600"
                            />
                            <span>
                              <span className="block text-sm font-semibold text-gray-800">
                                Samarkan nama saya
                              </span>
                              <span className="mt-1 block text-xs leading-5 text-gray-500">
                                Nama tidak ditampilkan. Identitas
                                ditampilkan sebagai “Pelapor warga”.
                              </span>
                            </span>
                          </label>

                          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-blue-300">
                            <input
                              type="radio"
                              name="privacy"
                              value="named"
                              checked={priv === "named"}
                              onChange={() => setPriv("named")}
                              className="mt-1 accent-blue-600"
                            />
                            <span>
                              <span className="block text-sm font-semibold text-gray-800">
                                Tampilkan nama saya
                              </span>
                              <span className="mt-1 block text-xs leading-5 text-gray-500">
                                Nama akan terlihat pada halaman laporan.
                              </span>
                            </span>
                          </label>
                        </div>
                      </fieldset>

                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4">
                        <input
                          type="checkbox"
                          checked={agree}
                          onChange={(e) => setAgree(e.target.checked)}
                          className="mt-1 accent-blue-600"
                        />
                        <span>
                          <span className="block text-sm font-semibold text-gray-800">
                            Saya menyatakan informasi ini benar
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-gray-500">
                            Data laporan akan disimpan untuk proses
                            verifikasi dan tindak lanjut.
                          </span>
                        </span>
                      </label>
                    </div>
                  </section>
                )}

                {/* Navigation Buttons */}
                <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-gray-100 pt-6 sm:flex-row">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitError("");
                        setStep((current) => current - 1);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      <FiArrowLeft size={16} />
                      Kembali
                    </button>
                  ) : (
                    <span />
                  )}

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitError("");

                        if (step === 2 && !location) {
                          setSubmitError(
                            "Silakan tentukan titik lokasi pada peta terlebih dahulu."
                          );
                          return;
                        }

                        setStep((current) => current + 1);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Lanjut
                      <FiArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting
                        ? "Mengirim laporan..."
                        : "Kirim Laporan"}
                      {!isSubmitting && <FiArrowRight size={16} />}
                    </button>
                  )}
                </div>
              </form>

              {/* Sidebar */}
              <aside className="space-y-5">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-4">
                    <h2 className="font-semibold text-gray-900">
                      Pratinjau Lokasi
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Pilih titik lokasi kejadian pada peta.
                    </p>
                  </div>

                  <LocationPicker
                    value={location}
                    onChange={setLocation}
                  />

                  <div className="mt-4 rounded-xl bg-gray-50 p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <FiMapPin className="text-blue-600" />
                      Lokasi terpilih
                    </div>

                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      {location
                        ? `${location.lat}, ${location.lng}`
                        : "Belum ada titik lokasi yang dipilih."}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FiUser size={20} />
                    </div>
                    <h2 className="font-semibold text-gray-900">
                      Setelah laporan dikirim
                    </h2>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    Pada layanan nyata, laporan akan diverifikasi,
                    ditugaskan kepada petugas, lalu dicatat dalam Jejak
                    Penanganan.
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <h3 className="text-sm font-semibold text-blue-900">
                    Tips membuat laporan
                  </h3>

                  <ul className="mt-3 space-y-2 text-xs leading-5 text-blue-800">
                    <li>• Gunakan judul yang singkat dan jelas.</li>
                    <li>• Jelaskan kondisi dan dampak masalah.</li>
                    <li>• Pilih titik lokasi yang akurat.</li>
                    <li>• Sertakan foto kondisi terkini.</li>
                  </ul>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  );
}