import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Copy, Check, Trash2, ExternalLink, Users, Info, Link2,
  MessageCircleHeart, RotateCcw, UserRound, ClipboardList, CalendarClock,
  FileSpreadsheet,
} from "lucide-react";
import type { InvitationSettings } from "../../lib/settings";
import {
  useGuestBook, addGuest, removeGuest, markSent, clearGuestBook,
  buildInviteLink, buildWaUrl, renderWaMessage, normalizeWaPhone,
  getWaTemplate, saveWaTemplate, DEFAULT_WA_TEMPLATE, WA_PLACEHOLDERS,
  type InviteGuest,
} from "../../lib/guestBook";
import { loadWishes, type Wish } from "../../lib/wishes";
import { Card } from "./fields";

/* ----------------------------- ekspor CSV ---------------------------- */

const ATTEND_LABEL: Record<Wish["attend"], string> = {
  hadir: "Hadir",
  ragu: "InsyaAllah Hadir",
  tidak: "Berhalangan",
};

/** sel CSV: selalu dikutip agar aman dari koma/titik koma/kutip di teks */
function csvCell(v: string | number): string {
  return `"${String(v).replace(/"/g, '""')}"`;
}

function fmtDate(ts?: number): string {
  if (!ts) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date(ts))
    .replace(/\./g, ":");
}

