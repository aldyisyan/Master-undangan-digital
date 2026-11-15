/**
 * Preview template live — menggambarkan nuansa visual setiap layout
 * menggunakan CSS & SVG ringan tanpa iframe.
 * Setiap template punya komposisi berbeda yang merepresentasikan
 * hero, warna, ornamen, dan feel-nya.
 */
import { Check } from "lucide-react";
import type { LayoutDef } from "../../lib/layouts";
import type { InvitationSettings } from "../../lib/settings";

interface Props {
  layout: LayoutDef;
  draft: InvitationSettings;
  active: boolean;
  onClick: () => void;
}

/* warna palet per mood layout */
const MOOD: Record<string, { bg: string; card: string; accent: string; text: string; sub: string }> = {
  "klasik":         { bg: "#f6f1e5", card: "#fbf8ef", accent: "#b08d57", text: "#35412d", sub: "#7d8c6e" },
  "minimalis":      { bg: "#f9f9f7", card: "#ffffff", accent: "#c0a87a", text: "#2a2a2a", sub: "#aaaaaa" },
  "majalah":        { bg: "#f4f1ec", card: "#fdfaf5", accent: "#b08d57", text: "#2b2820", sub: "#888070" },
  "botani":         { bg: "#edf0e8", card: "#f4f7f0", accent: "#7a9e6e", text: "#2e3f28", sub: "#7d8c6e" },
  "romansa":        { bg: "#fdf4f2", card: "#fff8f7", accent: "#c9908c", text: "#5c3840", sub: "#c9a08c" },
  "sinematik":      { bg: "#1a1f1a", card: "#252e25", accent: "#d9c193", text: "#f0ead8", sub: "#a0956a" },
  "monogram":       { bg: "#f6f1e5", card: "#fbf8ef", accent: "#b08d57", text: "#35412d", sub: "#7d8c6e" },
  "duet":           { bg: "#f7f5f1", card: "#fdfaf5", accent: "#b08d57", text: "#2a2520", sub: "#998872" },
  "atelier":        { bg: "#f3f0eb", card: "#fdfaf5", accent: "#c0a87a", text: "#1e1c18", sub: "#908060" },
  "royal":          { bg: "#eef1f7", card: "#f7f9fd", accent: "#b08d57", text: "#2c3e63", sub: "#75849c" },
  "garden-party":   { bg: "#f0f4ec", card: "#f8fbf5", accent: "#6fa06a", text: "#2c4228", sub: "#7d8c6e" },
  "midnight":       { bg: "#0d1117", card: "#161c24", accent: "#d9c193", text: "#e8e0cc", sub: "#8a7c5a" },
  "soft-editorial": { bg: "#faf8f5", card: "#ffffff", accent: "#c0a87a", text: "#2a2520", sub: "#b0a080" },
  "adat-jawa":      { bg: "#f5f0e0", card: "#fffaee", accent: "#c8972a", text: "#3a2800", sub: "#8a7040" },
  "adat-minang":    { bg: "#f7ebe0", card: "#fff5eb", accent: "#c04020", text: "#3a1500", sub: "#c07050" },
  "adat-bali":      { bg: "#f7ecd8", card: "#fff7ec", accent: "#d4762a", text: "#3a2000", sub: "#c08040" },
  "adat-sunda":     { bg: "#f2ede0", card: "#faf6ec", accent: "#a08030", text: "#3a2800", sub: "#908040" },
  "forest-fairytale": { bg: "#e8f0e0", card: "#f4f9ec", accent: "#6a9850", text: "#1e3418", sub: "#7a9868" },
  "floral-arch":    { bg: "#fdf0f4", card: "#fff5f8", accent: "#d4708a", text: "#4a1830", sub: "#c09098" },
  "rustic-earth":   { bg: "#f2e8d8", card: "#faf3e8", accent: "#a07040", text: "#3c2810", sub: "#a08060" },
  "modern-korea":   { bg: "#fafafa", card: "#ffffff", accent: "#e0b4b4", text: "#1a1a1a", sub: "#c0b0b0" },
  "islamic-nazra":  { bg: "#f0f4ee", card: "#f8fbf6", accent: "#4a8060", text: "#1a3020", sub: "#6a9078" },
  "tropical-soiree":{ bg: "#e8f4f0", card: "#f2fbf8", accent: "#2a8068", text: "#0d2820", sub: "#4a9078" },
  "gebyok-heritage":{ bg: "#f5e8d0", card: "#fff4e0", accent: "#c06020", text: "#3a1800", sub: "#c07840" },
};

