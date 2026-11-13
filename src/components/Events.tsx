import { CalendarHeart, Clock3 } from "lucide-react";
import Section, { Reveal } from "./Section";
import Countdown from "./Countdown";
import { useSettings } from "../lib/settings";

export default function Events() {
  const s = useSettings();

  return (
    <Section
      id="acara"
      label="Save The Date"
      title="Hari yang Dinanti"
      subtitle="InsyaAllah rangkaian acara akan berlangsung dengan khidmat dan penuh kebahagiaan."
    >
      <Reveal>
        <Countdown dateISO={s.dateISO} />
      </Reveal>

      <div className="mt-14 grid gap-8 sm:grid-cols-2">
        {s.events.map((ev, i) => (
          <Reveal key={ev.title + i} delay={0.12 * (i + 1)}>
            <div className="group relative h-full overflow-hidden rounded-3xl border border-gold/40 bg-cream p-8 text-center shadow-[0_25px_60px_-30px_rgba(53,65,45,0.4)] sm:p-10">
              <span className="pointer-events-none absolute inset-2.5 rounded-[18px] border border-gold/25" />
              <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/10 transition-transform duration-700 group-hover:scale-[1.8]" />
              <span className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-sage/10 transition-transform duration-700 group-hover:scale-[1.8]" />

              <div className="relative">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/50 bg-ivory">
                  <CalendarHeart className="h-6 w-6 text-gold-dark" />
                </span>
                <h3 className="mt-5 font-serif text-3xl font-semibold text-forest">{ev.title}</h3>
                <p className="mt-3 font-sans text-[11px] font-medium uppercase tracking-[0.35em] text-gold-dark">
                  {ev.date}
                </p>
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2 font-sans text-xs tracking-[0.2em] text-cream">
                  <Clock3 className="h-3.5 w-3.5 text-gold-light" />
                  {ev.time}
                </p>
                <p className="mx-auto mt-5 max-w-xs font-serif text-sm italic leading-relaxed text-ink/65">
                  {ev.note}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
