import type { ReactNode } from "react";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Divider } from "./Ornament";
import { useSettings } from "../lib/settings";
import { getLayout } from "../lib/layouts";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface SectionProps {
  id?: string;
  label: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  tight?: boolean;
}

export default function Section({ id, label, title, subtitle, children, tight }: SectionProps) {
  const L = getLayout(useSettings().layout);
  const left = L.align === "left";

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // latar bergerak lebih lambat → efek kedalaman 3D
  const bgY = useTransform(scrollYProgress, [0, 1], ["-14%", "14%"]);
  // ornamen kiri bergerak ke bawah sedikit lebih lambat
  const orbLeftY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  // ornamen kanan bergerak berlawanan arah
  const orbRightY = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`relative overflow-hidden px-5 sm:px-6 ${tight ? "py-8 sm:py-10" : "py-12 sm:py-16"}`}
    >
      {/* ── parallax background layer ── */}
      <motion.div
        style={{ y: bgY }}
        className="pointer-events-none absolute inset-[-30%] will-change-transform"
        aria-hidden
      >
        {/* blob kiri atas */}
        <motion.span
          style={{ y: orbLeftY }}
          className="absolute left-[5%] top-[10%] h-56 w-56 rounded-full bg-gold/5 blur-[90px]"
        />
        {/* blob kanan bawah */}
        <motion.span
          style={{ y: orbRightY }}
          className="absolute bottom-[10%] right-[5%] h-48 w-48 rounded-full bg-sage/6 blur-[80px]"
        />
        {/* garis vertikal sangat tipis */}
        <span className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-gold/10 to-transparent" />
      </motion.div>

      {/* ── konten ── */}
      <div className="relative mx-auto max-w-4xl">
        <Reveal
          className={`flex flex-col ${left ? "items-start text-left" : "items-center text-center"}`}
        >
          <span className="fluid-label font-sans font-medium uppercase tracking-[0.55em] text-gold-dark">
            {label}
          </span>
          <h2 className="fluid-title balance mt-3 max-w-2xl font-serif font-light tracking-wide text-forest">
            {title}
          </h2>
          {subtitle && (
            <p
              className={`balance mt-3 max-w-xl font-serif text-[clamp(0.95rem,3vw,1.1rem)] italic leading-relaxed text-ink/70 ${
                left ? "" : "mx-auto"
              }`}
            >
              {subtitle}
            </p>
          )}
          {L.ornament === "none" ? (
            <span className="mt-5 h-px w-16 bg-gold/50" />
          ) : (
            <Divider className={`mt-5 ${left ? "-ml-2" : ""}`} />
          )}
        </Reveal>
        <div className="mt-8 sm:mt-10">{children}</div>
      </div>
    </section>
  );
}
