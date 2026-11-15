import { HeartHandshake, Lock } from "lucide-react";
import type { GuestPage } from "../lib/settings";
import { useSettings } from "../lib/settings";
import { useMediaSrc } from "../lib/mediaStore";
import { Divider } from "./Ornament";
import { Reveal } from "./Section";

export default function Closing({ guest }: { guest: GuestPage }) {
  const s = useSettings();
  const bg = useMediaSrc(s.backgroundImage);
  // tautan QR & Panel Admin hanya tampil bagi pengantin yang sudah login,
  // tidak pernah ditampilkan kepada tamu undangan
  const isAdmin =
    typeof window !== "undefined" && sessionStorage.getItem("rk-admin-auth") === "1";

  return (
    <footer className="relative overflow-hidden bg-forest-deep text-cream">
      {bg ? (
        <>
          <img src={bg} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-forest-deep via-forest-deep/80 to-forest-deep" />
        </>
      ) : (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 rotate-180 mix-blend-luminosity opacity-25">
          <img src="/images/flowers-arch.png" alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="relative mx-auto max-w-3xl px-6 py-14 text-center sm:py-16">
        <Reveal>
          <HeartHandshake className="mx-auto h-7 w-7 text-gold-light" />
          <p className="balance mt-5 font-serif text-[clamp(0.95rem,3.2vw,1.15rem)] italic leading-relaxed text-cream/85">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami sekeluarga apabila Anda berkenan
            hadir untuk memberikan doa restu kepada kedua mempelai. Atas kehadiran serta doa yang
            tulus, kami mengucapkan terima kasih yang sebesar-besarnya.
          </p>
          <p className="mt-6 font-sans text-[10px] uppercase tracking-[0.55em] text-gold-light/80">
            {guest.closing}
          </p>
          <Divider tone="cream" className="mx-auto mt-6 opacity-80" />
          <h2 className="break-safe mt-6 font-script text-[clamp(2.6rem,12vw,4.5rem)] leading-tight text-gold-light">
            {s.bride.short} &amp; {s.groom.short}
          </h2>
          <p className="mt-4 font-sans text-[11px] uppercase tracking-[0.55em] text-cream/60">
            {s.dateLabel}
          </p>
        </Reveal>

        {/* khusus pengantin: akses cepat kembali ke panel admin */}
        <Reveal delay={0.15} className="mt-10">
          <p className="font-sans text-[10px] uppercase tracking-[0.45em] text-cream/50">
            Halaman ini dibuat khusus untuk
          </p>
          <p className="break-safe mt-3 font-script text-[clamp(1.9rem,8vw,2.5rem)] text-gold-light">
            {guest.title}
          </p>
          {isAdmin && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#/admin"
                className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-7 py-3 font-sans text-[10px] font-medium uppercase tracking-[0.4em] text-cream/60 transition-colors hover:border-gold-light/60 hover:text-gold-light"
              >
                <Lock className="h-4 w-4" />
                Panel Admin
              </a>
            </div>
          )}
        </Reveal>

        <Reveal delay={0.25} className="mt-14">
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-cream/40">
            Dibuat dengan cinta · {s.bride.short} &amp; {s.groom.short} · {new Date(s.dateISO).getFullYear()}
          </p>
        </Reveal>
      </div>
    </footer>
  );
}
