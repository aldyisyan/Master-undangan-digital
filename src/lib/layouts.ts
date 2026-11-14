/** Template tata letak undangan — dipilih dari panel admin */

export type LayoutId =
  | "klasik"
  | "minimalis"
  | "majalah"
  | "botani"
  | "romansa"
  | "sinematik"
  | "monogram"
  | "duet"
  | "atelier"
  | "royal"
  | "garden-party"
  | "midnight"
  | "soft-editorial"
  | "adat-jawa"
  | "adat-minang"
  | "adat-bali";

export interface LayoutDef {
  id: LayoutId;
  name: string;
  desc: string;
  /** label kecil yang tampil di cover/hero untuk memberi karakter template */
  eyebrow: string;
  /** keunggulan utama template ini */
  strength: string;
  /** komposisi bagian hero */
  hero:
    | "center"
    | "stack"
    | "split"
    | "frame"
    | "cascade"
    | "cinematic"
    | "monogram"
    | "duet"
    | "heritage"
    | "banner";
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
    eyebrow: "The Wedding Of",
    strength: "Aman dipakai untuk hampir semua tema — formal, lembut, dan timeless.",
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
    eyebrow: "Wedding Invitation",
    strength: "Fokus pada konten, sangat rapi, tenang, dan mudah dibaca di semua perangkat.",
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
    eyebrow: "Editorial Wedding",
    strength: "Terasa seperti halaman majalah premium — cocok untuk foto yang kuat dan modern.",
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
    eyebrow: "In Bloom",
    strength: "Paling cocok untuk nuansa taman, kebun, outdoor, dan foto bernuansa alami.",
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
    eyebrow: "A Love Story",
    strength: "Memberi kesan dreamy dan puitis — sangat manis untuk pasangan berjiwa romantis.",
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
    eyebrow: "An Intimate Celebration",
    strength: "Paling dramatis dan emosional — ideal untuk foto prewedding yang sinematik.",
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
    eyebrow: "With Great Joy",
    strength: "Terasa sangat resmi dan mewah — cocok untuk nuansa ballroom dan black-tie.",
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
    eyebrow: "Two Becoming One",
    strength: "Tampak modern, editorial, dan berkarakter kuat di desktop maupun mobile.",
    hero: "duet",
    petals: false,
    leaves: false,
    arch: false,
    ornament: "none",
    align: "left",
    radius: "rounded-2xl",
    portrait: "rounded",
  },
  {
    id: "atelier",
    name: "Atelier Couture",
    desc: "Editorial halus dengan nuansa studio fashion yang bersih dan mahal.",
    eyebrow: "Maison de Mariage",
    strength: "Memberi rasa fashion editorial — sangat cocok untuk pasangan yang ingin tampil classy dan artsy.",
    hero: "split",
    petals: false,
    leaves: true,
    arch: false,
    ornament: "light",
    align: "left",
    radius: "rounded-[2rem]",
    portrait: "rounded",
  },
  {
    id: "royal",
    name: "Royal Heritage",
    desc: "Formal mewah, monogram dominan, cocok untuk nuansa klasik kerajaan.",
    eyebrow: "Royal Celebration",
    strength: "Paling megah dan ceremonial — cocok untuk acara yang ingin terasa sakral dan prestisius.",
    hero: "heritage",
    petals: false,
    leaves: true,
    arch: true,
    ornament: "full",
    align: "center",
    radius: "rounded-[2.25rem]",
    portrait: "circle",
  },
  {
    id: "garden-party",
    name: "Garden Party",
    desc: "Lembut, terang, airy, dengan sentuhan taman romantis yang manis.",
    eyebrow: "Garden Soirée",
    strength: "Terasa ringan, segar, dan cantik — paling pas untuk pesta siang, taman, atau intimate wedding.",
    hero: "center",
    petals: true,
    leaves: true,
    arch: true,
    ornament: "light",
    align: "center",
    radius: "rounded-[2rem]",
    portrait: "arch",
  },
  {
    id: "midnight",
    name: "Midnight Luxe",
    desc: "Sinematik pekat dan dramatis — paling cocok untuk foto yang sangat kuat.",
    eyebrow: "Afterglow Vows",
    strength: "Nuansanya dalam, romantis, dan dewasa — kuat sekali untuk foto malam atau indoor glamor.",
    hero: "cinematic",
    petals: false,
    leaves: false,
    arch: false,
    ornament: "none",
    align: "left",
    radius: "rounded-none",
    portrait: "square",
  },
  {
    id: "soft-editorial",
    name: "Soft Editorial",
    desc: "Minimal lembut dengan ruang putih luas dan ritme layout ala majalah premium.",
    eyebrow: "Love in Stillness",
    strength: "Paling tenang dan sophisticated — cocok untuk pasangan yang suka desain subtle dan dewasa.",
    hero: "stack",
    petals: false,
    leaves: false,
    arch: false,
    ornament: "light",
    align: "center",
    radius: "rounded-[2rem]",
    portrait: "rounded",
  },
  {
    id: "adat-jawa",
    name: "Adat Jawa · Pawiwahan",
    desc: "Simetris, anggun, sakral, dan terasa seperti perhelatan keluarga besar Jawa.",
    eyebrow: "Pawiwahan",
    strength: "Memberi aura teduh, halus, dan penuh tata krama — cocok untuk nuansa adat Jawa modern.",
    hero: "heritage",
    petals: false,
    leaves: true,
    arch: true,
    ornament: "full",
    align: "center",
    radius: "rounded-[2.25rem]",
    portrait: "arch",
  },
  {
    id: "adat-minang",
    name: "Adat Minang · Baralek",
    desc: "Berani, resmi, dan terasa seperti perayaan keluarga besar yang semarak namun rapi.",
    eyebrow: "Baralek Gadang",
    strength: "Punya ritme visual yang tegas dan meriah — bagus untuk konsep keluarga besar dan pesta yang hidup.",
    hero: "banner",
    petals: false,
    leaves: false,
    arch: false,
    ornament: "light",
    align: "left",
    radius: "rounded-[1.75rem]",
    portrait: "rounded",
  },
  {
    id: "adat-bali",
    name: "Adat Bali · Pawiwahan",
    desc: "Hangat, artistik, dan sakral dengan rasa seremoni yang kuat.",
    eyebrow: "Pawiwahan Bali",
    strength: "Cocok untuk foto dengan nuansa senja, budaya, atau dekor tropis-ritual yang artistik.",
    hero: "frame",
    petals: true,
    leaves: true,
    arch: false,
    ornament: "full",
    align: "center",
    radius: "rounded-[2rem]",
    portrait: "circle",
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