function exportGuestsCsv(guests: InviteGuest[], settings: InvitationSettings) {
  const wishes = loadWishes();
  const byName = new Map<string, Wish>();
  for (const w of wishes) byName.set(w.name.trim().toLowerCase(), w);

  const header = [
    "No",
    "Nama Tamu",
    "Nomor WhatsApp",
    "Status Undangan",
    "Waktu Kirim WA",
    "Konfirmasi Kehadiran",
    "Jumlah Orang",
    "Ucapan & Doa",
    "Tautan Undangan",
  ];

  const rows: string[][] = [];
  let no = 0;
  const matched = new Set<string>();

  // 1) tamu dari buku tamu + status RSVP-nya (bila sudah mengisi)
  for (const g of guests) {
    const w = byName.get(g.name.trim().toLowerCase());
    if (w) matched.add(w.name.trim().toLowerCase());
    rows.push([
      String(++no),
      g.name,
      g.phone || "-",
      g.sentAt ? "Terkirim via WA" : "Belum Dikirim",
      fmtDate(g.sentAt),
      w ? ATTEND_LABEL[w.attend] : "Belum Konfirmasi",
      w && w.attend === "hadir" ? String(w.count ?? 1) : "-",
      w ? w.message : "-",
      buildInviteLink(g.name),
    ]);
  }

  // 2) RSVP yang masuk dari nama di luar daftar tamu
  for (const w of wishes) {
    const key = w.name.trim().toLowerCase();
    if (matched.has(key)) continue;
    rows.push([
      String(++no),
      `${w.name} (langsung RSVP)`,
      "-",
      "-",
      "-",
      ATTEND_LABEL[w.attend],
      w.attend === "hadir" ? String(w.count ?? 1) : "-",
      w.message,
      "-",
    ]);
  }

  // ringkasan di baris akhir
  const hadirCount = wishes.filter((w) => w.attend === "hadir").length;
  const pax = wishes
    .filter((w) => w.attend === "hadir")
    .reduce((sum, w) => sum + (w.count ?? 1), 0);
  rows.push([]);
  rows.push(["", `RINGKASAN — ${settings.bride.short} & ${settings.groom.short}`, "", "", "", "", "", "", ""]);
  rows.push(["", "Total tamu terdaftar", String(guests.length), "", "", "", "", "", ""]);
  rows.push(["", "Terkirim via WA", String(guests.filter((g) => g.sentAt).length), "", "", "", "", "", ""]);
  rows.push(["", "Konfirmasi hadir", String(hadirCount), "", "", "", "", "", ""]);
  rows.push(["", "Perkiraan jumlah tamu hadir", `${pax} orang`, "", "", "", "", "", ""]);

  const body = [header, ...rows]
    .map((r) => (r.length === 0 ? "" : r.map(csvCell).join(";")))
    .join("\r\n");

  // BOM agar Excel membaca UTF-8 dengan benar; pemisah ";" cocok untuk locale Indonesia
  const blob = new Blob(["\uFEFF" + body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `daftar-tamu-${settings.bride.short.toLowerCase()}-${settings.groom.short.toLowerCase()}-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      return true;
    } catch {
      return false;
    }
  }
}

/* ------------------------------ panel ------------------------------ */

export default function GuestBookPanel({ settings }: { settings: InvitationSettings }) {
  const guests = useGuestBook();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [template, setTemplate] = useState(getWaTemplate);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const mempelai = `${settings.bride.name} & ${settings.groom.name}`;
  const previewLink = useMemo(() => buildInviteLink(name || "Nama Tamu"), [name]);
  const previewMsg = useMemo(
    () =>
      renderWaMessage(template, {
        nama: (name || "Nama Tamu").trim(),
        link: previewLink,
        mempelai,
        tanggal: settings.dateLabel,
        lokasi: settings.venue.name,
      }),
    [template, name, previewLink, mempelai, settings.dateLabel, settings.venue.name],
  );

  const sentCount = guests.filter((g) => g.sentAt).length;
  const valid = name.trim().length > 0;

  const flashAdded = (id: string) => {
    setJustAdded(id);
    setTimeout(() => setJustAdded(null), 2600);
  };

  const handleCopy = async (g: InviteGuest) => {
    const ok = await copyText(buildInviteLink(g.name));
    if (ok) {
      setCopiedId(g.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSend = (g: InviteGuest, message?: string) => {
    const msg =
      message ??
      renderWaMessage(template, {
        nama: g.name,
        link: buildInviteLink(g.name),
        mempelai,
        tanggal: settings.dateLabel,
        lokasi: settings.venue.name,
      });
    markSent(g.id);
    window.open(buildWaUrl(g.phone, msg), "_blank", "noopener");
  };

  const handleSaveCopy = async () => {
    if (!valid) return;
    const g = addGuest(name, phone);
    await handleCopy(g);
    flashAdded(g.id);
    setName("");
    setPhone("");
  };

  const handleSaveSend = () => {
    if (!valid) return;
    const g = addGuest(name, phone);
    flashAdded(g.id);
    handleSend(g, previewMsg);
    setName("");
    setPhone("");
  };

  const inputCls =
    "w-full rounded-xl border border-gold/30 bg-cream px-4 py-3 font-sans text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-gold focus:ring-2 focus:ring-gold/25";

  return (
    <>
      {/* penjelasan alur */}
      <div className="flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-5 py-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" />
        <p className="font-sans text-xs leading-relaxed text-cream/80">
          <span className="font-semibold text-gold-light">Alurnya sederhana:</span> ketik nama tamu →
          tautan undangan personal otomatis dibuat → kirim langsung lewat{" "}
          <span className="font-semibold text-gold-light">WhatsApp</span> atau salin tautannya.
          Nama tamu akan tampil besar di sampul undangan saat tautan dibuka. Seluruh daftar tamu{" "}
          <span className="font-semibold text-gold-light">tersimpan di perangkat ini</span> dan bisa
          dikirim ulang kapan saja.
        </p>
      </div>

      {/* statistik */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Tamu", value: guests.length, icon: Users },
          { label: "Terkirim WA", value: sentCount, icon: Send },
          { label: "Belum Dikirim", value: guests.length - sentCount, icon: ClipboardList },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-gold/25 bg-forest/60 px-4 py-4 text-center"
          >
            <s.icon className="mx-auto h-4 w-4 text-gold-light" />
            <p className="mt-2 font-serif text-3xl font-semibold leading-none text-cream">
              {s.value}
            </p>
            <p className="mt-1.5 font-sans text-[9px] uppercase tracking-[0.22em] text-cream/55">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* formulir pembuatan */}
      <Card
        title="Buat Undangan Personal"
        desc="Isi nama tamu — tautan unik langsung terbentuk dan otomatis tersimpan ke daftar."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-dark">
              Nama Tamu <span className="text-rose">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveSend()}
              placeholder="cth: Budi Santoso & Keluarga"
              className={inputCls}
            />
            <p className="mt-1.5 font-sans text-[11px] text-ink/50">
              Persis seperti ini akan tertulis di sampul undangan.
            </p>
          </div>
          <div>
            <label className="mb-1.5 block font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-dark">
              Nomor WhatsApp <span className="font-normal normal-case text-ink/40">(opsional)</span>
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveSend()}
              placeholder="cth: 0812 3456 7890"
              inputMode="tel"
              className={inputCls}
            />
            <p className="mt-1.5 font-sans text-[11px] text-ink/50">
              {phone.trim()
                ? `Terkirim ke: ${normalizeWaPhone(phone) || "—"}`
                : "Kosongkan untuk memilih kontak manual di WhatsApp."}
            </p>
          </div>
        </div>

        {/* pratinjau tautan */}
        <div className="rounded-xl border border-gold/25 bg-paper/70 px-4 py-3">
          <p className="flex items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-dark">
            <Link2 className="h-3.5 w-3.5" /> Tautan undangan
          </p>
          <p className="mt-1.5 break-all font-mono text-[11px] leading-relaxed text-ink/70">
            {previewLink}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleSaveSend}
            disabled={!valid}
            className="inline-flex items-center gap-2 rounded-full bg-[#1f7a4d] px-6 py-3 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-cream shadow-md transition-all hover:bg-[#17603c] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
            Simpan & Kirim via WhatsApp
          </button>
          <button
            onClick={handleSaveCopy}
            disabled={!valid}
            className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-cream shadow-md transition-all hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Copy className="h-4 w-4" />
            Simpan & Salin Tautan
          </button>
        </div>
      </Card>

      {/* template pesan */}
      <Card
        title="Template Pesan WhatsApp"
        desc="Satu template untuk semua tamu — gunakan placeholder berikut, sisanya bebas Anda ubah."
      >
        <div className="flex flex-wrap gap-1.5">
          {WA_PLACEHOLDERS.map((p) => (
            <span
              key={p}
              className="rounded-full border border-gold/30 bg-cream px-3 py-1 font-mono text-[10px] text-forest"
            >
              {p}
            </span>
          ))}
        </div>
        <textarea
          value={template}
          onChange={(e) => {
            setTemplate(e.target.value);
            saveWaTemplate(e.target.value);
          }}
          rows={12}
          className={`${inputCls} resize-y leading-relaxed`}
        />
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={() => {
              setTemplate(DEFAULT_WA_TEMPLATE);
              saveWaTemplate(DEFAULT_WA_TEMPLATE);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dark transition-colors hover:bg-gold/10"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Kembalikan Template Bawaan
          </button>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink/45">
            Tersimpan otomatis
          </p>
        </div>

        {/* pratinjau gelembung WA */}
        <div>
          <p className="mb-2 flex items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-dark">
            <MessageCircleHeart className="h-3.5 w-3.5" /> Pratinjau Pesan
          </p>
          <div className="rounded-2xl rounded-tl-sm border border-gold/20 bg-[#e7f3e4] p-4 shadow-sm">
            <p className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-[#1f2c22]">
              {previewMsg}
            </p>
            <p className="mt-2 text-right font-sans text-[10px] text-[#1f2c22]/50">
              {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} ✓✓
            </p>
          </div>
        </div>
      </Card>

      {/* daftar tamu tersimpan */}
      <Card
        title={`Daftar Tamu Tersimpan (${guests.length})`}
        desc="Data tidak hilang saat halaman ditutup. Kirim ulang, salin tautan, ekspor ke CSV (Excel), atau hapus kapan saja."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportGuestsCsv(guests, settings)}
              disabled={guests.length === 0}
              title="Unduh CSV berisi nama, status kirim, konfirmasi kehadiran, dan jumlah orang"
              className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 font-sans text-[9px] font-semibold uppercase tracking-[0.2em] text-cream shadow-sm transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FileSpreadsheet className="h-3 w-3 text-gold-light" /> Export CSV
            </button>
            {guests.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm(`Hapus SEMUA ${guests.length} data tamu dari perangkat ini?`))
                    clearGuestBook();
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-rose/50 px-4 py-2 font-sans text-[9px] font-semibold uppercase tracking-[0.2em] text-rose transition-colors hover:bg-rose hover:text-cream"
              >
                <Trash2 className="h-3 w-3" /> Hapus Semua
              </button>
            )}
          </div>
        }
      >
        {guests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gold/35 bg-cream/60 px-6 py-12 text-center">
            <UserRound className="mx-auto h-8 w-8 text-gold/60" />
            <p className="mt-4 font-serif text-lg italic text-ink/60">
              Belum ada tamu tersimpan
            </p>
            <p className="mx-auto mt-1.5 max-w-xs font-sans text-[11px] leading-relaxed text-ink/45">
              Ketik nama tamu pertama di formulir atas — tautan undangannya otomatis tercatat di
              sini.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {guests.map((g) => (
                <motion.li
                  key={g.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  className={`rounded-2xl border bg-cream p-4 transition-colors ${
                    justAdded === g.id ? "border-gold shadow-[0_10px_25px_-12px_rgba(138,106,59,0.55)]" : "border-gold/25"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="break-safe font-serif text-lg font-semibold text-forest">
                          {g.name}
                        </span>
                        {g.sentAt ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sage/15 px-2.5 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-[0.18em] text-forest">
                            <Check className="h-3 w-3" /> Terkirim
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-[0.18em] text-gold-dark">
                            Baru
                          </span>
                        )}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[11px] text-ink/50">
                        <span className="font-mono">{g.phone || "tanpa nomor"}</span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="h-3 w-3" />
                          dibuat{" "}
                          {new Intl.DateTimeFormat("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(g.createdAt))}
                        </span>
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => handleSend(g)}
                        title="Kirim via WhatsApp"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#1f7a4d] px-4 py-2 font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-cream transition-colors hover:bg-[#17603c]"
                      >
                        <Send className="h-3.5 w-3.5" /> WA
                      </button>
                      <button
                        onClick={() => handleCopy(g)}
                        title="Salin tautan undangan"
                        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 font-sans text-[10px] font-semibold uppercase tracking-[0.15em] transition-colors ${
                          copiedId === g.id
                            ? "border-sage bg-sage/15 text-forest"
                            : "border-gold/40 text-gold-dark hover:bg-gold/10"
                        }`}
                      >
                        {copiedId === g.id ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {copiedId === g.id ? "Tersalin" : "Salin"}
                      </button>
                      <a
                        href={buildInviteLink(g.name)}
                        target="_blank"
                        rel="noreferrer"
                        title="Buka undangan tamu ini"
                        className="inline-flex items-center justify-center rounded-full border border-gold/40 p-2 text-gold-dark transition-colors hover:bg-gold/10"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus undangan untuk ${g.name}?`)) removeGuest(g.id);
                        }}
                        title="Hapus tamu"
                        className="inline-flex items-center justify-center rounded-full border border-rose/50 p-2 text-rose transition-colors hover:bg-rose hover:text-cream"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
        <p className="font-sans text-[11px] leading-relaxed text-ink/50">
          Status hadir pada hasil export dibaca dari RSVP yang tercatat di perangkat ini (dicocokkan
          berdasarkan nama). RSVP yang diisi tamu di perangkatnya sendiri tetap tersimpan di sana.
        </p>
      </Card>
    </>
  );
}
