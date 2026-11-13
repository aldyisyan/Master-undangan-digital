import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Lock, Save, Check, RotateCcw, ExternalLink, LogOut, HeartHandshake,
  Image as ImageIcon, CalendarHeart, MapPin, Gift, Send, Music4, ShieldCheck, Info,
  Palette as PaletteIcon, Sparkles, CloudUpload, MessageCircleHeart, Trash2, Unplug,
  CheckCircle2, XCircle, HelpCircle,
} from "lucide-react";
import {
  DEFAULT_SETTINGS, getSettings, saveSettings, resetSettings,
  type InvitationSettings, type PersonInfo, type VenueInfo, type EventItem, type GiftAccount,
} from "../lib/settings";
import { THEME_PRESETS, PALETTE_FIELDS } from "../lib/theme";
import { LAYOUTS, getLayout, portraitClass } from "../lib/layouts";
import { FONT_PRESETS } from "../lib/typography";
import { clearMedia } from "../lib/mediaStore";
import { testCloudConnection, syncToCloud } from "../lib/cloud";
import {
  getCloudAdmin, saveCloudAdmin, clearCloud, saveCloudRead, getLastSync,
  type CloudAdmin,
} from "../lib/cloudConfig";
import { buildInviteLink } from "../lib/guestBook";
import { loadWishes, saveWishes, wipeWishes, restoreSeedWishes, type Wish } from "../lib/wishes";
import Code from "../components/Code";
import { Field, Area, Card, ImagePicker, AudioPicker } from "../components/admin/fields";
import GuestBookPanel from "../components/admin/GuestBookPanel";
import { Wreath } from "../components/Ornament";

const SESSION_KEY = "rk-admin-auth";

/* ============================ GERBANG PIN ============================ */

function PinGate({ expected, onSuccess }: { expected: string; onSuccess: () => void }) {
  const [pin, setPin] = useState("");
  const [errCount, setErrCount] = useState(0);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (pin.trim() === expected) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onSuccess();
    } else {
      setErrCount((c) => c + 1);
      setPin("");
    }
  };

  return (
    <div className="grain flex min-h-svh items-center justify-center bg-forest-deep px-5">
      <motion.div
        key={errCount}
        animate={errCount ? { x: [0, -12, 12, -9, 9, 0] } : {}}
        transition={{ duration: 0.45 }}
        className="w-full max-w-sm text-center"
      >
        <div className="relative mx-auto h-28 w-28">
          <Wreath className="absolute inset-0 h-full w-full opacity-90" />
          <span className="absolute inset-0 flex items-center justify-center">
            <Lock className="h-7 w-7 text-gold-light" />
          </span>
        </div>
        <h1 className="mt-6 font-serif text-3xl font-medium text-cream">Panel Admin</h1>
        <p className="mt-2 font-serif text-sm italic text-cream/60">
          Area khusus pengantin — masukkan PIN untuk mengelola undangan.
        </p>

        <form onSubmit={submit} className="mt-8">
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••••"
            className="w-full rounded-2xl border border-gold/40 bg-forest px-5 py-4 text-center font-sans text-2xl tracking-[0.6em] text-cream outline-none transition placeholder:text-cream/25 focus:border-gold-light focus:ring-2 focus:ring-gold/30"
          />
          {errCount > 0 && (
            <p className="mt-3 font-sans text-xs tracking-widest text-rose">
              PIN salah — silakan coba lagi
            </p>
          )}
          <button
            type="submit"
            className="mt-5 w-full rounded-full bg-gold px-8 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-forest-deep transition-colors hover:bg-gold-light"
          >
            Masuk
          </button>
        </form>

        {expected === DEFAULT_SETTINGS.adminPin ? (
          <p className="mt-6 font-sans text-[11px] leading-relaxed tracking-wide text-cream/45">
            PIN bawaan: <span className="font-semibold text-gold-light">140626</span> (tanggal
            pernikahan, format ddmmyy) — segera ganti di tab Musik &amp; PIN setelah masuk.
          </p>
        ) : (
          <p className="mt-6 font-sans text-[11px] leading-relaxed tracking-wide text-cream/45">
            Area ini terkunci dan hanya dapat diakses oleh pengantin.
          </p>
        )}
        <a
          href="#/"
          className="mt-6 inline-block font-sans text-[10px] uppercase tracking-[0.3em] text-cream/50 underline-offset-4 hover:text-gold-light hover:underline"
        >
          ← Kembali ke undangan
        </a>
      </motion.div>
    </div>
  );
}

/* =========================== HALAMAN ADMIN =========================== */

const TABS = [
  { id: "mempelai", label: "Mempelai", icon: HeartHandshake },
  { id: "tampilan", label: "Tampilan", icon: ImageIcon },
  { id: "warna", label: "Warna", icon: PaletteIcon },
  { id: "acara", label: "Acara", icon: CalendarHeart },
  { id: "lokasi", label: "Lokasi", icon: MapPin },
  { id: "hadiah", label: "Hadiah", icon: Gift },
  { id: "tamu", label: "Tamu & WA", icon: Send },
  { id: "ucapan", label: "Ucapan", icon: MessageCircleHeart },
  { id: "sinkro", label: "Sinkronisasi", icon: CloudUpload },
  { id: "musik", label: "Musik & PIN", icon: Music4 },
] as const;

type TabId = (typeof TABS)[number]["id"];

