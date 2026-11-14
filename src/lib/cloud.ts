/**
 * Sinkronisasi cloud via Supabase Storage (REST murni, tanpa SDK).
 * - Tamu membaca settings.json lewat URL publik (tanpa API key).
 * - Admin mengunggah settings + media dengan anon key di perangkatnya.
 */
import type { InvitationSettings } from "./settings";
import { replaceSettings } from "./settings";
import { readMedia, isMediaRef } from "./mediaStore";
import { replaceWishesFromCloud, type Wish } from "./wishes";
import {
  type CloudAdmin,
  type CloudRead,
  cloudObjectURL,
  getCloudRead,
  setLastSync,
} from "./cloudConfig";

/* ------------------------------ BACA (tamu) ------------------------------ */

export async function fetchRemoteSettings(read: CloudRead): Promise<unknown | null> {
  try {
    const url = `${cloudObjectURL(read, "site/settings.json")}?t=${Date.now()}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/* ---------------------- baca wishes dari cloud ---------------------- */

export async function fetchRemoteWishes(read: CloudRead): Promise<Wish[] | null> {
  try {
    const url = `${cloudObjectURL(read, "site/wishes.json")}?t=${Date.now()}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? (data as Wish[]) : null;
  } catch {
    return null;
  }
}

/** Tarik pengaturan + wishes terbaru dari cloud & terapkan ke aplikasi */
export async function pullFromCloud(): Promise<boolean> {
  const read = getCloudRead();
  if (!read) return false;

  // pull settings & wishes secara paralel
  const [remote, remoteWishes] = await Promise.all([
    fetchRemoteSettings(read),
    fetchRemoteWishes(read),
  ]);

  let ok = false;
  if (remote) {
    replaceSettings(remote);
    ok = true;
  }
  if (remoteWishes) {
    replaceWishesFromCloud(remoteWishes);
    ok = true;
  }
  return ok;
}

/** Upload wishes.json ke cloud (dipanggil setiap kali wishes berubah) */
export async function pushWishesToCloud(admin: CloudAdmin, wishes: Wish[]): Promise<boolean> {
  const json = new Blob([JSON.stringify(wishes)], { type: "application/json" });
  return uploadObject(admin, "site/wishes.json", json, "application/json; charset=utf-8");
}

/** Pull hanya wishes dari cloud (untuk polling di halaman undangan) */
export async function pullWishesOnly(): Promise<boolean> {
  const read = getCloudRead();
  if (!read) return false;
  const remote = await fetchRemoteWishes(read);
  if (!remote) return false;
  replaceWishesFromCloud(remote);
  return true;
}

/* ------------------------------ TULIS (admin) ------------------------------ */

