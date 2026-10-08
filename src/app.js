import { FeedbackEngine } from './feedback.js';

const STORAGE_KEY = 'detektif-bug-progress-v1';
const PREFERENCES_KEY = 'detektif-bug-preferences-v1';
const preferences = loadPreferences();
let playbackTimer = null;
let runVersion = 0;
let audioNote = '';
const feedback = new FeedbackEngine({ onUnavailable: (_kind, message) => {
  audioNote = message;
  const note = typeof document !== 'undefined' && document.querySelector('#audio-note');
  if (note) note.textContent = message;
} });
feedback.setOptions(preferences);

function loadPreferences() {
  const defaults = { sound: false, voice: false, volume: 0.35, calm: false, pace: 'normal' };
  try {
    const saved = JSON.parse(localStorage.getItem(PREFERENCES_KEY));
    if (saved) return { sound: saved.sound === true, voice: saved.voice === true,
      volume: Number.isFinite(saved.volume) ? Math.max(0, Math.min(1, saved.volume)) : defaults.volume,
      calm: saved.calm === true, pace: saved.pace === 'slow' ? 'slow' : 'normal' };
  } catch { /* Pilihan tetap dapat dipakai tanpa penyimpanan lokal. */ }
  return defaults;
}

function savePreferences() {
  try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences)); } catch { /* best effort */ }
  feedback.setOptions(preferences);
  applyMotionPreference();
}

function calmMotion() {
  return preferences.calm || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function applyMotionPreference() {
  if (typeof document !== 'undefined') document.documentElement.classList.toggle('calm-motion', calmMotion());
}

const COMMANDS = {
  forward: { label: 'Maju 1 langkah', short: 'maju', tone: 'blue', kind: 'move' },
  left: { label: 'Belok kiri', short: 'kiri', tone: 'purple', kind: 'turn' },
  right: { label: 'Belok kanan', short: 'kanan', tone: 'purple', kind: 'turn' },
  pickup: { label: 'Ambil buku', short: 'ambil', tone: 'yellow', kind: 'book' },
  deliver: { label: 'Antar buku', short: 'antar', tone: 'pink', kind: 'book' },
  loop2: { label: 'Ulang 2×: maju', short: 'ulang 2×', tone: 'green', kind: 'loop', repeat: 2 },
  loop3: { label: 'Ulang 3×: maju', short: 'ulang 3×', tone: 'green', kind: 'loop', repeat: 3 },
};

const MISSIONS = [
  {
    id: 1,
    title: 'Jejak lurus',
    concept: 'Urutan dasar',
    difficulty: 'Mulai dari sini',
    story: 'Buku ada di ujung lorong. Susun langkah robot dari kiri ke kanan.',
    start: { x: 0, y: 2, dir: 0 },
    book: { x: 2, y: 2 },
    target: { x: 3, y: 2 },
    solution: ['forward', 'forward', 'pickup', 'forward', 'deliver'],
    initial: ['forward', 'right', 'pickup', 'forward', 'deliver'],
    hints: [
      'Amati petak buku dan kartu tepat sebelum “ambil buku”.',
      'Robot perlu benar-benar berada di petak buku saat mengambil.',
      'Hitung langkah lurus dari garis start sampai buku. Periksa apakah jumlahnya sudah cukup.',
    ],
  },
  {
    id: 2,
    title: 'Belok ke rak',
    concept: 'Urutan + arah',
    difficulty: 'Naik satu tingkat',
    story: 'Rak perpustakaan ada di atas lorong. Satu belokan akan membawa robot ke sana.',
    start: { x: 0, y: 3, dir: 0 },
    book: { x: 1, y: 3 },
    target: { x: 1, y: 1 },
    solution: ['forward', 'pickup', 'left', 'forward', 'forward', 'deliver'],
    initial: ['forward', 'pickup', 'right', 'forward', 'forward', 'deliver'],
    hints: [
      'Lihat arah hadap robot sebelum kartu belok dijalankan.',
      'Robot harus naik menuju rak, bukan turun ke bawah.',
      'Coba bandingkan belok kiri dan kanan dengan posisi rak pada peta.',
    ],
  },
  {
    id: 3,
    title: 'Ulangi langkah',
    concept: 'Pengulangan',
    difficulty: 'Pakai pola',
    story: 'Lorongnya lebih panjang. Satu kartu ulang dapat menggantikan beberapa kartu maju.',
    start: { x: 0, y: 2, dir: 0 },
    book: { x: 3, y: 2 },
    target: { x: 4, y: 2 },
    solution: ['loop3', 'pickup', 'forward', 'deliver'],
    initial: ['loop2', 'pickup', 'forward', 'deliver'],
    hints: [
      'Perhatikan jarak robot ke buku dan baca angka pada kartu ulang.',
      'Kartu ulang menjalankan “maju” beberapa kali, bukan satu kali.',
      'Jumlah pengulangan harus menutup seluruh jarak dari start ke buku.',
    ],
  },
  {
    id: 4,
    title: 'Naik lalu melaju',
    concept: 'Pengulangan + arah',
    difficulty: 'Gabungkan pola',
    story: 'Naik dua petak, ambil buku, lalu melaju ke rak di sebelah kanan.',
    start: { x: 0, y: 3, dir: 0 },
    book: { x: 0, y: 1 },
    target: { x: 3, y: 1 },
    solution: ['left', 'loop2', 'pickup', 'right', 'loop3', 'deliver'],
    initial: ['left', 'loop2', 'pickup', 'left', 'loop3', 'deliver'],
    hints: [
      'Setelah mengambil buku, bandingkan arah hadap robot dengan posisi perpustakaan.',
      'Robot sudah berada di baris yang benar. Sekarang perpustakaan ada di kanan.',
      'Perintah setelah “ambil buku” perlu membuat robot menghadap ke arah tujuan.',
    ],
  },
  {
    id: 5,
    title: 'Naik ke lantai atas',
    concept: 'Urutan + pengulangan',
    difficulty: 'Cek waktunya',
    story: 'Robot harus sampai ke buku dulu sebelum berbelok ke lantai atas.',
    start: { x: 0, y: 2, dir: 0 },
    book: { x: 2, y: 2 },
    target: { x: 2, y: 0 },
    solution: ['forward', 'forward', 'pickup', 'left', 'loop2', 'deliver'],
    initial: ['forward', 'left', 'pickup', 'loop2', 'deliver'],
    hints: [
      'Perhatikan kartu yang dijalankan sebelum robot tiba di petak buku.',
      'Robot harus berjalan dua langkah mendatar sebelum mengambil.',
      'Ada urutan sederhana: sampai di buku, ambil, baru mengubah arah.',
    ],
  },
  {
    id: 6,
    title: 'Rute campuran',
    concept: 'Tantangan akhir',
    difficulty: 'Detektif andal',
    story: 'Gabungkan dua pengulangan dan dua belokan untuk menemukan rute paling rapi.',
    start: { x: 0, y: 3, dir: 0 },
    book: { x: 2, y: 3 },
    target: { x: 4, y: 1 },
    solution: ['loop2', 'pickup', 'left', 'loop2', 'right', 'loop2', 'deliver'],
    initial: ['loop2', 'pickup', 'left', 'loop3', 'right', 'loop2', 'deliver'],
    hints: [
      'Jalankan dan amati apakah robot berhenti di baris perpustakaan atau melewatinya.',
      'Periksa angka pada pengulangan pertama setelah robot berbelok ke atas.',
      'Hitung jarak ke atas dari buku sampai baris perpustakaan sebelum belok kanan lagi.',
    ],
  },
];

const state = {
  missionIndex: 0,
  program: [...MISSIONS[0].initial],
  completed: loadProgress(),
  status: 'idle',
  hintsUsed: 0,
  currentStep: 0,
  simulation: null,
};

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.completed)) return saved.completed.slice(0, MISSIONS.length).map(Boolean).concat(Array(MISSIONS.length).fill(false)).slice(0, MISSIONS.length);
  } catch {
    // localStorage boleh tidak tersedia di private browsing; aplikasi tetap berfungsi.
  }
  return Array(MISSIONS.length).fill(false);
}

