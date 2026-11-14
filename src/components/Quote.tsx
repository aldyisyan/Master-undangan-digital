import { Reveal } from "./Section";
import { useSettings } from "../lib/settings";
import { useMediaSrc } from "../lib/mediaStore";
import { getLayout, portraitClass } from "../lib/layouts";

export default function Quote() {
  const s = useSettings();
  const L = getLayout(s.layout);
  const shape = portraitClass(L.portrait);
  const photo = useMediaSrc(s.quotePhoto);

  return (
    <section className="relative mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <div className="grid items-center gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
        <Reveal className="relative order-2 md:order-1">
          <div className="relative mx-auto w-[min(80vw,24rem)] sm:max-w-sm">
            {L.ornament !== "none" && (
              <>
                <span className={`pointer-events-none absolute -inset-4 border border-gold/40 ${shape}`} />
                <span className={`pointer-events-none absolute -inset-1.5 border border-gold/60 ${shape}`} />
              </>
            )}
            <div className={`overflow-hidden bg-paper ${shape}`}>
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
            </div>
            <p className="mt-5 text-center font-script text-[clamp(1.6rem,6vw,2rem)] text-gold-dark">
              dua hati, satu tujuan
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="order-1 text-center md:order-2 md:text-left">
          <span className="font-script text-6xl leading-none text-gold/50">”</span>
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
      </div>
    </section>
  );
}