function getMood(id: string) {
  return MOOD[id] ?? MOOD["klasik"];
}

/* komponen preview per tipe hero */
function PreviewHeroCenter({ m, bride, groom }: { m: ReturnType<typeof getMood>; bride: string; groom: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-2">
      <div className="h-px w-10" style={{ background: m.accent, opacity: 0.5 }} />
      <span className="font-sans text-[7px] uppercase tracking-[0.4em]" style={{ color: m.sub }}>The Wedding Of</span>
      <span className="font-serif text-[12px] font-semibold leading-tight" style={{ color: m.text }}>{bride}</span>
      <span className="font-serif text-[9px] italic" style={{ color: m.accent }}>&amp;</span>
      <span className="font-serif text-[12px] font-semibold leading-tight" style={{ color: m.text }}>{groom}</span>
      <div className="h-px w-10" style={{ background: m.accent, opacity: 0.5 }} />
    </div>
  );
}

function PreviewHeroSplit({ m, bride, groom }: { m: ReturnType<typeof getMood>; bride: string; groom: string }) {
  return (
    <div className="flex items-center gap-1.5 w-full px-2 py-2">
      <div className="flex-1 text-left">
        <span className="font-sans text-[7px] uppercase tracking-[0.3em] block" style={{ color: m.sub }}>Wedding</span>
        <span className="font-serif text-[11px] font-semibold leading-tight block" style={{ color: m.text }}>{bride}</span>
        <span className="font-serif text-[9px] italic block" style={{ color: m.accent }}>&amp; {groom}</span>
      </div>
      <div className="w-12 h-14 rounded-lg flex-shrink-0 overflow-hidden" style={{ background: m.sub + "30" }}>
        <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${m.accent}30, ${m.sub}20)` }} />
      </div>
    </div>
  );
}

function PreviewHeroCinematic({ m, bride, groom }: { m: ReturnType<typeof getMood>; bride: string; groom: string }) {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg" style={{ background: m.bg }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${m.card}ee 40%, transparent)` }} />
      <div className="absolute bottom-2 left-2.5 text-left">
        <span className="font-sans text-[7px] uppercase tracking-[0.3em] block" style={{ color: m.accent }}>Cinematic</span>
        <span className="font-serif text-[11px] font-semibold block" style={{ color: m.text }}>{bride} &amp; {groom}</span>
      </div>
    </div>
  );
}

function PreviewHeroDuet({ m, bride, groom }: { m: ReturnType<typeof getMood>; bride: string; groom: string }) {
  return (
    <div className="flex items-center justify-center gap-1 w-full py-2">
      <span className="font-serif text-[10px] font-light" style={{ color: m.text }}>{bride}</span>
      <span className="flex h-6 w-6 items-center justify-center rounded-full border text-[9px] font-serif italic flex-shrink-0" style={{ borderColor: m.accent, color: m.accent }}>&</span>
      <span className="font-serif text-[10px] font-light" style={{ color: m.text }}>{groom}</span>
    </div>
  );
}

function PreviewHeroCascade({ m, bride, groom }: { m: ReturnType<typeof getMood>; bride: string; groom: string }) {
  return (
    <div className="flex flex-col items-center w-full py-1">
      <span className="font-serif text-[13px] font-semibold -translate-x-3" style={{ color: m.text }}>{bride}</span>
      <span className="font-serif text-[9px] italic my-0.5" style={{ color: m.accent }}>&amp;</span>
      <span className="font-serif text-[13px] font-semibold translate-x-3" style={{ color: m.text }}>{groom}</span>
    </div>
  );
}

