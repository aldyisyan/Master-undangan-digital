/**
 * Audio placeholder generator — membuat 4 "voice note" demo yang berbeda
 * melodinya per halaman + 1 backsound musik lembut.
 *
 * >>> UNTUK PRODUKSI <<<
 * Ganti file di public/voice/*.wav dengan rekaman suara asli (mp3/wav),
 * lalu sesuaikan path-nya di src/data/config.ts (field voiceSrc).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SR = 22050;

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

// Satu "petikan" lembut ala piano: harmonik + envelope eksponensial
function pluck(buf, start, freq, dur, vol) {
  const s0 = Math.floor(start * SR);
  const n = Math.floor(dur * SR);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const idx = s0 + i;
    if (idx >= buf.length) break;
    const env = Math.exp(-t * 3.2);
    const v =
      Math.sin(2 * Math.PI * freq * t) +
      0.45 * Math.sin(2 * Math.PI * freq * 2 * t) * Math.exp(-t * 5) +
      0.2 * Math.sin(2 * Math.PI * freq * 3 * t) * Math.exp(-t * 8);
    buf[idx] += v * env * vol;
  }
}

// Pad akor lembut (sine bertumpuk, attack pelan)
function pad(buf, start, freqs, dur, vol) {
  const s0 = Math.floor(start * SR);
  const n = Math.floor(dur * SR);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const idx = s0 + i;
    if (idx >= buf.length) break;
    const attack = Math.min(1, t / 1.2);
    const release = Math.min(1, (dur - t) / 1.6);
    let v = 0;
    for (const f of freqs) {
      v += Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t);
    }
    buf[idx] += (v / freqs.length) * attack * release * vol;
  }
}

function writeWav(file, buf) {
  const n = buf.length;
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(buf[i]));
  const gain = peak > 0 ? 0.72 / peak : 1;
  const data = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, buf[i] * gain));
    data.writeInt16LE(Math.round(s * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.concat([header, data]));
  console.log('✓', path.relative(process.cwd(), file), `${(n / SR).toFixed(1)}s`);
}

const A = {
  C4: 60, D4: 62, E4: 64, Fs4: 66, G4: 67, A4: 69, B4: 71,
  C5: 72, D5: 74, E5: 76, Fs5: 78, G5: 79, A5: 81, B5: 83,
};

// Setiap kategori punya "melodi" berbeda agar terasa personal
const VOICE_NOTES = {
  keluarga: {
    // hangat, menenangkan — A mayor lambat
    notes: [A.A4, A.C5, A.E5, A.C5, A.A4, A.E5, A.Fs5, A.E5, A.D5, A.C5, A.B4, A.A4],
    step: 0.62, bass: [A.A4 - 24, A.E5 - 24],
  },
  teman: {
    // ceria, ritmis — pentatonik cerah
    notes: [A.C5, A.E5, A.G5, A.E5, A.A5, A.G5, A.E5, A.D5, A.E5, A.G5, A.A5, A.G5, A.E5, A.C5],
    step: 0.42, bass: [A.C5 - 24, A.G4 - 24],
  },
  'rekan-kerja': {
    // tenang & formal — gerak perlahan
    notes: [A.G4, A.B4, A.D5, A.B4, A.E5, A.D5, A.B4, A.G4, A.A4, A.B4, A.C5, A.B4],
    step: 0.66, bass: [A.G4 - 24, A.D5 - 24],
  },
  sahabat: {
    // emosional, naik-turun lebar
    notes: [A.E5, A.G5, A.B5, A.A5, A.G5, A.E5, A.D5, A.E5, A.G5, A.E5, A.D5, A.C5, A.D5, A.E5],
    step: 0.5, bass: [A.E5 - 24, A.B4 - 24],
  },
};

for (const [slug, cfg] of Object.entries(VOICE_NOTES)) {
  const dur = 14;
  const buf = new Float32Array(SR * dur);
  pad(buf, 0.2, cfg.bass.map(midi), dur - 0.4, 0.32);
  let t = 0.8;
  cfg.notes.forEach((m, i) => {
    pluck(buf, t, midi(m), 1.6, 0.5);
    // variasi oktaf halus setiap 4 nada
    if (i % 4 === 3) pluck(buf, t + cfg.step / 2, midi(m - 12), 1.2, 0.22);
    t += cfg.step;
  });
  writeWav(path.join(__dirname, '..', 'public', 'voice', `${slug}.wav`), buf);
}

// Backsound: progresi akor lembut 28 detik (loop-able)
{
  const dur = 28;
  const buf = new Float32Array(SR * dur);
  const chords = [
    [A.A4 - 12, A.C5 - 12, A.E5 - 12],
    [A.Fs4 - 12, A.A4 - 12, A.D5 - 12],
    [A.C5 - 12, A.E5 - 12, A.G5 - 12],
    [A.G4 - 12, A.B4 - 12, A.D5 - 12],
  ];
  chords.forEach((ch, i) => pad(buf, i * 7, ch.map(midi), 8.4, 0.34));
  const melody = [A.A5, A.E5, A.Fs5, A.E5, A.D5, A.B4, A.C5, A.E5, A.Fs5, A.A5, A.G5, A.E5, A.D5, A.E5];
  let t = 1.4;
  for (const m of melody) {
    pluck(buf, t, midi(m), 2.0, 0.3);
    t += 1.75;
  }
  writeWav(path.join(__dirname, '..', 'public', 'music', 'backsound.wav'), buf);
}
