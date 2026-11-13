import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, MessageCircleHeart, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import Section, { Reveal } from "./Section";
import { loadWishes, saveWishes, type Wish } from "../lib/wishes";

const attendMeta = {
  hadir: { label: "Hadir", icon: CheckCircle2, cls: "text-forest" },
  ragu: { label: "InsyaAllah", icon: HelpCircle, cls: "text-gold-dark" },
  tidak: { label: "Berhalangan", icon: XCircle, cls: "text-rose" },
} as const;

export default function Wishes() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [name, setName] = useState("");
  const [attend, setAttend] = useState<Wish["attend"]>("hadir");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setWishes(loadWishes());
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    const next = [{ name: name.trim(), attend, message: message.trim(), at: Date.now() }, ...wishes];
    setWishes(next);
    saveWishes(next);
    setName("");
    setMessage("");
    setAttend("hadir");
    setSent(true);
    setTimeout(() => setSent(false), 2400);
  };

  const count = wishes.filter((w) => w.attend === "hadir").length;

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
            className="relative rounded-3xl border border-gold/40 bg-cream p-7 shadow-[0_25px_60px_-30px_rgba(53,65,45,0.4)] sm:p-9"
          >
            <span className="pointer-events-none absolute inset-2.5 rounded-[18px] border border-gold/20" />
            <div className="relative">
              <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-dark">
                Nama
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tulis namamu…"
                className="mt-2 w-full rounded-xl border border-gold/30 bg-ivory px-4 py-3 font-serif text-[15px] text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/25"
              />

              <label className="mt-6 block font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-dark">
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

              <label className="mt-6 block font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-dark">
                Ucapan &amp; Doa
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Tuliskan doa terbaikmu di sini…"
                className="mt-2 w-full resize-none rounded-xl border border-gold/30 bg-ivory px-4 py-3 font-serif text-[15px] text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/25"
              />

              <button
                type="submit"
                disabled={!name.trim() || !message.trim()}
                className="mt-6 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-forest px-7 py-3.5 font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-cream shadow-md transition-all hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sent ? <CheckCircle2 className="h-4 w-4 text-gold-light" /> : <Send className="h-4 w-4 text-gold-light" />}
                {sent ? "Terkirim, terima kasih!" : "Kirim Ucapan"}
              </button>
            </div>
          </form>
        </Reveal>

        {/* daftar ucapan */}
        <Reveal delay={0.15}>
          <div className="flex items-center justify-between">
            <p className="inline-flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-forest">
              <MessageCircleHeart className="h-4 w-4 text-gold-dark" />
              {wishes.length} ucapan · {count} akan hadir
            </p>
          </div>
          <div className="mt-5 max-h-[26rem] space-y-4 overflow-y-auto pr-2 [scrollbar-width:thin]">
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
                    className="rounded-2xl border border-gold/25 bg-cream/80 px-5 py-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-serif text-base font-semibold text-forest">{w.name}</span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-ivory px-3 py-1 font-sans text-[9px] font-medium uppercase tracking-widest ${M.cls}`}>
                        <M.icon className="h-3 w-3" />
                        {M.label}
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