function toLocalInput(iso: string) {
  const d = new Date(iso);
  if (isNaN(+d)) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* ---------- pemilih warna ---------- */

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-gold/25 bg-cream px-4 py-2.5 transition focus-within:border-gold">
      <span className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-forest">
        {label}
      </span>
      <span className="flex items-center gap-3">
        <span className="font-mono text-xs uppercase text-ink/55">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border border-gold/40 bg-transparent p-0.5"
        />
      </span>
    </label>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  const [draft, setDraft] = useState<InvitationSettings>(() => structuredClone(getSettings()));
  const [tab, setTab] = useState<TabId>("tamu");
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);

  // ---- sinkronisasi cloud ----
  const [cloudAdmin, setCloudAdmin] = useState<CloudAdmin | null>(() => getCloudAdmin());
  const [cloudUrl, setCloudUrl] = useState(() => getCloudAdmin()?.url ?? "");
  const [cloudKey, setCloudKey] = useState(() => getCloudAdmin()?.anonKey ?? "");
  const [cloudBucket, setCloudBucket] = useState(() => getCloudAdmin()?.bucket ?? "invite");
  const [cloudMsg, setCloudMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(() => getLastSync());

  // ---- kelola ucapan ----
  const [wishes, setWishes] = useState<Wish[]>(() => loadWishes());

  // muat seluruh font preset agar pratinjau di tab Tampilan akurat
  useEffect(() => {
    const ID = "rk-admin-font-preview";
    if (document.getElementById(ID)) return;
    const link = document.createElement("link");
    link.id = ID;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${FONT_PRESETS.map((f) => f.query).join("&")}&display=swap`;
    document.head.appendChild(link);
  }, []);

  if (!authed) {
    return <PinGate expected={getSettings().adminPin} onSuccess={() => setAuthed(true)} />;
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(getSettings());

  // bingkai crop mengikuti template yang sedang dipilih
  const activeLayout = getLayout(draft.layout);
  const portraitAspect = activeLayout.portrait === "circle" ? 1 : 4 / 5;
  const portraitShape = portraitClass(activeLayout.portrait);

  /* ---------- helper pembaruan draft ---------- */
  const patch = (p: Partial<InvitationSettings>) => setDraft((d) => ({ ...d, ...p }));
  const patchPerson = (who: "groom" | "bride", p: Partial<PersonInfo>) =>
    setDraft((d) => ({ ...d, [who]: { ...d[who], ...p } }));
  const patchVenue = (p: Partial<VenueInfo>) => setDraft((d) => ({ ...d, venue: { ...d.venue, ...p } }));
  const patchEvent = (i: number, p: Partial<EventItem>) =>
    setDraft((d) => ({ ...d, events: d.events.map((e, idx) => (idx === i ? { ...e, ...p } : e)) }));
  const patchGift = (i: number, p: Partial<GiftAccount>) =>
    setDraft((d) => ({ ...d, gifts: d.gifts.map((g, idx) => (idx === i ? { ...g, ...p } : g)) }));

  const runCloudSync = async (cfg: CloudAdmin | null, settings: InvitationSettings) => {
    if (!cfg) return false;
    setSyncing(true);
    const ok = await syncToCloud(cfg, settings);
    setSyncing(false);
    setLastSync(getLastSync());
    setCloudMsg(
      ok
        ? { ok: true, text: "Tersinkron ke cloud — semua perangkat kini memuat versi terbaru Anda." }
        : { ok: false, text: "Sinkronisasi cloud gagal. Periksa koneksi, anon key, dan policy SQL bucket." },
    );
    return ok;
  };

  const connectCloud = async () => {
    if (!cloudUrl.trim() || !cloudKey.trim()) {
      setCloudMsg({ ok: false, text: "Isi Project URL dan anon key terlebih dahulu." });
      return;
    }
    setConnecting(true);
    setCloudMsg(null);
    const cfg: CloudAdmin = {
      url: cloudUrl.trim().replace(/\/+$/, ""),
      anonKey: cloudKey.trim(),
      bucket: cloudBucket.trim() || "invite",
    };
    const result = await testCloudConnection(cfg);
    setConnecting(false);
    if (!result.ok) {
      setCloudMsg({
        ok: false,
        text: result.hint ?? "Koneksi gagal. Periksa Project URL, anon key, nama bucket, dan policy SQL.",
      });
      return;
    }
    saveCloudAdmin(cfg);
    saveCloudRead({ url: cfg.url, bucket: cfg.bucket });
    setCloudAdmin(cfg);
    setCloudMsg({ ok: true, text: "Terhubung! Mengunggah pengaturan & media ke cloud…" });
    await runCloudSync(cfg, structuredClone(draft));
  };

  const disconnectCloud = () => {
    clearCloud();
    setCloudAdmin(null);
    setCloudMsg({ ok: true, text: "Cloud terputus dari perangkat ini. Tautan tamu baru tidak lagi membawa penanda cloud." });
  };

  const removeWish = (w: Wish) => {
    const next = wishes.filter((x) => !(x.at === w.at && x.name === w.name));
    setWishes(next);
    saveWishes(next);
  };

  const clearAllWishes = () => {
    if (window.confirm("Hapus SEMUA ucapan & RSVP di perangkat ini?")) {
      wipeWishes();
      setWishes([]);
    }
  };

  const seedAllWishes = () => {
    restoreSeedWishes();
    setWishes(loadWishes());
  };

  const save = async () => {
    saveSettings(structuredClone(draft));
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
    if (cloudAdmin) {
      const ok = await runCloudSync(cloudAdmin, structuredClone(draft));
      if (!ok) {
        setCloudMsg({ ok: false, text: "Tersimpan lokal, tetapi sinkronisasi cloud gagal." });
      }
    }
  };

  const resetAll = async () => {
    if (!window.confirm("Kembalikan SEMUA isi undangan ke bawaan? Foto & audio yang diunggah ikut terhapus.")) return;
    setResetting(true);
    await clearMedia();
    resetSettings();
    setDraft(structuredClone(DEFAULT_SETTINGS));
    setResetting(false);
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.hash = "/";
  };

  const onDateChange = (v: string) => {
    const d = new Date(v);
    if (isNaN(+d)) return;
    const label = new Intl.DateTimeFormat("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    }).format(d);
    patch({ dateISO: d.toISOString(), dateLabel: label });
  };

  return (
    <div className="grain min-h-svh bg-forest-deep">
      {/* bilah atas */}
      <header className="sticky top-0 z-40 border-b border-cream/10 bg-forest-deep/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/50">
              <ShieldCheck className="h-4 w-4 text-gold-light" />
            </span>
            <div>
              <p className="font-serif text-lg font-semibold leading-none text-cream">Panel Admin</p>
              <p className="mt-1 font-sans text-[9px] uppercase tracking-[0.3em] text-cream/50">
                {draft.bride.short} &amp; {draft.groom.short}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="#/"
              className="inline-flex items-center gap-1.5 rounded-full border border-cream/20 px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-cream/70 transition-colors hover:border-gold-light/60 hover:text-gold-light"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Undangan
            </a>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-full border border-cream/20 px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-cream/70 transition-colors hover:border-rose/70 hover:text-rose"
            >
              <LogOut className="h-3.5 w-3.5" /> Keluar
            </button>
            <button
              onClick={save}
              disabled={!dirty || syncing}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-2 font-sans text-[10px] font-semibold uppercase tracking-[0.25em] shadow-md transition-all ${
                saved
                  ? "bg-gold-light text-forest"
                  : "bg-gold text-forest-deep hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-40"
              }`}
            >
              {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
              {syncing
                ? "Menyinkronkan…"
                : saved
                  ? "Tersimpan"
                  : dirty
                    ? cloudAdmin
                      ? "Simpan & Sinkron"
                      : "Simpan Perubahan"
                    : "Tersimpan"}
            </button>
          </div>
        </div>

        {/* tab */}
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-1.5 px-5 pb-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.16em] transition-colors sm:gap-2 sm:px-4 sm:tracking-[0.2em] ${
                tab === t.id
                  ? "bg-gold text-forest-deep shadow-md"
                  : "text-cream/60 hover:bg-cream/10 hover:text-cream"
              }`}
            >
              <t.icon className="h-3.5 w-3.5 shrink-0" />
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-5 py-8 pb-24">
        {/* info penyimpanan lokal */}
        <div className="flex items-start gap-3 rounded-2xl border border-gold/25 bg-forest/60 px-5 py-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" />
          <p className="font-sans text-xs leading-relaxed text-cream/70">
            Semua perubahan tersimpan aman di perangkat ini (localStorage untuk teks &amp; daftar tamu,
            IndexedDB untuk foto &amp; audio) dan langsung mengubah tampilan undangan. Buat undangan
            personal per nama tamu di tab{" "}
            <span className="font-semibold text-gold-light">Tamu &amp; WA</span>, kirim lewat WhatsApp,
            lalu tekan <span className="font-semibold text-gold-light">Simpan Perubahan</span> bila Anda
            mengubah isi undangan. Tautan Panel Admin{" "}
            <span className="font-semibold text-gold-light">tidak pernah ditampilkan kepada tamu</span>{" "}
            — akses kembali kapan saja melalui{" "}
            <span className="font-mono text-gold-light">#/admin</span>.
          </p>
        </div>

        {/* ================= TAB: MEMPELAI ================= */}
        {tab === "mempelai" && (
          <>
            <Card title="Mempelai Wanita" desc="Mempelai wanita selalu ditampilkan lebih dahulu di seluruh undangan.">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nama Lengkap" value={draft.bride.name} onChange={(v) => patchPerson("bride", { name: v })} />
                <Field label="Nama Panggilan (tampil besar)" value={draft.bride.short} onChange={(v) => patchPerson("bride", { short: v })} />
              </div>
              <Area label="Orang Tua" rows={2} value={draft.bride.parents} onChange={(v) => patchPerson("bride", { parents: v })} />
              <ImagePicker
                label="Foto Mempelai Wanita"
                value={draft.bride.photo}
                onChange={(v) => patchPerson("bride", { photo: v })}
                mediaKey="bride-photo"
                defaultValue={DEFAULT_SETTINGS.bride.photo}
                accept="image/*"
                previewClass="h-28 w-24"
                aspect={portraitAspect}
                shapeClass={portraitShape}
                hint="Setelah memilih berkas, atur perbesaran & posisi agar wajah pas di dalam bingkai."
              />
            </Card>

            <Card title="Mempelai Pria">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nama Lengkap" value={draft.groom.name} onChange={(v) => patchPerson("groom", { name: v })} />
                <Field label="Nama Panggilan (tampil besar)" value={draft.groom.short} onChange={(v) => patchPerson("groom", { short: v })} />
              </div>
              <Area label="Orang Tua" rows={2} value={draft.groom.parents} onChange={(v) => patchPerson("groom", { parents: v })} />
              <ImagePicker
                label="Foto Mempelai Pria"
                value={draft.groom.photo}
                onChange={(v) => patchPerson("groom", { photo: v })}
                mediaKey="groom-photo"
                defaultValue={DEFAULT_SETTINGS.groom.photo}
                accept="image/*"
                previewClass="h-28 w-24"
                aspect={portraitAspect}
                shapeClass={portraitShape}
              />
            </Card>

            <Card title="Lainnya">
              <Field label="Hashtag Pernikahan" value={draft.hashtag} onChange={(v) => patch({ hashtag: v })} placeholder="#KiranaMenemukanRangga" />
            </Card>
          </>
        )}

        {/* ================= TAB: TAMPILAN ================= */}
        {tab === "tampilan" && (
          <>
            <Card
              title="Template Tata Letak"
              desc="Mengubah komposisi hero, kepadatan ornamen, bentuk foto, dan perataan judul di seluruh undangan."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {LAYOUTS.map((l) => {
                  const active = draft.layout === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => patch({ layout: l.id })}
                      className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 ${
                        active
                          ? "border-gold bg-cream shadow-[0_14px_30px_-14px_rgba(138,106,59,0.5)]"
                          : "border-gold/25 bg-cream/70 hover:border-gold/60"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-serif text-lg font-semibold text-forest">{l.name}</span>
                        {active && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-forest px-2.5 py-1 font-sans text-[8px] font-semibold uppercase tracking-[0.2em] text-cream">
                            <Check className="h-2.5 w-2.5 text-gold-light" /> Aktif
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block font-sans text-[11px] leading-relaxed text-ink/55">
                        {l.desc}
                      </span>
                      {/* sketsa mini */}
                      <span
                        className={`mt-3 flex h-14 items-center justify-center gap-1.5 overflow-hidden rounded-lg px-3 ${
                          l.hero === "cinematic" ? "bg-forest-deep" : "bg-paper/70"
                        }`}
                      >
                        {l.hero === "split" ? (
                          <>
                            <span className="flex flex-1 flex-col gap-1">
                              <span className="h-1.5 w-10 rounded bg-forest/50" />
                              <span className="h-1 w-8 rounded bg-gold/60" />
                            </span>
                            <span className="h-9 w-7 rounded bg-forest/25" />
                          </>
                        ) : l.hero === "frame" ? (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gold/50">
                            <span className="h-1.5 w-4 rounded bg-forest/50" />
                          </span>
                        ) : l.hero === "cinematic" ? (
                          <span className="flex h-full w-full flex-col justify-end gap-1 pb-1">
                            <span className="h-1.5 w-20 rounded bg-cream/80" />
                            <span className="h-1 w-12 rounded bg-gold-light/70" />
                          </span>
                        ) : l.hero === "cascade" ? (
                          <span className="flex w-24 flex-col gap-0.5">
                            <span className="h-1.5 w-14 self-start rounded bg-forest/50" />
                            <span className="h-1 w-4 self-center rounded bg-gold/60" />
                            <span className="h-1.5 w-14 self-end rounded bg-forest/50" />
                          </span>
                        ) : l.hero === "monogram" ? (
                          <span className="relative flex h-11 w-20 items-center justify-center">
                            <span className="absolute font-serif text-4xl text-gold/20">KB</span>
                            <span className="relative h-1.5 w-12 rounded bg-forest/60" />
                          </span>
                        ) : l.hero === "duet" ? (
                          <span className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-1">
                            <span className="h-2 rounded bg-forest/50" />
                            <span className="h-5 w-5 rounded-full border border-gold/60" />
                            <span className="h-2 rounded bg-forest/50" />
                          </span>
                        ) : (
                          <span className="flex flex-col items-center gap-1">
                            <span className="h-1.5 w-14 rounded bg-forest/50" />
                            <span className="h-1 w-8 rounded bg-gold/60" />
                            <span className="h-1 w-11 rounded bg-forest/25" />
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card
              title="Paket Font"
              desc="Setiap paket memuat tiga jenis huruf: judul, tulisan tangan untuk nama, dan teks antarmuka."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {FONT_PRESETS.map((f) => {
                  const active = draft.fontId === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => patch({ fontId: f.id })}
                      className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 ${
                        active
                          ? "border-gold bg-cream shadow-[0_14px_30px_-14px_rgba(138,106,59,0.5)]"
                          : "border-gold/25 bg-cream/70 hover:border-gold/60"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dark">
                          {f.name}
                        </span>
                        {active && <Check className="h-3.5 w-3.5 shrink-0 text-forest" />}
                      </span>
                      <span
                        className="mt-2 block text-3xl leading-tight text-forest"
                        style={{ fontFamily: `"${f.script}", cursive` }}
                      >
                        {draft.bride.short} &amp; {draft.groom.short}
                      </span>
                      <span
                        className="mt-1 block text-lg text-ink/75"
                        style={{ fontFamily: `"${f.serif}", serif` }}
                      >
                        Undangan Pernikahan
                      </span>
                      <span
                        className="mt-1 block text-[10px] uppercase tracking-[0.25em] text-ink/50"
                        style={{ fontFamily: `"${f.sans}", sans-serif` }}
                      >
                        {f.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="font-sans text-[11px] leading-relaxed text-ink/50">
                Pratinjau memakai font yang sedang dimuat browser. Setelah disimpan, seluruh undangan
                memakai paket terpilih.
              </p>
            </Card>

            <Card
              title="Foto Latar (Background)"
              desc="Foto pengantin akan menjadi latar sampul pembuka, bagian hero, dan penutup — menggantikan motif floral bawaan."
            >
              <ImagePicker
                label="Foto Latar Utama"
                value={draft.backgroundImage}
                onChange={(v) => patch({ backgroundImage: v })}
                mediaKey="background"
                defaultValue={DEFAULT_SETTINGS.backgroundImage}
                accept="image/*"
                previewClass="h-24 w-40"
                aspect={9 / 16}
                shapeClass="rounded-2xl"
                hint="Bingkai crop memakai rasio layar HP (9:16) karena sebagian besar tamu membuka undangan dari ponsel. Kosongkan untuk kembali ke motif floral."
              />
              <div>
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
                  Peredam Latar — {draft.backgroundDim}%
                </span>
                <input
                  type="range"
                  min={0}
                  max={92}
                  value={draft.backgroundDim}
                  onChange={(e) => patch({ backgroundDim: Number(e.target.value) })}
                  className="mt-2 w-full accent-gold"
                />
                <p className="mt-1 font-sans text-[11px] text-ink/50">
                  Semakin tinggi, semakin terang lapisan pelindungnya — agar tulisan tetap terbaca di atas foto.
                </p>
              </div>
            </Card>

            <Card title="Foto Pendukung">
              <ImagePicker
                label="Foto Bagian Kutipan (bingkai lengkung)"
                value={draft.quotePhoto}
                onChange={(v) => patch({ quotePhoto: v })}
                mediaKey="quote-photo"
                defaultValue={DEFAULT_SETTINGS.quotePhoto}
                accept="image/*"
                previewClass="h-28 w-24"
                aspect={activeLayout.portrait === "circle" ? 1 : 3 / 4}
                shapeClass={portraitShape}
              />
              <ImagePicker
                label="Foto Lokasi Acara"
                value={draft.venue.photo}
                onChange={(v) => patchVenue({ photo: v })}
                mediaKey="venue-photo"
                defaultValue={DEFAULT_SETTINGS.venue.photo}
                accept="image/*"
                previewClass="h-24 w-40"
                aspect={16 / 9}
                shapeClass="rounded-2xl"
              />
            </Card>
          </>
        )}

        {/* ================= TAB: ACARA ================= */}
        {tab === "acara" && (
          <>
            <Card title="Tanggal & Waktu Utama" desc="Menggerakkan hitung mundur dan tanggal pada sampul serta hero.">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
                    Tanggal &amp; Jam Akad
                  </span>
                  <input
                    type="datetime-local"
                    value={toLocalInput(draft.dateISO)}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gold/30 bg-cream px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/25"
                  />
                </label>
                <Field
                  label="Label Tanggal (teks bebas)"
                  value={draft.dateLabel}
                  onChange={(v) => patch({ dateLabel: v })}
                  hint="Terisi otomatis saat tanggal diubah — boleh disunting manual."
                />
              </div>
            </Card>

            {draft.events.map((ev, i) => (
              <Card key={i} title={`Rangkaian Acara ${i + 1}`}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Nama Acara" value={ev.title} onChange={(v) => patchEvent(i, { title: v })} />
                  <Field label="Waktu" value={ev.time} onChange={(v) => patchEvent(i, { time: v })} placeholder="08.00 — 10.00 WIB" />
                </div>
                <Field label="Tanggal (teks)" value={ev.date} onChange={(v) => patchEvent(i, { date: v })} />
                <Area label="Catatan Singkat" rows={2} value={ev.note} onChange={(v) => patchEvent(i, { note: v })} />
              </Card>
            ))}
          </>
        )}

        {/* ================= TAB: LOKASI ================= */}
        {tab === "lokasi" && (
          <Card title="Lokasi & Peta">
            <Field label="Nama Tempat" value={draft.venue.name} onChange={(v) => patchVenue({ name: v })} />
            <Area label="Alamat Lengkap" rows={2} value={draft.venue.address} onChange={(v) => patchVenue({ address: v })} />
            <Field
              label="Tautan Google Maps (tombol)"
              value={draft.venue.mapsUrl}
              onChange={(v) => patchVenue({ mapsUrl: v })}
              hint="Buka Google Maps → Bagikan → salin tautan."
            />
            <Field
              label="URL Semat Peta (iframe)"
              value={draft.venue.mapsEmbed}
              onChange={(v) => patchVenue({ mapsEmbed: v })}
              hint="Google Maps → Bagikan → Sematkan peta → salin nilai src. Contoh: https://maps.google.com/maps?q=-6.24,106.79&z=15&output=embed"
            />
          </Card>
        )}

        {/* ================= TAB: HADIAH ================= */}
        {tab === "hadiah" && (
          <>
            {draft.gifts.map((g, i) => (
              <Card key={i} title={`Rekening ${i + 1}`}>
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field label="Bank / E-Wallet" value={g.bank} onChange={(v) => patchGift(i, { bank: v })} />
                  <Field label="Nomor" value={g.number} onChange={(v) => patchGift(i, { number: v })} />
                  <Field label="Atas Nama" value={g.holder} onChange={(v) => patchGift(i, { holder: v })} />
                </div>
              </Card>
            ))}
            <Card title="Alamat Kado Fisik">
              <Area label="Alamat Pengiriman" rows={2} value={draft.kadoAddress} onChange={(v) => patch({ kadoAddress: v })} />
            </Card>
          </>
        )}

        {/* ================= TAB: TAMU & WHATSAPP ================= */}
        {tab === "tamu" && <GuestBookPanel settings={draft} />}

        {/* ================= TAB: WARNA ================= */}
        {tab === "warna" && (
          <>
            <Card
              title="Tema Siap Pakai"
              desc="Satu klik mengubah seluruh palet undangan — latar, emas, warna pokok, hingga ornamen daun. Tekan Simpan untuk menerapkan."
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {THEME_PRESETS.map((p) => {
                  const active = JSON.stringify(p.colors) === JSON.stringify(draft.colors);
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => patch({ colors: { ...p.colors } })}
                      className={`group rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 ${
                        active
                          ? "border-gold bg-cream shadow-[0_14px_30px_-14px_rgba(138,106,59,0.5)]"
                          : "border-gold/25 bg-cream/70 hover:border-gold/60"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {[p.colors.ivory, p.colors.gold, p.colors.forest, p.colors.rose].map((c) => (
                          <span
                            key={c}
                            className="h-6 w-6 rounded-full border border-black/10 shadow-inner"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        {active && (
                          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-forest px-2.5 py-1 font-sans text-[8px] font-semibold uppercase tracking-[0.2em] text-cream">
                            <Check className="h-2.5 w-2.5 text-gold-light" /> Aktif
                          </span>
                        )}
                      </span>
                      <span className="mt-3 block font-serif text-lg font-semibold text-forest">
                        {p.name}
                      </span>
                      <span className="mt-0.5 block font-sans text-[11px] text-ink/55">{p.desc}</span>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card
              title="Kustom Setiap Warna"
              desc="Atur satu per satu hingga menemukan kombinasi yang paling mewakili kalian berdua."
            >
              <div>
                <p className="mb-2 inline-flex items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-dark">
                  <Sparkles className="h-3.5 w-3.5" /> Pratinjau Campuran Saat Ini
                </p>
                <div className="flex h-10 overflow-hidden rounded-xl border border-gold/30">
                  {PALETTE_FIELDS.map((f) => (
                    <span
                      key={f.key}
                      title={f.label}
                      className="h-full flex-1"
                      style={{ backgroundColor: draft.colors[f.key] }}
                    />
                  ))}
                </div>
              </div>

              {["Latar & Kartu", "Aksen Emas", "Warna Pokok", "Sentuhan Lembut"].map((group) => (
                <div key={group}>
                  <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-dark">
                    {group}
                  </p>
                  <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                    {PALETTE_FIELDS.filter((f) => f.group === group).map((f) => (
                      <ColorField
                        key={f.key}
                        label={f.label}
                        value={draft.colors[f.key]}
                        onChange={(v) => patch({ colors: { ...draft.colors, [f.key]: v } })}
                      />
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => patch({ colors: { ...DEFAULT_SETTINGS.colors } })}
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-forest transition-colors hover:bg-gold/15"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Kembalikan Warna Bawaan
              </button>
            </Card>
          </>
        )}

        {/* ================= TAB: UCAPAN ================= */}
        {tab === "ucapan" && (
          <Card
            title="Kelola RSVP & Ucapan"
            desc="Catatan: RSVP & ucapan disimpan di perangkat tamu yang mengisinya. Daftar ini menampilkan entri yang tercatat di perangkat Anda — berguna untuk membersihkan data uji coba."
          >
            <div className="flex flex-wrap gap-2.5">
              {(
                [
                  ["hadir", "Hadir", CheckCircle2],
                  ["ragu", "InsyaAllah", HelpCircle],
                  ["tidak", "Berhalangan", XCircle],
                ] as const
              ).map(([k, label, Icon]) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-cream px-4 py-2 font-sans text-[11px] font-medium uppercase tracking-widest text-forest"
                >
                  <Icon className="h-3.5 w-3.5 text-gold-dark" />
                  {label}: {wishes.filter((w) => w.attend === k).length}
                </span>
              ))}
              <span className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 font-sans text-[11px] font-medium uppercase tracking-widest text-cream">
                Total: {wishes.length}
              </span>
            </div>

            <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
              {wishes.length === 0 && (
                <p className="rounded-xl border border-gold/25 bg-cream px-5 py-6 text-center font-serif text-sm italic text-ink/55">
                  Belum ada ucapan di perangkat ini.
                </p>
              )}
              {wishes.map((w) => (
                <div
                  key={`${w.at}-${w.name}`}
                  className="flex items-start justify-between gap-3 rounded-xl border border-gold/25 bg-cream px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-sm font-semibold text-forest">{w.name}</span>
                      <span className="rounded-full bg-gold/15 px-2 py-0.5 font-sans text-[9px] uppercase tracking-widest text-gold-dark">
                        {w.attend === "hadir" ? "Hadir" : w.attend === "ragu" ? "InsyaAllah" : "Berhalangan"}
                      </span>
                    </div>
                    <p className="mt-1 font-serif text-sm italic leading-relaxed text-ink/70">{w.message}</p>
                  </div>
                  <button
                    onClick={() => removeWish(w)}
                    aria-label={`Hapus ucapan dari ${w.name}`}
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rose/40 text-rose transition-colors hover:bg-rose hover:text-cream"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={seedAllWishes}
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-forest transition-colors hover:bg-gold/15"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Kembalikan Contoh
              </button>
              <button
                onClick={clearAllWishes}
                className="inline-flex items-center gap-2 rounded-full border border-rose/60 px-5 py-2 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-rose transition-colors hover:bg-rose hover:text-cream"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Kosongkan Semua
              </button>
            </div>
          </Card>
        )}

        {/* ================= TAB: SINKRONISASI CLOUD ================= */}
        {tab === "sinkro" && (
          <>
            <div className="flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-5 py-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" />
              <p className="font-sans text-xs leading-relaxed text-cream/80">
                <span className="font-semibold text-gold-light">Mengapa perlu ini?</span> Tanpa cloud,
                perubahan Anda (foto, warna, voice note) hanya tersimpan di browser perangkat ini —
                itulah sebabnya HP tamu menampilkan versi bawaan. Dengan cloud gratis dari Supabase,
                setiap kali Anda menekan <span className="font-semibold text-gold-light">Simpan</span>,
                semuanya terunggah dan otomatis dimuat di semua perangkat yang membuka tautan
                berpenanda cloud.
              </p>
            </div>

            <Card title="Pengaturan Satu Kali (±5 menit)" desc="Gunakan Supabase — gratis, tanpa kartu kredit.">
              <div className="space-y-4 font-sans text-[13px] leading-relaxed text-ink/75">
                <p>
                  <span className="font-semibold text-forest">1.</span> Buka{" "}
                  <span className="font-mono text-forest">supabase.com</span> → Start your project →
                  masuk (bisa dengan GitHub) → <span className="font-semibold text-forest">New project</span>{" "}
                  → isi nama bebas (mis. undangan), password database bebas (simpan), region{" "}
                  <span className="font-semibold text-forest">Singapore</span> → Create.
                </p>
                <p>
                  <span className="font-semibold text-forest">2.</span> Di menu kiri pilih{" "}
                  <span className="font-semibold text-forest">Storage → New bucket</span> → Name:{" "}
                  <span className="font-mono text-forest">invite</span> → aktifkan{" "}
                  <span className="font-semibold text-forest">Public bucket</span> → Create.
                </p>
                <div>
                  <p>
                    <span className="font-semibold text-forest">3.</span> Izinkan unggahan: menu{" "}
                    <span className="font-semibold text-forest">SQL Editor → New query</span> → tempel
                    kode ini → <span className="font-semibold text-forest">Run</span>. SQL ini aman
                    dijalankan ulang karena policy lama akan dihapus terlebih dahulu:
                  </p>
                  <Code>{`drop policy if exists "baca invite" on storage.objects;
drop policy if exists "unggah anon" on storage.objects;
drop policy if exists "ubah anon" on storage.objects;
drop policy if exists "hapus anon" on storage.objects;

create policy "baca invite" on storage.objects
  for select to anon
  using (bucket_id = 'invite');

create policy "unggah anon" on storage.objects
  for insert to anon
  with check (bucket_id = 'invite');

create policy "ubah anon" on storage.objects
  for update to anon
  using (bucket_id = 'invite')
  with check (bucket_id = 'invite');

create policy "hapus anon" on storage.objects
  for delete to anon
  using (bucket_id = 'invite');`}</Code>
                  <p className="mt-2 text-[11px] text-ink/55">
                    Penting: policy <span className="font-mono text-forest">SELECT</span> diperlukan
                    oleh mekanisme upsert saat <span className="font-mono text-forest">settings.json</span>{" "}
                    atau media yang sama diperbarui.
                  </p>
                </div>
                <p>
                  <span className="font-semibold text-forest">4.</span> Salin kuncinya:{" "}
                  <span className="font-semibold text-forest">Project Settings (ikon gir) → Data API / API</span>{" "}
                  → ambil <span className="font-semibold text-forest">Project URL</span> dan kunci{" "}
                  <span className="font-semibold text-forest">anon public</span>.
                </p>
              </div>
            </Card>

            <Card
              title="Gagal Koneksi? Cek 6 Hal Ini"
              desc="90% kasus gagal disebabkan salah satu poin di bawah."
            >
              <ol className="list-decimal space-y-2.5 pl-5 font-sans text-[13px] leading-relaxed text-ink/75">
                <li>
                  <span className="font-semibold text-forest">Project URL</span> harus berbentuk{" "}
                  <span className="font-mono text-forest">https://xxxx.supabase.co</span> — bukan alamat
                  halaman dashboard{" "}
                  <span className="font-mono text-forest">supabase.com/dashboard/…</span>
                </li>
                <li>
                  Kunci yang disalin adalah{" "}
                  <span className="font-semibold text-forest">anon public</span> (diawali{" "}
                  <span className="font-mono text-forest">eyJ…</span>) atau{" "}
                  <span className="font-semibold text-forest">Publishable key</span> pada dashboard baru
                  (<span className="font-mono text-forest">sb_publishable_…</span>) —{" "}
                  <span className="font-semibold text-rose">jangan pernah</span> pakai service_role/secret.
                </li>
                <li>
                  Tidak ada <span className="font-semibold text-forest">spasi atau baris baru</span> yang
                  ikut tersalin di awal/akhir kunci — coba salin ulang dengan tombol copy di dashboard.
                </li>
                <li>
                  Bucket bernama persis <span className="font-mono text-forest">invite</span> (huruf kecil
                  semua) dan toggle <span className="font-semibold text-forest">Public bucket</span> aktif —
                  cek di Storage.
                </li>
                <li>
                  Policy SQL sudah di-<span className="font-semibold text-forest">Run</span> di project yang
                  benar dan muncul tulisan <span className="font-mono text-forest">Success</span>.
                </li>
                <li>
                  Project tidak sedang <span className="font-semibold text-forest">paused</span> — versi
                  gratis tidur setelah ±1 minggu tanpa aktivitas; buka dashboard Supabase lalu klik{" "}
                  <span className="font-semibold text-forest">Restore/Resume</span>.
                </li>
              </ol>
            </Card>

            <Card title="Hubungkan">
              <Field
                label="Supabase Project URL"
                value={cloudUrl}
                onChange={setCloudUrl}
                placeholder="https://abcdefgh.supabase.co"
              />
              <Area
                label="Anon Public Key"
                rows={3}
                value={cloudKey}
                onChange={setCloudKey}
                hint="Kunci panjang diawali eyJ… — hanya tersimpan di perangkat Anda, tidak pernah dikirim ke tamu."
              />
              <Field
                label="Nama Bucket"
                value={cloudBucket}
                onChange={setCloudBucket}
                hint="Harus sama persis dengan nama bucket di langkah 2 (bawaan: invite)."
              />
              <button
                onClick={connectCloud}
                disabled={connecting}
                className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-cream shadow-md transition-colors hover:bg-forest-deep disabled:opacity-50"
              >
                <CloudUpload className="h-4 w-4 text-gold-light" />
                {connecting ? "Menguji koneksi…" : "Hubungkan & Sinkronkan Sekarang"}
              </button>
              {cloudMsg && (
                <p
                  className={`rounded-xl px-4 py-3 font-sans text-xs leading-relaxed ${
                    cloudMsg.ok ? "bg-forest text-cream" : "bg-rose/25 text-forest"
                  }`}
                >
                  {cloudMsg.text}
                </p>
              )}
            </Card>

            {cloudAdmin && (
              <Card title="Status & Berbagi">
                <div className="grid gap-3 font-sans text-[13px] text-ink/75 sm:grid-cols-2">
                  <div className="rounded-xl border border-gold/25 bg-cream p-4">
                    <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-dark">
                      Status
                    </p>
                    <p className="mt-1.5 inline-flex items-center gap-2 font-semibold text-forest">
                      <span className="h-2.5 w-2.5 rounded-full bg-sage" />
                      Terhubung
                    </p>
                    <p className="mt-1 break-all font-mono text-[11px] text-ink/55">{cloudAdmin.url}</p>
                  </div>
                  <div className="rounded-xl border border-gold/25 bg-cream p-4">
                    <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-dark">
                      Sinkron Terakhir
                    </p>
                    <p className="mt-1.5 font-semibold text-forest">
                      {lastSync
                        ? new Intl.DateTimeFormat("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(lastSync))
                        : "belum pernah"}
                    </p>
                    <p className="mt-1 text-[11px] text-ink/55">
                      Tombol Simpan kini otomatis ikut menyinkronkan.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-dark">
                    Tautan undangan dengan penanda cloud (contoh)
                  </p>
                  <p className="mt-2 break-all rounded-xl bg-paper/70 px-4 py-3 font-mono text-[11px] text-ink/70">
                    {buildInviteLink("Nama Tamu")}
                  </p>
                  <p className="mt-2 font-sans text-[11px] leading-relaxed text-ink/55">
                    Selama cloud terhubung, setiap tautan yang dibuat di tab{" "}
                    <span className="font-semibold text-forest">Tamu &amp; WA</span> otomatis
                    membawa penanda cloud — HP tamu memuat versi terbaru Anda, termasuk voice note.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => runCloudSync(cloudAdmin, structuredClone(draft))}
                    disabled={syncing}
                    className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-cream transition-colors hover:bg-forest-deep disabled:opacity-50"
                  >
                    <CloudUpload className="h-3.5 w-3.5 text-gold-light" />
                    {syncing ? "Menyinkronkan…" : "Sinkronkan Sekarang"}
                  </button>
                  <button
                    onClick={disconnectCloud}
                    className="inline-flex items-center gap-2 rounded-full border border-rose/60 px-5 py-2.5 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-rose transition-colors hover:bg-rose hover:text-cream"
                  >
                    <Unplug className="h-3.5 w-3.5" />
                    Putuskan Cloud
                  </button>
                </div>
              </Card>
            )}
          </>
        )}

        {/* ================= TAB: MUSIK & PIN ================= */}
        {tab === "musik" && (
          <>
            <Card title="Backsound Musik" desc="Diputar otomatis setelah tamu menekan tombol Buka Undangan.">
              <AudioPicker
                label="File Musik"
                value={draft.music}
                onChange={(v) => patch({ music: v })}
                mediaKey="music"
                defaultValue={DEFAULT_SETTINGS.music}
                accept="audio/*"
                hint="Lagu instrumental lembut berdurasi 2–4 menit adalah pilihan ideal."
              />
            </Card>
            <Card title="Keamanan" desc="PIN ini melindungi panel admin dari tamu.">
              <Field
                label="PIN Admin"
                value={draft.adminPin}
                onChange={(v) => patch({ adminPin: v.replace(/\s/g, "") })}
                hint="4–8 digit/angka disarankan. Catat baik-baik — tanpa backend, PIN yang lupa mengharuskan reset total."
              />
            </Card>
          </>
        )}

        {/* zona berbahaya */}
        <div className="rounded-2xl border border-rose/40 bg-rose/10 p-5 sm:p-7">
          <h3 className="font-serif text-xl font-semibold text-cream">Zona Berbahaya</h3>
          <p className="mt-1 font-sans text-xs leading-relaxed text-cream/60">
            Mengembalikan seluruh undangan ke pengaturan awal dan menghapus semua foto &amp; audio
            yang pernah diunggah dari perangkat ini.
          </p>
          <button
            onClick={resetAll}
            disabled={resetting}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-rose/60 px-6 py-2.5 font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-rose transition-colors hover:bg-rose hover:text-cream disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {resetting ? "Mereset…" : "Reset Semua ke Bawaan"}
          </button>
        </div>

        <p className="text-center font-sans text-[10px] tracking-[0.25em] text-cream/35">
          PANEL ADMIN · {draft.bride.short.toUpperCase()} &amp; {draft.groom.short.toUpperCase()}
        </p>
      </main>

      {/* tombol simpan melayang saat ada perubahan */}
      {dirty && (
        <motion.button
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={save}
          disabled={syncing}
          style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
          className="fixed left-1/2 z-40 max-w-[calc(100vw-2rem)] -translate-x-1/2 truncate rounded-full bg-gold px-6 py-3.5 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-forest-deep shadow-2xl transition-colors hover:bg-gold-light disabled:opacity-60 sm:px-8 sm:text-xs sm:tracking-[0.3em]"
        >
          {syncing ? "Mengunggah ke cloud…" : cloudAdmin ? "Simpan & Sinkron ke Cloud" : "Simpan Perubahan"}
        </motion.button>
      )}
    </div>
  );
}
