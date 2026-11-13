/** Paket font — dimuat dinamis dari Google Fonts saat dipilih di panel admin */

export interface FontPreset {
  id: string;
  name: string;
  desc: string;
  /** font judul bertipe serif */
  serif: string;
  /** font tulisan tangan untuk nama mempelai */
  script: string;
  /** font label & antarmuka */
  sans: string;
  /** potongan query Google Fonts */
  query: string;
}

export const FONT_PRESETS: FontPreset[] = [
  {
    id: "klasik",
    name: "Cormorant · Great Vibes",
    desc: "Anggun klasik — pilihan bawaan",
    serif: "Cormorant Garamond",
    script: "Great Vibes",
    sans: "Jost",
    query:
      "family=Cormorant+Garamond:ital,wght@0,300..700;1,300..600&family=Great+Vibes&family=Jost:wght@200..600",
  },
  {
    id: "playfair",
    name: "Playfair · Parisienne",
    desc: "Kontras tegas, modern bersih",
    serif: "Playfair Display",
    script: "Parisienne",
    sans: "Montserrat",
    query:
      "family=Playfair+Display:ital,wght@0,400..800;1,400..700&family=Parisienne&family=Montserrat:wght@200..600",
  },
  {
    id: "lora",
    name: "Lora · Sacramento",
    desc: "Hangat, lembut, romantis",
    serif: "Lora",
    script: "Sacramento",
    sans: "Karla",
    query:
      "family=Lora:ital,wght@0,400..700;1,400..600&family=Sacramento&family=Karla:wght@200..600",
  },
  {
    id: "garamond",
    name: "EB Garamond · Pinyon",
    desc: "Formal kerajaan, berwibawa",
    serif: "EB Garamond",
    script: "Pinyon Script",
    sans: "Raleway",
    query:
      "family=EB+Garamond:ital,wght@0,400..700;1,400..600&family=Pinyon+Script&family=Raleway:wght@200..600",
  },
  {
    id: "marcellus",
    name: "Marcellus · Allura",
    desc: "Tenang berkelas, sentuhan Romawi",
    serif: "Marcellus",
    script: "Allura",
    sans: "Inter",
    query: "family=Marcellus&family=Allura&family=Inter:wght@200..600",
  },
  {
    id: "libre",
    name: "Libre Baskerville · Italianno",
    desc: "Tebal membaca, script mengalir",
    serif: "Libre Baskerville",
    script: "Italianno",
    sans: "Inter",
    query:
      "family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Italianno&family=Inter:wght@200..600",
  },
];

export const getFontPreset = (id: string): FontPreset =>
  FONT_PRESETS.find((f) => f.id === id) ?? FONT_PRESETS[0];

const LINK_ID = "rk-dynamic-fonts";

/** Muat paket font & terapkan ke variabel CSS global */
export function applyFonts(id: string) {
  const preset = getFontPreset(id);

  let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = LINK_ID;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  const href = `https://fonts.googleapis.com/css2?${preset.query}&display=swap`;
  if (link.href !== href) link.href = href;

  const root = document.documentElement;
  root.style.setProperty("--app-serif", `"${preset.serif}", Georgia, serif`);
  root.style.setProperty("--app-script", `"${preset.script}", cursive`);
  root.style.setProperty("--app-sans", `"${preset.sans}", system-ui, sans-serif`);
}
