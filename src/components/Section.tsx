import type { ReactNode } from "react";
import { motion } from "framer-motion";
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
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
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

  return (
    <section
      id={id}
      className={`relative px-5 sm:px-6 ${tight ? "py-8 sm:py-10" : "py-12 sm:py-16"}`}
    >
      <div className="mx-auto max-w-4xl">
        <Reveal
          className={`flex flex-col ${
            left ? "items-start text-left" : "items-center text-center"
          }`}
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
