import { useState, useRef, useEffect } from "react";
import { CalendarPlus, Smartphone, Globe, ChevronDown, Check } from "lucide-react";
import { downloadICS, buildGoogleCalendarUrl } from "../lib/calendar";
import { useSettings } from "../lib/settings";

interface Props {
  eventTitle: string;
  startISO: string;
  durationHours?: number;
}

export default function SaveToCalendar({ eventTitle, startISO, durationHours = 2 }: Props) {
  const s = useSettings();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const title = `${eventTitle} — ${s.bride.short} & ${s.groom.short}`;
  const location = `${s.venue.name}, ${s.venue.address}`;
  const description =
    `Undangan pernikahan ${s.bride.name} & ${s.groom.name}.\n` +
    `${s.dateLabel}\n${s.venue.name}\n${s.venue.address}`;

  // tutup dropdown saat klik luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleICS = () => {
    downloadICS({ title, location, description, startISO, durationHours, filename: `save-the-date-${s.bride.short}-${s.groom.short}`.toLowerCase() });
    setSaved(true);
    setOpen(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleGoogle = () => {
    const url = buildGoogleCalendarUrl({ title, location, description, startISO, durationHours });
    window.open(url, "_blank", "noopener");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative mt-6 inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`group inline-flex items-center gap-2.5 rounded-full border px-6 py-3 font-sans text-[10px] font-semibold uppercase tracking-[0.32em] shadow-md transition-all ${
          saved
            ? "border-sage/60 bg-sage/15 text-forest"
            : "border-gold/35 bg-cream/80 text-forest backdrop-blur-sm hover:border-gold hover:bg-gold/10 hover:shadow-lg"
        }`}
      >
        {saved ? (
          <Check className="h-4 w-4 shrink-0 text-sage" />
        ) : (
          <CalendarPlus className="h-4 w-4 shrink-0 text-gold-dark transition-transform duration-300 group-hover:scale-110" />
        )}
        {saved ? "Tersimpan!" : "Simpan ke Kalender"}
        {!saved && (
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 text-gold-dark/70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && !saved && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 overflow-hidden rounded-2xl border border-gold/30 bg-cream/95 shadow-[0_20px_60px_-15px_rgba(53,65,45,0.4)] backdrop-blur-md">
          <p className="border-b border-gold/15 px-4 py-2.5 font-sans text-[9px] uppercase tracking-[0.35em] text-ink/50">
            Simpan ke
          </p>

          {/* Google Calendar */}
          <button
            type="button"
            onClick={handleGoogle}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gold/10"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <Globe className="h-4 w-4 text-[#4285f4]" />
            </span>
            <div>
              <p className="font-sans text-[11px] font-semibold text-forest">Google Calendar</p>
              <p className="font-sans text-[10px] text-ink/50">Buka di browser</p>
            </div>
          </button>

          {/* iCal / iPhone */}
          <button
            type="button"
            onClick={handleICS}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gold/10"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <Smartphone className="h-4 w-4 text-[#555]" />
            </span>
            <div>
              <p className="font-sans text-[11px] font-semibold text-forest">iPhone / Android</p>
              <p className="font-sans text-[10px] text-ink/50">Unduh file .ics</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
