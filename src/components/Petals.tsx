import { useEffect, useRef } from "react";
import { useSettings } from "../lib/settings";

interface Petal {
  x: number;
  y: number;
  size: number;
  speed: number;
  sway: number;
  phase: number;
  rot: number;
  rotSpeed: number;
  alt: boolean;
}

type RGB = [number, number, number];

function toRgb(hex: string): RGB | null {
  const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Kelopak berjatuhan — warna mengikuti palet tema (rose & gold) */
export default function Petals({ density = 20 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const settings = useSettings();
  const colorsRef = useRef<{ a: RGB; b: RGB }>({ a: [201, 160, 140], b: [176, 141, 87] });

  // baca ulang warna dari CSS variabel setiap palet berubah
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const rose = toRgb(cs.getPropertyValue("--pal-rose"));
    const gold = toRgb(cs.getPropertyValue("--pal-gold"));
    colorsRef.current = {
      a: rose ?? [201, 160, 140],
      b: gold ?? [176, 141, 87],
    };
  }, [settings.colors]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const petals: Petal[] = [];

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      w = rect?.width ?? window.innerWidth;
      h = rect?.height ?? window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (initial = false): Petal => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : -30,
      size: 5 + Math.random() * 9,
      speed: 0.35 + Math.random() * 0.8,
      sway: 14 + Math.random() * 26,
      phase: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      alt: Math.random() >= 0.55,
    });

    resize();
    for (let i = 0; i < density; i++) petals.push(spawn(true));

    let t = 0;
    const tick = () => {
      t += 0.008;
      ctx.clearRect(0, 0, w, h);
      const { a, b } = colorsRef.current;
      for (const p of petals) {
        p.y += p.speed;
        p.rot += p.rotSpeed;
        const x = p.x + Math.sin(t * 2 + p.phase) * p.sway;
        if (p.y > h + 30) Object.assign(p, spawn());

        const [r, g, bl] = p.alt ? b : a;
        ctx.save();
        ctx.translate(x, p.y);
        ctx.rotate(p.rot);
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        grad.addColorStop(0, `rgba(${r},${g},${bl},0.55)`);
        grad.addColorStop(1, `rgba(${r},${g},${bl},0.05)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [density]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 z-10" aria-hidden />;
}
