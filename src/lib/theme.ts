import type { Palette } from "./settings";

/** Metadata setiap warna yang bisa diubah: label, kelompok, dan variabel CSS tujuan */
export const PALETTE_FIELDS: {
  key: keyof Palette;
  label: string;
  group: string;
  cssVar: string;
}[] = [
  { key: "ivory", label: "Latar Halaman", group: "Latar & Kartu", cssVar: "--pal-ivory" },
  { key: "cream", label: "Latar Kartu", group: "Latar & Kartu", cssVar: "--pal-cream" },
  { key: "paper", label: "Latar Lembut", group: "Latar & Kartu", cssVar: "--pal-paper" },
  { key: "gold", label: "Emas Utama", group: "Aksen Emas", cssVar: "--pal-gold" },
  { key: "goldLight", label: "Emas Terang", group: "Aksen Emas", cssVar: "--pal-gold-light" },
  { key: "goldDark", label: "Emas Gelap", group: "Aksen Emas", cssVar: "--pal-gold-dark" },
  { key: "forest", label: "Warna Utama (Tombol & Kartu Gelap)", group: "Warna Pokok", cssVar: "--pal-forest" },
  { key: "forestDeep", label: "Warna Pekat (Footer & Admin)", group: "Warna Pokok", cssVar: "--pal-forest-deep" },
  { key: "ink", label: "Warna Teks", group: "Warna Pokok", cssVar: "--pal-ink" },
  { key: "sage", label: "Hijau Daun Dekoratif", group: "Sentuhan Lembut", cssVar: "--pal-sage" },
  { key: "rose", label: "Rose / Kelopak", group: "Sentuhan Lembut", cssVar: "--pal-rose" },
];

/** Terapkan palet ke seluruh dokumen (langsung mengubah semua utilitas warna) */
export function applyPalette(p: Palette) {
  const root = document.documentElement;
  for (const f of PALETTE_FIELDS) {
    if (p[f.key]) root.style.setProperty(f.cssVar, p[f.key]);
  }
}

/* --------------------------- preset tema --------------------------- */

export interface ThemePreset {
  name: string;
  desc: string;
  colors: Palette;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: "Ivory Klasik",
    desc: "Hangat, anggun, tak lekang waktu",
    colors: {
      ivory: "#f6f1e5", cream: "#fbf8ef", paper: "#efe7d4",
      forest: "#35412d", forestDeep: "#262f20",
      gold: "#b08d57", goldLight: "#d9c193", goldDark: "#8a6a3b",
      ink: "#3c392e", sage: "#7d8c6e", rose: "#c9a08c",
    },
  },
  {
    name: "Sage Alami",
    desc: "Hijau lembut bernuansa taman",
    colors: {
      ivory: "#f0f3ea", cream: "#f8faf3", paper: "#e2e8d6",
      forest: "#41503a", forestDeep: "#2e3828",
      gold: "#a78f5f", goldLight: "#cbbb93", goldDark: "#826c41",
      ink: "#3c4034", sage: "#7d8c6e", rose: "#c0a58c",
    },
  },
  {
    name: "Terracotta",
    desc: "Earthy, hangat, dan rustic",
    colors: {
      ivory: "#f7efe4", cream: "#fdf7ec", paper: "#eedece",
      forest: "#5a4130", forestDeep: "#3f2d1f",
      gold: "#c07c46", goldLight: "#dea877", goldDark: "#96582a",
      ink: "#453729", sage: "#94896b", rose: "#cf8d68",
    },
  },
  {
    name: "Navy Royale",
    desc: "Biru malam berkelas dengan emas",
    colors: {
      ivory: "#eef1f7", cream: "#f7f9fd", paper: "#dee4f0",
      forest: "#2c3e63", forestDeep: "#1d2a47",
      gold: "#b08d57", goldLight: "#d3bc90", goldDark: "#86683c",
      ink: "#363b46", sage: "#75849c", rose: "#c1a190",
    },
  },
  {
    name: "Blush Rosé",
    desc: "Merah muda lembut nan romantis",
    colors: {
      ivory: "#faf2ef", cream: "#fdf8f5", paper: "#f1e0da",
      forest: "#5c4046", forestDeep: "#402c31",
      gold: "#bb8a68", goldLight: "#dcb69b", goldDark: "#90624a",
      ink: "#473a38", sage: "#a09384", rose: "#d79b8d",
    },
  },
  {
    name: "Zamrud Agung",
    desc: "Hijau zamrud pekat dan mewah",
    colors: {
      ivory: "#f2f0e4", cream: "#faf8ec", paper: "#e6e2cd",
      forest: "#1f4a38", forestDeep: "#143225",
      gold: "#c2a253", goldLight: "#dfc98d", goldDark: "#937c3a",
      ink: "#333a30", sage: "#6f8773", rose: "#c79b85",
    },
  },
];
