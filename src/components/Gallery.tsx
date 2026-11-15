import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { useSettings } from "../lib/settings";
import { resolveSrc } from "../lib/mediaStore";
import Section, { Reveal } from "./Section";

/** Resolve sekumpulan referensi media menjadi URL siap pakai */
function useMediaSrcs(refs: string[]): string[] {
  const key = refs.join("|");
  const [srcs, setSrcs] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    Promise.all(refs.map((r) => resolveSrc(r))).then((urls) => {
      if (alive) setSrcs(urls.filter(Boolean));
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return srcs;
}

export default function Gallery() {
  const s = useSettings();
  const photos = useMediaSrcs(s.gallery);
  const [active, setActive] = useState<number | null>(null);

  // kunci scroll saat lightbox terbuka
  useEffect(() => {
    if (active === null) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") setActive((i) => (i === null ? i : (i + 1) % photos.length));
      if (e.key === "ArrowLeft")
        setActive((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [active === null, photos.length]);

  if (photos.length === 0) return null;

  return (
    <Section
      id="galeri"
      label="Galeri"
      title="Momen yang Kami Abadikan"
      subtitle="Sepotong perjalanan menuju hari bahagia — sentuh foto untuk memperbesar."
    >
      <Reveal>
        <div className="columns-2 gap-3 [column-fill:_balance] sm:gap-4 md:columns-3">
          {photos.map((src, i) => (
            <motion.button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.12, ease: "easeOut" }}
              className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-gold/30 shadow-sm transition-shadow hover:shadow-[0_20px_45px_-20px_rgba(53,65,45,0.45)] sm:mb-4"
            >
              <img
                src={src}
                alt={`Foto prawedding ${i + 1}`}
                loading="lazy"
                className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <span className="pointer-events-none absolute inset-0 bg-forest/0 transition-colors duration-500 group-hover:bg-forest/25" />
              <span className="pointer-events-none absolute inset-2 rounded-xl border border-cream/0 transition-all duration-500 group-hover:border-cream/50" />
              <span className="pointer-events-none absolute bottom-2.5 right-2.5 flex h-8 w-8 translate-y-2 items-center justify-center rounded-full bg-cream/90 text-forest opacity-0 shadow transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <Camera className="h-3.5 w-3.5" />
              </span>
            </motion.button>
          ))}
        </div>
      </Reveal>

      {/* foto berikutnya muncul bertahap saat resolve selesai */}
      <p className="mt-5 text-center font-sans text-[10px] uppercase tracking-[0.35em] text-ink/40">
        {photos.length} foto · {s.bride.short} &amp; {s.groom.short}
      </p>

      {/* ------------------ lightbox ------------------ */}
      <AnimatePresence>
        {active !== null && photos[active] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-forest-deep/95 p-4 backdrop-blur-sm sm:p-10"
            onClick={() => setActive(null)}
          >
            <motion.img
              key={photos[active]}
              src={photos[active]}
              alt={`Foto prawedding ${active + 1}`}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="max-h-full max-w-full rounded-2xl border border-gold/30 object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              type="button"
              aria-label="Tutup"
              onClick={() => setActive(null)}
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-cream/25 text-cream transition-colors hover:border-gold-light hover:text-gold-light"
            >
              <X className="h-5 w-5" />
            </button>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Foto sebelumnya"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive((active - 1 + photos.length) % photos.length);
                  }}
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream/25 text-cream transition-colors hover:border-gold-light hover:text-gold-light sm:left-6"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Foto berikutnya"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive((active + 1) % photos.length);
                  }}
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream/25 text-cream transition-colors hover:border-gold-light hover:text-gold-light sm:right-6"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-sans text-[10px] uppercase tracking-[0.35em] text-cream/60">
              {active + 1} / {photos.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
