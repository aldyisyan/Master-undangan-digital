import { motion } from "framer-motion";
import Section, { Reveal } from "./Section";
import { useSettings } from "../lib/settings";
import { useMediaSrc } from "../lib/mediaStore";
import { getLayout, portraitClass, type LayoutDef } from "../lib/layouts";

function PersonCard({
  photo,
  name,
  role,
  parents,
  delay,
  L,
}: {
  photo: string;
  name: string;
  role: string;
  parents: string;
  delay: number;
  L: LayoutDef;
}) {
  const src = useMediaSrc(photo);
  const shape = portraitClass(L.portrait);
  const circle = L.portrait === "circle";

  return (
    <Reveal delay={delay}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="group relative mx-auto w-full max-w-[17rem] sm:max-w-xs"
      >
        {L.ornament !== "none" && (
          <span
            className={`pointer-events-none absolute -inset-3 border border-gold/40 transition-transform duration-700 group-hover:scale-[1.02] ${shape}`}
          />
        )}
        <div className={`overflow-hidden border border-gold/25 bg-cream p-3 shadow-[0_28px_60px_-25px_rgba(53,65,45,0.45)] ${shape}`}>
          <div className={`overflow-hidden bg-paper ${shape}`}>
            {src && (
              <img
                src={src}
                alt={name}
                loading="lazy"
                className={`w-full object-cover transition-transform duration-[2.2s] ease-out group-hover:scale-110 ${
                  circle ? "aspect-square" : "aspect-[4/5]"
                }`}
              />
            )}
          </div>
        </div>
        <div className="mt-6 text-center sm:mt-8">
          <p className="fluid-label font-sans font-medium uppercase tracking-[0.55em] text-gold-dark">
            {role}
          </p>
          <h3 className="balance mt-3 font-serif text-[clamp(1.25rem,4.6vw,1.65rem)] font-medium text-forest">
            {name}
          </h3>
          <p className="mx-auto mt-3 max-w-[16rem] font-serif text-[15px] italic leading-relaxed text-ink/70">
            {parents}
          </p>
        </div>
      </motion.div>
    </Reveal>
  );
}

export default function Mempelai() {
  const s = useSettings();
  const L = getLayout(s.layout);

  return (
    <Section
      id="mempelai"
      label="Mempelai"
      title="Dua Insan yang Dipertemukan"
      subtitle="Atas izin Allah SWT dan restu kedua orang tua, kami akan melangsungkan pernikahan."
    >
      <div className="grid gap-12 sm:grid-cols-2 sm:gap-8 lg:gap-14">
        <PersonCard
          photo={s.bride.photo}
          name={s.bride.name}
          role="Mempelai Wanita"
          parents={s.bride.parents}
          delay={0}
          L={L}
        />
        <PersonCard
          photo={s.groom.photo}
          name={s.groom.name}
          role="Mempelai Pria"
          parents={s.groom.parents}
          delay={0.16}
          L={L}
        />
      </div>
      <Reveal delay={0.28} className="mt-12 text-center sm:mt-14">
        <span className="fluid-script break-safe font-script text-gold-gradient">{s.hashtag}</span>
      </Reveal>
    </Section>
  );
}