function PreviewHeroMonogram({ m, bride, groom }: { m: ReturnType<typeof getMood>; bride: string; groom: string }) {
  const initials = bride.charAt(0) + groom.charAt(0);
  return (
    <div className="relative flex items-center justify-center w-full py-2">
      <span className="absolute font-serif text-[36px] font-light" style={{ color: m.accent, opacity: 0.12 }}>{initials}</span>
      <div className="relative text-center">
        <span className="font-serif text-[11px] font-light tracking-widest block" style={{ color: m.text }}>{bride}</span>
        <span className="font-serif text-[9px] italic block" style={{ color: m.accent }}>&amp;</span>
        <span className="font-serif text-[11px] font-light tracking-widest block" style={{ color: m.text }}>{groom}</span>
      </div>
    </div>
  );
}

function PreviewHeroHeritage({ m, bride, groom }: { m: ReturnType<typeof getMood>; bride: string; groom: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-1.5">
      <div className="h-5 w-5 rounded-full border flex items-center justify-center" style={{ borderColor: m.accent }}>
        <span className="font-serif text-[8px]" style={{ color: m.accent }}>{bride.charAt(0)}{groom.charAt(0)}</span>
      </div>
      <span className="font-serif text-[11px] font-light tracking-[0.08em]" style={{ color: m.text }}>{bride}</span>
      <span className="font-serif text-[9px] italic" style={{ color: m.accent }}>&amp;</span>
      <span className="font-serif text-[11px] font-light tracking-[0.08em]" style={{ color: m.text }}>{groom}</span>
      <div className="flex items-center gap-1 mt-0.5">
        <span className="h-px w-6" style={{ background: m.accent, opacity: 0.5 }} />
        <span className="font-sans text-[6px] uppercase tracking-[0.3em]" style={{ color: m.sub }}>heritage</span>
        <span className="h-px w-6" style={{ background: m.accent, opacity: 0.5 }} />
      </div>
    </div>
  );
}

function PreviewHeroBanner({ m, bride, groom }: { m: ReturnType<typeof getMood>; bride: string; groom: string }) {
  return (
    <div className="mx-2 my-1 rounded-xl border px-3 py-2 text-center" style={{ borderColor: m.accent + "50", background: m.card + "aa" }}>
      <span className="font-sans text-[6px] uppercase tracking-[0.4em] block" style={{ color: m.sub }}>Manten Agung</span>
      <span className="font-serif text-[12px] font-semibold block mt-0.5" style={{ color: m.text }}>{bride}</span>
      <span className="font-serif text-[9px] italic block" style={{ color: m.accent }}>&amp;</span>
      <span className="font-serif text-[12px] font-semibold block" style={{ color: m.text }}>{groom}</span>
    </div>
  );
}

function PreviewHeroStack({ m, bride, groom }: { m: ReturnType<typeof getMood>; bride: string; groom: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <span className="font-sans text-[7px] uppercase tracking-[0.4em]" style={{ color: m.sub }}>Save The Date</span>
      <span className="font-serif text-[11px] font-light" style={{ color: m.text }}>{bride}</span>
      <div className="h-px w-8" style={{ background: m.accent, opacity: 0.5 }} />
      <span className="font-serif text-[11px] font-light" style={{ color: m.text }}>{groom}</span>
    </div>
  );
}

function PreviewHeroFrame({ m, bride, groom }: { m: ReturnType<typeof getMood>; bride: string; groom: string }) {
  return (
    <div className="relative flex items-center justify-center w-full py-1">
      <div
        className="absolute inset-1 rounded-full border"
        style={{ borderColor: m.accent, opacity: 0.4 }}
      />
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-serif text-[11px] font-semibold" style={{ color: m.text }}>{bride}</span>
        <span className="font-serif text-[9px] italic" style={{ color: m.accent }}>&amp;</span>
        <span className="font-serif text-[11px] font-semibold" style={{ color: m.text }}>{groom}</span>
      </div>
    </div>
  );
}

