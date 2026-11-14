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

/* ====================== EKSPOR EXCEL ASLI (.xlsx) ======================
   Menggunakan workbook Excel beneran supaya:
   - lebih stabil dibuka di Excel / Google Sheets / Numbers
   - kolom rapi
   - tidak ada masalah separator / kutip / karakter aneh
   - autofilter & lebar kolom otomatis
   ====================================================================== */

const ATTEND_LABEL: Record<Wish["attend"], string> = {
  hadir: "Hadir",
  ragu: "InsyaAllah Hadir",
  tidak: "Berhalangan",
};

async function exportGuestsExcel(guests: InviteGuest[], settings: InvitationSettings) {
  const wishes = loadWishes();
  const byName = new Map<string, Wish>();
  for (const w of wishes) byName.set(w.name.trim().toLowerCase(), w);

  const rows = guests.map((g, i) => {
    const wish = byName.get(g.name.trim().toLowerCase());
    return {
      No: i + 1,
      "Nama Tamu": g.name,
      "Status Kehadiran": wish ? ATTEND_LABEL[wish.attend] : "Belum Konfirmasi",
      "Jumlah Kedatangan": wish?.attend === "hadir" ? wish.count ?? 1 : "-",
    };
  });

  const { utils, writeFileXLSX } = await import("xlsx");
  const workbook = utils.book_new();
  const worksheet = utils.json_to_sheet(rows, {
    header: ["No", "Nama Tamu", "Status Kehadiran", "Jumlah Kedatangan"],
  });

  // lebar kolom agar nyaman dibaca
  worksheet["!cols"] = [
    { wch: 6 },
    { wch: 34 },
    { wch: 24 },
    { wch: 18 },
  ];

  // filter pada header
  worksheet["!autofilter"] = { ref: "A1:D1" };

  // freeze header row (beberapa viewer mendukung)
  (worksheet as Record<string, unknown>)["!freeze"] = { xSplit: 0, ySplit: 1 };

  utils.book_append_sheet(workbook, worksheet, "Daftar Tamu");

  // metadata workbook
  workbook.Props = {
    Title: `Daftar Tamu ${settings.bride.short} & ${settings.groom.short}`,
    Subject: "Wedding Guest List",
    Author: `${settings.bride.short} & ${settings.groom.short}`,
    CreatedDate: new Date(),
  };

  const stamp = new Date().toISOString().slice(0, 10);
  writeFileXLSX(
    workbook,
    `daftar-tamu-${settings.bride.short.toLowerCase()}-${settings.groom.short.toLowerCase()}-${stamp}.xlsx`,
    { compression: true },
  );
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
        desc="Data tidak hilang saat halaman ditutup. Kirim ulang, salin tautan, ekspor ke Excel (.xlsx), atau hapus kapan saja."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportGuestsExcel(guests, settings)}
              disabled={guests.length === 0}
              title="Unduh file Excel berisi nama tamu, status kehadiran, dan jumlah kedatangan"
              className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 font-sans text-[9px] font-semibold uppercase tracking-[0.2em] text-cream shadow-sm transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FileSpreadsheet className="h-3 w-3 text-gold-light" /> Export Excel
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
          File Excel berisi: nama tamu, konfirmasi kehadiran, dan jumlah orang — data RSVP
          dicocokkan berdasarkan nama dari form ucapan di perangkat ini.
        </p>
      </Card>
    </>
  );
}
