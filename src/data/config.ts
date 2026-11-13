/* =========================================================
   KONFIGURASI UNDANGAN — ubah data mempelai, acara, dan
   pesan per kategori tamu di file ini.
   ========================================================= */

export const couple = {
  // Mempelai wanita sengaja didahulukan — urutan ini dipakai di seluruh undangan.
  bride: {
    name: "Kirana Maharani",
    short: "Kirana",
    parents: "Putri kedua dari Bapak Slamet Riyadi & Ibu Dewi Anggraini",
    photo: "/images/bride.jpg",
  },
  groom: {
    name: "Rangga Aditya Wijaya",
    short: "Rangga",
    parents: "Putra pertama dari Bapak Hendra Wijaya & Ibu Sari Wijayanti",
    photo: "/images/groom.jpg",
  },
  hashtag: "#KiranaMenemukanRangga",
  dateISO: "2026-06-14T08:00:00+07:00",
  dateLabel: "Minggu, 14 Juni 2026",
  events: [
    {
      title: "Akad Nikah",
      time: "08.00 — 10.00 WIB",
      date: "Minggu, 14 Juni 2026",
      note: "Prosesi sakral ijab qabul disaksikan keluarga dan kerabat terdekat.",
    },
    {
      title: "Resepsi",
      time: "11.00 — 14.00 WIB",
      date: "Minggu, 14 Juni 2026",
      note: "Ramah tamah dan perayaan bersama seluruh tamu undangan.",
    },
  ],
  venue: {
    name: "Pendopo Sasono Kembang",
    address: "Jl. Kenanga Raya No. 12, Kebayoran Baru, Jakarta Selatan",
    mapsUrl: "https://maps.google.com/?q=Pendopo+Kebayoran+Baru+Jakarta+Selatan",
    mapsEmbed:
      "https://maps.google.com/maps?q=-6.240892,106.799065&z=15&output=embed",
    photo: "/images/venue.jpg",
  },
  gifts: [
    { bank: "BCA", number: "137 00 6621 447", holder: "Kirana Maharani" },
    { bank: "MANDIRI", number: "5271 0422 88", holder: "Rangga Aditya Wijaya" },
  ],
  music: "/music/backsound.wav",
};

export interface GuestCategory {
  slug: string;
  /** Label kecil pada tombol/penanda */
  shortLabel: string;
  /** Sapaan besar di sampul undangan */
  title: string;
  /** Sapaan formal di atas judul */
  honorific: string;
  /** Paragraf personal yang hanya muncul di halaman kategori ini */
  greeting: string;
  /** Penutup bertanda tangan */
  closing: string;
  /** File voice note khusus kategori ini */
  voiceSrc: string;
  voiceTitle: string;
  voiceHint: string;
  /** Transkrip singkat voice note */
  transcript: string;
}

export const guests: GuestCategory[] = [
  {
    slug: "keluarga",
    shortLabel: "Keluarga",
    title: "Keluarga Tercinta",
    honorific: "Kepada Yth. Bapak/Ibu/Saudara/i beserta Keluarga Besar",
    greeting:
      "Doa restu keluarga adalah pondasi dari setiap langkah kami. Dengan segala kerendahan hati, kami mengundang Bapak/Ibu beserta keluarga besar untuk hadir, menyaksikan, dan memberkati hari bahagia ini. Kehadiran keluarga adalah hadiah terindah bagi kami berdua.",
    closing: "Dengan penuh cinta, kami yang berbahagia",
    voiceSrc: "/voice/keluarga.wav",
    voiceTitle: "Pesan Suara untuk Keluarga",
    voiceHint: "Rekaman khusus dari kami berdua untuk keluarga tercinta",
    transcript:
      "“Untuk keluarga kami tercinta… terima kasih atas doa dan restu yang tak pernah putus. Kami menanti kehadiran Bapak, Ibu, dan saudara semua di hari bahagia ini.”",
  },
  {
    slug: "teman",
    shortLabel: "Teman",
    title: "Teman-Teman Hebat",
    honorific: "Kepada Yth. Sahabat dan Teman-Teman Tersayang",
    greeting:
      "Kalian adalah saksi tawa, tangis, dan ribuan cerita yang mengantarkan kami sampai di titik ini. Hari bahagia ini tak akan lengkap tanpa kehadiran kalian. Datang, rayakan, dan mari kita buat satu kenangan baru yang tak terlupakan!",
    closing: "Dengan penuh semangat, duo mempelai",
    voiceSrc: "/voice/teman.wav",
    voiceTitle: "Pesan Suara untuk Teman",
    voiceHint: "Ada pesan spesial dari kami — tekan tombol play ya!",
    transcript:
      "“Halo teman-teman! Akhirnya hari yang kita tunggu datang juga. Kalian WAJIB datang, siapkan outfit terbaik, dan bersiap seru-seruan bareng kami!”",
  },
  {
    slug: "rekan-kerja",
    shortLabel: "Rekan Kerja",
    title: "Rekan Kerja Terhormat",
    honorific: "Kepada Yth. Bapak/Ibu Rekan Kerja dan Kolega",
    greeting:
      "Dukungan dan kerja sama yang telah terjalin selama ini sangat berarti bagi kami. Dengan hormat, kami mengundang Bapak/Ibu rekan kerja dan kolega untuk berkenan hadir serta memberikan doa restu pada acara pernikahan kami.",
    closing: "Hormat dan terima kasih kami",
    voiceSrc: "/voice/rekan-kerja.wav",
    voiceTitle: "Pesan Suara untuk Rekan Kerja",
    voiceHint: "Ucapan terima kasih langsung dari kami berdua",
    transcript:
      "“Kepada rekan kerja dan kolega yang kami hormati, terima kasih atas dukungannya selama ini. Suatu kehormatan bila Bapak dan Ibu berkenan hadir di hari bahagia kami.”",
  },
  {
    slug: "sahabat",
    shortLabel: "Sahabat",
    title: "Sahabat Sehidup Semati",
    honorific: "Untuk Sahabat Terbaik Kami",
    greeting:
      "Kalian bukan sekadar sahabat — kalian adalah keluarga yang kami pilih sendiri. Di hari paling penting dalam hidup kami, tempat paling depan sudah kami siapkan untuk kalian. Jangan sampai absen, karena air mata bahagia kami butuh saksi.",
    closing: "Pelukan erat dari kami berdua",
    voiceSrc: "/voice/sahabat.wav",
    voiceTitle: "Pesan Suara untuk Sahabat",
    voiceHint: "Pesan paling personal — hanya untuk kalian",
    transcript:
      "“Bestie… kita akhirnya sampai di hari ini. Terima kasih sudah menemani dari nol. Kalian harus ada di sana, berdiri paling dekat, saat kami mengucap janji suci.”",
  },
];

export const defaultGuest = guests[0];

/** Halaman umum jika QR tidak membawa kategori */
export const generalGuest: GuestCategory = {
  slug: "",
  shortLabel: "Tamu Undangan",
  title: "Tamu Undangan",
  honorific: "Kepada Yth. Bapak/Ibu/Saudara/i",
  greeting:
    "Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada acara pernikahan kami.",
  closing: "Dengan hormat, kami yang berbahagia",
  voiceSrc: "/voice/keluarga.wav",
  voiceTitle: "Pesan Suara untuk Anda",
  voiceHint: "Salam hangat dari kami berdua",
  transcript: "“Terima kasih telah membuka undangan kami. Sampai jumpa di hari bahagia!”",
};
