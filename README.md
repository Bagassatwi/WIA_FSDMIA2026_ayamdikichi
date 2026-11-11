# JEJAKPUBLIK — Dari Laporan Menjadi Bukti

**JEJAKPUBLIK** adalah platform pelaporan masyarakat untuk permasalahan infrastruktur dan lingkungan publik. Masyarakat dapat mengirim laporan tanpa harus membuat akun, memantau proses penanganan, serta melihat bukti penyelesaian melalui kode laporan.

Platform ini dirancang untuk meningkatkan transparansi, mempermudah penyampaian aspirasi masyarakat, dan membantu proses tindak lanjut permasalahan publik secara terstruktur.

## Team Ayamdikichi

- Pandhu Arya M
- M. Dwi Kurniawan
- Bagas Satrio W

## Tech Stack

| Teknologi | Kegunaan |
|---|---|
| Next.js 16 | Framework aplikasi web |
| React 19 | Library antarmuka pengguna |
| TypeScript | Type safety |
| Tailwind CSS | Styling antarmuka |
| Supabase | PostgreSQL, Authentication, Backend, dan Storage |
| Leaflet | Peta interaktif |
| React Leaflet | Integrasi peta dengan React |
| Lucide React | Ikon antarmuka |

## Features

### Public Landing Page

- Informasi dan pengenalan platform JEJAKPUBLIK.
- Menampilkan laporan terbaru.
- Formulir pelaporan tanpa registrasi akun.
- Pelacakan laporan menggunakan kode laporan.
- Peta lokasi laporan.

### Public Reporting System

- Pelaporan tanpa akun.
- Pengisian judul dan deskripsi permasalahan.
- Pemilihan kategori laporan.
- Pengisian alamat dan titik koordinat melalui peta.
- Unggah foto bukti laporan.
- Pilihan privasi identitas pelapor (bernama atau anonim).
- Persetujuan menerima notifikasi perkembangan laporan.
- Pembuatan kode laporan otomatis dengan format `JP-YYYY-#####`.

### Automatic Duplicate Report Detection

- Deteksi otomatis laporan yang berpotensi duplikat pada Admin Dashboard.
- Pemeriksaan kemungkinan laporan serupa berdasarkan informasi dan lokasi.
- Peringatan kepada masyarakat ketika ditemukan laporan serupa saat mengisi formulir.
- Masyarakat dapat memilih untuk membatalkan atau tetap melanjutkan laporan.
- Keputusan akhir pemeriksaan duplikasi tetap berada pada admin.

### Admin Dashboard

- Dashboard statistik dan ringkasan laporan.
- Manajemen seluruh laporan masyarakat.
- Verifikasi dan penolakan laporan.
- Deteksi laporan duplikat.
- Manajemen akun petugas.
- Penambahan petugas lapangan melalui formulir yang hanya memerlukan:
  - Nama lengkap.
  - Alamat email.
  - Nomor telepon.
- Sistem mengirimkan email undangan kepada petugas untuk membuat password secara mandiri.
- Admin tidak perlu menentukan atau mengetahui password petugas.
- Penugasan laporan kepada petugas lapangan.
- Pemantauan progres penanganan.
- Validasi hasil pekerjaan petugas.
- Persetujuan hasil penanganan atau permintaan revisi.

### Petugas Dashboard

- Dashboard khusus petugas lapangan.
- Daftar tugas dan detail penugasan.
- Informasi lokasi laporan.
- Pembaruan progres penanganan.
- Pengiriman deskripsi hasil pekerjaan.
- Unggah dokumentasi pekerjaan.
- Pemantauan status validasi hasil.
- Riwayat penanganan yang telah disetujui admin.

### Report Tracking

- Pelacakan laporan menggunakan kode laporan.
- Informasi status perkembangan laporan.
- Informasi hasil penanganan.
- Dokumentasi penyelesaian yang telah disetujui admin.

## Application Workflow

1. Masyarakat mengirim laporan tanpa akun.
2. Sistem memeriksa kemungkinan laporan duplikat.
3. Masyarakat dapat melanjutkan atau membatalkan laporan setelah menerima peringatan.
4. Sistem menghasilkan kode laporan secara otomatis.
5. Admin melakukan verifikasi laporan.
6. Admin menambahkan petugas dengan mengisi nama lengkap, email, dan nomor telepon.
7. Sistem mengirimkan email undangan kepada petugas untuk membuat password sendiri.
8. Petugas menyelesaikan proses pembuatan password dan mengakses dashboard.
9. Admin menugaskan laporan kepada petugas.
10. Petugas melakukan penanganan dan mengirim dokumentasi.
11. Admin memeriksa hasil pekerjaan.
12. Admin menyetujui hasil atau meminta revisi.
13. Masyarakat dapat memantau perkembangan dan bukti penyelesaian melalui kode laporan.

