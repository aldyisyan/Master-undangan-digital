/** Penyimpanan RSVP & ucapan (localStorage per perangkat) */

export interface Wish {
  name: string;
  attend: "hadir" | "ragu" | "tidak";
  /** Jumlah orang yang ikut hadir (termasuk pengisi) — hanya saat attend = "hadir" */
  count?: number;
  message: string;
  at: number;
}

export const WISHES_KEY = "rk-wedding-wishes";

export const seedWishes: Wish[] = [
  { name: "Keluarga Wijaya", attend: "hadir", count: 4, message: "Selamat Kirana & Rangga! Semoga menjadi keluarga sakinah, mawaddah, warahmah.", at: 1 },
  { name: "Nadia", attend: "hadir", count: 1, message: "AAA akhirnya! Nggak sabar lihat kalian di pelaminan. Bahagia selalu ya!", at: 2 },
  { name: "Bima & Rara", attend: "ragu", message: "Barakallahu lakuma! Semoga lancar sampai hari H. Kami usahakan hadir!", at: 3 },
];

export function loadWishes(): Wish[] {
  try {
    const raw = localStorage.getItem(WISHES_KEY);
    return raw ? (JSON.parse(raw) as Wish[]) : [...seedWishes];
  } catch {
    return [...seedWishes];
  }
}

export function saveWishes(wishes: Wish[]): void {
  try {
    localStorage.setItem(WISHES_KEY, JSON.stringify(wishes));
  } catch {
    /* abaikan */
  }
}

/** Hapus total → juga menghapus contoh bawaan sampai tamu pertama mengisi */
export function wipeWishes(): void {
  saveWishes([]);
}

/** Kembalikan ke contoh awal */
export function restoreSeedWishes(): void {
  saveWishes([...seedWishes]);
}
