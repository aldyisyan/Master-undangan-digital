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
    <div className="mx-auto flex w-full max-w-sm items-stretch justify-center gap-2 sm:max-w-md sm:gap-3">
      {cells.map((c) => (
        <div
          key={c.label}
          className="relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-gold/20 bg-forest/90 px-1 py-5 text-center shadow-[0_20px_40px_-15px_rgba(38,47,32,0.4)] backdrop-blur-md sm:px-2 sm:py-7"
        >
          <span className="pointer-events-none absolute inset-x-4 top-2 h-[0.5px] bg-gold-light/30 sm:inset-x-5" />
          <span className="pointer-events-none absolute inset-x-4 bottom-2 h-[0.5px] bg-gold-light/30 sm:inset-x-5" />
          <span className="block font-serif text-[clamp(2rem,8vw,3.2rem)] font-light leading-none tracking-wide tabular-nums text-cream">
            {t.selesai ? "0" : String(c.value).padStart(2, "0")}
          </span>
          <span className="mt-3 block font-sans text-[8px] font-medium uppercase tracking-[0.4em] text-gold-light sm:text-[9px]">
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}
