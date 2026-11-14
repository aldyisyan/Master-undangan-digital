/**
 * Penyimpanan RSVP & ucapan — terpusat dengan subscriber reaktif.
 * - Tamu mengisi form → tersimpan lokal → langsung terupload ke cloud (bila aktif)
 * - Admin membuka tab Ucapan → pull dari cloud → state terupdate realtime
 * - Hapus/wipe di admin → langsung sync ke cloud
 */
import { useSyncExternalStore } from "react";

export interface Wish {
  name: string;
  attend: "hadir" | "ragu" | "tidak";
  /** Jumlah orang yang ikut hadir (termasuk pengisi) */
  count?: number;
  message: string;
  at: number;
}

export const WISHES_KEY = "rk-wedding-wishes-v2";

export const seedWishes: Wish[] = [
  {
    name: "Keluarga Wijaya",
    attend: "hadir",
    count: 4,
    message: "Selamat! Semoga menjadi keluarga sakinah, mawaddah, warahmah.",
    at: 1,
  },
  {
    name: "Nadia",
    attend: "hadir",
    count: 1,
    message: "AAA akhirnya! Nggak sabar lihat kalian di pelaminan. Bahagia selalu ya!",
    at: 2,
  },
  {
    name: "Bima & Rara",
    attend: "ragu",
    message: "Barakallahu lakuma! Semoga lancar sampai hari H. Kami usahakan hadir!",
    at: 3,
  },
];

/* ========================= STORE TERPUSAT ========================= */

let _state: Wish[] = _load();
const _listeners = new Set<() => void>();

function _load(): Wish[] {
  try {
    const raw = localStorage.getItem(WISHES_KEY);
    if (!raw) return [...seedWishes];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Wish[]) : [...seedWishes];
  } catch {
    return [...seedWishes];
  }
}

function _commit(next: Wish[], persist = true): void {
  _state = next;
  if (persist) {
    try {
      localStorage.setItem(WISHES_KEY, JSON.stringify(next));
    } catch {
      /* storage penuh */
    }
  }
  _listeners.forEach((l) => l());
}

/** Hook reaktif — semua komponen otomatis re-render saat wishes berubah */
export function useWishes(): Wish[] {
  return useSyncExternalStore(
    (cb) => {
      _listeners.add(cb);
      return () => _listeners.delete(cb);
    },
    () => _state,
  );
}

export function loadWishes(): Wish[] {
  return _state;
}

/** Tambah satu ucapan baru (dari form tamu) */
export function addWish(wish: Wish): void {
  _commit([wish, ..._state]);
}

/** Simpan array ucapan penuh (dari cloud/import) */
export function saveWishes(wishes: Wish[]): void {
  _commit(wishes);
}

/** Ganti state dari cloud tanpa persist ulang ke localStorage (sudah segar dari cloud) */
export function replaceWishesFromCloud(wishes: Wish[]): void {
  _commit(wishes, false);
  // simpan tetap agar tersedia offline
  try {
    localStorage.setItem(WISHES_KEY, JSON.stringify(wishes));
  } catch {
    /* abaikan */
  }
}

/** Hapus satu ucapan */
export function removeWish(wish: Wish): Wish[] {
  const next = _state.filter((x) => !(x.at === wish.at && x.name === wish.name));
  _commit(next);
  return next;
}

/** Hapus semua */
export function wipeWishes(): void {
  _commit([]);
}

/** Kembalikan ke contoh awal */
export function restoreSeedWishes(): void {
  _commit([...seedWishes]);
}
