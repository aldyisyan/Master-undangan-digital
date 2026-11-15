export type CoverId =
  | "frosted-glass"
  | "cinematic-full"
  | "editorial-split"
  | "minimal-clean"
  | "royal-gold"
  | "floral-arch"
  | "heritage-batik"
  | "modern-magazine"
  | "intimate-photo";

export interface CoverDef {
  id: CoverId;
  name: string;
  desc: string;
}

export const COVERS: CoverDef[] = [
  {
    id: "frosted-glass",
    name: "Classic Frosted",
    desc: "Kartu kaca buram di tengah dengan latar belakang halus.",
  },
  {
    id: "cinematic-full",
    name: "Cinematic Full",
    desc: "Foto prewedding penuh layar dengan tipografi elegan di atasnya.",
  },
  {
    id: "editorial-split",
    name: "Editorial Split",
    desc: "Setengah foto dan setengah teks, gaya majalah fashion modern.",
  },
  {
    id: "minimal-clean",
    name: "Minimalist Clean",
    desc: "Sangat bersih, fokus pada tipografi dan ruang kosong yang lapang.",
  },
  {
    id: "royal-gold",
    name: "Royal Gold",
    desc: "Kesan mewah dengan ornamen emas dominan dan nuansa kerajaan.",
  },
  {
    id: "floral-arch",
    name: "Floral Arch",
    desc: "Bingkai bunga yang melingkari detail undangan Anda.",
  },
  {
    id: "heritage-batik",
    name: "Heritage Batik",
    desc: "Sentuhan tradisional dengan pola batik/songket yang elegan.",
  },
  {
    id: "modern-magazine",
    name: "Modern Magazine",
    desc: "Layout asimetris dengan elemen tanggal yang berani.",
  },
  {
    id: "intimate-photo",
    name: "Intimate Card",
    desc: "Kartu kecil di tengah dengan margin luas, terasa eksklusif.",
  },
];

export const getCover = (id: string): CoverDef =>
  COVERS.find((c) => c.id === id) ?? COVERS[0];
