import { useEffect, useState } from "react";
import { cloudObjectURL, getCloudRead } from "./cloudConfig";

/**
 * Penyimpanan file media (foto & audio) berbasis IndexedDB —
 * aman untuk file berukuran besar, tidak terkena batas 5MB localStorage.
 * Nilai yang disimpan di pengaturan hanya berupa referensi "media:<key>".
 */

const DB_NAME = "rk-invite-media";
const STORE = "media";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

export async function saveMedia(key: string, blob: Blob): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  bustCache(key);
}

export async function readMedia(key: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve((req.result as Blob) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function removeMedia(key: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  bustCache(key);
}

export async function clearMedia(): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  urlCache.forEach((url) => {
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
  });
  urlCache.clear();
}

/* ---------------- referensi & resolver ---------------- */

const urlCache = new Map<string, string>();

function bustCache(key: string) {
  const old = urlCache.get(key);
  if (old) {
    if (old.startsWith("blob:")) URL.revokeObjectURL(old);
    urlCache.delete(key);
  }
}

export const mediaRef = (key: string) => `media:${key}`;
export const isMediaRef = (v?: string | null): v is string => !!v && v.startsWith("media:");

/**
 * Ubah referensi ("media:key" | "/path" | "https://…") menjadi URL siap pakai.
 * Prioritas: salinan lokal (IndexedDB) → URL cloud (untuk perangkat tamu).
 */
export async function resolveSrc(value: string): Promise<string> {
  if (!isMediaRef(value)) return value;
  const key = value.slice(6);
  const cached = urlCache.get(key);
  if (cached) return cached;

  const blob = await readMedia(key);
  if (blob) {
    const url = URL.createObjectURL(blob);
    urlCache.set(key, url);
    return url;
  }

  const read = getCloudRead();
  if (read) {
    const url = cloudObjectURL(read, `media/${key}`);
    urlCache.set(key, url);
    return url;
  }
  return "";
}

/** Hook React: resolve sumber media secara reaktif */
export function useMediaSrc(value?: string | null): string {
  const [src, setSrc] = useState<string>(() => (isMediaRef(value) ? "" : (value ?? "")));

  useEffect(() => {
    let alive = true;
    if (!value) {
      setSrc("");
    } else if (!isMediaRef(value)) {
      setSrc(value);
    } else {
      resolveSrc(value).then((url) => alive && setSrc(url));
    }
    return () => {
      alive = false;
    };
  }, [value]);

  return src;
}