async function uploadObject(
  admin: CloudAdmin,
  path: string,
  blob: Blob,
  contentType: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${admin.url}/storage/v1/object/${admin.bucket}/${path}`, {
      method: "POST",
      headers: {
        apikey: admin.anonKey,
        authorization: `Bearer ${admin.anonKey}`,
        "content-type": contentType,
        "x-upsert": "true",
      },
      body: blob,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export interface CloudTestResult {
  ok: boolean;
  status?: number;
  hint?: string;
}

/** Uji koneksi sekaligus verifikasi policy unggah — dengan diagnosa penyebab */
export async function testCloudConnection(admin: CloudAdmin): Promise<CloudTestResult> {
  // validasi format sebelum mengirim request
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(admin.url)) {
    return {
      ok: false,
      hint: "Format Project URL salah. Harus seperti https://abcdefgh.supabase.co — BUKAN alamat halaman dashboard (supabase.com/dashboard/…).",
    };
  }
  if (!admin.anonKey.startsWith("eyJ") && !admin.anonKey.startsWith("sb_publishable")) {
    return {
      ok: false,
      hint: "Kunci yang dimasukkan tidak tampak seperti anon/publishable key (harus diawali 'eyJ' atau 'sb_publishable_'). Salin kunci anon public dari Project Settings → API.",
    };
  }
  if (admin.anonKey.startsWith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9") === false && admin.anonKey.length < 25) {
    return {
      ok: false,
      hint: "Kunci tampak terpotong — anon key asli sangat panjang. Salin ulang hingga karakter terakhir.",
    };
  }

  try {
    const res = await fetch(`${admin.url}/storage/v1/object/${admin.bucket}/site/ping.txt`, {
      method: "POST",
      headers: {
        apikey: admin.anonKey,
        authorization: `Bearer ${admin.anonKey}`,
        "content-type": "text/plain",
        "x-upsert": "true",
      },
      body: new Blob(["ok"], { type: "text/plain" }),
    });
    if (res.ok) return { ok: true };

    let serverMsg = "";
    try {
      const body = await res.json();
      serverMsg = String(body?.message || body?.error || "");
    } catch {
      /* bukan json */
    }

    if (res.status === 403 || /row.level security/i.test(serverMsg)) {
      return {
        ok: false,
        status: res.status,
        hint: "Izin ditolak oleh RLS. Jalankan ulang SQL 4 policy di langkah 3: SELECT, INSERT, UPDATE, dan DELETE untuk role anon. Policy SELECT wajib karena proses upsert perlu membaca file sebelum memperbaruinya.",
      };
    }
    if (/bucket not found/i.test(serverMsg) || res.status === 404) {
      return {
        ok: false,
        status: res.status,
        hint: `Bucket "${admin.bucket}" tidak ditemukan. Nama peka huruf besar/kecil — di menu Storage buat bucket bernama persis "${admin.bucket}" dan aktifkan toggle Public.`,
      };
    }
    if (res.status === 401 || /invalid api key|invalid jwt|jwt/i.test(serverMsg)) {
      return {
        ok: false,
        status: res.status,
        hint: "API key ditolak Supabase. Pakai kunci 'anon public' (atau 'Publishable key' pada dashboard baru) — BUKAN service_role/secret key.",
      };
    }
    if (/mime/i.test(serverMsg)) {
      return {
        ok: false,
        status: res.status,
        hint: "Bucket membatasi jenis file. Storage → klik bucket → Edit → kosongkan 'Allowed MIME types'.",
      };
    }
    if (res.status === 503 || res.status === 502) {
      return {
        ok: false,
        status: res.status,
        hint: "Project Supabase sedang pause/tidak aktif (free tier tidur bila lama tak dipakai). Buka dashboard Supabase Anda → klik Restore/Resume project, lalu coba lagi.",
      };
    }
    return {
      ok: false,
      status: res.status,
      hint: `Supabase menjawab error ${res.status}${serverMsg ? `: ${serverMsg}` : ""}. Simpan pesan ini sebagai petunjuk.`,
    };
  } catch {
    return {
      ok: false,
      hint: "Server tidak dapat dijangkau sama sekali — periksa ejaan Project URL dan koneksi internet Anda.",
    };
  }
}

/** Kumpulkan semua referensi media yang ada di pengaturan */
function collectMediaRefs(s: InvitationSettings): string[] {
  const refs: string[] = [];
  const push = (v?: string) => {
    if (v && isMediaRef(v)) refs.push(v.slice(6));
  };
  push(s.backgroundImage);
  push(s.quotePhoto);
  push(s.bride.photo);
  push(s.groom.photo);
  push(s.venue.photo);
  push(s.music);
  push(s.voiceNote?.src);
  s.gallery?.forEach((g) => push(g));
  s.guests.forEach((g) => push(g.voiceSrc));
  return [...new Set(refs)];
}

/**
 * Unggah semua media (foto, voice note, musik) dari IndexedDB perangkat ini
 * ke bucket cloud, lalu unggah settings.json terbaru.
 */
export async function syncToCloud(
  admin: CloudAdmin,
  settings: InvitationSettings,
  onProgress?: (done: number, total: number) => void,
): Promise<boolean> {
  try {
    const keys = collectMediaRefs(settings);
    let done = 0;
    // +2: settings.json + wishes.json
    const total = keys.length + 2;

    for (const key of keys) {
      const blob = await readMedia(key);
      if (blob) {
        const ok = await uploadObject(admin, `media/${key}`, blob, blob.type || "application/octet-stream");
        if (!ok) return false;
      }
      onProgress?.(++done, total);
    }

    // upload settings.json
    const json = new Blob([JSON.stringify(settings)], { type: "application/json" });
    const okSettings = await uploadObject(admin, "site/settings.json", json, "application/json; charset=utf-8");
    if (!okSettings) return false;
    onProgress?.(++done, total);

    // upload wishes.json — import dinamis untuk hindari circular dependency
    const { loadWishes } = await import("./wishes");
    const wishesBlob = new Blob([JSON.stringify(loadWishes())], { type: "application/json" });
    await uploadObject(admin, "site/wishes.json", wishesBlob, "application/json; charset=utf-8");
    onProgress?.(++done, total);

    setLastSync(new Date().toISOString());
    return true;
  } catch {
    return false;
  }
}
