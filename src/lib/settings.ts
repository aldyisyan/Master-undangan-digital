import { useSyncExternalStore } from "react";
import {
  couple as defaultCouple,
  guests as defaultGuests,
  generalGuest,
  type GuestCategory,
} from "../data/config";

/* ============================== TIPE ============================== */

export interface PersonInfo {
  name: string;
  short: string;
  parents: string;
  /** "/images/…" | "https://…" | "media:<key>" */
  photo: string;
}

export interface EventItem {
  title: string;
  time: string;
  date: string;
  note: string;
}

export interface VenueInfo {
  name: string;
  address: string;
  mapsUrl: string;
  mapsEmbed: string;
  photo: string;
}

export interface GiftAccount {
  bank: string;
  number: string;
  holder: string;
}

/** Seluruh warna yang dapat diubah dari panel admin */
export interface Palette {
  ivory: string;      // latar utama halaman
  cream: string;      // latar kartu
  paper: string;      // latar lembut di dalam kartu
  forest: string;     // warna utama (tombol, kartu gelap)
  forestDeep: string; // footer / panel admin
  gold: string;       // aksen emas utama
  goldLight: string;  // emas terang (teks di atas gelap)
  goldDark: string;   // emas gelap (label kecil)
  ink: string;        // warna teks
  sage: string;       // hijau daun dekoratif
  rose: string;       // aksen lembut / kelopak
}

export type GuestPage = GuestCategory;

/** Pengaturan voice note — satu untuk seluruh undangan, bisa dimatikan */
export interface VoiceNoteSettings {
  /** false = bagian voice note hilang total dari halaman undangan */
  enabled: boolean;
  src: string;
  title: string;
  hint: string;
  transcript: string;
}

export interface InvitationSettings {
  /** mempelai wanita — selalu ditampilkan lebih dahulu */
  bride: PersonInfo;
  groom: PersonInfo;
  hashtag: string;
  dateISO: string;
  dateLabel: string;
  events: EventItem[];
  venue: VenueInfo;
  gifts: GiftAccount[];
  kadoAddress: string;
  music: string;
  /** Foto latar hero/sampul — kosong = motif floral bawaan */
  backgroundImage: string;
  /** Kekuatan lapisan peredam di atas foto latar (0–90) */
  backgroundDim: number;
  quotePhoto: string;
  guests: GuestPage[];
  voiceNote: VoiceNoteSettings;
  /** Galeri foto prawedding — tiap entri: "/images/…" | "https://…" | "media:<key>" */
  gallery: string[];
  adminPin: string;
  colors: Palette;
  /** id template tata letak (lihat lib/layouts.ts) */
  layout: string;
  /** id paket font (lihat lib/typography.ts) */
  fontId: string;
  /** id template sampul (Cover) */
  coverLayout: string;
}

/* ============================ BAWAAN ============================= */

export const DEFAULT_SETTINGS: InvitationSettings = {
  bride: { ...defaultCouple.bride },
  groom: { ...defaultCouple.groom },
  hashtag: defaultCouple.hashtag,
  dateISO: defaultCouple.dateISO,
  dateLabel: defaultCouple.dateLabel,
  events: defaultCouple.events.map((e) => ({ ...e })),
  venue: { ...defaultCouple.venue },
  gifts: defaultCouple.gifts.map((g) => ({ ...g })),
  kadoAddress: "Jl. Kenanga Raya No. 12, Kebayoran Baru, Jakarta Selatan",
  music: defaultCouple.music,
  backgroundImage: "",
  backgroundDim: 55,
  quotePhoto: "/images/couple.jpg",
  guests: defaultGuests.map((g) => ({ ...g })),
  voiceNote: {
    enabled: true,
    src: generalGuest.voiceSrc,
    title: "Pesan Suara untuk Anda",
    hint: "Salam hangat dari kami berdua",
    transcript: generalGuest.transcript,
  },
  gallery: ["/images/couple.jpg", "/images/bride.jpg", "/images/groom.jpg"],
  adminPin: "140626",
  layout: "klasik",
  fontId: "klasik",
  coverLayout: "frosted-glass",
  colors: {
    ivory: "#f6f1e5",
    cream: "#fbf8ef",
    paper: "#efe7d4",
    forest: "#35412d",
    forestDeep: "#262f20",
    gold: "#b08d57",
    goldLight: "#d9c193",
    goldDark: "#8a6a3b",
    ink: "#3c392e",
    sage: "#7d8c6e",
    rose: "#c9a08c",
  },
};

/* ============================= STORE ============================= */

const KEY = "rk-invite-settings-v1";

function merge(stored: unknown): InvitationSettings {
  const base = structuredClone(DEFAULT_SETTINGS);
  if (!stored || typeof stored !== "object") return base;
  const s = stored as Partial<InvitationSettings>;
  const merged: InvitationSettings = { ...base, ...s };
  merged.bride = { ...base.bride, ...(s.bride ?? {}) };
  merged.groom = { ...base.groom, ...(s.groom ?? {}) };
  merged.venue = { ...base.venue, ...(s.venue ?? {}) };
  merged.colors = { ...base.colors, ...(s.colors ?? {}) };
  merged.events =
    Array.isArray(s.events) && s.events.length >= 2
      ? s.events.slice(0, 2).map((e, i) => ({ ...base.events[i], ...e }))
      : base.events;
  merged.gifts =
    Array.isArray(s.gifts) && s.gifts.length >= 2
      ? s.gifts.slice(0, 2).map((g, i) => ({ ...base.gifts[i], ...g }))
      : base.gifts;
  merged.guests = base.guests.map((g) => ({
    ...g,
    ...((s.guests ?? []).find((x) => x?.slug === g.slug) ?? {}),
    slug: g.slug,
  }));
  merged.voiceNote = { ...base.voiceNote, ...(s.voiceNote ?? {}) };
  merged.gallery =
    Array.isArray(s.gallery) && s.gallery.every((x) => typeof x === "string")
      ? [...(s.gallery as string[])]
      : base.gallery;
  merged.adminPin = typeof s.adminPin === "string" && s.adminPin ? s.adminPin : base.adminPin;
  return merged;
}

function load(): InvitationSettings {
  try {
    const raw = localStorage.getItem(KEY);
    return merge(raw ? JSON.parse(raw) : null);
  } catch {
    return structuredClone(DEFAULT_SETTINGS);
  }
}

let state: InvitationSettings = load();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getSettings(): InvitationSettings {
  return state;
}

export function saveSettings(next: InvitationSettings): void {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* penyimpanan penuh — abaikan */
  }
  emit();
}

export function resetSettings(): void {
  state = structuredClone(DEFAULT_SETTINGS);
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* abaikan */
  }
  emit();
}

/** Ganti seluruh pengaturan dari sumber luar (sinkronisasi cloud) */
export function replaceSettings(remote: unknown): void {
  state = merge(remote);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* penyimpanan penuh — abaikan */
  }
  emit();
}

export function useSettings(): InvitationSettings {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}

/** Cari halaman tamu berdasar slug rute */
export function findGuest(settings: InvitationSettings, slug: string): GuestPage | undefined {
  return settings.guests.find((g) => g.slug === slug);
}
