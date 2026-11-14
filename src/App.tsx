import { useEffect } from "react";
import { useHashRoute } from "./hooks/useHashRoute";
import { useSettings, type GuestPage } from "./lib/settings";
import { applyPalette } from "./lib/theme";
import { applyFonts } from "./lib/typography";
import { applyFavicon, applyDocumentTitle } from "./lib/favicon";
import { pullFromCloud } from "./lib/cloud";
import {
  decodeCloudParam, saveCloudRead, getCloudRead,
  getCloudAdmin, saveCloudAdmin, resolveCloudFromRef,
} from "./lib/cloudConfig";
import { generalGuest } from "./data/config";
import InvitationPage from "./pages/InvitationPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  const { route, to } = useHashRoute();
  const settings = useSettings();

  useEffect(() => {
    applyPalette(settings.colors);
  }, [settings.colors]);

  useEffect(() => {
    applyFonts(settings.fontId);
  }, [settings.fontId]);

  useEffect(() => {
    applyFavicon(settings.bride.short, settings.groom.short, settings.colors);
    applyDocumentTitle(settings.bride.short, settings.groom.short);
  }, [settings.bride.short, settings.groom.short, settings.colors]);

  // sinkronisasi cloud
  useEffect(() => {
    const boot = async () => {
      const combined = `${window.location.search}&${window.location.hash}`;

      // 1) tangkap parameter cloud — dua format:
      //    ?c=xpnpoqxljn        (baru, pendek)
      //    ?cloud=https%3A...    (lama, panjang — backward compat)
      const shortMatch = combined.match(/[?&]c=([^&]+)/);
      const longMatch = combined.match(/[?&]cloud=([^&]+)/);

      if (shortMatch) {
        const ref = decodeURIComponent(shortMatch[1]).trim();
        // cek apakah sudah punya config lengkap
        const existing = getCloudRead();
        if (!existing || !existing.anonKey) {
          // resolve config lengkap dari cloud.json
          const full = await resolveCloudFromRef(ref);
          if (full) {
            saveCloudRead(full);
            if (full.anonKey && !getCloudAdmin()) {
              saveCloudAdmin({ url: full.url, bucket: full.bucket, anonKey: full.anonKey });
            }
          } else {
            // fallback: simpan minimal
            saveCloudRead({ url: `https://${ref}.supabase.co`, bucket: "invite" });
          }
        }
      } else if (longMatch) {
        // format lama — backward compat
        const cfg = decodeCloudParam(longMatch[1]);
        if (cfg) {
          saveCloudRead(cfg);
          if (cfg.anonKey && !getCloudAdmin()) {
            saveCloudAdmin({ url: cfg.url, bucket: cfg.bucket, anonKey: cfg.anonKey });
          }
        }
      }

      // 2) pull data dari cloud
      if (getCloudRead()) {
        await pullFromCloud().catch(() => {});
      }
    };

    boot();

    // polling berkala
    const timer = setInterval(() => {
      if (getCloudRead()) pullFromCloud().catch(() => {});
    }, 15_000);

    const onVisible = () => {
      if (document.visibilityState === "visible" && getCloudRead()) {
        pullFromCloud().catch(() => {});
      }
    };
    const onFocus = () => {
      if (getCloudRead()) pullFromCloud().catch(() => {});
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  if (route === "admin") {
    return <AdminPage />;
  }

  const guest: GuestPage = {
    ...generalGuest,
    slug: to ? "tamu" : "",
    title: to || generalGuest.title,
    honorific: to
      ? "Kepada Yth. Bapak/Ibu/Saudara/i"
      : generalGuest.honorific,
  };

  return <InvitationPage key={to || "umum"} guest={guest} />;
}
