import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, MessageCircleHeart, CheckCircle2, XCircle, HelpCircle, Users } from "lucide-react";
import Section, { Reveal } from "./Section";
import { useWishes, addWish, type Wish } from "../lib/wishes";
import { getWritableCloud } from "../lib/cloudConfig";
import { pushWishesToCloud } from "../lib/cloud";

const attendMeta = {
  hadir:  { label: "Hadir",        icon: CheckCircle2, cls: "text-forest"    },
  ragu:   { label: "InsyaAllah",   icon: HelpCircle,   cls: "text-gold-dark" },
  tidak:  { label: "Berhalangan",  icon: XCircle,       cls: "text-rose"      },
} as const;

const PAX_OPTIONS = [1, 2, 3, 4, 5, 6] as const;

export default function Wishes() {
  const wishes   = useWishes();           // reaktif — update dari mana pun langsung tampil
  const [name,    setName]    = useState("");
  const [attend,  setAttend]  = useState<Wish["attend"]>("hadir");
  const [pax,     setPax]     = useState<number>(1);
  const [message, setMessage] = useState("");
  const [sent,    setSent]    = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || sending) return;
    setSending(true);

    const entry: Wish = {
      name:    name.trim(),
      attend,
      message: message.trim(),
      at:      Date.now(),
      ...(attend === "hadir" ? { count: pax } : {}),
    };

    // 1) simpan ke store lokal + localStorage (langsung tampil)
    addWish(entry);

    // 2) push ke Supabase bila cloud aktif (admin ATAU tamu dengan anon key)
    const writable = getWritableCloud();
    if (writable) {
      const { loadWishes } = await import("../lib/wishes");
      await pushWishesToCloud(writable, loadWishes()).catch(() => {});
    }

    setName("");
    setMessage("");
    setAttend("hadir");
    setPax(1);
    setSent(true);
    setSending(false);
    setTimeout(() => setSent(false), 2400);
  };

  const count    = wishes.filter((w) => w.attend === "hadir").length;
  const totalPax = wishes
    .filter((w) => w.attend === "hadir")
    .reduce((sum, w) => sum + (w.count ?? 1), 0);

  return (
    <Section
      id="ucapan"
      label="RSVP &amp; Ucapan"
      title="Doa untuk Kedua Mempelai"
      subtitle="Konfirmasi kehadiran dan titipkan doa terbaikmu — setiap kata sangat berarti bagi kami."
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        {/* form */}
        <Reveal>
          <form
            onSubmit={submit}
            className="relative rounded-[2rem] border border-gold/30 bg-cream/70 p-7 shadow-[0_45px_100px_-20px_rgba(38,47,32,0.25)] backdrop-blur-md sm:p-10"
          >
            <span className="pointer-events-none absolute inset-3 rounded-[1.25rem] border border-gold/20" />
            <div className="relative">
              <label className="font-sans text-[9px] font-medium uppercase tracking-[0.45em] text-gold-dark">
                Nama
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tulis namamu…"
                className="mt-2 w-full rounded-xl border border-gold/25 bg-ivory/50 px-4 py-3 font-serif text-[15px] text-ink outline-none transition focus:border-gold focus:bg-ivory focus:ring-2 focus:ring-gold/20"
              />

              <label className="mt-6 block font-sans text-[9px] font-medium uppercase tracking-[0.45em] text-gold-dark">
                Konfirmasi Kehadiran
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(Object.keys(attendMeta) as Wish["attend"][]).map((k) => {
                  const M = attendMeta[k];
                  return (
                    <button
                      type="button"
                      key={k}
                      onClick={() => setAttend(k)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 font-sans text-[10px] font-medium uppercase tracking-wider transition-all ${
                        attend === k
                          ? "border-gold bg-forest text-cream shadow-md"
                          : "border-gold/30 bg-ivory text-ink/60 hover:border-gold/60"
                      }`}
                    >
                      <M.icon className={`h-4 w-4 ${attend === k ? "text-gold-light" : M.cls}`} />
                      {M.label}
                    </button>
                  );
                })}
              </div>

              {/* jumlah orang — hanya saat hadir */}
              <AnimatePresence initial={false}>
                {attend === "hadir" && (
                  <motion.div
                    key="pax"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <label className="flex items-center gap-2 font-sans text-[9px] font-medium uppercase tracking-[0.45em] text-gold-dark">
                      <Users className="h-3.5 w-3.5" />
                      Jumlah yang Akan Datang
                    </label>
                    <div className="mt-2 grid grid-cols-6 gap-1.5">
                      {PAX_OPTIONS.map((n) => (
                        <button
                          type="button"
                          key={n}
                          onClick={() => setPax(n)}
                          className={`rounded-xl border px-1 py-2.5 font-sans text-xs font-semibold transition-all ${
                            pax === n
                              ? "border-gold bg-gold text-forest-deep shadow-md"
                              : "border-gold/30 bg-ivory text-ink/60 hover:border-gold/60"
                          }`}
                        >
                          {n === 6 ? "6+" : n}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 font-sans text-[11px] text-ink/50">
                      Termasuk Anda — membantu kami menyiapkan tempat &amp; konsumsi.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <label className="mt-6 block font-sans text-[9px] font-medium uppercase tracking-[0.45em] text-gold-dark">
                Ucapan &amp; Doa
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Tuliskan doa terbaikmu di sini…"
                className="mt-2 w-full resize-none rounded-xl border border-gold/25 bg-ivory/50 px-4 py-3 font-serif text-[15px] text-ink outline-none transition focus:border-gold focus:bg-ivory focus:ring-2 focus:ring-gold/20"
              />

              <button
                type="submit"
                disabled={!name.trim() || !message.trim() || sending}
                className="ring-pulse mt-8 inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-gold/30 bg-forest px-7 py-3.5 font-sans text-[10px] font-medium uppercase tracking-[0.35em] text-cream shadow-xl transition-all hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sent ? (
                  <CheckCircle2 className="h-4 w-4 text-gold-light" />
                ) : (
                  <Send className="h-4 w-4 text-gold-light" />
                )}
                {sending ? "Menyimpan…" : sent ? "Terkirim, terima kasih!" : "Kirim Ucapan"}
              </button>
            </div>
          </form>
        </Reveal>

        {/* daftar ucapan */}
        <Reveal delay={0.15}>
          <div className="flex items-center justify-between border-b border-gold/20 pb-4">
            <p className="inline-flex items-center gap-2 font-sans text-[10px] font-medium uppercase tracking-[0.4em] text-forest">
              <MessageCircleHeart className="h-4 w-4 text-gold-dark" />
              {wishes.length} ucapan · {count} hadir · {totalPax} orang
            </p>
          </div>
          <div className="mt-5 max-h-[28rem] space-y-4 overflow-y-auto pr-2 [scrollbar-width:thin]">
            <AnimatePresence initial={false}>
              {wishes.map((w) => {
                const M = attendMeta[w.attend];
                return (
                  <motion.article
                    key={w.at + w.name}
                    layout
                    initial={{ opacity: 0, y: -14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-2xl border border-gold/20 bg-cream/50 px-5 py-5 shadow-sm backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-serif text-base font-semibold text-forest">{w.name}</span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        {w.attend === "hadir" && w.count ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-gold/25 bg-gold/10 px-2.5 py-1 font-sans text-[9px] font-medium uppercase tracking-widest text-gold-dark">
                            <Users className="h-3 w-3" />
                            {w.count >= 6 ? "6+" : `${w.count} orang`}
                          </span>
                        ) : null}
                        <span className={`inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-ivory px-3 py-1 font-sans text-[9px] font-medium uppercase tracking-widest ${M.cls}`}>
                          <M.icon className="h-3 w-3" />
                          {M.label}
                        </span>
                      </span>
                    </div>
                    <p className="mt-2 font-serif text-sm italic leading-relaxed text-ink/75">
                      {w.message}
                    </p>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
