/** Template tata letak undangan — dipilih dari panel admin */

export type LayoutId =
  | "klasik"
  | "minimalis"
  | "majalah"
  | "botani"
  | "romansa"
  | "sinematik"
  | "monogram"
  | "duet";

export interface LayoutDef {
  id: LayoutId;
  name: string;
  desc: string;
  /** komposisi bagian hero */
  hero:
    | "center"
    | "stack"
    | "split"
    | "frame"
    | "cascade"
    | "cinematic"
    | "monogram"
    | "duet";
  /** efek kelopak berjatuhan */
  petals: boolean;
  /** tangkai daun melayang */
  leaves: boolean;
  /** motif floral di tepi atas/bawah */
  arch: boolean;
  /** kepadatan ornamen garis & bingkai */
  ornament: "full" | "light" | "none";
  /** perataan judul tiap bagian */
  align: "center" | "left";
  /** sudut kartu */
  radius: string;
  /** gaya bingkai foto mempelai */
  portrait: "arch" | "rounded" | "square" | "circle";
}

export const LAYOUTS: LayoutDef[] = [
  {
    id: "klasik",
    name: "Klasik Elegan",
    desc: "Nama berukir di tengah, motif floral, kelopak berjatuhan.",
    hero: "center",
    petals: true,
    leaves: true,
    arch: true,
    ornament: "full",
    align: "center",
    radius: "rounded-3xl",
    portrait: "arch",
  },
  {
    id: "minimalis",
    name: "Minimalis Bersih",
    desc: "Ruang kosong lapang, garis tipis, tanpa animasi kelopak.",
    hero: "stack",
    petals: false,
    leaves: false,
    arch: false,
    ornament: "light",
    align: "center",
    radius: "rounded-xl",
    portrait: "square",
  },
  {
    id: "majalah",
    name: "Editorial Majalah",
    desc: "Komposisi asimetris, foto besar, judul rata kiri.",
    hero: "split",
    petals: false,
    leaves: false,
    arch: false,
    ornament: "light",
    align: "left",
    radius: "rounded-2xl",
    portrait: "rounded",
  },
  {
    id: "botani",
    name: "Botani Mewah",
    desc: "Karangan daun melingkari nama, ornamen paling padat.",
    hero: "frame",
    petals: true,
    leaves: true,
    arch: true,
    ornament: "full",
    align: "center",
    radius: "rounded-[2rem]",
    portrait: "circle",
  },
  {
    id: "romansa",
    name: "Romansa Bertingkat",
    desc: "Nama bertingkat diagonal, lembut, romantis, dan banyak ruang.",
    hero: "cascade",
    petals: true,
    leaves: false,
    arch: true,
    ornament: "light",
    align: "center",
    radius: "rounded-[2rem]",
    portrait: "arch",
  },
  {
    id: "sinematik",
    name: "Sinematik Foto",
    desc: "Foto penuh layar dengan judul dramatis di bagian bawah.",
    hero: "cinematic",
    petals: false,
    leaves: false,
    arch: false,
    ornament: "light",
    align: "left",
    radius: "rounded-none",
    portrait: "square",
  },
  {
    id: "monogram",
    name: "Monogram Agung",
    desc: "Inisial raksasa menjadi pusat komposisi yang formal dan mewah.",
    hero: "monogram",
    petals: false,
    leaves: true,
    arch: false,
    ornament: "full",
    align: "center",
    radius: "rounded-3xl",
    portrait: "circle",
  },
  {
    id: "duet",
    name: "Kontemporer Duet",
    desc: "Dua nama berhadapan dalam grid modern dan berani.",
    hero: "duet",
    petals: false,
    leaves: false,
    arch: false,
    ornament: "none",
    align: "left",
    radius: "rounded-2xl",
    portrait: "rounded",
  },
];

export const getLayout = (id: string): LayoutDef =>
  LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];

/** Kelas bingkai foto sesuai gaya potret */
export function portraitClass(p: LayoutDef["portrait"]): string {
  switch (p) {
    case "arch":
      return "rounded-t-full rounded-b-3xl";
    case "circle":
      return "rounded-full";
    case "square":
      return "rounded-none";
    default:
      return "rounded-2xl";
  }
}
