import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


// =====================================================
// SUPABASE CONFIGURATION (SERVER ONLY)
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Mendukung nama variabel baru maupun lama.
// Pastikan salah satunya tersedia di .env.local.
const serviceRoleKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  throw new Error("Konfigurasi Supabase belum lengkap. Periksa .env.local.");
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// =====================================================
// HELPER: VALIDASI ADMIN
// =====================================================

async function authorizeAdmin(request: NextRequest) {
  const authorization = request.headers.get("Authorization");

  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return {
      user: null,
      error: "Sesi login tidak ditemukan.",
      status: 401,
    };
  }

  const supabaseAuth = createClient(supabaseUrl!, anonKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabaseAuth.auth.getUser(token);

  if (userError || !user) {
    return {
      user: null,
      error: "Sesi login tidak valid.",
      status: 401,
    };
  }

  const { data: adminProfile, error: adminError } = await supabaseAdmin
    .from("user_profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError) {
    console.error("ADMIN PROFILE ERROR:", adminError);

    return {
      user: null,
      error: "Gagal memeriksa profil admin.",
      status: 500,
    };
  }

  if (!adminProfile) {
    return {
      user: null,
      error: "Profil admin tidak ditemukan.",
      status: 403,
    };
  }

  if (adminProfile.role !== "admin" || adminProfile.is_active !== true) {
    return {
      user: null,
      error: "Akses hanya untuk admin aktif.",
      status: 403,
    };
  }

  return {
    user,
    error: null,
    status: 200,
  };
}

// =====================================================
// GET: MENGAMBIL DAFTAR PETUGAS
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeAdmin(request);

    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .select("id, full_name, email, phone, role, is_active, created_at")
      .eq("role", "petugas")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      users: data ?? [],
    });
  } catch (error) {
    console.error("FETCH OFFICERS ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data petugas.",
      },
      { status: 500 },
    );
  }
}

// =====================================================
// POST: MENGUNDANG PETUGAS BARU
// =====================================================

export async function POST(request: NextRequest) {
  try {
    // 1. Validasi admin
    const auth = await authorizeAdmin(request);

    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // 2. Ambil dan validasi input
    const body = await request.json();

    const fullName = String(body.full_name ?? "").trim();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const phone = String(body.phone ?? "").trim();

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Nama lengkap dan email wajib diisi." },
        { status: 400 },
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 },
      );
    }

    // 3. Periksa apakah email sudah memiliki profil
    const { data: existingProfile, error: existingError } = await supabaseAdmin
      .from("user_profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existingProfile) {
      return NextResponse.json(
        { error: "Email tersebut sudah terdaftar." },
        { status: 409 },
      );
    }

    // 4. Validasi URL aplikasi
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL belum dikonfigurasi.");
    }

    // 5. Kirim undangan melalui Supabase Auth
    const { data: inviteData, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${appUrl}/auth/confirm`,
        data: {
          full_name: fullName,
        },
      });

    if (inviteError) throw inviteError;

    const invitedUser = inviteData.user;

    if (!invitedUser) {
      throw new Error("Supabase tidak mengembalikan data pengguna.");
    }

    // 6. Simpan role pada app_metadata
    const { error: metadataError } =
      await supabaseAdmin.auth.admin.updateUserById(invitedUser.id, {
        app_metadata: {
          role: "petugas",
        },
      });

    if (metadataError) {
      console.error("UPDATE ROLE ERROR:", metadataError);

      return NextResponse.json(
        {
          error:
            "Undangan terkirim, tetapi penetapan role gagal. Perlu pemeriksaan admin.",
          user_id: invitedUser.id,
        },
        { status: 500 },
      );
    }

    // 7. Simpan profil petugas
    const { error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .insert({
        id: invitedUser.id,
        full_name: fullName,
        email,
        phone: phone || null,
        role: "petugas",
        is_active: true,
      });

    if (profileError) {
      console.error("INSERT PROFILE ERROR:", profileError);

      return NextResponse.json(
        {
          error:
            "Undangan terkirim, tetapi penyimpanan profil gagal. Perlu pemeriksaan admin.",
          user_id: invitedUser.id,
        },
        { status: 500 },
      );
    }

    // 8. Respons berhasil
    return NextResponse.json(
      {
        success: true,
        message: `Undangan berhasil dikirim ke ${email}.`,
        user: {
          id: invitedUser.id,
          full_name: fullName,
          email,
          phone,
          role: "petugas",
          is_active: true,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("INVITE OFFICER ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mengundang petugas.",
      },
      { status: 500 },
    );
  }
}
