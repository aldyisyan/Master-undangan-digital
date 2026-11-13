import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { GuestPage } from "../lib/settings";
import { useSettings } from "../lib/settings";
import { useMediaSrc } from "../lib/mediaStore";
import { getLayout } from "../lib/layouts";
import Petals from "./Petals";
import { Divider, LeafSprig, Wreath } from "./Ornament";

interface Props {
  guest: GuestPage;
  opened: boolean;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.5 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Hero({ guest, opened }: Props) {
  const s = useSettings();
  const L = getLayout(s.layout);
  const bg = useMediaSrc(s.backgroundImage);
  const portrait = useMediaSrc(s.quotePhoto);
  const cinematicPhoto = bg || portrait;

  const dim = Math.min(0.92, Math.max(0, s.backgroundDim / 100));
  const split = L.hero === "split";
  const cinematic = L.hero === "cinematic";
  const duet = L.hero === "duet";

  const Names = (
    <motion.h1 variants={item} className="font-script text-forest">
      <span className="fluid-display block break-safe">{s.bride.short}</span>
      <span className="my-1 block font-serif text-[clamp(1.4rem,4.5vw,2.2rem)] italic text-gold">
        &amp;
      </span>
      <span className="fluid-display block break-safe">{s.groom.short}</span>
    </motion.h1>
  );

  return (
    <section
      className={`relative flex min-h-svh flex-col overflow-hidden ${
        cinematic ? "justify-end" : split ? "justify-end sm:justify-center" : "items-center justify-center"
      }`}
    >
      {/* ---------- latar ---------- */}
      {cinematic ? (
        <>
          {cinematicPhoto && (
            <motion.img
              initial={{ scale: 1.08 }}
              animate={opened ? { scale: 1 } : {}}
              transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
              src={cinematicPhoto}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
          )}
          {!cinematicPhoto && <div className="pointer-events-none absolute inset-0 bg-forest-deep" />}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-forest-deep/20 via-forest-deep/20 to-forest-deep/95" />
        </>
      ) : bg ? (
        <>
          <img src={bg} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: "var(--pal-ivory)", opacity: dim }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ivory to-transparent" />
        </>
      ) : L.arch ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[38vh] mix-blend-multiply sm:h-[42vh]">
            <img src="/images/flowers-arch.png" alt="" className="h-full w-full object-cover object-top" />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[26vh] rotate-180 mix-blend-multiply opacity-60 sm:h-[30vh]">
            <img src="/images/flowers-arch.png" alt="" className="h-full w-full object-cover object-top" />
          </div>
        </>
      ) : (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--pal-cream),transparent_60%)]" />
          {L.hero === "monogram" && (
            <div className="pointer-events-none absolute inset-6 border border-gold/25 sm:inset-10" />
          )}
        </>
      )}

      {L.leaves && (
        <>
          <LeafSprig className="leaf-float pointer-events-none absolute -left-5 top-[22%] w-12 opacity-50 sm:w-16 md:left-16 md:w-20 md:opacity-60" />
          <LeafSprig className="leaf-float pointer-events-none absolute -right-4 bottom-[22%] w-10 -scale-x-100 opacity-40 sm:w-14 md:right-20 md:w-16 md:opacity-50" />
        </>
      )}
      {L.petals && <Petals density={18} />}

      {/* ====== SINEMATIK FOTO ====== */}
      {cinematic ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate={opened ? "show" : "hidden"}
          className="safe-x safe-bottom relative z-20 mx-auto w-full max-w-6xl pb-20 pt-36 text-left sm:pb-24"
        >
          <motion.p
            variants={item}
            className="fluid-label font-sans font-medium uppercase tracking-[0.5em] text-gold-light"
          >
            The Wedding Of
          </motion.p>
          <motion.h1 variants={item} className="balance mt-4 max-w-5xl font-script text-cream">
            <span className="block text-[clamp(3.8rem,17vw,9rem)] leading-[0.86] sm:inline">
              {s.bride.short}
            </span>
            <span className="mx-3 block font-serif text-[clamp(1.5rem,5vw,3rem)] italic text-gold-light sm:inline">
              &amp;
            </span>
            <span className="block text-[clamp(3.8rem,17vw,9rem)] leading-[0.86] sm:inline">
              {s.groom.short}
            </span>
          </motion.h1>
          <motion.div
            variants={item}
            className="mt-7 flex flex-col gap-2 border-l border-gold-light/60 pl-4 sm:flex-row sm:items-center sm:gap-6"
          >
            <p className="font-serif text-[clamp(1rem,3.8vw,1.35rem)] text-cream">{s.dateLabel}</p>
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-cream/65">
              Untuk {guest.title}
            </p>
          </motion.div>
        </motion.div>
      ) : split ? (
        /* ====== EDITORIAL MAJALAH ====== */
        <div className="relative z-20 mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-8 px-6 py-16 sm:flex-none sm:gap-12 sm:py-20 md:grid-cols-[1.05fr_0.95fr] md:px-10">
          <motion.div
            variants={container}
            initial="hidden"
            animate={opened ? "show" : "hidden"}
            className="order-2 text-center md:order-1 md:text-left"
          >
            <motion.div
              variants={item}
              className="fluid-label inline-flex items-center gap-3 font-sans font-medium uppercase tracking-[0.42em] text-gold-dark"
            >
              <span className="h-px w-8 bg-gold/60" />
              The Wedding Of
            </motion.div>
            <div className="mt-6 md:[&_.fluid-display]:text-[clamp(3rem,8vw,6.5rem)]">{Names}</div>
            <motion.div variants={item} className="mt-8">
              <div className="mx-auto h-px w-28 bg-gold/50 md:mx-0" />
              <p className="mt-5 font-serif text-[clamp(1.05rem,3.4vw,1.5rem)] font-medium text-ink">
                {s.dateLabel}
              </p>
              <p className="mt-4 font-sans text-[10px] uppercase tracking-[0.26em] text-forest/70">
                Untuk {guest.title}
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={opened ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 md:order-2"
          >
            <div className="relative mx-auto w-[min(78vw,22rem)] md:w-full md:max-w-sm">
              <span className="pointer-events-none absolute -inset-3 rounded-2xl border border-gold/35" />
              <div className="overflow-hidden rounded-2xl bg-paper shadow-[0_30px_70px_-30px_rgba(0,0,0,0.45)]">
                {portrait && <img src={portrait} alt="" className="aspect-[3/4] w-full object-cover" />}
              </div>
            </div>
          </motion.div>
        </div>
      ) : duet ? (
        /* ====== KONTEMPORER DUET ====== */
        <motion.div
          variants={container}
          initial="hidden"
          animate={opened ? "show" : "hidden"}
          className="relative z-20 w-full max-w-6xl px-5 sm:px-8"
        >
          <motion.div variants={item} className="flex items-center justify-between gap-4">
            <span className="fluid-label font-sans uppercase tracking-[0.35em] text-gold-dark">
              The Wedding Of
            </span>
            <span className="h-px flex-1 bg-gold/40" />
            <span className="hidden font-sans text-[10px] tracking-widest text-ink/55 min-[440px]:block">
              {s.dateLabel}
            </span>
          </motion.div>
          <motion.div
            variants={item}
            className="mt-10 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-7"
          >
            <h1 className="break-safe text-right font-serif text-[clamp(2.25rem,10.5vw,7.5rem)] font-light leading-[0.9] tracking-[-0.04em] text-forest">
              {s.bride.short}
            </h1>
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/60 font-script text-2xl text-gold sm:h-20 sm:w-20 sm:text-4xl">
              &amp;
            </span>
            <h1 className="break-safe font-serif text-[clamp(2.25rem,10.5vw,7.5rem)] font-light leading-[0.9] tracking-[-0.04em] text-forest">
              {s.groom.short}
            </h1>
          </motion.div>
          <motion.div variants={item} className="mt-11 grid gap-3 border-t border-gold/35 pt-5 sm:grid-cols-2">
            <p className="font-serif text-[clamp(1rem,3vw,1.25rem)] italic text-ink/70">
              Dua cerita, satu perjalanan.
            </p>
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold-dark sm:text-right">
              {s.dateLabel} · Untuk {guest.title}
            </p>
          </motion.div>
        </motion.div>
      ) : (
        /* ====== KLASIK · MINIMALIS · BOTANI · ROMANSA · MONOGRAM ====== */
        <motion.div
          variants={container}
          initial="hidden"
          animate={opened ? "show" : "hidden"}
          className="relative z-20 flex w-full max-w-3xl flex-col items-center px-6 text-center"
        >
          <motion.div
            variants={item}
            className="fluid-label flex items-center gap-3 font-sans font-medium uppercase tracking-[0.45em] text-gold-dark"
          >
            <span className="h-px w-7 bg-gold/60 sm:w-14" />
            The Wedding Of
            <span className="h-px w-7 bg-gold/60 sm:w-14" />
          </motion.div>

          {L.hero === "frame" ? (
            <div className="relative mt-8 flex w-full items-center justify-center">
              <Wreath className="spin-slow pointer-events-none absolute w-[min(92vw,30rem)] opacity-70 [animation-duration:90s]" />
              <div className="relative px-4 [&_.fluid-display]:text-[clamp(2.8rem,13vw,6.5rem)]">
                {Names}
              </div>
            </div>
          ) : L.hero === "stack" ? (
            <div className="mt-9 [&_.fluid-display]:font-serif [&_.fluid-display]:text-[clamp(2.6rem,11vw,5.5rem)] [&_.fluid-display]:font-light [&_.fluid-display]:tracking-[0.02em]">
              {Names}
            </div>
          ) : L.hero === "cascade" ? (
            <motion.h1 variants={item} className="mt-9 w-full max-w-2xl font-script text-forest">
              <span className="block -translate-x-[8%] text-[clamp(4rem,18vw,8.5rem)] leading-[0.82]">
                {s.bride.short}
              </span>
              <span className="relative z-10 block font-serif text-[clamp(1.4rem,5vw,2.4rem)] italic text-gold">
                &amp;
              </span>
              <span className="block translate-x-[8%] text-[clamp(4rem,18vw,8.5rem)] leading-[0.82]">
                {s.groom.short}
              </span>
            </motion.h1>
          ) : L.hero === "monogram" ? (
            <div className="relative mt-7 flex min-h-64 w-full items-center justify-center sm:min-h-80">
              <motion.span
                variants={item}
                className="pointer-events-none absolute font-serif text-[clamp(11rem,45vw,23rem)] font-light leading-none tracking-[-0.12em] text-gold/10"
              >
                {s.bride.short.charAt(0)}{s.groom.short.charAt(0)}
              </motion.span>
              <motion.h1 variants={item} className="relative font-serif text-forest">
                <span className="block text-[clamp(2.7rem,11vw,6rem)] font-light tracking-[0.04em]">
                  {s.bride.short}
                </span>
                <span className="my-2 block font-script text-[clamp(1.8rem,6vw,3rem)] text-gold">&amp;</span>
                <span className="block text-[clamp(2.7rem,11vw,6rem)] font-light tracking-[0.04em]">
                  {s.groom.short}
                </span>
              </motion.h1>
            </div>
          ) : (
            <div className="mt-8">{Names}</div>
          )}

          <motion.div variants={item} className="mt-9 flex w-full flex-col items-center">
            {L.ornament === "none" ? (
              <span className="h-px w-24 bg-gold/50" />
            ) : (
              <Divider className="w-40 opacity-80 sm:w-48" />
            )}
            <p className="mt-4 font-serif text-[clamp(1.05rem,4vw,1.5rem)] font-medium tracking-wide text-ink">
              {s.dateLabel}
            </p>
            <div className="mt-5 inline-flex max-w-full items-center gap-2 rounded-full border border-gold/40 bg-cream/70 px-4 py-2 backdrop-blur-sm sm:px-5">
              <Heart className="h-3.5 w-3.5 shrink-0 fill-rose text-rose" />
              <span className="fluid-label truncate font-sans uppercase tracking-[0.22em] text-forest">
                Undangan untuk {guest.title}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ---------- indikator gulir ---------- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={opened ? { opacity: 1 } : {}}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className={`font-sans text-[9px] uppercase tracking-[0.4em] ${cinematic ? "text-cream/60" : "text-ink/50"}`}>
          Gulir
        </span>
        <span className={`flex h-9 w-5 justify-center rounded-full border pt-1.5 ${cinematic ? "border-gold-light/60" : "border-gold/60"}`}>
          <span className={`scroll-hint-dot h-1.5 w-1.5 rounded-full ${cinematic ? "bg-gold-light" : "bg-gold"}`} />
        </span>
      </motion.div>
    </section>
  );
}