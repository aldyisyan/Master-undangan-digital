/**
 * Konfigurasi sinkronisasi cloud.
 *
 * CloudRead dulunya hanya berisi URL + bucket.
 * Sekarang ikut membawa anonKey agar perangkat TAMU
 * bisa menulis wishes.json ke cloud (anon key Supabase
 * adalah publishable key — aman untuk dibagikan).
 */

export interface CloudRead {
  url: string;      // mis. https://abcd.supabase.co
  bucket: string;   // mis. invite
  anonKey?: string;  // publishable anon key — opsional untuk backward compat
}

export interface CloudAdmin extends CloudRead {
  anonKey: string;
}

const READ_KEY = "rk-cloud-read";
const ADMIN_KEY = "rk-cloud-admin";
const LAST_KEY = "rk-cloud-last";

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function getCloudRead(): CloudRead | null {
  return read<CloudRead>(READ_KEY);
}
export function saveCloudRead(cfg: CloudRead) {
  localStorage.setItem(READ_KEY, JSON.stringify(cfg));
}
export function getCloudAdmin(): CloudAdmin | null {
  return read<CloudAdmin>(ADMIN_KEY);
}
export function saveCloudAdmin(cfg: CloudAdmin) {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(cfg));
}
export function clearCloud() {
  localStorage.removeItem(ADMIN_KEY);
}
export function getLastSync(): string | null {
  return localStorage.getItem(LAST_KEY);
}
export function setLastSync(iso: string) {
  localStorage.setItem(LAST_KEY, iso);
}

/** URL publik sebuah objek di bucket */
export function cloudObjectURL(cfg: CloudRead, path: string): string {
  return `${cfg.url}/storage/v1/object/public/${cfg.bucket}/${path}`;
}

/**
 * Encode konfigurasi baca ke parameter URL (?cloud=…).
 * Sekarang ikut membawa anon key agar tamu bisa push wishes.
 */
export function encodeCloudParam(source: CloudRead): string {
  // cari anon key: dari source sendiri, atau dari admin config
  const key = source.anonKey || getCloudAdmin()?.anonKey || "";
  const parts = key
    ? `${source.url}|${source.bucket}|${key}`
    : `${source.url}|${source.bucket}`;
  return encodeURIComponent(parts);
}

export function decodeCloudParam(value: string): CloudRead | null {
  try {
    const decoded = decodeURIComponent(value);
    const [url, bucket = "invite", anonKey] = decoded.split("|");
    if (!url.startsWith("http")) return null;
    return { url, bucket, ...(anonKey ? { anonKey } : {}) };
  } catch {
    return null;
  }
}

/**
 * Mendapatkan CloudAdmin dari sumber yang tersedia:
 * 1) CloudAdmin yang tersimpan di perangkat ini (untuk admin)
 * 2) CloudRead yang membawa anonKey (untuk tamu yang buka dari link)
 */
export function getWritableCloud(): CloudAdmin | null {
  const admin = getCloudAdmin();
  if (admin) return admin;

  const read = getCloudRead();
  if (read?.anonKey) {
    return { url: read.url, bucket: read.bucket, anonKey: read.anonKey };
  }
  return null;
}

/** Bangun tautan halaman tamu; otomatis menyertakan ?cloud bila cloud aktif */
export function guestLink(slug: string): string {
  const base = `${window.location.origin}${window.location.pathname}#/${slug}`;
  const read = getCloudRead();
  return read ? `${base}?cloud=${encodeCloudParam(read)}` : base;
}