/* ornamen floral dekoratif berbeda per mood */
function FloralDecor({ layout, m }: { layout: LayoutDef; m: ReturnType<typeof getMood> }) {
  if (layout.arch) {
    return (
      <>
        {/* arch atas */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 flex justify-center overflow-hidden h-7 opacity-50">
          <svg viewBox="0 0 120 28" className="w-full" fill={m.accent}>
            {[0, 15, 30, 45, 60, 75, 90, 105].map((x, i) => (
              <ellipse key={i} cx={x + 8} cy={0} rx={6} ry={i % 2 === 0 ? 14 : 10} opacity="0.4" />
            ))}
          </svg>
        </div>
        {/* arch bawah */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex justify-center overflow-hidden h-7 opacity-40 rotate-180">
          <svg viewBox="0 0 120 28" className="w-full" fill={m.accent}>
            {[0, 15, 30, 45, 60, 75, 90, 105].map((x, i) => (
              <ellipse key={i} cx={x + 8} cy={0} rx={6} ry={i % 2 === 0 ? 12 : 8} opacity="0.4" />
            ))}
          </svg>
        </div>
      </>
    );
  }
  if (layout.leaves) {
    return (
      <>
        <div className="pointer-events-none absolute -left-1 top-6 opacity-30">
          <svg width="22" height="40" viewBox="0 0 22 40" fill={m.sub}>
            <ellipse cx="11" cy="20" rx="8" ry="20" />
          </svg>
        </div>
        <div className="pointer-events-none absolute -right-1 bottom-6 opacity-25 rotate-180">
          <svg width="18" height="32" viewBox="0 0 18 32" fill={m.sub}>
            <ellipse cx="9" cy="16" rx="7" ry="16" />
          </svg>
        </div>
      </>
    );
  }
  return null;
}

export default function TemplatePreviewCard({ layout, draft, active, onClick }: Props) {
  const m = getMood(layout.id);
  const bride = draft.bride.short || "Kirana";
  const groom = draft.groom.short || "Rangga";

  const HeroComp = {
    center: PreviewHeroCenter,
    split: PreviewHeroSplit,
    cinematic: PreviewHeroCinematic,
    duet: PreviewHeroDuet,
    cascade: PreviewHeroCascade,
    monogram: PreviewHeroMonogram,
    heritage: PreviewHeroHeritage,
    banner: PreviewHeroBanner,
    stack: PreviewHeroStack,
    frame: PreviewHeroFrame,
  }[layout.hero] ?? PreviewHeroCenter;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        active
          ? "border-gold shadow-[0_8px_30px_-8px_rgba(176,141,87,0.6)] ring-2 ring-gold/30"
          : "border-gold/25 hover:border-gold/60"
      }`}
      style={{ background: m.bg }}
    >
      {/* preview area — mockup HP */}
      <div className="relative mx-auto mt-3 w-[82px] overflow-hidden rounded-[14px] border shadow-[0_8px_24px_-8px_rgba(0,0,0,0.25)]"
        style={{ borderColor: m.accent + "40", background: m.card, minHeight: 112 }}>

        {/* ornamen dekoratif */}
        <FloralDecor layout={layout} m={m} />

        {/* konten hero preview */}
        <div className="relative z-10 flex h-full min-h-[108px] flex-col items-center justify-center">
          <HeroComp m={m} bride={bride} groom={groom} />
        </div>

        {/* bar navigasi bawah (simulasi HP) */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 py-1.5" style={{ background: m.card + "dd" }}>
          {[0, 1, 2].map(i => (
            <span key={i} className="h-1 w-1 rounded-full" style={{ background: i === 1 ? m.accent : m.sub, opacity: i === 1 ? 0.9 : 0.3 }} />
          ))}
        </div>
      </div>

      {/* info template */}
      <div className="flex flex-1 flex-col p-3.5 pt-3">
        <div className="flex items-start justify-between gap-1">
          <span className="font-serif text-[13px] font-semibold leading-tight text-forest">{layout.name}</span>
          {active && (
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold shadow-sm">
              <Check className="h-3 w-3 text-forest-deep" />
            </span>
          )}
        </div>
        <span className="mt-1.5 inline-flex self-start rounded-full px-2 py-0.5 font-sans text-[8px] uppercase tracking-[0.18em]"
          style={{ background: m.accent + "18", color: m.text, opacity: 0.9 }}>
          {layout.eyebrow}
        </span>
        <span className="mt-2 line-clamp-2 font-sans text-[10px] leading-relaxed text-ink/55">
          {layout.desc}
        </span>
      </div>
    </button>
  );
}
