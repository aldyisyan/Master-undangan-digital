import { useEffect } from "react";
import { useHashRoute } from "./hooks/useHashRoute";
import { useSettings, type GuestPage } from "./lib/settings";
import { applyPalette } from "./lib/theme";
import { applyFonts } from "./lib/typography";
import { applyFavicon, applyDocumentTitle } from "./lib/favicon";
import { pullFromCloud } from "./lib/cloud";
import { decodeCloudParam, saveCloudRead } from "./lib/cloudConfig";
import { generalGuest } from "./data/config";
import InvitationPage from "./pages/InvitationPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  const { route, to } = useHashRoute();
  const settings = useSettings();

  // terapkan palet warna dari pengaturan ke seluruh dokumen
  useEffect(() => {
    applyPalette(settings.colors);
  }, [settings.colors]);

  // muat & terapkan paket font terpilih
  useEffect(() => {
    applyFonts(settings.fontId);
  }, [settings.fontId]);

  // favicon & judul tab mengikuti nama mempelai (wanita lebih dahulu)
  useEffect(() => {
    applyFavicon(settings.bride.short, settings.groom.short, settings.colors);
    applyDocumentTitle(settings.bride.short, settings.groom.short);
  }, [settings.bride.short, settings.groom.short, settings.colors]);

  // sinkronisasi cloud:
  // 1) tangkap penanda ?cloud=… dari tautan tamu dan simpan ke perangkat ini
  // 2) tarik pengaturan terbaru dari cloud (teks, foto, voice note)
  useEffect(() => {
    const m = window.location.hash.match(/[?&]cloud=([^&]+)/);
    if (m) {
      const cfg = decodeCloudParam(m[1]);
      if (cfg) saveCloudRead(cfg);
    }
    pullFromCloud().catch(() => {});
  }, []);

  // ========================= 2 HALAMAN SAJA =========================
  if (route === "admin") {
    return <AdminPage />;
  }

  // Halaman undangan — nama tamu diambil dari parameter ?to=
  // yang dibuat & dibagikan dari panel admin.
  const guest: GuestPage = {
    ...generalGuest,
    slug: to ? "tamu" : "",
    title: to || generalGuest.title,
    honorific: to
      ? "Kepada Yth. Bapak/Ibu/Saudara/i"
      : generalGuest.honorific,
  };

  // key memaksa remount saat berganti nama tamu —
  // amplop tertutup kembali untuk tamu berikutnya.
  return <InvitationPage key={to || "umum"} guest={guest} />;
}
