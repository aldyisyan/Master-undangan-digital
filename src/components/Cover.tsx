import { motion } from "framer-motion";
import { MailOpen, Heart } from "lucide-react";
import type { GuestPage } from "../lib/settings";
import { useSettings } from "../lib/settings";
import { useMediaSrc } from "../lib/mediaStore";
import { Wreath, Divider } from "./Ornament";

interface Props {
  guest: GuestPage;
  onOpen: () => void;
}

export default function Cover({ guest, onOpen }: Props) {
  const s = useSettings();
  const bg = useMediaSrc(s.backgroundImage);
  const portrait = useMediaSrc(s.quotePhoto);
  const dim = Math.min(0.92, Math.max(0, s.backgroundDim / 100));

  const darkCover = ["sinematik", "midnight", "cinematic-full"].includes(s.coverLayout);
  const headingTone = darkCover ? "text-cream" : "text-forest";
  const subTone = darkCover ? "text-cream/70" : "text-ink/70";
  const labelTone = darkCover ? "text-gold-light/80" : "text-gold-dark";

  const containerTransition: any = { duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.35 };

  const Names = (
    <motion.h1
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className={`balance font-serif text-[clamp(1.4rem,6vw,2.2rem)] font-medium tracking-wide ${headingTone}`}
    >
      {s.bride.short} <span className="mx-1 font-script text-xl text-gold sm:text-2xl">&amp;</span> {s.groom.short}
    </motion.h1>
  );

  const Button = (
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
  );

  // ------------------- TEMPLATE: CLASSIC FROSTED -------------------
  if (s.coverLayout === "frosted-glass" || !s.coverLayout) {
    return (
      <motion.div exit={{ y: "-100%" }} transition={containerTransition} className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-ivory">
        {bg ? (
          <>
            <img src={bg} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-ivory" style={{ opacity: dim }} />
          </>
        ) : (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--pal-cream),transparent_65%)]" />
        )}
        <motion.div
          exit={{ scale: 0.92, opacity: 0, y: 60 }}
          className="gold-frame relative z-10 mx-4 flex max-h-[90svh] w-full max-w-md flex-col items-center overflow-y-auto border border-gold/30 bg-cream/70 px-6 py-12 text-center shadow-[0_45px_100px_-20px_rgba(38,47,32,0.45)] backdrop-blur-md sm:px-12 sm:py-14 rounded-[2.5rem]"
        >
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative h-28 w-28 shrink-0">
            <Wreath className="spin-slow absolute inset-0 h-full w-full [animation-duration:40s]" />
            <div className="absolute inset-0 flex items-center justify-center font-script text-3xl text-forest">{s.bride.short[0]}&amp;{s.groom.short[0]}</div>
          </motion.div>
          <p className={`fluid-label mt-7 font-sans font-medium uppercase tracking-[0.55em] ${labelTone}`}>Undangan Pernikahan</p>
          {Names}
          <div className="mx-auto mt-7 h-px w-12 bg-gold/40" />
          <div className="mt-7 w-full">
            <p className="fluid-label font-sans uppercase tracking-[0.35em] text-ink/50">{guest.honorific}</p>
            <p className="fluid-script mt-3 font-script text-gold-gradient">{guest.title}</p>
          </div>
          <p className={`mt-7 font-serif text-sm italic leading-relaxed ${subTone}`}>Kami mengundang Anda pada hari bahagia kami — <span className="mt-2 block font-sans text-[10px] uppercase not-italic tracking-[0.35em] text-forest/80">{s.dateLabel}</span></p>
          {Button}
        </motion.div>
      </motion.div>
    );
  }

  // ------------------- TEMPLATE: CINEMATIC FULL -------------------
  if (s.coverLayout === "cinematic-full") {
    return (
      <motion.div exit={{ y: "-100%" }} transition={containerTransition} className="fixed inset-0 z-[80] flex flex-col justify-end bg-forest-deep px-8 pb-20 pt-36 overflow-hidden">
        {bg && <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/20 to-transparent" />
        <div className="relative z-10 max-w-xl">
          <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="font-sans text-[10px] font-medium uppercase tracking-[0.6em] text-gold-light">Wedding Invitation</motion.p>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6 font-script text-6xl text-cream sm:text-8xl">
            {s.bride.short} <span className="font-serif text-2xl italic text-gold-light">&amp;</span> {s.groom.short}
          </motion.div>
          <div className="mt-10 flex flex-col gap-6 border-l border-gold-light/40 pl-6">
            <div>
              <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-cream/50">Special Guest</p>
              <p className="mt-2 font-serif text-2xl text-cream">{guest.title}</p>
            </div>
            <p className="max-w-xs font-serif text-sm italic leading-relaxed text-cream/70">Bergabunglah bersama kami saat kami memulai perjalanan baru ini pada <span className="font-sans text-[10px] uppercase not-italic font-semibold text-gold-light ml-1">{s.dateLabel}</span></p>
          </div>
          {Button}
        </div>
      </motion.div>
    );
  }

  // ------------------- TEMPLATE: EDITORIAL SPLIT -------------------
  if (s.coverLayout === "editorial-split") {
    return (
      <motion.div exit={{ y: "-100%" }} transition={containerTransition} className="fixed inset-0 z-[80] grid lg:grid-cols-2 bg-ivory overflow-hidden">
        <div className="relative hidden lg:block overflow-hidden">
          {(bg || portrait) && <img src={bg || portrait} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-center sm:p-16">
          <div className="lg:hidden mb-10 h-64 w-full overflow-hidden rounded-2xl border border-gold/30">
            {(bg || portrait) && <img src={bg || portrait} alt="" className="h-full w-full object-cover" />}
          </div>
          <span className="font-sans text-[9px] uppercase tracking-[0.6em] text-gold-dark">Maison de Mariage</span>
          <div className="mt-8 font-serif">
            <span className="block text-5xl uppercase tracking-tighter text-forest sm:text-7xl">{s.bride.short}</span>
            <span className="my-2 block font-script text-4xl text-gold-dark">&amp;</span>
            <span className="block text-5xl uppercase tracking-tighter text-forest sm:text-7xl">{s.groom.short}</span>
          </div>
          <div className="mt-12 w-full max-w-sm border-y border-gold/20 py-8">
            <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-ink/40">Exclusive Invitation For</p>
            <p className="mt-4 font-serif text-2xl font-medium text-forest">{guest.title}</p>
          </div>
          <p className="mt-8 font-serif text-sm text-ink/60 italic">{s.dateLabel} · {s.venue.name}</p>
          {Button}
        </div>
      </motion.div>
    );
  }

  // ------------------- TEMPLATE: MINIMAL CLEAN -------------------
  if (s.coverLayout === "minimal-clean") {
    return (
      <motion.div exit={{ y: "-100%" }} transition={containerTransition} className="fixed inset-0 z-[80] flex items-center justify-center bg-[#fdfdfd] overflow-hidden">
        <div className="p-10 text-center border-[0.5px] border-black/10 m-6 flex flex-col items-center max-w-md w-full py-16">
          <Heart className="h-4 w-4 text-forest mb-8 opacity-40" />
          <span className="font-sans text-[8px] uppercase tracking-[0.8em] text-ink/40 mb-10">Save The Date</span>
          <div className="space-y-2">
             <h1 className="font-serif text-4xl text-forest uppercase tracking-widest leading-none">{s.bride.short}</h1>
             <p className="font-serif text-xl italic text-gold-dark">and</p>
             <h1 className="font-serif text-4xl text-forest uppercase tracking-widest leading-none">{s.groom.short}</h1>
          </div>
          <div className="mt-14 h-16 w-px bg-black/10" />
          <p className="mt-14 font-serif text-lg tracking-widest text-forest/80 uppercase">{guest.title}</p>
          <p className="mt-4 font-sans text-[9px] tracking-[0.4em] text-ink/30 uppercase">{s.dateLabel}</p>
          {Button}
        </div>
      </motion.div>
    );
  }

  // ------------------- TEMPLATE: ROYAL GOLD -------------------
  if (s.coverLayout === "royal-gold") {
    return (
      <motion.div exit={{ y: "-100%" }} transition={containerTransition} className="fixed inset-0 z-[80] flex items-center justify-center bg-forest-deep overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #b08d57 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 w-full max-w-md mx-6 text-center border-2 border-gold/40 p-1 rounded-sm shadow-2xl">
          <div className="border border-gold/30 px-6 py-14 sm:px-10">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-10 flex justify-center">
               <span className="font-serif text-6xl text-gold-light/20 absolute -mt-4 uppercase">{s.bride.short[0]}{s.groom.short[0]}</span>
               <Wreath className="relative h-20 w-20 text-gold-light" />
            </motion.div>
            <span className="font-sans text-[9px] uppercase tracking-[0.5em] text-gold-light/60">The Royal Wedding of</span>
            <div className="mt-8 font-serif">
              <h1 className="text-4xl text-cream font-medium tracking-widest uppercase">{s.bride.name}</h1>
              <span className="my-4 block font-script text-3xl text-gold-light">&amp;</span>
              <h1 className="text-4xl text-cream font-medium tracking-widest uppercase">{s.groom.name}</h1>
            </div>
            <Divider tone="cream" className="mx-auto my-10 opacity-30" />
            <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-light/50">Invitation for</p>
            <p className="mt-4 font-serif text-2xl text-cream italic">{guest.title}</p>
            {Button}
          </div>
        </div>
      </motion.div>
    );
  }

  // ------------------- TEMPLATE: HERITAGE BATIK -------------------
  if (s.coverLayout === "heritage-batik") {
    return (
      <motion.div exit={{ y: "-100%" }} transition={containerTransition} className="fixed inset-0 z-[80] flex items-center justify-center bg-[#2a1b15] overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/batik-fractal.png')]" />
        <div className="relative z-10 max-w-sm w-full mx-4 bg-[#fdfaf5] p-8 text-center shadow-[0_40px_80px_rgba(0,0,0,0.5)] rounded-lg border-t-8 border-[#8a6a3b]">
           <span className="inline-block px-4 py-1 border border-[#8a6a3b]/30 rounded-full font-sans text-[8px] uppercase tracking-[0.4em] text-[#8a6a3b] mb-10">Pawiwahan</span>
           <div className="font-serif">
             <h2 className="text-4xl text-[#3a2000] font-light leading-tight">{s.bride.short}</h2>
             <span className="my-2 block font-script text-3xl text-[#8a6a3b]">&amp;</span>
             <h2 className="text-4xl text-[#3a2000] font-light leading-tight">{s.groom.short}</h2>
           </div>
           <div className="my-10 flex items-center justify-center gap-4">
              <span className="h-px w-8 bg-[#8a6a3b]/30" />
              <div className="h-2 w-2 rotate-45 border border-[#8a6a3b]" />
              <span className="h-px w-8 bg-[#8a6a3b]/30" />
           </div>
           <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-ink/40">Katur dumateng</p>
           <p className="mt-4 font-serif text-2xl text-[#3a2000] font-semibold">{guest.title}</p>
           <p className="mt-6 font-serif text-sm italic text-ink/60">{s.dateLabel}</p>
           {Button}
        </div>
      </motion.div>
    );
  }

  // ------------------- TEMPLATE: FLORAL ARCH -------------------
  if (s.coverLayout === "floral-arch") {
    return (
      <motion.div exit={{ y: "-100%" }} transition={containerTransition} className="fixed inset-0 z-[80] flex items-center justify-center bg-[#fdf5f8] overflow-hidden">
        <img src="/images/flowers-arch.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 p-10 text-center max-w-md">
           <Heart className="mx-auto h-5 w-5 text-rose/50 fill-rose/20 mb-8" />
           <span className="font-sans text-[9px] uppercase tracking-[0.5em] text-rose/60">With Love We Invite You</span>
           <div className="mt-8 font-script">
             <h2 className="text-6xl text-forest">{s.bride.short}</h2>
             <span className="my-1 block font-serif text-2xl italic text-rose">&amp;</span>
             <h2 className="text-6xl text-forest">{s.groom.short}</h2>
           </div>
           <p className="mt-14 font-sans text-[10px] uppercase tracking-[0.4em] text-ink/40">Exclusive Guest</p>
           <p className="mt-3 font-serif text-3xl text-forest font-medium">{guest.title}</p>
           <Divider className="mx-auto my-10" />
           {Button}
        </motion.div>
      </motion.div>
    );
  }

  // Fallback ke template Classic jika tidak ditemukan
  return (
    <motion.div exit={{ y: "-100%" }} transition={containerTransition} className="fixed inset-0 z-[80] flex items-center justify-center bg-ivory">
      <div className="text-center">
        {Names}
        {Button}
      </div>
    </motion.div>
  );
}
