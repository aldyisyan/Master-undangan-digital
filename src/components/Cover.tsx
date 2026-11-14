import { motion } from "framer-motion";
import { MailOpen, Headphones } from "lucide-react";
import type { GuestPage } from "../lib/settings";
import { useSettings } from "../lib/settings";
import { useMediaSrc } from "../lib/mediaStore";
import { getLayout } from "../lib/layouts";
import { Wreath } from "./Ornament";

interface Props {
  guest: GuestPage;
  onOpen: () => void;
}

export default function Cover({ guest, onOpen }: Props) {
  const s = useSettings();
  const L = getLayout(s.layout);
  const bg = useMediaSrc(s.backgroundImage);
  const dim = Math.min(0.92, Math.max(0, s.backgroundDim / 100));

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-ivory"
      exit={{ y: "-100%" }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.35 }}
    >
      {/* latar */}
      {bg ? (
        <>
          <img src={bg} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: "var(--pal-ivory)", opacity: dim }}
          />
        </>
      ) : L.arch ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[32vh] mix-blend-multiply sm:h-[38vh]">
            <img src="/images/flowers-arch.png" alt="" className="h-full w-full object-cover" />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[28vh] rotate-180 mix-blend-multiply opacity-80 sm:h-[34vh]">
            <img src="/images/flowers-arch.png" alt="" className="h-full w-full object-cover" />
          </div>
        </>
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--pal-cream),transparent_65%)]" />
      )}

      {/* kartu */}
      <motion.div
        exit={{ scale: 0.92, opacity: 0, y: 60 }}
        transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
        className={`${
          L.ornament === "full" ? "gold-frame" : ""
        } relative z-10 mx-4 flex max-h-[90svh] w-full max-w-md flex-col items-center overflow-y-auto overscroll-contain border border-gold/30 bg-cream/70 px-5 py-10 text-center shadow-[0_45px_100px_-20px_rgba(38,47,32,0.45)] backdrop-blur-md sm:px-12 sm:py-12 ${L.radius}`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.9, ease: "easeOut" }}
          className="relative mt-1 h-24 w-24 shrink-0 sm:h-32 sm:w-32"
        >
          <Wreath className="spin-slow absolute inset-0 h-full w-full [animation-duration:40s]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-script text-3xl text-forest sm:text-4xl">
              {s.bride.short.charAt(0)}
              <span className="mx-1 text-xl text-gold sm:text-2xl">&amp;</span>
              {s.groom.short.charAt(0)}
            </span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8 }}
          className="fluid-label mt-6 font-sans font-medium uppercase tracking-[0.55em] text-gold-dark"
        >
          Undangan Pernikahan
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="balance mt-4 font-serif text-[clamp(1.2rem,5vw,1.65rem)] font-medium tracking-wide text-forest"
        >
          {s.bride.short} <span className="mx-1 font-script text-xl text-gold sm:text-2xl">&amp;</span> {s.groom.short}
        </motion.h1>

        <div className="mx-auto mt-7 h-px w-12 bg-gold/40" />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.8 }}
          className="mt-7 w-full"
        >
          <p className="fluid-label balance font-sans uppercase tracking-[0.35em] text-ink/50">
            {guest.honorific}
          </p>
          <p className="fluid-script balance break-safe mt-3 font-script text-gold-gradient">
            {guest.title}
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="balance mt-6 max-w-xs font-serif text-[clamp(0.85rem,3.3vw,0.95rem)] italic leading-relaxed text-ink/70"
        >
          Kami mengundang Anda untuk hadir dan memberikan doa restu pada hari bahagia kami —
          <span className="mt-2 block font-sans text-[10px] uppercase not-italic tracking-[0.35em] text-forest/80">
            {s.dateLabel}
          </span>
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.8 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpen}
          className="ring-pulse group mt-9 inline-flex min-h-12 items-center gap-3 rounded-full border border-gold/30 bg-forest px-8 py-3.5 font-sans text-[10px] font-medium uppercase tracking-[0.35em] text-cream shadow-xl transition-all hover:bg-forest-deep sm:text-[11px]"
        >
          <MailOpen className="h-4 w-4 shrink-0 text-gold-light transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
          Buka Undangan
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 1 }}
          className="mt-6 inline-flex items-center gap-2 font-sans text-[9px] tracking-[0.2em] text-ink/40 uppercase"
        >
          <Headphones className="h-3 w-3 shrink-0 text-gold/80" />
          gunakan earphone
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
