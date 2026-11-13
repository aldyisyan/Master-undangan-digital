import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Mic, Quote as QuoteIcon } from "lucide-react";
import { useSettings } from "../lib/settings";
import { useMediaSrc } from "../lib/mediaStore";
import { suspendMusicForVoice, resumeMusicAfterVoice } from "../lib/music";
import Section, { Reveal } from "./Section";

function fmt(sec: number) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function VoiceNote() {
  const settings = useSettings();
  const vn = settings.voiceNote;
  const audioSrc = useMediaSrc(vn.src);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // tinggi batang waveform — deterministik agar konsisten per render
  const bars = useMemo(() => {
    const arr: number[] = [];
    let seed = 97;
    for (let i = 0; i < 44; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      const rnd = seed / 233280;
      arr.push(0.22 + rnd * 0.78 * (0.5 + 0.5 * Math.sin(i / 4.2)));
    }
    return arr;
  }, []);

  useEffect(() => {
    setPlaying(false);
    setTime(0);
  }, [audioSrc]);

  // bila tamu berpindah halaman saat pesan suara berjalan,
  // pastikan backsound tidak ikut terhenti selamanya
  useEffect(() => () => resumeMusicAfterVoice(), []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    a.currentTime = ratio * duration;
    setTime(a.currentTime);
  };

  const progress = duration ? time / duration : 0;
  const activeBars = Math.floor(progress * bars.length);

  return (
    <Section
      id="pesan"
      label="Pesan Khusus Untukmu"
      title="Selembar Suara, Sejuta Rasa"
      subtitle={vn.hint}
    >
      <Reveal>
        <div className="relative mx-auto max-w-2xl">
          {/* kartu utama */}
          <div className="relative overflow-hidden rounded-3xl border border-gold/40 bg-cream p-7 shadow-[0_35px_70px_-30px_rgba(53,65,45,0.4)] sm:p-10">
            <span className="pointer-events-none absolute inset-2 rounded-[20px] border border-gold/25" />
            <QuoteIcon className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 rotate-12 text-gold/10" />

            <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
              {/* tombol play */}
              <motion.button
                onClick={toggle}
                whileTap={{ scale: 0.92 }}
                aria-label={playing ? "Jeda voice note" : "Putar voice note"}
                className="ring-pulse relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-forest text-cream shadow-lg transition-colors hover:bg-forest-deep"
              >
                <motion.span
                  animate={playing ? { scale: [1, 1.35], opacity: [0.5, 0] } : { scale: 1, opacity: 0 }}
                  transition={playing ? { repeat: Infinity, duration: 1.6, ease: "easeOut" } : {}}
                  className="absolute inset-0 rounded-full border-2 border-gold"
                />
                {playing ? <Pause className="h-7 w-7" /> : <Play className="ml-1 h-7 w-7" />}
              </motion.button>

              <div className="w-full flex-1">
                <div className="flex items-center gap-2">
                  <Mic className="h-3.5 w-3.5 text-gold" />
                  <span className="font-sans text-[10px] font-medium uppercase tracking-[0.32em] text-gold-dark">
                    Voice Note
                  </span>
                </div>
                <h3 className="balance mt-1.5 font-serif text-[clamp(1.3rem,5vw,1.7rem)] font-medium text-forest">
                  {vn.title}
                </h3>
                <p className="mt-1 font-serif text-sm italic text-ink/60">
                  dari {settings.bride.short} &amp; {settings.groom.short}
                </p>

                {/* waveform */}
                <div
                  className="mt-5 flex h-12 cursor-pointer items-center gap-[2px] sm:h-14 sm:gap-[3px]"
                  onClick={seek}
                  role="slider"
                  aria-label="Posisi pemutaran"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress * 100)}
                >
                  {bars.map((bh, i) => (
                    <span
                      key={i}
                      className={`voice-bar min-w-0 flex-1 rounded-full transition-colors duration-200 ${
                        i < activeBars ? "bg-gold" : "bg-forest/20"
                      } ${playing ? "playing" : ""}`}
                      style={{
                        height: `${Math.max(0.18, bh) * 100}%`,
                        animationDelay: `${(i % 12) * 0.09}s`,
                        animationDuration: `${0.9 + (i % 5) * 0.14}s`,
                      }}
                    />
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 font-sans text-[10px] tracking-widest text-ink/55 sm:text-[11px]">
                  <span className="tabular-nums">{fmt(time)}</span>
                  <span className="hidden truncate uppercase tracking-[0.2em] text-gold-dark/80 min-[400px]:block sm:tracking-[0.25em]">
                    {playing ? "Sedang diputar…" : "Sentuh untuk memutar"}
                  </span>
                  <span className="tabular-nums">{duration ? fmt(duration) : "--:--"}</span>
                </div>
              </div>
            </div>

            {/* transkrip */}
            <div className="relative mt-8 rounded-2xl bg-paper/70 px-6 py-5">
              <p className="font-serif text-[15px] italic leading-relaxed text-ink/80">
                {vn.transcript}
              </p>
            </div>

            {audioSrc && (
              <audio
                ref={audioRef}
                src={audioSrc}
                preload="metadata"
                onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onPlay={() => {
                  // backsound berhenti otomatis selama pesan suara diputar
                  suspendMusicForVoice();
                  setPlaying(true);
                }}
                onPause={() => {
                  resumeMusicAfterVoice();
                  setPlaying(false);
                }}
                onEnded={() => {
                  resumeMusicAfterVoice();
                  setPlaying(false);
                }}
              />
            )}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
