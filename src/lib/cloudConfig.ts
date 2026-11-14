/**
 * Konfigurasi sinkronisasi cloud.
 *
 * Link tamu sekarang hanya membawa project ref pendek (?c=xpnpoqxljn).
 * Saat dibuka, app fetch cloud.json dari Supabase untuk mendapat config
 * lengkap (url, bucket, anonKey). Sangat pendek & bersih.
 */

export interface CloudRead {
  url: string;
  bucket: string;
  anonKey?: string;
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

/* =================== SHORT CLOUD PARAM =================== */

/**
 * Ekstrak project ref dari Supabase URL.
 * https://xpnpoqxljn.supabase.co → xpnpoqxljn
 */
export function extractRef(url: string): string {
  const m = url.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return m ? m[1] : "";
}

/**
 * Encode cloud config menjadi string pendek untuk parameter URL.
 * Format: hanya project ref (mis. "xpnpoqxljn")
 * Anon key & bucket tersimpan di cloud.json — tidak perlu di URL.
 */
export function encodeCloudParam(_source?: CloudRead): string {
  const admin = getCloudAdmin();
  const source = _source || getCloudRead();
  const url = admin?.url || source?.url || "";
  return extractRef(url);
}

/**
 * Decode parameter cloud dari URL.
 * Mendukung 2 format:
 * - Baru (pendek): "xpnpoqxljn" → project ref saja
 * - Lama (panjang): "https://...supabase.co|invite|eyJ..." → backward compat
 */
export function decodeCloudParam(value: string): CloudRead | null {
  try {
    const decoded = decodeURIComponent(value);

    // format lama: url|bucket|anonKey
    if (decoded.startsWith("http")) {
      const [url, bucket = "invite", anonKey] = decoded.split("|");
      return { url, bucket, ...(anonKey ? { anonKey } : {}) };
    }

    // format baru: hanya project ref
    const ref = decoded.trim();
    if (/^[a-z0-9-]+$/i.test(ref) && ref.length >= 6) {
      return {
        url: `https://${ref}.supabase.co`,
        bucket: "invite",
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Resolve cloud config lengkap dari project ref pendek.
 * Fetch cloud.json dari Supabase untuk mendapat anonKey.
 */
export async function resolveCloudFromRef(ref: string): Promise<CloudRead | null> {
  try {
    const url = `https://${ref}.supabase.co`;
    const res = await fetch(
      `${url}/storage/v1/object/public/invite/site/cloud.json?t=${Date.now()}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data && typeof data.anonKey === "string") {
      return {
        url: data.url || url,
        bucket: data.bucket || "invite",
        anonKey: data.anonKey,
      };
    }
    return { url, bucket: "invite" };
  } catch {
    return null;
  }
}

/**
 * Mendapatkan CloudAdmin dari sumber yang tersedia:
 * 1) CloudAdmin yang tersimpan di perangkat ini
 * 2) CloudRead yang membawa anonKey
 */
export function getWritableCloud(): CloudAdmin | null {
  const admin = getCloudAdmin();
  if (admin) return admin;

  const r = getCloudRead();
  if (r?.anonKey) {
    return { url: r.url, bucket: r.bucket, anonKey: r.anonKey };
  }
  return null;
}

/** Bangun tautan halaman tamu — sekarang pendek */
export function guestLink(slug: string): string {
  const base = `${window.location.origin}${window.location.pathname}#/${slug}`;
  const ref = encodeCloudParam();
  return ref ? `${base}?c=${ref}` : base;
}