function saveProgress() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: state.completed })); } catch { /* progres lokal bersifat best effort */ }
}

function icon(name, size = 20) {
  const paths = {
    play: '<path d="m8 5 10 7-10 7V5Z"/>',
    rotate: '<path d="M5 7v5h5"/><path d="M5.4 12a7 7 0 1 0 2-5"/>',
    arrowUp: '<path d="m6 10 6-6 6 6"/><path d="M12 4v16"/>',
    arrowDown: '<path d="m6 14 6 6 6-6"/><path d="M12 4v16"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    lightbulb: '<path d="M9 18h6M10 21h4M8.2 14.5A6 6 0 1 1 15.8 14.5c-.9.7-1.4 1.5-1.6 2.5h-4.4c-.2-1-.7-1.8-1.6-2.5Z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    flag: '<path d="M6 21V4m0 1c4-3 8 3 12 0v9c-4 3-8-3-12 0"/>',
    book: '<path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v17H7.5A2.5 2.5 0 0 0 5 21.5v-17Z"/><path d="M5 5h11M9 8h6"/>',
    magnify: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    forward: '<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',
    turnLeft: '<path d="M19 12H5"/><path d="m10 7-5 5 5 5"/>',
    turnRight: '<path d="M5 12h14"/><path d="m14 7 5 5-5 5"/>',
    repeat: '<path d="M17 6h3v4M7 18H4v-4"/><path d="M20 10a8 8 0 0 0-14-2M4 14a8 8 0 0 0 14 2"/>',
    sound: '<path d="M11 4 6 8H3v8h3l5 4V4Z"/><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>',
    muted: '<path d="M11 4 6 8H3v8h3l5 4V4Z"/><path d="m16 9 5 6m0-6-5 6"/>',
    voice: '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    step: '<path d="m5 5 10 7-10 7V5ZM19 5v14"/>',
    leaf: '<path d="M20 3C7 2 2 9 5 16c7 6 16 0 15-13ZM5 19l10-9"/>',
    star: '<path d="m12 3 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3-5.6-3-5.6 3 1.1-6.3L3 9.6l6.2-.9Z"/>',
  };
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.check}</svg>`;
}

function robotSvg() {
  return `<svg class="robot-art" viewBox="0 0 160 150" role="img" aria-label="Robot penjaga perpustakaan">
    <path class="robot-shadow" d="M31 130h97"/>
    <rect class="robot-body" x="39" y="50" width="82" height="67" rx="22"/>
    <rect class="robot-screen" x="51" y="63" width="58" height="34" rx="13"/>
    <circle class="robot-eye" cx="70" cy="79" r="5"/><circle class="robot-eye" cx="91" cy="79" r="5"/>
    <path class="robot-smile" d="M70 88c6 5 14 5 20 0"/>
    <path class="robot-antenna" d="M80 50V35"/><circle class="robot-dot" cx="80" cy="29" r="7"/>
    <path class="robot-arm" d="M39 73H25v25"/><path class="robot-arm" d="M121 73h14v25"/>
    <circle class="robot-wheel" cx="58" cy="121" r="11"/><circle class="robot-wheel" cx="103" cy="121" r="11"/>
    <path class="robot-wheel-line" d="M58 116v10M53 121h10M103 116v10M98 121h10"/>
  </svg>`;
}

function dirName(dir) { return ['timur', 'selatan', 'barat', 'utara'][dir]; }
function cloneRobot(robot) { return { ...robot }; }
function positionMatches(a, b) { return a.x === b.x && a.y === b.y; }

function forward(robot, mission) {
  const vectors = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
  const vector = vectors[robot.dir];
  const next = { ...robot, x: robot.x + vector.x, y: robot.y + vector.y };
  if (next.x < 0 || next.x > 4 || next.y < 0 || next.y > 3) {
    next.x = robot.x; next.y = robot.y; next.invalid = true; next.message = 'Robot menabrak tepi peta. Coba amati arah dan jaraknya.';
  }
  return next;
}

function executeOne(robot, command, mission) {
  const next = cloneRobot(robot);
  next.lastCommand = command;
  if (command === 'forward') return forward(next, mission);
  if (command === 'left') { next.dir = (next.dir + 3) % 4; return next; }
  if (command === 'right') { next.dir = (next.dir + 1) % 4; return next; }
  if (command === 'pickup') {
    if (positionMatches(next, mission.book) && !next.carrying) next.carrying = true;
    else { next.invalid = true; next.message = 'Buku belum ada di dekat robot saat perintah ambil dijalankan.'; }
    return next;
  }
  if (command === 'deliver') {
    if (positionMatches(next, mission.target) && next.carrying) next.delivered = true;
    else { next.invalid = true; next.message = 'Robot belum berada di petak perpustakaan dengan membawa buku.'; }
    return next;
  }
  return next;
}

function simulate(program, mission) {
  let robot = { ...mission.start, carrying: false, delivered: false, invalid: false, message: '' };
  const steps = [{ robot: cloneRobot(robot), command: 'start', label: 'Mulai' }];
  program.forEach((command, programIndex) => {
    const repeat = COMMANDS[command]?.repeat || 1;
    for (let count = 0; count < repeat; count += 1) {
      const atomic = repeat > 1 ? 'forward' : command;
      robot = executeOne(robot, atomic, mission);
      steps.push({ robot: cloneRobot(robot), command, programIndex, label: COMMANDS[command]?.label || command, repeatIndex: count + 1, repeatTotal: repeat });
    }
  });
  const success = Boolean(robot.delivered && !robot.invalid);
  const error = success ? 'Selesai' : robot.message || (robot.carrying ? 'Robot sudah membawa buku, tetapi belum sampai di perpustakaan.' : 'Robot belum mengantar buku. Amati langkah terakhirnya.');
  return { steps, end: robot, success, error };
}

function isMissionUnlocked(index) { return index === 0 || state.completed[index - 1]; }
function currentMission() { return MISSIONS[state.missionIndex]; }

function directionArrow(dir) { return ['→', '↓', '←', '↑'][dir]; }

function renderMissionPicker() {
  return MISSIONS.map((mission, index) => {
    const unlocked = isMissionUnlocked(index);
    const done = state.completed[index];
    const active = index === state.missionIndex;
    return `<button class="mission-item ${active ? 'is-active' : ''} ${done ? 'is-done' : ''}" data-action="select-mission" data-index="${index}" ${unlocked ? '' : 'disabled'} aria-label="Misi ${mission.id}: ${mission.title}${done ? ', selesai' : ''}${unlocked ? '' : ', terkunci'}">
      <span class="mission-number">${done ? icon('check', 16) : mission.id}</span>
      <span class="mission-item-copy"><strong>${mission.title}</strong><small>${mission.concept}</small></span>
      <span class="mission-item-state">${done ? 'Selesai' : unlocked ? 'Mulai' : icon('lock', 16)}</span>
    </button>`;
  }).join('');
}

function renderMap(mission, robot) {
  const cells = [];
  for (let y = 0; y < 4; y += 1) {
    for (let x = 0; x < 5; x += 1) {
      const isBook = mission.book.x === x && mission.book.y === y;
      const isTarget = mission.target.x === x && mission.target.y === y;
      cells.push(`<div class="map-cell ${isBook ? 'has-book' : ''} ${isTarget ? 'has-target' : ''}" data-x="${x}" data-y="${y}" aria-label="Petak ${x + 1}, ${y + 1}">
        ${isTarget ? `<span class="cell-object target-object">${icon('flag', 19)}<small>rak</small></span>` : ''}
        ${isBook ? `<span class="cell-object book-object" ${robot.carrying || robot.delivered ? 'hidden' : ''}>${icon('book', 18)}<small>buku</small></span>` : ''}
      </div>`);
    }
  }
  return `<div class="map-wrap"><div class="map-grid" role="img" aria-label="Peta misi dengan robot, buku, dan perpustakaan">${cells.join('')}<div class="robot-position" style="--robot-x:${robot.x};--robot-y:${robot.y}"><span class="robot-token"><svg class="mini-robot" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 6V3"/><circle cx="20" cy="3" r="2" fill="#facc15"/><rect x="5" y="7" width="30" height="27" rx="9" fill="#77adff"/><rect x="10" y="12" width="20" height="14" rx="5" fill="#d9f8ff"/><circle cx="15" cy="18" r="1.8" fill="#0f172a"/><circle cx="25" cy="18" r="1.8" fill="#0f172a"/><path d="M16 22q4 3 8 0"/><path d="M12 34v3M28 34v3"/></svg><span class="robot-direction" style="transform:rotate(${robot.dir * 90}deg)">${icon('forward', 17)}</span><span class="carried-book" ${!robot.carrying || robot.delivered ? 'hidden' : ''}>${icon('book', 14)}</span></span></div><div class="celebration-layer" aria-hidden="true"></div></div><div class="map-legend"><span><i class="legend-dot dot-robot"></i>robot</span><span><i class="legend-dot dot-book"></i>buku</span><span><i class="legend-dot dot-target"></i>perpustakaan</span></div></div>`;
}

