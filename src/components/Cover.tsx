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
        transition={{ duration: 0.45, ease: "easeIn" }}
        className={`${
          L.ornament === "full" ? "gold-frame" : ""
        } relative z-10 mx-4 flex max-h-[92svh] w-full max-w-md flex-col items-center overflow-y-auto overscroll-contain border border-gold/40 bg-cream/85 px-5 py-9 text-center shadow-[0_30px_80px_-20px_rgba(53,65,45,0.35)] backdrop-blur-sm sm:px-10 sm:py-10 ${L.radius}`}
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
          transition={{ delay: 0.4, duration: 0.7 }}
          className="fluid-label mt-5 font-sans font-medium uppercase tracking-[0.42em] text-gold-dark"
        >
          Undangan Pernikahan
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="balance mt-3 font-serif text-[clamp(1.15rem,5vw,1.5rem)] font-medium text-forest"
        >
          {s.bride.short} <span className="font-script text-gold">&amp;</span> {s.groom.short}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.7 }}
          className="mt-7 w-full"
        >
          <p className="fluid-label balance font-sans uppercase tracking-[0.3em] text-ink/60">
            {guest.honorific}
          </p>
          <p className="fluid-script balance break-safe mt-3 font-script text-gold-gradient">
            {guest.title}
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="balance mt-5 max-w-xs font-serif text-[clamp(0.85rem,3.3vw,0.95rem)] italic leading-relaxed text-ink/70"
        >
          Kami mengundang Anda untuk hadir dan memberikan doa restu pada hari bahagia kami —
          <span className="font-sans text-xs uppercase not-italic tracking-widest text-forest">
            {" "}
            {s.dateLabel}
          </span>
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={onOpen}
          className="ring-pulse group mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-forest px-7 py-3.5 font-sans text-[11px] font-medium uppercase tracking-[0.28em] text-cream shadow-lg transition-colors hover:bg-forest-deep sm:px-8 sm:text-xs"
        >
          <MailOpen className="h-4 w-4 shrink-0 text-gold-light transition-transform group-hover:-rotate-12" />
          Buka Undangan
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.15, duration: 0.8 }}
          className="mt-5 inline-flex items-center gap-2 font-sans text-[10px] tracking-wider text-ink/50"
        >
          <Headphones className="h-3.5 w-3.5 shrink-0 text-gold" />
          gunakan earphone untuk pengalaman terbaik
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
