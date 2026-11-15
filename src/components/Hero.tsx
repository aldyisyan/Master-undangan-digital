import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Heart } from "lucide-react";
// useRef / useScroll / useTransform dipakai untuk parallax foto latar hero
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

  // parallax latar hero — foto bergerak lebih lambat dari konten
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgParallax = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);

  const Names = (
    <motion.h1 variants={item} className="font-script text-forest">
      <span className="fluid-display block break-safe">{s.bride.short}</span>
      <span className="my-2 block font-serif text-[clamp(1.6rem,5vw,2.5rem)] italic text-gold">
        &amp;
      </span>
      <span className="fluid-display block break-safe">{s.groom.short}</span>
    </motion.h1>
  );

  return (
    <section
      ref={heroRef}
      className={`relative flex min-h-svh flex-col overflow-hidden ${
        cinematic ? "justify-center" : split ? "justify-end sm:justify-center" : "items-center justify-center"
      }`}
    >
      {/* ---------- latar ---------- */}
      {cinematic ? (
        <>
          <div className="absolute inset-0 z-0 bg-forest-deep" />
          {cinematicPhoto && (
            <motion.img
              initial={{ scale: 1.08 }}
              animate={opened ? { scale: 1 } : {}}
              style={{ y: bgParallax }}
              transition={{ duration: 2.8, ease: [0.22, 1, 0.36, 1] }}
              src={cinematicPhoto}
              alt=""
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
            />
          )}
          {!cinematicPhoto && <div className="absolute inset-0 bg-forest-deep" />}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/55" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(10,16,24,0.3)_100%)]" />
          <div className="pointer-events-none absolute inset-3 rounded-[1.75rem] border border-white/8 sm:inset-4 md:inset-5" />
        </>
      ) : bg ? (
        <>
          <motion.img src={bg} alt="" style={{ y: bgParallax }} className="pointer-events-none absolute left-0 top-[-20%] h-[140%] w-full object-cover will-change-transform" />
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
          <LeafSprig className="leaf-float pointer-events-none absolute -left-5 top-[22%] z-20 w-12 opacity-50 sm:w-16 md:left-16 md:w-20 md:opacity-60" />
          <LeafSprig className="leaf-float pointer-events-none absolute -right-4 bottom-[22%] z-20 w-10 -scale-x-100 opacity-40 sm:w-14 md:right-20 md:w-16 md:opacity-50" />
        </>
      )}
      {L.petals && <Petals density={18} />}

      {/* ====== SINEMATIK FOTO ====== */}
      {cinematic ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate={opened ? "show" : "hidden"}
          className="safe-x relative z-20 mx-auto flex w-full max-w-6xl flex-col items-center px-10 text-center sm:px-16"
        >
          <motion.div variants={item} className="flex items-center gap-3">
             <span className="h-px w-6 bg-gold-light/40" />
             <p className="fluid-label font-sans font-medium uppercase tracking-[0.65em] text-gold-light">
               {L.eyebrow}
             </p>
             <span className="h-px w-6 bg-gold-light/40" />
          </motion.div>

          <motion.h1 variants={item} className="balance mt-8 font-script text-cream drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]">
            <span className="block text-[clamp(4.2rem,18vw,10rem)] leading-[0.8] sm:inline">
              {s.bride.short}
            </span>
            <span className="mx-4 block font-serif text-[clamp(1.8rem,6vw,3.5rem)] italic text-gold-light sm:inline">
              &amp;
            </span>
            <span className="block text-[clamp(4.2rem,18vw,10rem)] leading-[0.8] sm:inline">
              {s.groom.short}
            </span>
          </motion.h1>

          <motion.div
            variants={item}
            className="mt-12 flex flex-col items-center gap-4"
          >
            <p className="font-serif text-[clamp(1.1rem,4vw,1.6rem)] font-light tracking-[0.12em] text-cream/90 drop-shadow-[0_4px_12px_rgba(0,0,0,0.28)]">{s.dateLabel}</p>
            <div className="h-8 w-px bg-gold-light/30" />
            <p className="font-sans text-[10px] uppercase tracking-[0.45em] text-gold-light/70">
              Undangan untuk <span className="font-semibold text-cream">{guest.title}</span>
            </p>
          </motion.div>
        </motion.div>
      ) : split ? (
        /* ====== EDITORIAL MAJALAH ====== */
        <div className="relative z-20 mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 items-center gap-12 px-8 py-20 sm:flex-none sm:py-24 md:grid-cols-[1fr_1fr] md:px-12">
          <motion.div
            variants={container}
            initial="hidden"
            animate={opened ? "show" : "hidden"}
            className="order-2 text-center md:order-1 md:text-left"
          >
            <motion.div
              variants={item}
              className="fluid-label inline-flex items-center gap-4 font-sans font-medium uppercase tracking-[0.6em] text-gold-dark"
            >
              <span className="h-px w-6 bg-gold/50" />
              {L.eyebrow}
            </motion.div>
            <div className="mt-8 md:[&_.fluid-display]:text-[clamp(2.8rem,10vw,6rem)]">{Names}</div>
            <motion.div variants={item} className="mt-10">
              <div className="mx-auto h-px w-24 bg-gold/40 md:mx-0" />
              <p className="mt-6 font-serif text-[clamp(1.1rem,3.8vw,1.4rem)] font-light tracking-wide text-ink">
                {s.dateLabel}
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-4 py-1.5 font-sans text-[9px] uppercase tracking-[0.35em] text-forest/80">
                Invitation for <span className="font-semibold text-forest">{guest.title}</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={opened ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.3, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 md:order-2"
          >
            <div className="relative mx-auto w-[min(72vw,20rem)] md:w-full md:max-w-[22rem]">
              <span className="pointer-events-none absolute -inset-4 rounded-3xl border border-gold/25" />
              <div className="overflow-hidden rounded-2xl bg-paper shadow-[0_45px_100px_-30px_rgba(38,47,32,0.3)]">
                {portrait && <img src={portrait} alt="" className="aspect-[3/4.5] w-full object-cover" />}
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
              {L.eyebrow}
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
            {L.eyebrow}
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
          ) : L.hero === "heritage" ? (
            <div className="relative mt-8 flex min-h-72 w-full flex-col items-center justify-center sm:min-h-80">
              <Wreath className="pointer-events-none absolute w-[min(90vw,25rem)] opacity-30" />
              <motion.span
                variants={item}
                className="rounded-full border border-gold/35 bg-cream/70 px-4 py-1 font-sans text-[9px] uppercase tracking-[0.45em] text-gold-dark"
              >
                {s.bride.short.charAt(0)} • {s.groom.short.charAt(0)}
              </motion.span>
              <motion.h1 variants={item} className="relative mt-6 text-center font-serif text-forest">
                <span className="block break-safe text-[clamp(2.7rem,10vw,5.8rem)] font-light tracking-[0.08em]">
                  {s.bride.short}
                </span>
                <span className="my-3 block font-script text-[clamp(2.1rem,7vw,3.8rem)] text-gold">&amp;</span>
                <span className="block break-safe text-[clamp(2.7rem,10vw,5.8rem)] font-light tracking-[0.08em]">
                  {s.groom.short}
                </span>
              </motion.h1>
              <motion.div variants={item} className="mt-6 flex items-center gap-3 text-gold/70">
                <span className="h-px w-10 bg-gold/45" />
                <span className="font-sans text-[9px] uppercase tracking-[0.45em]">heritage</span>
                <span className="h-px w-10 bg-gold/45" />
              </motion.div>
            </div>
          ) : L.hero === "banner" ? (
            <motion.div
              variants={item}
              className="mt-8 w-full max-w-2xl rounded-[2rem] border border-gold/30 bg-cream/65 px-6 py-8 shadow-[0_25px_70px_-25px_rgba(53,65,45,0.28)] backdrop-blur-md sm:px-10 sm:py-10"
            >
              <span className="block font-sans text-[9px] uppercase tracking-[0.55em] text-gold-dark">
                {L.eyebrow}
              </span>
              <div className="mt-5 font-script text-forest">
                <span className="block break-safe text-[clamp(3rem,12vw,6rem)] leading-[0.86]">{s.bride.short}</span>
                <span className="block font-serif text-[clamp(1.4rem,4vw,2rem)] italic text-gold">&amp;</span>
                <span className="block break-safe text-[clamp(3rem,12vw,6rem)] leading-[0.86]">{s.groom.short}</span>
              </div>
              <div className="mt-6 flex items-center justify-center gap-3">
                <span className="h-px w-10 bg-gold/40" />
                <span className="font-sans text-[9px] uppercase tracking-[0.45em] text-forest/65">Baralek</span>
                <span className="h-px w-10 bg-gold/40" />
              </div>
            </motion.div>
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

          <motion.div variants={item} className="mt-10 flex w-full flex-col items-center">
            {L.ornament === "none" ? (
              <span className="h-[0.5px] w-24 bg-gold/50" />
            ) : (
              <Divider className="w-40 opacity-80 sm:w-48" />
            )}
            <p className="mt-6 font-serif text-[clamp(1.1rem,4vw,1.5rem)] font-light tracking-wide text-ink">
              {s.dateLabel}
            </p>
            <div className="mt-7 inline-flex max-w-full items-center gap-2.5 rounded-full border border-gold/30 bg-cream/80 px-6 py-2.5 shadow-lg backdrop-blur-md sm:px-7">
              <Heart className="h-3.5 w-3.5 shrink-0 fill-rose text-rose" />
              <span className="fluid-label truncate font-sans uppercase tracking-[0.35em] text-forest">
                Undangan untuk {guest.title}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* vignette effect */}
      {cinematic && <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_120px_rgba(0,0,0,0.4)] sm:shadow-[inset_0_0_200px_rgba(0,0,0,0.5)]" />}

      {/* ---------- indikator gulir ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={opened ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 2.2, duration: 1.2, ease: "easeOut" }}
        className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className={`font-sans text-[8px] font-medium uppercase tracking-[0.5em] ${cinematic ? "text-cream/50" : "text-ink/40"}`}>
          Gulir
        </span>
        <div className={`flex h-10 w-6 justify-center rounded-full border pt-2 ${cinematic ? "border-gold-light/30" : "border-gold/30"}`}>
          <motion.span
            animate={{ y: [0, 14, 0], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className={`h-1.5 w-1.5 rounded-full ${cinematic ? "bg-gold-light" : "bg-gold"}`}
          />
        </div>
      </motion.div>
    </section>
  );
}