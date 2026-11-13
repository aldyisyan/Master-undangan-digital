import { useEffect, useState } from "react";

/* =========================================================
   Router hash sangat sederhana — hanya ada dua halaman:
     #/                    → undangan umum
     #/?to=Nama%20Tamu     → undangan personal untuk tamu
     #/admin               → panel admin
   Query hash juga membawa ?cloud=… (penanda sinkronisasi)
   yang ditangkap terpisah di App.tsx.
   ========================================================= */

export interface RouteInfo {
  /** "admin" | "" */
  route: string;
  /** Nama tamu dari parameter ?to= (sudah ter-decode), "" bila umum */
  to: string;
}

function parseHash(): RouteInfo {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const qIndex = raw.indexOf("?");
  const path = (qIndex >= 0 ? raw.slice(0, qIndex) : raw).replace(/\/+$/, "").toLowerCase();
  const query = qIndex >= 0 ? raw.slice(qIndex + 1) : "";
  let to = "";
  try {
    to = (new URLSearchParams(query).get("to") ?? "").trim();
  } catch {
    to = "";
  }
  return { route: path, to };
}

export function useHashRoute(): RouteInfo {
  const [info, setInfo] = useState<RouteInfo>(parseHash);

  useEffect(() => {
    const onChange = () => {
      setInfo(parseHash());
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return info;
}

/** Pindah halaman secara programatik */
export function navigate(to: "" | "admin"): void {
  window.location.hash = to ? `/${to}` : "/";
}
