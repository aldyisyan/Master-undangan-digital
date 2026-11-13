import { useState } from "react";
import { Copy, Check, Gift as GiftIcon, Landmark } from "lucide-react";
import Section, { Reveal } from "./Section";
import { useSettings } from "../lib/settings";

function BankCard({ bank, number, holder }: { bank: string; number: string; holder: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(number.replace(/\s/g, ""));
    } catch {
      /* clipboard tidak tersedia */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-forest p-7 text-left shadow-[0_25px_55px_-25px_rgba(38,47,32,0.7)]">
      <span className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full border border-gold-light/30" />
      <span className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 rounded-full border border-gold-light/20" />
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm font-semibold tracking-[0.3em] text-gold-light">{bank}</span>
        <Landmark className="h-5 w-5 text-gold-light/70" />
      </div>
      <p className="mt-6 font-sans text-xl font-light tracking-[0.18em] text-cream sm:text-2xl">
        {number}
      </p>
      <p className="mt-1.5 font-serif text-sm italic text-cream/70">a.n. {holder}</p>
      <button
        onClick={copy}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold-light/50 px-5 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.25em] text-gold-light transition-colors hover:bg-gold-light hover:text-forest"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Tersalin" : "Salin Nomor"}
      </button>
    </div>
  );
}

export default function Gift() {
  const s = useSettings();

  return (
    <Section
      id="hadiah"
      label="Tanda Kasih"
      title="Amplop Digital"
      subtitle="Kehadiran Anda adalah hadiah terindah. Namun bila ingin berbagi tanda kasih, kami sediakan dengan penuh terima kasih."
    >
      <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
        {s.gifts.map((g, i) => (
          <Reveal key={g.bank + i} delay={0.12 * (i + 1)}>
            <BankCard {...g} />
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.3} className="mt-8 flex justify-center">
        <div className="inline-flex max-w-lg items-center gap-4 rounded-2xl border border-gold/35 bg-cream px-7 py-5 text-left shadow-sm">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/15">
            <GiftIcon className="h-5 w-5 text-gold-dark" />
          </span>
          <p className="font-serif text-sm italic leading-relaxed text-ink/70">
            Kado fisik dapat dikirim ke — {s.kadoAddress}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
