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
      className={`relative px-5 sm:px-6 ${tight ? "py-14 sm:py-16" : "py-20 sm:py-24 lg:py-28"}`}
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
          <h2 className="fluid-title balance mt-4 max-w-2xl font-serif font-light tracking-wide text-forest">
            {title}
          </h2>
          {subtitle && (
            <p
              className={`balance mt-5 max-w-xl font-serif text-[clamp(1rem,3.5vw,1.15rem)] italic leading-relaxed text-ink/70 ${
                left ? "" : "mx-auto"
              }`}
            >
              {subtitle}
            </p>
          )}
          {L.ornament === "none" ? (
            <span className="mt-6 h-px w-20 bg-gold/50" />
          ) : (
            <Divider className={`mt-6 ${left ? "-ml-2" : ""}`} />
          )}
        </Reveal>
        <div className="mt-10 sm:mt-14">{children}</div>
      </div>
    </section>
  );
}
