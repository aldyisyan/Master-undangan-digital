/**
 * Favicon dinamis — digambar ulang setiap nama mempelai atau warna berubah.
 * Urutan selalu mendahulukan mempelai wanita: inisial wanita & pria.
 */
import type { Palette } from "./settings";

const ID = "rk-favicon";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function initial(name: string): string {
  const c = (name ?? "").trim().charAt(0).toUpperCase();
  return c || "•";
}

/**
 * @param brideName nama panggilan mempelai wanita (tampil lebih dahulu)
 * @param groomName nama panggilan mempelai pria
 */
export function applyFavicon(brideName: string, groomName: string, colors: Palette) {
  const b = esc(initial(brideName));
  const g = esc(initial(groomName));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${colors.forest}"/>
      <stop offset="1" stop-color="${colors.forestDeep}"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#bg)"/>
  <rect x="4.5" y="4.5" width="55" height="55" rx="11" fill="none" stroke="${colors.gold}" stroke-width="1.5" opacity="0.85"/>
  <text x="32" y="41" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="27" font-weight="600"
        fill="${colors.goldLight}">${b}<tspan font-size="18" fill="${colors.gold}" dx="1" dy="-1">&amp;</tspan><tspan dx="1" dy="1">${g}</tspan></text>
</svg>`;

  const href = `data:image/svg+xml,${encodeURIComponent(svg)}`;

  let link = document.getElementById(ID) as HTMLLinkElement | null;
  if (!link) {
    document
      .querySelectorAll<HTMLLinkElement>("link[rel~='icon'], link[rel='shortcut icon']")
      .forEach((el) => el.parentElement?.removeChild(el));
    link = document.createElement("link");
    link.id = ID;
    link.rel = "icon";
    link.type = "image/svg+xml";
    document.head.appendChild(link);
  }
  link.href = href;

  // ikon layar utama iOS/Android
  let apple = document.getElementById(`${ID}-apple`) as HTMLLinkElement | null;
  if (!apple) {
    apple = document.createElement("link");
    apple.id = `${ID}-apple`;
    apple.rel = "apple-touch-icon";
    document.head.appendChild(apple);
  }
  apple.href = href;
}

/** Judul tab mengikuti nama mempelai — wanita lebih dahulu */
export function applyDocumentTitle(brideName: string, groomName: string) {
  document.title = `${brideName} & ${groomName} — Undangan Pernikahan`;
}
