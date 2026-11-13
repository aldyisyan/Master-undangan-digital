import { cn } from "../utils/cn";

/* Semua warna memakai var(--pal-*) agar mengikuti tema dari panel admin */

/** Pembatas berbentuk tangkai daun dengan wajik di tengah */
export function Divider({ className, tone = "gold" }: { className?: string; tone?: "gold" | "cream" }) {
  const stroke = tone === "gold" ? "var(--pal-gold)" : "var(--pal-gold-light)";
  return (
    <svg viewBox="0 0 220 26" fill="none" className={cn("h-6 w-52", className)} aria-hidden>
      <line x1="8" y1="13" x2="86" y2="13" stroke={stroke} strokeWidth="1" />
      <line x1="134" y1="13" x2="212" y2="13" stroke={stroke} strokeWidth="1" />
      {[
        [30, -1], [46, 1], [62, -1],
      ].map(([x, dir], i) => (
        <path
          key={`l${i}`}
          d={`M${x} 13 q 7 ${-6 * dir} 14 0 q -7 ${6 * dir} -14 0`}
          stroke={stroke}
          strokeWidth="1"
          fill="none"
        />
      ))}
      {[
        [158, -1], [174, 1], [190, -1],
      ].map(([x, dir], i) => (
        <path
          key={`r${i}`}
          d={`M${x} 13 q 7 ${-6 * dir} 14 0 q -7 ${6 * dir} -14 0`}
          stroke={stroke}
          strokeWidth="1"
          fill="none"
        />
      ))}
      <rect x="106" y="9" width="8" height="8" transform="rotate(45 110 13)" stroke={stroke} strokeWidth="1" fill="none" />
      <circle cx="110" cy="13" r="1.6" fill={stroke} />
      <circle cx="8" cy="13" r="1.4" fill={stroke} />
      <circle cx="212" cy="13" r="1.4" fill={stroke} />
    </svg>
  );
}

/** Tangkai eucalyptus kecil untuk aksen melayang */
export function LeafSprig({ className }: { className?: string }) {
  const sage = "var(--pal-sage)";
  return (
    <svg viewBox="0 0 60 120" fill="none" className={className} aria-hidden>
      <path d="M30 118 C 30 80, 30 40, 30 4" stroke={sage} strokeWidth="1.4" strokeLinecap="round" />
      {[
        [30, 18, -20, 10], [30, 34, 18, 24], [30, 52, -22, 46], [30, 70, 18, 64], [30, 88, -20, 84], [30, 104, 16, 100],
      ].map(([x, y, tx, ty], i) => (
        <path
          key={i}
          d={`M${x} ${y} Q ${(x + tx) / 2} ${(y + ty) / 2 - 8} ${tx + 30} ${ty}`}
          stroke={sage}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
      ))}
      {[
        [12, 12], [46, 26], [10, 48], [46, 66], [12, 86], [44, 102],
      ].map(([x, y], i) => (
        <ellipse
          key={`e${i}`}
          cx={x}
          cy={y}
          rx="8.5"
          ry="11"
          transform={`rotate(${i % 2 === 0 ? -28 : 28} ${x} ${y})`}
          fill={sage}
          opacity="0.9"
        />
      ))}
      <circle cx="30" cy="6" r="4.5" fill={sage} />
    </svg>
  );
}

/** Karangan lingkar daun untuk monogram */
export function Wreath({ className }: { className?: string }) {
  const gold = "var(--pal-gold)";
  const sage = "var(--pal-sage)";
  const rose = "var(--pal-rose)";
  const leaves = Array.from({ length: 26 });
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} aria-hidden>
      <circle cx="100" cy="100" r="86" stroke={gold} strokeWidth="1" opacity="0.8" />
      <circle cx="100" cy="100" r="80" stroke={gold} strokeWidth="0.6" opacity="0.5" />
      {leaves.map((_, i) => {
        const angle = (i / leaves.length) * 360;
        const rad = ((angle - 90) * Math.PI) / 180;
        const x = 100 + Math.cos(rad) * 86;
        const y = 100 + Math.sin(rad) * 86;
        return (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx="3.2"
            ry="7.5"
            transform={`rotate(${angle} ${x} ${y})`}
            fill={i % 3 === 0 ? gold : sage}
            opacity={i % 3 === 0 ? 0.85 : 0.65}
          />
        );
      })}
      {[55, 145].map((angle, i) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        const x = 100 + Math.cos(rad) * 86;
        const y = 100 + Math.sin(rad) * 86;
        return (
          <g key={i}>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse
                key={a}
                cx={x}
                cy={y - 6}
                rx="3.4"
                ry="6.5"
                transform={`rotate(${a} ${x} ${y})`}
                fill={rose}
              />
            ))}
            <circle cx={x} cy={y} r="3.2" fill={gold} />
          </g>
        );
      })}
    </svg>
  );
}

/** Aksen sudut bingkai */
export function CornerFlourish({ className }: { className?: string }) {
  const gold = "var(--pal-gold)";
  const sage = "var(--pal-sage)";
  const rose = "var(--pal-rose)";
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <path d="M2 62 V14 Q2 2 14 2 H62" stroke={gold} strokeWidth="1.1" />
      <path d="M8 62 V20 Q8 8 20 8 H62" stroke={gold} strokeWidth="0.6" opacity="0.6" />
      <ellipse cx="16" cy="16" rx="3.5" ry="7" transform="rotate(-45 16 16)" fill={sage} opacity="0.85" />
      <ellipse cx="30" cy="10" rx="2.8" ry="6" transform="rotate(-70 30 10)" fill={sage} opacity="0.7" />
      <ellipse cx="10" cy="30" rx="2.8" ry="6" transform="rotate(-20 10 30)" fill={sage} opacity="0.7" />
      <circle cx="44" cy="8" r="1.8" fill={rose} />
      <circle cx="8" cy="44" r="1.8" fill={rose} />
    </svg>
  );
}
