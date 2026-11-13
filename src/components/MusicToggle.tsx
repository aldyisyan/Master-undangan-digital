import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Music, Pause } from "lucide-react";
import { isMusicPlaying, onMusicChange, toggleMusic } from "../lib/music";

export default function MusicToggle({ visible }: { visible: boolean }) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setPlaying(isMusicPlaying());
    return onMusicChange(setPlaying);
  }, []);

  if (!visible) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, type: "spring", stiffness: 260, damping: 20 }}
      onClick={toggleMusic}
      aria-label={playing ? "Matikan musik" : "Putar musik"}
      style={{
        bottom: "max(1.25rem, env(safe-area-inset-bottom))",
        right: "max(1.25rem, env(safe-area-inset-right))",
      }}
      className="fixed z-[70] flex h-12 w-12 items-center justify-center rounded-full border border-gold/50 bg-forest text-cream shadow-xl transition-colors hover:bg-forest-deep"
    >
      <span
        className={`pointer-events-none absolute inset-0 rounded-full border border-gold/40 ${
          playing ? "spin-slow border-t-transparent" : ""
        }`}
      />
      {playing ? <Pause className="h-4 w-4" /> : <Music className="h-4 w-4" />}
    </motion.button>
  );
}
