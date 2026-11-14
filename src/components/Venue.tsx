import { MapPin, Navigation } from "lucide-react";
import Section, { Reveal } from "./Section";
import { useSettings } from "../lib/settings";
import { useMediaSrc } from "../lib/mediaStore";

export default function Venue() {
  const s = useSettings();
  const photo = useMediaSrc(s.venue.photo);

  return (
    <Section
      id="lokasi"
      label="Denah Lokasi"
      title="Tempat BerLabuhnya Bahagia"
      subtitle="Acara akan diselenggarakan di pendopo taman terbuka yang asri — silakan gunakan peta di bawah untuk navigasi."
    >
      <Reveal>
        <div className="overflow-hidden rounded-3xl border border-gold/40 bg-cream shadow-[0_30px_70px_-30px_rgba(53,65,45,0.45)]">
          <div className="relative h-56 overflow-hidden sm:h-64">
            {photo && <img src={photo} alt={s.venue.name} className="h-full w-full object-cover" />}
            <span className="absolute inset-0 bg-gradient-to-t from-forest-deep/70 via-forest-deep/10 to-transparent" />
            <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between gap-4">
              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.35em] text-gold-light">
                  Lokasi Acara
                </p>
                <h3 className="mt-1 font-serif text-2xl font-semibold text-cream sm:text-3xl">
                  {s.venue.name}
                </h3>
              </div>
              <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-light/60 bg-cream/15 backdrop-blur-sm sm:flex">
                <MapPin className="h-5 w-5 text-gold-light" />
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-[1.15fr_1fr]">
            <div className="flex flex-col justify-center gap-5 p-7 sm:p-10">
              <p className="font-serif text-lg leading-relaxed text-ink/80">{s.venue.address}</p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={s.venue.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-forest px-8 py-3.5 font-sans text-[10px] font-medium uppercase tracking-[0.35em] text-cream shadow-xl transition-all hover:-translate-y-0.5 hover:bg-forest-deep"
                >
                  <Navigation className="h-4 w-4 text-gold-light" />
                  Buka Google Maps
                </a>
                <span className="font-sans text-[11px] tracking-widest text-ink/50">
                  parkir luas &amp; akses mudah
                </span>
              </div>
            </div>
            <div className="border-t border-gold/25 md:border-l md:border-t-0">
              <iframe
                title="Peta lokasi acara"
                src={s.venue.mapsEmbed}
                className="h-64 w-full grayscale-[35%] sepia-[18%] md:h-full md:min-h-64"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