function renderSettings() {
  return `<section class="play-settings panel" aria-label="Pilihan suara dan gerakan"><div class="settings-title"><span class="overline">TEMAN BERMAINMU</span><h2>Atur petualanganmu</h2><p id="audio-note" role="status">${audioNote || 'Suara boleh dinyalakan. Tanpa suara juga bisa bermain.'}</p></div><div class="settings-controls"><div class="settings-toggles"><button class="setting-button ${preferences.sound ? 'is-on' : ''}" data-action="toggle-sound" aria-pressed="${preferences.sound}">${icon(preferences.sound ? 'sound' : 'muted', 19)} Suara efek: ${preferences.sound ? 'nyala' : 'mati'}</button><button class="setting-button ${preferences.voice ? 'is-on' : ''}" data-action="toggle-voice" aria-pressed="${preferences.voice}">${icon('voice', 19)} Bacakan: ${preferences.voice ? 'nyala' : 'mati'}</button><button class="setting-button ${calmMotion() ? 'is-on' : ''}" data-action="toggle-calm" aria-pressed="${calmMotion()}" ${typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'disabled' : ''}>${icon('leaf', 19)} Gerak tenang: ${calmMotion() ? 'nyala' : 'mati'}</button></div><div class="settings-sliders"><label class="volume-control" for="sound-volume">Volume <input id="sound-volume" type="range" min="0" max="100" step="5" value="${Math.round(preferences.volume * 100)}" aria-label="Volume suara"/><output for="sound-volume">${Math.round(preferences.volume * 100)}%</output></label><label class="pace-control" for="playback-pace">Kecepatan <select id="playback-pace"><option value="normal" ${preferences.pace === 'normal' ? 'selected' : ''}>Biasa</option><option value="slow" ${preferences.pace === 'slow' ? 'selected' : ''}>Pelan</option></select></label></div></div></section>`;
}

