import { useRef, useState, type ReactNode } from "react";
import { ImagePlus, Music4, RotateCcw, Link2, Crop } from "lucide-react";
import {
  isMediaRef,
  mediaRef,
  saveMedia,
  removeMedia,
  readMedia,
  useMediaSrc,
} from "../../lib/mediaStore";
import ImageCropper from "./ImageCropper";

/* ------------------------------ dasar ------------------------------ */

export function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-gold/30 bg-cream px-4 py-2.5 font-serif text-[15px] text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/25"
      />
      {hint && <span className="mt-1 block font-sans text-[11px] text-ink/50">{hint}</span>}
    </label>
  );
}

export function Area({
  label,
  value,
  onChange,
  rows = 4,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="mt-1.5 w-full resize-y rounded-xl border border-gold/30 bg-cream px-4 py-2.5 font-serif text-[15px] leading-relaxed text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/25"
      />
      {hint && <span className="mt-1 block font-sans text-[11px] text-ink/50">{hint}</span>}
    </label>
  );
}

export function Card({
  title,
  desc,
  action,
  children,
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gold/30 bg-ivory p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-serif text-xl font-semibold text-forest">{title}</h3>
          {desc && <p className="mt-1 font-sans text-xs leading-relaxed text-ink/55">{desc}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

/* --------------------------- pemilih media --------------------------- */

interface MediaPickerProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  /** key unik di IndexedDB, mis. "groom-photo" */
  mediaKey: string;
  /** nilai bawaan untuk tombol reset */
  defaultValue: string;
  accept: string;
  hint?: string;
}

function useMediaUpload({ value, onChange, mediaKey, defaultValue }: MediaPickerProps) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      await saveMedia(mediaKey, file);
      onChange(mediaRef(mediaKey));
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (isMediaRef(value)) {
      await removeMedia(mediaKey);
      await removeMedia(`${mediaKey}__orig`);
    }
    onChange(defaultValue);
  };

  return { busy, inputRef, upload, reset, changed: value !== defaultValue };
}

export function ImagePicker(
  props: MediaPickerProps & {
    previewClass?: string;
    /** rasio bingkai tujuan (lebar/tinggi) */
    aspect?: number;
    /** bentuk bingkai pada alat crop, mis. "rounded-full" */
    shapeClass?: string;
  },
) {
  const { label, value, onChange, hint, previewClass, mediaKey } = props;
  const aspect = props.aspect ?? 4 / 5;
  const shapeClass = props.shapeClass ?? "rounded-2xl";
  const src = useMediaSrc(value);
  const { busy, inputRef, upload, reset, changed } = useMediaUpload(props);

  // sumber yang sedang dipotong + penanda apakah berasal dari berkas baru
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingType, setPendingType] = useState("image/jpeg");

  const openCropperWithFile = (file: File) => {
    setPendingType(file.type === "image/png" ? "image/png" : "image/jpeg");
    // simpan berkas asli agar posisinya bisa disesuaikan ulang kapan saja
    saveMedia(`${mediaKey}__orig`, file).catch(() => {});
    setCropSrc(URL.createObjectURL(file));
  };

  /** buka kembali alat crop memakai foto asli yang tersimpan */
  const adjustAgain = async () => {
    const original = await readMedia(`${mediaKey}__orig`);
    if (original) {
      setPendingType(original.type === "image/png" ? "image/png" : "image/jpeg");
      setCropSrc(URL.createObjectURL(original));
    } else if (src) {
      setPendingType("image/jpeg");
      setCropSrc(src);
    }
  };

  const closeCropper = () => {
    if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const handleCropped = async (blob: Blob) => {
    const file = new File([blob], `${mediaKey}.${pendingType === "image/png" ? "png" : "jpg"}`, {
      type: pendingType,
    });
    closeCropper();
    await upload(file);
  };

  return (
    <div>
      <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
        {label}
      </span>
      <div className="mt-2 flex items-start gap-4">
        <div className={`overflow-hidden rounded-xl border border-gold/30 bg-paper ${previewClass ?? "h-24 w-20"}`}>
          {src ? (
            <img src={src} alt={label} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-sans text-[9px] uppercase tracking-widest text-ink/40">
              kosong
            </span>
          )}
        </div>
        <div className="flex-1 space-y-2.5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-cream transition-colors hover:bg-forest-deep disabled:opacity-50"
            >
              <ImagePlus className="h-3.5 w-3.5 text-gold-light" />
              {busy ? "Menyimpan…" : "Unggah Foto"}
            </button>
            {src && (
              <button
                type="button"
                onClick={adjustAgain}
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-forest transition-colors hover:bg-gold/15"
              >
                <Crop className="h-3.5 w-3.5" />
                Atur Posisi
              </button>
            )}
            {changed && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-forest transition-colors hover:bg-gold/15"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Bawaan
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link2 className="h-3.5 w-3.5 shrink-0 text-gold" />
            <input
              value={isMediaRef(value) ? "" : value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="…atau tempel URL gambar"
              className="w-full rounded-lg border border-gold/25 bg-cream px-3 py-2 font-sans text-xs text-ink outline-none focus:border-gold"
            />
          </div>
          {hint && <p className="font-sans text-[11px] leading-relaxed text-ink/50">{hint}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={props.accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) openCropperWithFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          aspect={aspect}
          shapeClass={shapeClass}
          mime={pendingType}
          title={`Atur Posisi — ${label}`}
          onCancel={closeCropper}
          onDone={handleCropped}
        />
      )}
    </div>
  );
}

export function AudioPicker(props: MediaPickerProps) {
  const { label, value, hint } = props;
  const src = useMediaSrc(value);
  const { busy, inputRef, upload, reset, changed } = useMediaUpload(props);

  return (
    <div>
      <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-dark">
        {label}
      </span>
      <div className="mt-2 space-y-2.5">
        {src && <audio controls src={src} className="h-9 w-full" preload="metadata" />}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-cream transition-colors hover:bg-forest-deep disabled:opacity-50"
          >
            <Music4 className="h-3.5 w-3.5 text-gold-light" />
            {busy ? "Mengunggah…" : "Unggah Audio"}
          </button>
          {changed && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-forest transition-colors hover:bg-gold/15"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Bawaan
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link2 className="h-3.5 w-3.5 shrink-0 text-gold" />
          <input
            value={isMediaRef(value) ? "" : value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder="…atau tempel URL audio"
            className="w-full rounded-lg border border-gold/25 bg-cream px-3 py-2 font-sans text-xs text-ink outline-none focus:border-gold"
          />
        </div>
        {hint && <p className="font-sans text-[11px] leading-relaxed text-ink/50">{hint}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={props.accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
