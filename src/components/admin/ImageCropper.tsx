import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, X, RotateCw, ZoomIn, ZoomOut, Maximize2, Move } from "lucide-react";

interface Props {
  /** sumber gambar: object URL / data URL / URL publik */
  src: string;
  /** rasio bingkai tujuan (lebar / tinggi) */
  aspect: number;
  /** kelas bentuk bingkai agar pratinjau sama dengan undangan */
  shapeClass?: string;
  title?: string;
  /** tipe berkas keluaran */
  mime?: string;
  onCancel: () => void;
  onDone: (blob: Blob) => void;
}

const MIN_Z = 1;
const MAX_Z = 4;
const OUT_MAX = 1600;

export default function ImageCropper({
  src,
  aspect,
  shapeClass = "rounded-2xl",
  title = "Atur Posisi Foto",
  mime = "image/jpeg",
  onCancel,
  onDone,
}: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [ready, setReady] = useState(false);
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [rot, setRot] = useState(0); // 0 | 90 | 180 | 270
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);

  /* ---------- muat gambar ---------- */
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setNat({ w: img.naturalWidth, h: img.naturalHeight });
      setReady(true);
    };
    img.src = src;
  }, [src]);

  /* ---------- ukur kotak crop ---------- */
  useEffect(() => {
    const measure = () => {
      const el = boxRef.current;
      if (el) setBox({ w: el.clientWidth, h: el.clientHeight });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [ready, aspect]);

  /* ---------- kunci gulir latar ---------- */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // dimensi sumber setelah rotasi
  const swapped = rot === 90 || rot === 270;
  const srcW = swapped ? nat.h : nat.w;
  const srcH = swapped ? nat.w : nat.h;

  // skala agar gambar selalu menutupi kotak (cover)
  const baseScale = srcW && srcH && box.w && box.h ? Math.max(box.w / srcW, box.h / srcH) : 1;
  const eff = baseScale * zoom;
  const drawW = srcW * eff;
  const drawH = srcH * eff;

  const clamp = useCallback(
    (p: { x: number; y: number }) => {
      const mx = Math.max(0, (drawW - box.w) / 2);
      const my = Math.max(0, (drawH - box.h) / 2);
      return {
        x: Math.min(mx, Math.max(-mx, p.x)),
        y: Math.min(my, Math.max(-my, p.y)),
      };
    },
    [drawW, drawH, box.w, box.h],
  );

  useEffect(() => {
    setOff((o) => clamp(o));
  }, [clamp]);

  /* ---------- geser & cubit ---------- */
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const pinch = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStart = useRef<{ dist: number; zoom: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pinch.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current.size === 1) {
      drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    } else if (pinch.current.size === 2) {
      const [a, b] = [...pinch.current.values()];
      pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom };
      drag.current = null;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pinch.current.has(e.pointerId)) return;
    pinch.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinch.current.size >= 2 && pinchStart.current) {
      const [a, b] = [...pinch.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const next = (pinchStart.current.zoom * dist) / (pinchStart.current.dist || 1);
      setZoom(Math.min(MAX_Z, Math.max(MIN_Z, next)));
      return;
    }
    const d = drag.current;
    if (d && d.id === e.pointerId) {
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      drag.current = { id: d.id, x: e.clientX, y: e.clientY };
      setOff((o) => clamp({ x: o.x + dx, y: o.y + dy }));
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    pinch.current.delete(e.pointerId);
    if (pinch.current.size < 2) pinchStart.current = null;
    if (drag.current?.id === e.pointerId) drag.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    setZoom((z) => Math.min(MAX_Z, Math.max(MIN_Z, z - e.deltaY * 0.0016)));
  };

  const reset = () => {
    setZoom(1);
    setRot(0);
    setOff({ x: 0, y: 0 });
  };

  /* ---------- hasilkan potongan ---------- */
  const confirm = async () => {
    const img = imgRef.current;
    if (!img || !box.w) return;
    setBusy(true);
    try {
      // batasi resolusi agar berkas ringan namun tetap tajam di layar retina
      const natCrop = (box.w / drawW) * nat.w * (swapped ? srcH / nat.h : 1);
      const outW = Math.round(Math.min(OUT_MAX, Math.max(box.w * 2, Math.min(natCrop, OUT_MAX))));
      const outH = Math.round(outW / aspect);
      const ratio = outW / box.w;

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (mime === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, outW, outH);
      }
      ctx.imageSmoothingQuality = "high";

      // titik tengah kotak + geseran pengguna
      ctx.translate(outW / 2 + off.x * ratio, outH / 2 + off.y * ratio);
      ctx.rotate((rot * Math.PI) / 180);
      const w = nat.w * eff * ratio;
      const h = nat.h * eff * ratio;
      ctx.drawImage(img, -w / 2, -h / 2, w, h);

      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob(res, mime, mime === "image/jpeg" ? 0.92 : undefined),
      );
      if (blob) onDone(blob);
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-forest-deep/92 p-4 backdrop-blur-sm">
      <div className="flex max-h-[94svh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-gold/35 bg-ivory shadow-2xl">
        {/* kepala */}
        <div className="flex items-center justify-between gap-3 border-b border-gold/25 px-5 py-3.5">
          <div>
            <h3 className="font-serif text-lg font-semibold text-forest">{title}</h3>
            <p className="font-sans text-[11px] text-ink/55">
              Geser untuk menggeser · cubit atau gulir untuk memperbesar
            </p>
          </div>
          <button
            onClick={onCancel}
            aria-label="Batal"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/35 text-ink/60 transition-colors hover:bg-rose hover:text-cream"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* area crop */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div
            ref={boxRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endPointer}
            onPointerCancel={endPointer}
            onWheel={onWheel}
            style={{ aspectRatio: String(aspect) }}
            className={`relative mx-auto w-full max-w-sm cursor-grab touch-none select-none overflow-hidden bg-paper active:cursor-grabbing ${shapeClass}`}
          >
            {ready && (
              <img
                src={src}
                alt=""
                draggable={false}
                style={{
                  width: nat.w * eff,
                  height: nat.h * eff,
                  transform: `translate(-50%, -50%) rotate(${rot}deg)`,
                  left: `calc(50% + ${off.x}px)`,
                  top: `calc(50% + ${off.y}px)`,
                }}
                className="pointer-events-none absolute max-w-none"
              />
            )}
            {/* garis bantu sepertiga */}
            <div className="pointer-events-none absolute inset-0 opacity-45">
              <div className="absolute inset-y-0 left-1/3 w-px bg-cream/70" />
              <div className="absolute inset-y-0 left-2/3 w-px bg-cream/70" />
              <div className="absolute inset-x-0 top-1/3 h-px bg-cream/70" />
              <div className="absolute inset-x-0 top-2/3 h-px bg-cream/70" />
            </div>
            <span className={`pointer-events-none absolute inset-0 border-2 border-gold/70 ${shapeClass}`} />
            {!ready && (
              <span className="absolute inset-0 flex items-center justify-center font-sans text-xs tracking-widest text-ink/50">
                memuat…
              </span>
            )}
          </div>

          <p className="mt-3 flex items-center justify-center gap-1.5 font-sans text-[11px] text-ink/50">
            <Move className="h-3.5 w-3.5 text-gold" />
            Bagian di dalam bingkai inilah yang akan tampil di undangan
          </p>

          {/* zoom */}
          <div className="mt-5 flex items-center gap-3">
            <ZoomOut className="h-4 w-4 shrink-0 text-gold-dark" />
            <input
              type="range"
              min={MIN_Z}
              max={MAX_Z}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-gold"
              aria-label="Perbesar foto"
            />
            <ZoomIn className="h-4 w-4 shrink-0 text-gold-dark" />
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setRot((r) => (r + 90) % 360)}
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-forest transition-colors hover:bg-gold/15"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Putar 90°
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-forest transition-colors hover:bg-gold/15"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Atur Ulang
            </button>
          </div>
        </div>

        {/* aksi */}
        <div className="flex gap-2.5 border-t border-gold/25 px-5 py-3.5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full border border-gold/40 px-5 py-3 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-forest transition-colors hover:bg-gold/10"
          >
            Batal
          </button>
          <button
            onClick={confirm}
            disabled={!ready || busy}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-cream transition-colors hover:bg-forest-deep disabled:opacity-50"
          >
            <Check className="h-4 w-4 text-gold-light" />
            {busy ? "Memproses…" : "Gunakan Foto"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
