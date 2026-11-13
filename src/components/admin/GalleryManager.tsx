import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, Trash2, Images } from "lucide-react";
import { mediaRef, isMediaRef, saveMedia, removeMedia, useMediaSrc } from "../../lib/mediaStore";

const MAX_PHOTOS = 18;

function Thumb({ value, onRemove }: { value: string; onRemove: () => void }) {
  const src = useMediaSrc(value);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.25 }}
      className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-gold/30 bg-paper"
    >
      {src ? (
        <img src={src} alt="Foto galeri" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-sans text-[9px] uppercase tracking-widest text-ink/40">
          memuat…
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Hapus foto"
        className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-forest-deep/80 text-cream opacity-100 shadow transition-all hover:bg-rose sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

export default function GalleryManager({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const next = [...value];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        if (next.length >= MAX_PHOTOS) break;
        const key = `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        await saveMedia(key, file);
        next.push(mediaRef(key));
      }
      onChange(next);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = async (i: number) => {
    const ref = value[i];
    if (isMediaRef(ref)) {
      await removeMedia(ref.slice(6)).catch(() => {});
    }
    onChange(value.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-sans text-[11px] leading-relaxed text-ink/55">
          <span className="font-semibold text-forest">{value.length}</span> / {MAX_PHOTOS} foto.
          Bila galeri dikosongkan, bagian ini tidak tampil di undangan.
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy || value.length >= MAX_PHOTOS}
          className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-cream shadow-md transition-colors hover:bg-forest-deep disabled:opacity-50"
        >
          <ImagePlus className="h-3.5 w-3.5 text-gold-light" />
          {busy ? "Menyimpan…" : "Tambah Foto"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {value.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gold/40 bg-cream/60 px-6 py-12 text-center transition-colors hover:border-gold hover:bg-cream"
        >
          <Images className="h-8 w-8 text-gold/60" />
          <span className="font-serif text-lg italic text-ink/60">Belum ada foto galeri</span>
          <span className="max-w-xs font-sans text-[11px] leading-relaxed text-ink/45">
            Pilih beberapa foto prawedding sekaligus — semuanya tersimpan aman di perangkat ini.
          </span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          <AnimatePresence initial={false}>
            {value.map((ref, i) => (
              <Thumb key={ref + i} value={ref} onRemove={() => removeAt(i)} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <p className="font-sans text-[11px] leading-relaxed text-ink/50">
        Tips: foto dengan rasio campuran (potret &amp; landscape) tampil paling menarik pada susunan
        masonry. Urutan foto sesuai urutan unggah.
      </p>
    </div>
  );
}