## Report Status

| Status | Keterangan |
|---|---|
| `pending` | Menunggu verifikasi |
| `verified` | Laporan telah diverifikasi |
| `rejected` | Laporan ditolak |
| `assigned` | Laporan telah ditugaskan |
| `in_progress` | Sedang ditangani |
| `completed` | Penanganan telah selesai |
| `closed` | Proses laporan telah ditutup |

## Development Progress

| Fitur | Status |
|---|---|
| Landing Page | Completed |
| Form Pelaporan | Completed |
| Supabase Integration | Completed |
| Automatic Report Code | Completed |
| Duplicate Report Detection | Completed |
| Duplicate Warning on Reporting Form | Completed |
| Report Tracking | Completed |
| Admin Authentication | Completed |
| Petugas Authentication | Completed |
| Admin Dashboard | Completed |
| Petugas Dashboard | Completed |
| Report Verification | Completed |
| Officer Management | Completed |
| Officer Registration and Email Invitation | Completed |
| Officer Self-Service Password Setup | Completed |
| Field Assignment | Completed |
| Handling Process | Completed |
| Handling Documentation | Completed |
| Evidence Validation | Completed |
| Officer Handling History | Completed |
| Interactive Map | Completed |

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/mdwkrnwn/WIA_FSDMIA2026_ayamdikichi.git

cd WIA_FSDMIA2026_ayamdikichi
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory.

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY

SUPABASE_SECRET_KEY=YOUR_SUPABASE_SECRET_KEY

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Replace the placeholder values with your Supabase configuration.

**Environment Variable Notes:**

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable key |
| `SUPABASE_SECRET_KEY` | Server-side Supabase secret key |
| `NEXT_PUBLIC_APP_URL` | Application base URL |

**Security Notes:**

- Never commit `.env.local` to a public repository.
- Never expose `SUPABASE_SECRET_KEY` in frontend code.
- Never use secret keys in client-side components.
- Configure Row Level Security (RLS) to protect database access.
- For production, change `NEXT_PUBLIC_APP_URL` to the deployed application URL.

### 4. Run Development Server

```bash
npm run dev
```

Open the application:

```text
http://localhost:3000
```

## Akun Demo

Berikut adalah akun yang dapat digunakan untuk mencoba aplikasi JEJAKPUBLIK.

| Role | Email | Password |
|---|---|---|
| Administrator | admin@jejakpublik.id | `AdminJP#2026!` |
| Petugas Lapangan | mdwikurniawan976@gmail.com | `Mdwikurniawan` |
| Petugas Lapangan | petugas@jejak.publik | `petugas123` |

### Hak Akses Akun

- **Administrator:** Dapat mengakses dashboard admin, mengelola laporan masyarakat, melakukan verifikasi laporan, mendeteksi laporan duplikat, menambahkan petugas, melakukan penugasan, serta memvalidasi hasil penanganan.
- **Petugas Lapangan:** Dapat mengakses dashboard petugas, melihat tugas yang diberikan, memperbarui progres penanganan, mengunggah dokumentasi pekerjaan, serta melihat riwayat penanganan.

### Catatan Penggunaan

- Akun di atas disediakan khusus untuk keperluan demonstrasi aplikasi JEJAKPUBLIK.
- Data yang digunakan dalam demonstrasi merupakan data simulasi.
- Setiap akun memiliki hak akses sesuai dengan perannya masing-masing.

## Project Information

| Information | Details |
|---|---|
| Project Name | JEJAKPUBLIK |
| Tagline | Dari Laporan Menjadi Bukti |
| Competition | Multimedia In Action (MIA) 2026 |
| Team | Ayamdikichi |
| Repository | [GitHub Repository](https://github.com/mdwkrnwn/WIA_FSDMIA2026_ayamdikichi) |
| Backend | Supabase |
| Framework | Next.js 16 |

---

**JEJAKPUBLIK — Dari Laporan Menjadi Bukti.**

*Setiap laporan adalah langkah awal menuju perubahan. Setiap penanganan harus menghadirkan bukti.*