import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { GuestPage } from "../lib/settings";
import { useSettings } from "../lib/settings";
import { resolveSrc } from "../lib/mediaStore";
import { initMusic, playMusic } from "../lib/music";
import Cover from "../components/Cover";
import Hero from "../components/Hero";
import Quote from "../components/Quote";
import VoiceNote from "../components/VoiceNote";
import Mempelai from "../components/Mempelai";
import Events from "../components/Events";
import Venue from "../components/Venue";
import Gift from "../components/Gift";
import Wishes from "../components/Wishes";
import Closing from "../components/Closing";
import MusicToggle from "../components/MusicToggle";

export default function InvitationPage({ guest }: { guest: GuestPage }) {
  const settings = useSettings();
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    let alive = true;
    resolveSrc(settings.music).then((src) => {
      if (alive && src) initMusic(src);
    });
    return () => {
      alive = false;
    };
  }, [settings.music]);

  // kunci scroll saat sampul masih tertutup
  useEffect(() => {
    document.documentElement.style.overflow = opened ? "" : "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [opened]);

  const handleOpen = () => {
    playMusic();
    setOpened(true);
  };

  return (
    <div className="grain relative min-h-svh bg-ivory">
      <AnimatePresence>
        {!opened && <Cover key="cover" guest={guest} onOpen={handleOpen} />}
      </AnimatePresence>

      <MusicToggle visible={opened} />

      <Hero guest={guest} opened={opened} />
      <VoiceNote guest={guest} />
      <Quote />
      <Mempelai />
      <Events />
      <Venue />
      <Gift />
      <Wishes />
      <Closing guest={guest} />
    </div>
  );
}