function stepDescription() {
  const step = state.simulation?.steps[state.currentStep];
  if (!step || state.currentStep === 0) return 'Robot menunggu perintah';
  return `Kartu ${step.programIndex + 1}: ${step.label}${step.repeatTotal > 1 ? ` · ${step.repeatIndex} dari ${step.repeatTotal}` : ''}`;
}

function robotCaption(robot) {
  if (robot.delivered) return 'Buku sudah diantar';
  if (robot.carrying) return 'Robot membawa buku';
  return 'Robot belum membawa buku';
}

function directionAngle() {
  // Keep the signed turns: left is −90°, including when the direction wraps.
  // A normalized 270° would visually turn right three times instead of left once.
  return (state.simulation?.steps.slice(1, state.currentStep + 1) || []).reduce((angle, step) =>
    angle + (step.command === 'left' ? -90 : step.command === 'right' ? 90 : 0), currentMission().start.dir * 90);
}

function getHints() {
  const mission = currentMission();
  const firstError = state.simulation?.steps.find(step => step.robot.invalid);
  if (!firstError || state.status === 'success') return mission.hints;
  if (firstError.command === 'pickup') return [
    'Amati posisi robot saat kartu “Ambil buku” dibaca. Apakah sudah di petak buku?',
    'Bandingkan arah dan banyak langkah sebelum mengambil buku.',
    'Perbaiki bagian sebelum “Ambil buku” supaya robot tiba di buku terlebih dahulu.',
  ];
  if (firstError.command === 'deliver') return [
    'Periksa: apakah robot membawa buku dan sudah berada di perpustakaan?',
    firstError.robot.carrying ? 'Buku sudah dibawa. Amati belokan dan jarak ke perpustakaan.' : 'Periksa posisi robot ketika kartu “Ambil buku” dijalankan.',
    'Coba “Satu langkah” dan cari kartu pertama yang membuat robot menjauh dari tujuan.',
  ];
  return [
    'Robot sampai ke tepi peta. Perhatikan langkah pertama yang tidak bisa maju.',
    'Bandingkan arah robot dengan petak tujuan. Periksa juga angka pada kartu ulang.',
    'Gunakan “Satu langkah” untuk menghitung jarak sebelum belok atau berhenti.',
  ];
}

