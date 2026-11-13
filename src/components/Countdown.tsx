import { useEffect, useState } from "react";

function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    hari: Math.floor(diff / 86_400_000),
    jam: Math.floor(diff / 3_600_000) % 24,
    menit: Math.floor(diff / 60_000) % 60,
    detik: Math.floor(diff / 1_000) % 60,
    selesai: diff <= 0,
  };
}

export default function Countdown({ dateISO }: { dateISO: string }) {
  const target = new Date(dateISO).getTime();
  const [t, setT] = useState(() => getRemaining(target));

  useEffect(() => {
    setT(getRemaining(target));
    const id = setInterval(() => setT(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const cells = [
    { label: "Hari", value: t.hari },
    { label: "Jam", value: t.jam },
    { label: "Menit", value: t.menit },
    { label: "Detik", value: t.detik },
  ];

  return (
    <div className="mx-auto flex w-full max-w-md items-stretch justify-center gap-2 sm:max-w-lg sm:gap-4">
      {cells.map((c) => (
        <div
          key={c.label}
          className="relative min-w-0 flex-1 overflow-hidden rounded-xl border border-gold/40 bg-forest px-1 py-4 text-center shadow-md sm:px-2 sm:py-6"
        >
          <span className="pointer-events-none absolute inset-x-3 top-2 h-px bg-gold-light/40 sm:inset-x-4" />
          <span className="pointer-events-none absolute inset-x-3 bottom-2 h-px bg-gold-light/40 sm:inset-x-4" />
          <span className="block font-sans text-[clamp(1.35rem,6vw,2.25rem)] font-light tabular-nums text-cream">
            {t.selesai ? "0" : String(c.value).padStart(2, "0")}
          </span>
          <span className="mt-1 block font-sans text-[8px] uppercase tracking-[0.2em] text-gold-light sm:text-[10px] sm:tracking-[0.3em]">
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}
