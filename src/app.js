const STORAGE_KEY = 'detektif-bug-progress-v1';

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
      'Robot harus berhenti satu baris di atas buku sebelum belok kanan lagi.',
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
  program.forEach((command) => {
    const repeat = COMMANDS[command]?.repeat || 1;
    for (let count = 0; count < repeat; count += 1) {
      const atomic = repeat > 1 ? 'forward' : command;
      robot = executeOne(robot, atomic, mission);
      steps.push({ robot: cloneRobot(robot), command, label: COMMANDS[command]?.label || command, repeatIndex: count + 1, repeatTotal: repeat });
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
      const isRobot = robot.x === x && robot.y === y;
      const isBook = mission.book.x === x && mission.book.y === y;
      const isTarget = mission.target.x === x && mission.target.y === y;
      cells.push(`<div class="map-cell ${isRobot ? 'has-robot' : ''} ${isBook ? 'has-book' : ''} ${isTarget ? 'has-target' : ''}" aria-label="Petak ${x + 1}, ${y + 1}">
        ${isTarget ? `<span class="cell-object target-object">${icon('flag', 19)}<small>rak</small></span>` : ''}
        ${isBook && !robot.carrying && !robot.delivered ? `<span class="cell-object book-object">${icon('book', 18)}<small>buku</small></span>` : ''}
        ${isRobot ? `<span class="robot-token" style="--robot-rotation:${robot.dir * 90}deg">${directionArrow(robot.dir)}</span>` : ''}
      </div>`);
    }
  }
  return `<div class="map-wrap"><div class="map-grid" role="img" aria-label="Peta misi dengan robot, buku, dan perpustakaan">${cells.join('')}</div><div class="map-legend"><span><i class="legend-dot dot-robot"></i>robot</span><span><i class="legend-dot dot-book"></i>buku</span><span><i class="legend-dot dot-target"></i>perpustakaan</span></div></div>`;
}

