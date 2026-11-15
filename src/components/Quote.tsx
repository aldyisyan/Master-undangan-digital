import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "./Section";
import { useSettings } from "../lib/settings";
import { useMediaSrc } from "../lib/mediaStore";
import { getLayout, portraitClass } from "../lib/layouts";

export default function Quote() {
  const s = useSettings();
  const L = getLayout(s.layout);
  const shape = portraitClass(L.portrait);
  const photo = useMediaSrc(s.quotePhoto);

  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // foto bergerak ke atas lebih lambat → kedalaman layering
  const photoY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  // teks bergerak sedikit berlawanan arah
  const textY  = useTransform(scrollYProgress, [0, 1], ["4%", "-4%"]);

  return (
    <section ref={ref} className="relative overflow-hidden px-5 py-10 sm:py-12">
      {/* blob parallax latar */}
      <motion.span
        style={{ y: useTransform(scrollYProgress, [0, 1], ["-25%", "25%"]) }}
        className="pointer-events-none absolute -right-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-gold/5 blur-[100px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          {/* foto dengan parallax independen */}
          <Reveal className="relative order-2 md:order-1">
            <div className="relative mx-auto w-[min(80vw,24rem)] sm:max-w-sm">
              {L.ornament !== "none" && (
                <>
                  <span className={`pointer-events-none absolute -inset-4 border border-gold/40 ${shape}`} />
                  <span className={`pointer-events-none absolute -inset-1.5 border border-gold/60 ${shape}`} />
                </>
              )}
              <motion.div
                style={{ y: photoY }}
                className={`overflow-hidden bg-paper will-change-transform ${shape}`}
              >
                {photo && (
                  <img
                    src={photo}
                    alt={`Mempelai ${s.bride.short} dan ${s.groom.short}`}
                    loading="lazy"
                    className={`w-full object-cover transition-transform duration-[2.5s] hover:scale-105 ${
                      L.portrait === "circle" ? "aspect-square" : "aspect-[3/4]"
                    }`}
                  />
                )}
              </motion.div>
              <p className="mt-5 text-center font-script text-[clamp(1.6rem,6vw,2rem)] text-gold-dark">
                dua hati, satu tujuan
              </p>
            </div>
          </Reveal>

          {/* teks dengan parallax berlawanan */}
          <motion.div style={{ y: textY }} className="order-1 text-center md:order-2 md:text-left will-change-transform">
            <Reveal delay={0.15}>
              <span className="font-script text-6xl leading-none text-gold/50">"</span>
              <p className="balance -mt-4 font-serif text-[clamp(1.05rem,4vw,1.5rem)] italic leading-relaxed text-ink/85">
                Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu
                dari jenismu sendiri, agar kamu merasa tenteram kepadanya, dan Dia menjadikan di antaramu
                rasa kasih dan sayang.
              </p>
              <p className="mt-6 font-sans text-[11px] font-medium uppercase tracking-[0.55em] text-gold-dark">
                QS. Ar-Rum : 21
              </p>
              <p className="mt-4 max-w-md font-serif text-sm italic leading-relaxed text-ink/60 max-md:mx-auto">
                Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyempurnakan separuh agama
                dalam ikatan suci pernikahan.
              </p>
            </Reveal>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