function renderProgram() {
  if (!state.program.length) return '<div class="empty-program">Belum ada kartu. Tambahkan satu kartu dari palet di bawah.</div>';
  return state.program.map((command, index) => {
    const item = COMMANDS[command];
    return `<div class="command-card tone-${item.tone}" data-command-index="${index}">
      <span class="command-index">${index + 1}</span>
      <span class="command-glyph">${command === 'forward' ? icon('forward', 19) : command === 'left' ? icon('turnLeft', 19) : command === 'right' ? icon('turnRight', 19) : command === 'pickup' ? icon('book', 19) : command === 'deliver' ? icon('flag', 19) : icon('repeat', 19)}</span>
      <span class="command-copy"><strong>${item.label}</strong><small>${item.kind === 'loop' ? 'jalankan gerak berulang' : item.kind === 'turn' ? 'ubah arah robot' : item.kind === 'book' ? 'aksi buku' : 'gerak robot'}</small><span class="command-progress" hidden></span></span>
      <span class="command-controls">
        <button class="icon-button" data-action="move-up" data-index="${index}" ${index === 0 ? 'disabled' : ''} aria-label="Naikkan ${item.label}">${icon('arrowUp', 17)}</button>
        <button class="icon-button" data-action="move-down" data-index="${index}" ${index === state.program.length - 1 ? 'disabled' : ''} aria-label="Turunkan ${item.label}">${icon('arrowDown', 17)}</button>
        <button class="icon-button danger" data-action="remove-command" data-index="${index}" aria-label="Hapus ${item.label}">${icon('trash', 17)}</button>
      </span>
    </div>`;
  }).join('');
}

function renderPalette() {
  return Object.entries(COMMANDS).map(([key, item]) => `<button class="palette-button tone-${item.tone}" data-action="add-command" data-command="${key}"><span>${item.short}</span><small>Tambah</small></button>`).join('');
}

function resultPanel() {
  const mission = currentMission();
  if (state.status === 'success') return `<div class="result-card result-success" role="status"><div class="result-icon">${icon('check', 25)}</div><div><strong>Kasus terpecahkan!</strong><p>Robot berhasil mengantar buku. Kamu membaca program dengan teliti.</p></div><button class="button button-primary" data-action="next-mission">${state.missionIndex === MISSIONS.length - 1 ? 'Ulangi tantangan' : 'Misi berikutnya'} ${icon('arrowDown', 16)}</button></div>`;
  if (state.status === 'error') return `<div class="result-card result-error" role="alert"><div class="result-icon">!</div><div><strong>Belum tepat, detektif.</strong><p>${state.simulation.error}</p></div><button class="button button-secondary" data-action="run-again">Coba lagi ${icon('rotate', 17)}</button></div>`;
  if (state.status === 'running') return `<div class="result-card result-running" role="status"><div class="spinner"></div><div><strong>Robot sedang bekerja…</strong><p>Amati langkahnya satu per satu.</p></div></div>`;
  if (state.status === 'paused') return `<div class="result-card result-idle" role="status"><div class="result-icon">${icon('pause', 22)}</div><div><strong>Waktunya mengamati.</strong><p>Tekan “Satu langkah” untuk membaca kartu berikutnya, atau lanjutkan program.</p></div></div>`;
  return `<div class="result-card result-idle" role="status"><div class="result-icon">?</div><div><strong>Siap menyelidiki?</strong><p>Jalankan kartu dari atas ke bawah, lalu amati gerak robot.</p></div></div>`;
}

