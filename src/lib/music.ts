/**
 * Singleton pemutar backsound. Diputar otomatis setelah tamu
 * menekan tombol "Buka Undangan" (agar lolos kebijakan autoplay).
 * Sumber musik dapat diganti dari panel admin tanpa reload.
 */

let audio: HTMLAudioElement | null = null;
let currentSrc = "";
/** true bila musik dihentikan sementara oleh voice note */
let suspendedByVoice = false;
const listeners = new Set<(playing: boolean) => void>();

function emit(playing: boolean) {
  listeners.forEach((fn) => fn(playing));
}

function create(src: string) {
  audio = new Audio(src);
  audio.loop = true;
  audio.volume = 0.45;
  audio.addEventListener("play", () => emit(true));
  audio.addEventListener("pause", () => emit(false));
  currentSrc = src;
}

export function initMusic(src: string) {
  if (!src) return;
  if (audio && currentSrc === src) return;
  const wasPlaying = audio ? !audio.paused : false;
  audio?.pause();
  create(src);
  if (wasPlaying) audio?.play().catch(() => {});
}

export function playMusic() {
  suspendedByVoice = false;
  audio?.play().catch(() => {});
}

export function pauseMusic() {
  audio?.pause();
}

export function toggleMusic() {
  if (!audio) return;
  if (audio.paused) {
    suspendedByVoice = false;
    audio.play().catch(() => {});
  } else {
    // dijeda manual oleh tamu — jangan dilanjutkan otomatis nanti
    suspendedByVoice = false;
    audio.pause();
  }
}

/**
 * Hentikan sementara backsound saat voice note diputar.
 * Status "sedang berbunyi" diingat agar bisa dilanjutkan kembali.
 */
export function suspendMusicForVoice() {
  if (audio && !audio.paused) {
    suspendedByVoice = true;
    audio.pause();
  }
}

/** Lanjutkan backsound setelah voice note selesai atau dijeda. */
export function resumeMusicAfterVoice() {
  if (audio && suspendedByVoice) {
    suspendedByVoice = false;
    audio.play().catch(() => {});
  }
}

export function isMusicPlaying() {
  return audio ? !audio.paused : false;
}

export function onMusicChange(fn: (playing: boolean) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
