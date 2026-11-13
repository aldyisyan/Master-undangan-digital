import { useState } from "react";
import { Copy, Check } from "lucide-react";

/** Blok kode dengan tombol salin — dipakai halaman panduan & panel sinkronisasi */
export default function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(children);
    } catch {
      /* abaikan */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="group relative mt-2 overflow-hidden rounded-xl bg-forest-deep">
      <pre className="overflow-x-auto px-4 py-3.5 pr-14 font-mono text-xs leading-relaxed text-cream/90">
        {children}
      </pre>
      <button
        onClick={copy}
        aria-label="Salin"
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg border border-cream/15 text-cream/60 transition-colors hover:border-gold-light/60 hover:text-gold-light"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