function render() {
  const focused = document.activeElement?.dataset;
  const focusKey = focused?.action ? { action: focused.action, index: focused.index, command: focused.command } : null;
  const mission = currentMission();
  const robot = state.simulation?.steps?.[state.currentStep]?.robot || { ...mission.start, carrying: false, delivered: false, dir: mission.start.dir };
  const totalDone = state.completed.filter(Boolean).length;
  const hint = getHints()[Math.max(0, state.hintsUsed - 1)];
  document.querySelector('#app').innerHTML = `<div class="app-shell">
    <header class="topbar">
      <a class="brand" href="./" aria-label="Detektif Bug, halaman utama"><span class="brand-mark">${icon('magnify', 26)}</span><span><strong>Detektif Bug</strong><small>belajar dari kesalahan</small></span></a>
      <div class="topbar-progress"><span class="progress-label">Progresmu</span><div class="progress-track" aria-label="${totalDone} dari ${MISSIONS.length} misi selesai"><span style="width:${(totalDone / MISSIONS.length) * 100}%"></span></div><strong>${totalDone}/${MISSIONS.length}</strong></div>
    </header>

    <main>
      <section class="hero-row">
        <div class="hero-copy"><span class="eyebrow">LABORATORIUM KODE <span class="eyebrow-dot"></span> KASUS ${String(mission.id).padStart(2, '0')}</span><h1>Temukan bug.<br><em>Bantu robot.</em></h1><p>Program adalah kumpulan perintah. Kalau urutannya keliru, robot bisa tersesat. Mari cari penyebabnya bersama.</p><div class="hero-pills"><span>${icon('book', 16)} 6 misi cerita</span><span>${icon('lightbulb', 16)} petunjuk bertahap</span></div></div>
        <div class="robot-hero"><div class="spark spark-one">✦</div><div class="spark spark-two">✦</div>${robotSvg()}<div class="robot-label"><span class="status-dot"></span> robot siap menyelidiki</div></div>
      </section>

      <section class="learning-strip" aria-label="Panduan singkat"><div class="strip-step"><span class="step-badge">1</span><div><strong>Baca</strong><small>dari atas ke bawah</small></div></div><span class="strip-line"></span><div class="strip-step"><span class="step-badge">2</span><div><strong>Jalankan</strong><small>lihat geraknya</small></div></div><span class="strip-line"></span><div class="strip-step"><span class="step-badge">3</span><div><strong>Perbaiki</strong><small>satu kartu dulu</small></div></div></section>

      ${renderSettings()}

      <div class="workspace-grid">
        <aside class="mission-sidebar panel"><div class="panel-heading"><div><span class="overline">PAPAN KASUS</span><h2>Pilih misi</h2></div><span class="case-count">${totalDone}/${MISSIONS.length}</span></div><div class="mission-list">${renderMissionPicker()}</div><div class="sidebar-note"><span class="note-icon">${icon('lightbulb', 18)}</span><p>Setiap misi mengajarkan pola baru. Tidak apa-apa mencoba lagi.</p></div></aside>

        <section class="mission-main">
          <div class="mission-heading"><div><span class="overline">MISI ${String(mission.id).padStart(2, '0')} · ${mission.difficulty.toUpperCase()}</span><h2>${mission.title}</h2><p>${mission.story}</p></div><span class="concept-chip">${mission.concept}</span></div>
          <div class="simulation-card panel" tabindex="-1" aria-label="Simulasi robot"><div class="simulation-top"><div><span class="overline">SIMULASI LANGKAH</span><h3>Antar buku ke perpustakaan</h3></div><span class="direction-badge">Hadap: ${directionArrow(robot.dir)} ${dirName(robot.dir)}</span></div>${renderMap(mission, robot)}<div class="step-readout" aria-live="polite" aria-atomic="true"><span class="step-dot"></span><strong>${stepDescription()}</strong><span class="step-caption">${robotCaption(robot)}</span></div><div class="simulation-controls"><button class="button button-ghost" data-action="step">${icon('step', 18)} Satu langkah</button><button class="button button-ghost" data-action="pause" ${state.status === 'running' ? '' : 'disabled'}>${icon('pause', 18)} Jeda</button><button class="button button-ghost read-mission" data-action="read-mission" ${preferences.voice && state.status !== 'running' ? '' : 'disabled'}>${icon('voice', 18)} Bacakan misi</button><span class="playback-count">${state.currentStep} / ${state.simulation ? state.simulation.steps.length - 1 : '—'} langkah</span></div><div id="simulation-result">${resultPanel()}</div></div>

          <div class="builder-card panel"><div class="builder-top"><div><span class="overline">PROGRAM ROBOT</span><h3>Susun kartu perintah</h3></div><span class="builder-tip">${icon('lightbulb', 17)} klik kartu untuk menambah</span></div><div class="program-list">${renderProgram()}</div><div class="palette"><span class="palette-label">Tambah kartu</span><div class="palette-list">${renderPalette()}</div></div><div class="builder-actions"><button class="button button-primary button-large" data-action="run" ${state.status === 'running' ? 'disabled' : ''}>${icon('play', 18)} ${state.status === 'paused' ? 'Lanjutkan program' : 'Jalankan program'}</button><button class="button button-ghost" data-action="hint" ${state.hintsUsed >= mission.hints.length || state.status === 'running' ? 'disabled' : ''}>${icon('lightbulb', 18)} ${state.hintsUsed ? `Petunjuk ${state.hintsUsed}/${mission.hints.length}` : 'Minta petunjuk'}</button><button class="button button-ghost" data-action="reset">${icon('rotate', 18)} Ulangi</button></div><div id="hint-region">${state.hintsUsed > 0 ? `<div class="hint-box" role="status"><div class="hint-symbol">${icon('lightbulb', 19)}</div><div><strong>Petunjuk ${state.hintsUsed}</strong><p>${hint}</p></div></div>` : ''}</div></div>
        </section>
      </div>
    </main>
    <footer class="footer"><span>Detektif Bug · belajar coding lewat mencoba</span><span class="footer-meta">Progres tersimpan di perangkat ini saja</span></footer>
  </div>`;
  applyMotionPreference();
  updatePlayback();
  if (focusKey) {
    const button = Array.from(document.querySelectorAll('[data-action]')).find(el =>
      el.dataset.action === focusKey.action && el.dataset.index === focusKey.index && el.dataset.command === focusKey.command);
    if (button && !button.disabled) button.focus({ preventScroll: true });
  }
}

function selectMission(index) {
  if (!isMissionUnlocked(index)) return;
  cancelPlayback();
  state.missionIndex = index;
  state.program = [...MISSIONS[index].initial];
  state.status = 'idle'; state.hintsUsed = 0; state.currentStep = 0; state.simulation = null;
  render();
}

function moveCommand(index, direction) {
  const target = index + direction;
  if (target < 0 || target >= state.program.length) return;
  cancelPlayback();
  [state.program[index], state.program[target]] = [state.program[target], state.program[index]];
  state.status = 'idle'; state.simulation = null; state.currentStep = 0; render();
}

function resetMission() {
  cancelPlayback();
  state.program = [...currentMission().initial];
  state.status = 'idle'; state.hintsUsed = 0; state.currentStep = 0; state.simulation = null; render();
}

