import { CalendarHeart, Clock3 } from "lucide-react";
import Section, { Reveal } from "./Section";
import Countdown from "./Countdown";
import SaveToCalendar from "./SaveToCalendar";
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
            <div className="group relative h-full overflow-hidden rounded-[2.5rem] border border-gold/30 bg-cream/80 p-9 text-center shadow-[0_45px_100px_-20px_rgba(38,47,32,0.25)] backdrop-blur-sm sm:p-12">
              <span className="pointer-events-none absolute inset-3 rounded-[2rem] border border-gold/20" />
              <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/10 transition-transform duration-1000 ease-out group-hover:scale-[2]" />
              <span className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-sage/10 transition-transform duration-1000 ease-out group-hover:scale-[2]" />

              <div className="relative">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-ivory/80 shadow-sm">
                  <CalendarHeart className="h-6 w-6 text-gold-dark" />
                </span>
                <h3 className="mt-7 font-serif text-3xl font-medium tracking-wide text-forest">{ev.title}</h3>
                <p className="mt-4 font-sans text-[10px] font-medium uppercase tracking-[0.45em] text-gold-dark">
                  {ev.date}
                </p>
                <p className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-gold/20 bg-forest px-7 py-3 font-sans text-[9px] uppercase tracking-[0.4em] text-cream shadow-xl">
                  <Clock3 className="h-3.5 w-3.5 text-gold-light" />
                  {ev.time}
                </p>
                <p className="mx-auto mt-7 max-w-xs font-serif text-[15px] italic leading-relaxed text-ink/75">
                  {ev.note}
                </p>

                {/* Tombol simpan ke kalender per acara */}
                <div className="flex justify-center">
                  <SaveToCalendar
                    eventTitle={ev.title}
                    startISO={s.dateISO}
                    durationHours={2}
                  />
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