function renderProgram() {
  if (!state.program.length) return '<div class="empty-program">Belum ada kartu. Tambahkan satu kartu dari palet di bawah.</div>';
  return state.program.map((command, index) => {
    const item = COMMANDS[command];
    return `<div class="command-card tone-${item.tone}" data-command-index="${index}">
      <span class="command-index">${index + 1}</span>
      <span class="command-glyph">${command === 'forward' ? icon('forward', 19) : command === 'left' ? icon('turnLeft', 19) : command === 'right' ? icon('turnRight', 19) : command === 'pickup' ? icon('book', 19) : command === 'deliver' ? icon('flag', 19) : icon('repeat', 19)}</span>
      <span class="command-copy"><strong>${item.label}</strong><small>${item.kind === 'loop' ? 'jalankan gerak berulang' : item.kind === 'turn' ? 'ubah arah robot' : item.kind === 'book' ? 'aksi buku' : 'gerak robot'}</small></span>
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
  return `<div class="result-card result-idle" role="status"><div class="result-icon">?</div><div><strong>Siap menyelidiki?</strong><p>Jalankan kartu dari atas ke bawah, lalu amati gerak robot.</p></div></div>`;
}

function render() {
  const mission = currentMission();
  const robot = state.simulation?.steps?.[state.currentStep]?.robot || { ...mission.start, carrying: false, delivered: false, dir: mission.start.dir };
  const totalDone = state.completed.filter(Boolean).length;
  const hint = mission.hints[Math.max(0, state.hintsUsed - 1)];
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

      <div class="workspace-grid">
        <aside class="mission-sidebar panel"><div class="panel-heading"><div><span class="overline">PAPAN KASUS</span><h2>Pilih misi</h2></div><span class="case-count">${totalDone}/${MISSIONS.length}</span></div><div class="mission-list">${renderMissionPicker()}</div><div class="sidebar-note"><span class="note-icon">${icon('lightbulb', 18)}</span><p>Setiap misi mengajarkan pola baru. Tidak apa-apa mencoba lagi.</p></div></aside>

        <section class="mission-main">
          <div class="mission-heading"><div><span class="overline">MISI ${String(mission.id).padStart(2, '0')} · ${mission.difficulty.toUpperCase()}</span><h2>${mission.title}</h2><p>${mission.story}</p></div><span class="concept-chip">${mission.concept}</span></div>
          <div class="simulation-card panel"><div class="simulation-top"><div><span class="overline">SIMULASI LANGKAH</span><h3>Antar buku ke perpustakaan</h3></div><span class="direction-badge">Hadap: ${directionArrow(robot.dir)} ${dirName(robot.dir)}</span></div>${renderMap(mission, robot)}<div class="step-readout" aria-live="polite"><span class="step-dot"></span><strong>${state.status === 'running' ? `Langkah ${Math.min(state.currentStep, state.simulation?.steps?.length - 1 || 0)} sedang diamati` : state.status === 'success' ? 'Semua langkah tepat' : state.status === 'error' ? `Robot berhenti di langkah ${state.currentStep}` : 'Robot menunggu perintah'}</strong><span class="step-caption">${robot.carrying ? 'robot membawa buku' : robot.delivered ? 'buku sudah diantar' : 'amati posisi robot'}</span></div></div>

          <div class="builder-card panel"><div class="builder-top"><div><span class="overline">PROGRAM ROBOT</span><h3>Susun kartu perintah</h3></div><span class="builder-tip">${icon('lightbulb', 17)} klik kartu untuk menambah</span></div><div class="program-list">${renderProgram()}</div><div class="palette"><span class="palette-label">Tambah kartu</span><div class="palette-list">${renderPalette()}</div></div><div class="builder-actions"><button class="button button-primary button-large" data-action="run" ${state.status === 'running' ? 'disabled' : ''}>${icon('play', 18)} Jalankan program</button><button class="button button-ghost" data-action="hint" ${state.hintsUsed >= mission.hints.length || state.status === 'running' ? 'disabled' : ''}>${icon('lightbulb', 18)} ${state.hintsUsed ? `Petunjuk ${state.hintsUsed}/${mission.hints.length}` : 'Lihat langkah berikutnya'}</button><button class="button button-ghost" data-action="reset">${icon('rotate', 18)} Ulangi</button></div>${state.hintsUsed > 0 ? `<div class="hint-box" role="status"><div class="hint-symbol">${icon('lightbulb', 19)}</div><div><strong>Petunjuk ${state.hintsUsed}</strong><p>${hint}</p></div></div>` : ''}${resultPanel()}</div>
        </section>
      </div>
    </main>
    <footer class="footer"><span>Detektif Bug · belajar coding lewat mencoba</span><span class="footer-meta">Progres tersimpan di perangkat ini saja</span></footer>
  </div>`;
}

function selectMission(index) {
  if (!isMissionUnlocked(index)) return;
  state.missionIndex = index;
  state.program = [...MISSIONS[index].initial];
  state.status = 'idle'; state.hintsUsed = 0; state.currentStep = 0; state.simulation = null;
  render();
}

function moveCommand(index, direction) {
  const target = index + direction;
  if (target < 0 || target >= state.program.length) return;
  [state.program[index], state.program[target]] = [state.program[target], state.program[index]];
  state.status = 'idle'; state.simulation = null; state.currentStep = 0; render();
}

function resetMission() {
  state.program = [...currentMission().initial];
  state.status = 'idle'; state.hintsUsed = 0; state.currentStep = 0; state.simulation = null; render();
}

function addCommand(command) {
  state.program.push(command); state.status = 'idle'; state.simulation = null; state.currentStep = 0; render();
}

function removeCommand(index) {
  state.program.splice(index, 1); state.status = 'idle'; state.simulation = null; state.currentStep = 0; render();
}

function runProgram() {
  if (state.status === 'running') return;
  state.simulation = simulate(state.program, currentMission());
  state.status = 'running'; state.currentStep = 0; render();
  const totalSteps = state.simulation.steps.length - 1;
  let step = 0;
  const tick = () => {
    if (state.status !== 'running') return;
    step += 1; state.currentStep = step; render();
    if (step < totalSteps) window.setTimeout(tick, 560);
    else window.setTimeout(finishSimulation, 420);
  };
  if (totalSteps === 0) finishSimulation(); else window.setTimeout(tick, 350);
}

function finishSimulation() {
  if (!state.simulation) return;
  state.status = state.simulation.success ? 'success' : 'error';
  state.currentStep = state.simulation.steps.length - 1;
  if (state.simulation.success) { state.completed[state.missionIndex] = true; saveProgress(); }
  render();
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
    if (action === 'select-mission') selectMission(Number(button.dataset.index));
    if (action === 'add-command') addCommand(button.dataset.command);
    if (action === 'move-up') moveCommand(Number(button.dataset.index), -1);
    if (action === 'move-down') moveCommand(Number(button.dataset.index), 1);
    if (action === 'remove-command') removeCommand(Number(button.dataset.index));
    if (action === 'run' || action === 'run-again') runProgram();
    if (action === 'reset') resetMission();
    if (action === 'hint') { state.hintsUsed += 1; render(); }
    if (action === 'next-mission') nextMission();
  });

  render();
}

export { COMMANDS, MISSIONS, simulate };