function addCommand(command) {
  if (!COMMANDS[command]) return;
  cancelPlayback();
  state.program.push(command); state.status = 'idle'; state.simulation = null; state.currentStep = 0; render();
}

function removeCommand(index) {
  cancelPlayback();
  state.program.splice(index, 1); state.status = 'idle'; state.simulation = null; state.currentStep = 0; render();
}

function cancelPlayback() {
  clearTimeout(playbackTimer);
  playbackTimer = null;
  runVersion += 1;
  feedback.stop();
}

function beginSimulation() {
  cancelPlayback();
  state.simulation = simulate(state.program, currentMission());
  state.status = 'paused'; state.currentStep = 0;
  render();
}

function schedulePlayback(callback, delay) {
  clearTimeout(playbackTimer);
  const version = runVersion;
  playbackTimer = window.setTimeout(() => {
    playbackTimer = null;
    if (version === runVersion) callback();
  }, delay);
}

function runProgram() {
  if (state.status === 'running') return;
  if (state.status !== 'paused' || !state.simulation) beginSimulation();
  state.status = 'running';
  updatePlayback();
  const board = document.querySelector('.simulation-card');
  board.focus({ preventScroll: true });
  board.scrollIntoView({ block: 'start', behavior: calmMotion() ? 'auto' : 'smooth' });
  if (state.currentStep >= state.simulation.steps.length - 1) { finishSimulation(); return; }
  const tick = () => {
    if (state.status !== 'running') return;
    advanceStep();
    if (state.currentStep < state.simulation.steps.length - 1) {
      schedulePlayback(tick, preferences.pace === 'slow' || preferences.voice ? 1700 : 950);
    } else schedulePlayback(finishSimulation, calmMotion() ? 150 : 480);
  };
  schedulePlayback(tick, 300);
}

function pauseProgram() {
  if (state.status !== 'running') return;
  cancelPlayback();
  state.status = 'paused';
  updatePlayback();
}

function stepProgram() {
  if (state.status === 'running') pauseProgram();
  if (!state.simulation || !['paused', 'running'].includes(state.status)) beginSimulation();
  cancelPlayback();
  if (state.currentStep >= state.simulation.steps.length - 1) { finishSimulation(); return; }
  state.status = 'paused';
  advanceStep();
  if (state.currentStep === state.simulation.steps.length - 1) {
    schedulePlayback(finishSimulation, calmMotion() ? 150 : 480);
  }
}

function advanceStep() {
  if (!state.simulation || state.currentStep >= state.simulation.steps.length - 1) return;
  state.currentStep += 1;
  const step = state.simulation.steps[state.currentStep];
  const previous = state.simulation.steps[state.currentStep - 1].robot;
  const newError = step.robot.invalid && !previous.invalid;
  updatePlayback();
  const cue = newError ? 'error' : step.command.startsWith('loop') || step.command === 'forward' ? 'move'
    : ['left', 'right'].includes(step.command) ? 'turn' : step.command;
  feedback.play(cue);
  feedback.speak(newError ? 'Amati langkah ini. Ada yang belum tepat.' : step.repeatTotal > 1
    ? `Maju. Ulangan ${step.repeatIndex} dari ${step.repeatTotal}.` : step.label);
  const token = document.querySelector('.robot-token');
  if (token && !calmMotion()) {
    token.classList.remove('is-picking', 'is-bumping', 'is-delivering');
    void token.offsetWidth;
    if (newError) token.classList.add('is-bumping');
    else if (step.command === 'pickup' && step.robot.carrying) token.classList.add('is-picking');
    else if (step.command === 'deliver' && step.robot.delivered) token.classList.add('is-delivering');
  }
}

function updatePlayback() {
  const robot = state.simulation?.steps[state.currentStep]?.robot || { ...currentMission().start, carrying: false, delivered: false };
  const step = state.simulation?.steps[state.currentStep];
  const running = state.status === 'running';
  const position = document.querySelector('.robot-position');
  if (!position) return;
  position.style.setProperty('--robot-x', robot.x);
  position.style.setProperty('--robot-y', robot.y);
  document.querySelector('.robot-direction').style.transform = `rotate(${directionAngle()}deg)`;
  document.querySelector('.carried-book').hidden = !robot.carrying || robot.delivered;
  document.querySelector('.book-object').hidden = robot.carrying || robot.delivered;
  document.querySelector('.has-target').classList.toggle('is-delivered', Boolean(robot.delivered));
  document.querySelector('.map-grid').setAttribute('aria-label', `Robot di kolom ${robot.x + 1}, baris ${robot.y + 1}, menghadap ${dirName(robot.dir)}. ${robotCaption(robot)}.`);
  document.querySelector('.direction-badge').textContent = `Hadap: ${directionArrow(robot.dir)} ${dirName(robot.dir)}`;
  document.querySelector('.step-readout strong').textContent = stepDescription();
  document.querySelector('.step-caption').textContent = robotCaption(robot);
  document.querySelector('.playback-count').textContent = `${state.currentStep} / ${state.simulation ? state.simulation.steps.length - 1 : '—'} langkah`;
  document.querySelector('[data-action="run"]').disabled = running;
  document.querySelector('[data-action="run"]').innerHTML = `${icon('play', 18)} ${state.status === 'paused' ? 'Lanjutkan program' : 'Jalankan program'}`;
  document.querySelector('[data-action="pause"]').disabled = !running;
  document.querySelector('[data-action="hint"]').disabled = running || state.hintsUsed >= currentMission().hints.length;
  document.querySelector('[data-action="read-mission"]').disabled = running || !preferences.voice;
  for (const button of document.querySelectorAll('.command-controls button, .palette-button')) {
    const index = Number(button.dataset.index);
    button.disabled = running || (button.dataset.action === 'move-up' && index === 0)
      || (button.dataset.action === 'move-down' && index === state.program.length - 1);
  }
  const visited = new Set(state.simulation?.steps.slice(0, state.currentStep + 1).map(s => `${s.robot.x},${s.robot.y}`));
  for (const cell of document.querySelectorAll('.map-cell')) {
    cell.classList.toggle('is-visited', visited.has(`${cell.dataset.x},${cell.dataset.y}`));
  }
  for (const card of document.querySelectorAll('.command-card')) {
    const active = Boolean(step && state.currentStep > 0 && Number(card.dataset.commandIndex) === step.programIndex);
    card.classList.toggle('is-current', active);
    if (active) card.setAttribute('aria-current', 'step'); else card.removeAttribute('aria-current');
    const progress = card.querySelector('.command-progress');
    progress.hidden = !active;
    if (active) progress.textContent = step.repeatTotal > 1 ? `Ulangan ${step.repeatIndex} dari ${step.repeatTotal}` : 'Kartu sedang diamati';
  }
  document.querySelector('#simulation-result').innerHTML = resultPanel();
}

