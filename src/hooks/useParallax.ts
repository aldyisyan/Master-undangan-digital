/**
 * useParallax — parallax ringan berbasis Framer Motion useScroll + useTransform.
 * Tidak perlu RAF manual, sudah dioptimasi oleh Framer Motion (transform GPU).
 *
 * @param speed  negatif = background naik saat scroll turun (efek depth)
 *               positif = background turun saat scroll turun
 *               range: -0.5 ~ 0.5, disarankan -0.25 sampai -0.15
 */
import { useRef } from "react";
import { useScroll, useTransform, type MotionValue } from "framer-motion";

export interface ParallaxResult {
  ref: React.RefObject<HTMLElement | null>;
  y: MotionValue<string>;
}

export function useParallax(speed = -0.2): ParallaxResult {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Translate dari +speed*100% (elemen belum masuk viewport) ke -speed*100%
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${speed * 100}%`, `${-speed * 100}%`],
  );
  return { ref, y };
}
