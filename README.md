# JEJAKPUBLIK — Dari Laporan Menjadi Bukti

JEJAKPUBLIK adalah platform pelaporan masyarakat untuk permasalahan infrastruktur dan lingkungan publik. Masyarakat dapat mengirim laporan tanpa akun, memantau proses penanganan, dan melihat bukti penyelesaian melalui ID tiket.

## Team Ayamdikichi

- Pandhu Arya M
- M. Dwi Kurniawan
- Bagas Satrio W

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL & Backend)
- Leaflet & React Leaflet (Peta)
- Lucide React (Icons)

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

Buat file `.env.local` di root directory project.

Isi dengan konfigurasi Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ebxjzrsgtxpjxefsrhvw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_GnApl6c8IBH-OEU37z1jKA_GfQ-w0AT
```

Ganti `YOUR_SUPABASE_PUBLISHABLE_KEY` dengan publishable key dari project Supabase.

Jangan membagikan file `.env.local` ke repository publik.

### 4. Run Development Server

```bash
npm run dev
```

Buka browser melalui:

```text
http://localhost:3000
```

## Development Progress

| Fitur | Status |
|---|---|
| Landing Page | Completed |
| Form Pelaporan | Completed |
| Supabase Integration | In Progress |
| Admin Authentication | Planned |
| Petugas Authentication | Planned |
| Admin Dashboard | Planned |
| Petugas Dashboard | Planned |
| Report Verification | Planned |
| Field Assignment | Planned |
| Evidence Validation | Planned |

## Application Workflow

1. Masyarakat mengirim laporan tanpa akun.
2. Sistem menghasilkan ID tiket.
3. Admin memverifikasi laporan.
4. Admin meneruskan laporan yang disetujui kepada petugas.
5. Petugas melakukan penanganan dan mengirim dokumentasi.
6. Admin memvalidasi hasil penanganan.
7. Masyarakat memantau progres dan bukti penyelesaian melalui ID tiket.

## Project Information

**Project:** JEJAKPUBLIK  
**Tagline:** Dari Laporan Menjadi Bukti  
**Competition:** Multimedia In Action (MIA) 2026  
**Team:** Ayamdikichi  
**Repository:** https://github.com/mdwkrnwn/WIA_FSDMIA2026_ayamdikichi