function celebrate() {
  if (calmMotion()) return;
  const layer = document.querySelector('.celebration-layer');
  layer.innerHTML = Array.from({ length: 16 }, (_, i) => `<span class="confetti ${i % 3 === 0 ? 'confetti-star' : ''}" style="--scatter:${(i - 7.5) * 12}px;--rise:${-55 - (i % 4) * 18}px;--spin:${i % 2 ? 220 : -180}deg;--delay:${(i % 4) * 40}ms;--confetti-color:${['#facc15', '#ec4899', '#2563eb', '#14b88a'][i % 4]}">${i % 3 === 0 ? icon('star', 15) : ''}</span>`).join('');
  layer.querySelectorAll('.confetti').forEach(piece => piece.addEventListener('animationend', () => piece.remove(), { once: true }));
}

function finishSimulation() {
  if (!state.simulation || !['running', 'paused'].includes(state.status)) return;
  clearTimeout(playbackTimer); playbackTimer = null;
  state.status = state.simulation.success ? 'success' : 'error';
  state.currentStep = state.simulation.steps.length - 1;
  if (state.simulation.success) { state.completed[state.missionIndex] = true; saveProgress(); }
  render();
  if (state.simulation.success) {
    celebrate(); feedback.play('success'); feedback.speak('Kasus terpecahkan! Buku sudah diantar.');
  } else {
    feedback.play('error'); feedback.speak('Belum tepat. Mari amati langkahnya dan coba lagi.');
  }
}

function nextMission() {
  if (state.missionIndex === MISSIONS.length - 1) { resetMission(); return; }
  selectMission(state.missionIndex + 1);
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    const action = button.dataset.action;
    if (action.startsWith('toggle-')) {
      if (action === 'toggle-sound') preferences.sound = !preferences.sound;
      if (action === 'toggle-voice') preferences.voice = !preferences.voice;
      if (action === 'toggle-calm') preferences.calm = !preferences.calm;
      savePreferences();
      render();
      if (action === 'toggle-sound' && preferences.sound) feedback.unlock().then(ok => { if (ok) feedback.play('click'); });
      if (action === 'toggle-voice' && preferences.voice) feedback.speak('Halo detektif! Mari bantu robot mengantar buku.');
      return;
    }
    feedback.unlock();
    if (action === 'select-mission') selectMission(Number(button.dataset.index));
    if (action === 'add-command') addCommand(button.dataset.command);
    if (action === 'move-up') moveCommand(Number(button.dataset.index), -1);
    if (action === 'move-down') moveCommand(Number(button.dataset.index), 1);
    if (action === 'remove-command') removeCommand(Number(button.dataset.index));
    if (action === 'run' || action === 'run-again') runProgram();
    if (action === 'reset') { resetMission(); feedback.play('reset'); }
    if (action === 'pause') pauseProgram();
    if (action === 'step') stepProgram();
    if (action === 'read-mission') feedback.speak(currentMission().story);
    if (action === 'hint') { state.hintsUsed += 1; render(); feedback.play('hint'); feedback.speak(getHints()[state.hintsUsed - 1]); }
    if (action === 'next-mission') nextMission();
    if (['select-mission', 'add-command', 'move-up', 'move-down', 'remove-command', 'next-mission'].includes(action)) feedback.play('click');
  });

  document.addEventListener('input', event => {
    if (event.target.id !== 'sound-volume') return;
    preferences.volume = Number(event.target.value) / 100;
    savePreferences();
    document.querySelector('output[for="sound-volume"]').textContent = `${event.target.value}%`;
  });
  document.addEventListener('change', event => {
    if (event.target.id !== 'playback-pace') return;
    preferences.pace = event.target.value === 'slow' ? 'slow' : 'normal';
    savePreferences();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseProgram(); });
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => { applyMotionPreference(); render(); });

  render();
}

export { COMMANDS, MISSIONS, simulate };
