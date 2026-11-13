/**
 * Konfigurasi sinkronisasi cloud.
 * - CloudRead  : cukup URL + nama bucket. Ikut tertanam di URL tamu (?cloud=…)
 *                sehingga perangkat TAMU bisa membaca pengaturan terbaru.
 * - CloudAdmin : URL + anon key, hanya tersimpan di perangkat ADMIN
 *                (dipakai untuk mengunggah settings & media).
 */

export interface CloudRead {
  url: string;    // mis. https://abcd.supabase.co
  bucket: string; // mis. invite
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

/** Encode konfigurasi baca ke parameter URL (?cloud=…) */
export function encodeCloudParam(read: CloudRead): string {
  return encodeURIComponent(`${read.url}|${read.bucket}`);
}

export function decodeCloudParam(value: string): CloudRead | null {
  try {
    const decoded = decodeURIComponent(value);
    const [url, bucket = "invite"] = decoded.split("|");
    if (!url.startsWith("http")) return null;
    return { url, bucket };
  } catch {
    return null;
  }
}

/** Bangun tautan halaman tamu; otomatis menyertakan ?cloud bila cloud aktif */
export function guestLink(slug: string): string {
  const base = `${window.location.origin}${window.location.pathname}#/${slug}`;
  const read = getCloudRead();
  return read ? `${base}?cloud=${encodeCloudParam(read)}` : base;
}
