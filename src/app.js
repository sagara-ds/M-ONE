import { FeedbackEngine } from './feedback.js';
import { MISSIONS, STAGES, mapSize } from './missions.js';
import { readProgress, writeProgress, isUnlocked, recordCompletion, recordReflection, earnedBadges, learningSummary } from './progress.js';

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


const progress = readProgress(MISSIONS);
const state = {
  missionIndex: progress.lastMissionIndex,
  program: [...MISSIONS[progress.lastMissionIndex].initial],
  completed: progress.completed,
  progress,
  reflectionChoice: null,
  summaryOpen: false,
  status: 'idle',
  hintsUsed: 0,
  currentStep: 0,
  simulation: null,
};

function saveProgress() {
  state.progress.completed = [...state.completed];
  state.progress.lastMissionIndex = state.missionIndex;
  writeProgress(state.progress);
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
    shelf: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18M7 4v7M11 5v6M15 4v7M7 13v7M12 13v7M16 14v6"/>',
    medal: '<path d="m7 3 5 7 5-7M5 3h5l2 3 2-3h5"/><circle cx="12" cy="15" r="6"/><path d="m12 12 1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L9 14.3l2-.3Z"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6ZM9 3v15M15 6v15"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 5 2c-1 .5-2 1-2 2M12 16h.01"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
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
  const { width, height } = mapSize(mission);
  if (next.x < 0 || next.x >= width || next.y < 0 || next.y >= height) {
    next.x = robot.x; next.y = robot.y; next.invalid = true; next.errorKind = 'boundary';
    next.message = 'Robot menabrak tepi peta. Coba amati arah dan jaraknya.';
  } else if ((mission.walls || []).some(wall => positionMatches(wall, next))) {
    next.x = robot.x; next.y = robot.y; next.invalid = true; next.errorKind = 'wall';
    next.message = 'Ada rak yang menghalangi robot. Cari petak kosong untuk memutari rak.';
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

function isMissionUnlocked(index) { return isUnlocked(index, state.completed); }
function currentMission() { return MISSIONS[state.missionIndex]; }

function directionArrow(dir) { return ['→', '↓', '←', '↑'][dir]; }

function renderMissionButton(mission, index) {
    const unlocked = isMissionUnlocked(index);
    const done = state.completed[index];
    const active = index === state.missionIndex;
    return `<button class="mission-item ${active ? 'is-active' : ''} ${done ? 'is-done' : ''}" data-action="select-mission" data-index="${index}" ${unlocked ? '' : 'disabled'} aria-label="Misi ${mission.id}: ${mission.title}${done ? ', selesai' : ''}${unlocked ? '' : ', terkunci'}">
      <span class="mission-number">${done ? icon('check', 16) : mission.id}</span>
      <span class="mission-item-copy"><strong>${mission.title}</strong><small>${mission.concept}</small></span>
      <span class="mission-item-state">${done ? 'Selesai' : unlocked ? 'Mulai' : icon('lock', 16)}</span>
    </button>`;
}

function renderMissionPicker() {
  return STAGES.map(stage => `<section class="mission-group"><h3><span>Stage ${stage.id} · ${stage.title}</span><small>${stage.missionIds.filter(id => state.completed[id - 1]).length}/4</small></h3><div class="mission-group-list">${stage.missionIds.map(id => renderMissionButton(MISSIONS[id - 1], id - 1)).join('')}</div></section>`).join('');
}

function renderStageMap() {
  const badges = earnedBadges(state.progress, STAGES);
  return `<section class="stage-map" aria-label="Peta stage"><div class="section-intro"><div><span class="overline">PETUALANGAN DI PERPUSTAKAAN</span><h2>Peta stage</h2></div><p>Empat kasus tiap stage. Pecahkan satu demi satu.</p></div><div class="stage-grid">${STAGES.map(stage => {
    const done = stage.missionIds.filter(id => state.completed[id - 1]).length;
    const unlocked = stage.missionIds.some(id => isMissionUnlocked(id - 1));
    const current = currentMission().stageId === stage.id;
    return `<article class="stage-card stage-${stage.id} ${current ? 'is-current-stage' : ''} ${badges.includes(stage.id) ? 'is-complete' : ''}" data-stage-id="${stage.id}"><div class="stage-card-heading"><span class="stage-tag">STAGE ${stage.id}</span><span class="stage-state">${done === 4 ? 'Selesai' : unlocked ? `${done}/4 kasus` : 'Terkunci'}</span></div><h3>${stage.title}</h3><p>${stage.description}</p><div class="stage-path" aria-label="Misi stage ${stage.id}">${stage.missionIds.map(id => `<button class="stage-node ${state.completed[id - 1] ? 'is-done' : ''} ${id === currentMission().id ? 'is-active' : ''}" data-action="jump-mission" data-index="${id - 1}" ${isMissionUnlocked(id - 1) ? '' : 'disabled'} aria-label="Misi ${id}: ${MISSIONS[id - 1].title}, ${state.completed[id - 1] ? 'selesai' : isMissionUnlocked(id - 1) ? 'terbuka' : 'selesaikan misi ' + (id - 1) + ' dulu'}">${state.completed[id - 1] ? icon('check', 18) : id}</button>`).join('')}</div><div class="stage-reward">${icon(badges.includes(stage.id) ? 'medal' : 'lock', 18)}<span>${stage.badge.title}${badges.includes(stage.id) ? ' · didapat!' : ' · setelah 4 kasus'}</span></div><button class="button stage-launch" data-action="select-stage" data-stage="${stage.id}" ${unlocked ? '' : 'disabled'}>${unlocked ? icon('play', 16) : icon('lock', 16)} ${unlocked ? done === 4 ? 'Mainkan lagi' : 'Jelajahi stage' : `Selesaikan misi ${stage.missionIds[0] - 1} dulu`}</button></article>`;
  }).join('')}</div></section>`;
}

function renderLearningSummary() {
  const summary = learningSummary(state.progress, MISSIONS);
  const badges = earnedBadges(state.progress, STAGES);
  const completed = MISSIONS.filter((mission, index) => state.completed[index]);
  return `<details id="learning-summary" class="learning-journal panel" ${state.summaryOpen || summary.completed === summary.total ? 'open' : ''}><summary>${icon('book', 22)}<span><strong>Rangkuman belajarku</strong><small>${summary.completed}/${summary.total} misi · ${badges.length}/3 lencana</small></span><span class="summary-chevron">${icon('arrowDown', 19)}</span></summary><div class="journal-body"><div class="learning-stats"><div><strong>${summary.completed}/${summary.total}</strong><span>Misi terpecahkan</span></div><div><strong>${summary.understood}/${summary.total}</strong><span>Pertanyaan dijawab tepat</span></div><div><strong>${badges.length}/3</strong><span>Lencana petualangan</span></div></div><h3>Lencanaku</h3><div class="badge-grid">${STAGES.map(stage => `<article class="badge-item ${badges.includes(stage.id) ? 'is-earned' : ''}" data-stage-id="${stage.id}"><span class="badge-symbol">${icon(badges.includes(stage.id) ? 'medal' : 'lock', 28)}</span><div><strong>${stage.badge.title}</strong><p>${badges.includes(stage.id) ? stage.badge.description : `Pecahkan misi ${stage.missionIds[0]}–${stage.missionIds.at(-1)} untuk mendapat lencana.`}</p></div><span class="badge-status">${badges.includes(stage.id) ? 'Didapat' : 'Belum'}</span></article>`).join('')}</div><h3>Catatan penemuanku</h3>${completed.length ? `<ul class="concept-notes">${completed.map(mission => `<li><span>${icon('check', 17)}</span><div><strong>Misi ${mission.id} · ${mission.title}</strong><p>${mission.takeaway}</p><small>${state.progress.understood[mission.id - 1] ? 'Pertanyaan konsep sudah dijawab tepat.' : 'Pertanyaan konsep masih bisa dicoba saat membuka misi ini.'}</small></div></li>`).join('')}</ul>` : '<p class="journal-empty">Catatanmu muncul setelah berhasil mengantar buku. Mari mulai satu kasus!</p>'}<div class="journal-next"><p>${summary.nextMissionIndex === null ? 'Semua kasus terpecahkan. Kamu bisa bermain lagi dan menjelaskan caranya kepada teman atau pendamping.' : `Petualangan berikutnya: misi ${summary.nextMissionIndex + 1}, ${MISSIONS[summary.nextMissionIndex].title}.`}</p><button class="button button-primary" data-action="resume-summary">${summary.nextMissionIndex === null ? 'Latihan lagi' : 'Lanjutkan petualangan'} ${icon('play', 16)}</button></div><p class="journal-note">Catatan tersimpan di perangkat ini. Jawaban tepat belum menjadi bukti kemampuan coding; coba jelaskan alasanmu kepada pendamping.</p></div></details>`;
}

function renderReflection() {
  if (!state.completed[state.missionIndex]) return '';
  const question = currentMission().reflection;
  const answered = state.progress.understood[state.missionIndex];
  const choice = state.reflectionChoice;
  const selected = answered ? question.correctIndex : choice;
  return `<section class="reflection-panel" aria-label="Pertanyaan konsep"><div class="reflection-heading"><span class="reflection-icon">${icon('lightbulb', 22)}</span><div><span class="overline">APA YANG KAMU TEMUKAN?</span><h3>${question.question}</h3></div></div><div class="reflection-choices">${question.choices.map((text, index) => `<button class="reflection-choice ${selected === index ? 'is-selected' : ''} ${answered && selected === index ? 'is-correct' : ''}" data-action="answer-reflection" data-choice="${index}" aria-pressed="${selected === index}" ${answered || state.status === 'running' ? 'disabled' : ''}><span>${String.fromCharCode(65 + index)}</span>${text}</button>`).join('')}</div><div class="reflection-feedback ${answered ? 'is-correct' : ''}" role="status">${answered ? `${icon('check', 18)}<p><strong>Penjelasanmu tepat.</strong> ${question.explanations[question.correctIndex]}</p>` : choice !== null ? `<p><strong>Coba amati lagi.</strong> ${question.explanations[choice]}</p>` : '<p>Pilih alasan yang paling cocok. Kamu boleh mencoba lagi atau lanjut ke misi berikutnya.</p>'}</div></section>`;
}

function helpDialog() {
  return `<dialog id="help-dialog" aria-labelledby="help-title"><div class="help-heading"><h2 id="help-title">Cara menjadi detektif bug</h2><button class="icon-button" data-action="close-help" aria-label="Tutup panduan">${icon('close', 20)}</button></div><ol class="help-steps"><li><strong>Baca petanya.</strong> Robot mengikuti arah panah. Petak tujuan punya bendera; rak penghalang tidak bisa dilewati.</li><li><strong>Jalankan program yang keliru.</strong> Perhatikan kartu bertanda biru. Tombol “Satu langkah” menjalankan satu gerakan saja.</li><li><strong>Perbaiki kartunya.</strong> Tambahkan kartu, pindahkan dengan panah naik/turun, atau hapus. “Ulang 2×: maju” sama dengan dua kartu maju.</li><li><strong>Coba lagi dan ceritakan alasanmu.</strong> Petunjuk dibuka bertahap. Setelah berhasil, coba pertanyaan konsep dan lanjut ke misi baru.</li></ol><div class="help-example"><strong>Contoh kartu ulang</strong><span>Ulang 2×: maju</span><span>= Maju → Maju</span><p>Dua gerakan, walaupun hanya ada satu kartu.</p></div><p>Kamu boleh memakai petunjuk sebanyak yang diperlukan. Lencana tidak berkurang karena mencoba.</p><button class="button button-primary" data-action="close-help">Siap menyelidiki ${icon('magnify', 18)}</button></dialog>`;
}

function renderMap(mission, robot) {
  const cells = [];
  const { width, height } = mapSize(mission);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const isBook = mission.book.x === x && mission.book.y === y;
      const isTarget = mission.target.x === x && mission.target.y === y;
      const isWall = (mission.walls || []).some(wall => wall.x === x && wall.y === y);
      cells.push(`<div class="map-cell ${isBook ? 'has-book' : ''} ${isTarget ? 'has-target' : ''} ${isWall ? 'has-wall' : ''}" data-x="${x}" data-y="${y}" aria-label="Petak ${x + 1}, ${y + 1}${isWall ? ', rak penghalang' : ''}">
        ${isWall ? `<span class="cell-object wall-object">${icon('shelf', 20)}<small>rak</small></span>` : ''}
        ${isTarget ? `<span class="cell-object target-object">${icon('flag', 19)}<small>tujuan</small></span>` : ''}
        ${isBook ? `<span class="cell-object book-object" ${robot.carrying || robot.delivered ? 'hidden' : ''}>${icon('book', 18)}<small>buku</small></span>` : ''}
      </div>`);
    }
  }
  return `<div class="map-wrap"><div class="map-grid" style="--map-columns:${width};--map-rows:${height}" role="img" aria-label="Peta misi dengan robot, buku, dan perpustakaan">${cells.join('')}<div class="robot-position" style="--robot-x:${robot.x};--robot-y:${robot.y}"><span class="robot-token"><svg class="mini-robot" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 6V3"/><circle cx="20" cy="3" r="2" fill="#facc15"/><rect x="5" y="7" width="30" height="27" rx="9" fill="#77adff"/><rect x="10" y="12" width="20" height="14" rx="5" fill="#d9f8ff"/><circle cx="15" cy="18" r="1.8" fill="#0f172a"/><circle cx="25" cy="18" r="1.8" fill="#0f172a"/><path d="M16 22q4 3 8 0"/><path d="M12 34v3M28 34v3"/></svg><span class="robot-direction" style="transform:rotate(${robot.dir * 90}deg)">${icon('forward', 17)}</span><span class="carried-book" ${!robot.carrying || robot.delivered ? 'hidden' : ''}>${icon('book', 14)}</span></span></div><div class="celebration-layer" aria-hidden="true"></div></div><div class="map-legend"><span><i class="legend-dot dot-robot"></i>robot</span><span><i class="legend-dot dot-book"></i>buku</span><span><i class="legend-dot dot-target"></i>tujuan</span>${mission.walls?.length ? '<span><i class="legend-dot dot-wall"></i>rak penghalang</span>' : ''}</div></div>`;
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
  if (firstError.robot.errorKind === 'wall') return [
    'Ada rak di depan robot. Amati petak yang tidak bisa dilewati.',
    'Cari deretan petak kosong di samping rak. Robot mungkin perlu berbelok lebih dulu.',
    'Gunakan “Satu langkah” untuk memeriksa belokan sebelum robot mencapai rak.',
  ];
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
  if (state.status === 'success') return `<div class="result-card result-success" role="status"><div class="result-icon">${icon('check', 25)}</div><div><strong>Kasus terpecahkan!</strong><p>${mission.takeaway}</p></div><button class="button button-primary" data-action="${state.missionIndex === MISSIONS.length - 1 ? 'show-summary' : 'next-mission'}">${state.missionIndex === MISSIONS.length - 1 ? 'Lihat rangkuman' : 'Misi berikutnya'} ${icon('arrowDown', 16)}</button></div>`;
  if (state.status === 'error') return `<div class="result-card result-error" role="alert"><div class="result-icon">!</div><div><strong>Belum tepat, detektif.</strong><p>${state.simulation.error}</p></div><button class="button button-secondary" data-action="run-again">Coba lagi ${icon('rotate', 17)}</button></div>`;
  if (state.status === 'running') return `<div class="result-card result-running" role="status"><div class="spinner"></div><div><strong>Robot sedang bekerja…</strong><p>Amati langkahnya satu per satu.</p></div></div>`;
  if (state.status === 'paused') return `<div class="result-card result-idle" role="status"><div class="result-icon">${icon('pause', 22)}</div><div><strong>Waktunya mengamati.</strong><p>Tekan “Satu langkah” untuk membaca kartu berikutnya, atau lanjutkan program.</p></div></div>`;
  return `<div class="result-card result-idle" role="status"><div class="result-icon">?</div><div><strong>Siap menyelidiki?</strong><p>Jalankan kartu dari atas ke bawah, lalu amati gerak robot.</p></div></div>`;
}

function render() {
  const focused = document.activeElement?.dataset;
  const focusKey = focused?.action ? { action: focused.action, index: focused.index, command: focused.command, stage: focused.stage, choice: focused.choice } : null;
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
        <div class="hero-copy"><span class="eyebrow">LABORATORIUM KODE <span class="eyebrow-dot"></span> KASUS ${String(mission.id).padStart(2, '0')}</span><h1>Temukan bug.<br><em>Bantu robot.</em></h1><p>Program adalah kumpulan perintah. Kalau urutannya keliru, robot bisa tersesat. Mari cari penyebabnya bersama.</p><div class="hero-pills"><span>${icon('book', 16)} ${MISSIONS.length} misi cerita</span><span>${icon('lightbulb', 16)} petunjuk bertahap</span></div><div class="hero-actions"><button class="button button-primary button-large" data-action="resume-mission">${icon('play', 19)} ${totalDone ? 'Lanjutkan petualangan' : 'Mulai misi 1'}</button><button class="button button-ghost" data-action="open-help">${icon('question', 18)} Cara bermain</button></div></div>
        <div class="robot-hero"><div class="spark spark-one">✦</div><div class="spark spark-two">✦</div>${robotSvg()}<div class="robot-label"><span class="status-dot"></span> robot siap menyelidiki</div></div>
      </section>

      <section class="learning-strip" aria-label="Panduan singkat"><div class="strip-step"><span class="step-badge">1</span><div><strong>Baca</strong><small>dari atas ke bawah</small></div></div><span class="strip-line"></span><div class="strip-step"><span class="step-badge">2</span><div><strong>Jalankan</strong><small>lihat geraknya</small></div></div><span class="strip-line"></span><div class="strip-step"><span class="step-badge">3</span><div><strong>Perbaiki</strong><small>satu kartu dulu</small></div></div></section>

      ${renderStageMap()}
      ${renderSettings()}

      <div class="workspace-grid">
        <aside class="mission-sidebar panel"><div class="panel-heading"><div><span class="overline">PAPAN KASUS</span><h2>12 kasus seru</h2></div><span class="case-count">${totalDone}/${MISSIONS.length}</span></div><div class="mission-list">${renderMissionPicker()}</div><div class="sidebar-note"><span class="note-icon">${icon('lightbulb', 18)}</span><p>Setiap misi mengajarkan pola baru. Tidak apa-apa mencoba lagi.</p></div></aside>

        <section class="mission-main">
          <div class="mission-heading"><div><span class="overline">MISI ${String(mission.id).padStart(2, '0')} · ${mission.difficulty.toUpperCase()}</span><h2>${mission.title}</h2><p>${mission.story}</p><div class="mission-objective">${icon('flag', 15)} ${mission.objective}</div></div><span class="concept-chip">${mission.concept}</span></div>
          <div class="simulation-card panel" tabindex="-1" aria-label="Simulasi robot"><div class="simulation-top"><div><span class="overline">SIMULASI LANGKAH</span><h3>Antar buku ke perpustakaan</h3></div><span class="direction-badge">Hadap: ${directionArrow(robot.dir)} ${dirName(robot.dir)}</span></div>${renderMap(mission, robot)}<div class="step-readout" aria-live="polite" aria-atomic="true"><span class="step-dot"></span><strong>${stepDescription()}</strong><span class="step-caption">${robotCaption(robot)}</span></div><div class="simulation-controls"><button class="button button-ghost" data-action="step">${icon('step', 18)} Satu langkah</button><button class="button button-ghost" data-action="pause" ${state.status === 'running' ? '' : 'disabled'}>${icon('pause', 18)} Jeda</button><button class="button button-ghost read-mission" data-action="read-mission" ${preferences.voice && state.status !== 'running' ? '' : 'disabled'}>${icon('voice', 18)} Bacakan misi</button><span class="playback-count">${state.currentStep} / ${state.simulation ? state.simulation.steps.length - 1 : '—'} langkah</span></div><div id="simulation-result">${resultPanel()}</div><div id="reflection-region">${renderReflection()}</div></div>

          <div class="builder-card panel"><div class="builder-top"><div><span class="overline">PROGRAM ROBOT</span><h3>Susun kartu perintah</h3></div><span class="builder-tip">${icon('lightbulb', 17)} klik kartu untuk menambah</span></div><div class="program-list">${renderProgram()}</div><div class="palette"><span class="palette-label">Tambah kartu</span><div class="palette-list">${renderPalette()}</div></div><div class="builder-actions"><button class="button button-primary button-large" data-action="run" ${state.status === 'running' ? 'disabled' : ''}>${icon('play', 18)} ${state.status === 'paused' ? 'Lanjutkan program' : 'Jalankan program'}</button><button class="button button-ghost" data-action="hint" ${state.hintsUsed >= mission.hints.length || state.status === 'running' ? 'disabled' : ''}>${icon('lightbulb', 18)} ${state.hintsUsed ? `Petunjuk ${state.hintsUsed}/${mission.hints.length}` : 'Minta petunjuk'}</button><button class="button button-ghost" data-action="reset">${icon('rotate', 18)} Ulangi</button></div><div id="hint-region">${state.hintsUsed > 0 ? `<div class="hint-box" role="status"><div class="hint-symbol">${icon('lightbulb', 19)}</div><div><strong>Petunjuk ${state.hintsUsed}</strong><p>${hint}</p></div></div>` : ''}</div></div>
        </section>
      </div>
      ${renderLearningSummary()}
    </main>
    <footer class="footer"><span>Detektif Bug · belajar coding lewat mencoba</span><span class="footer-meta">Progres tersimpan di perangkat ini saja</span></footer>
    ${helpDialog()}
  </div>`;
  applyMotionPreference();
  updatePlayback();
  if (focusKey) {
    const button = Array.from(document.querySelectorAll('[data-action]')).find(el =>
      el.dataset.action === focusKey.action && el.dataset.index === focusKey.index && el.dataset.command === focusKey.command
      && el.dataset.stage === focusKey.stage && el.dataset.choice === focusKey.choice);
    if (button && !button.disabled) button.focus({ preventScroll: true });
  }
}

function selectMission(index) {
  if (!isMissionUnlocked(index)) return;
  cancelPlayback();
  state.missionIndex = index;
  state.program = [...MISSIONS[index].initial];
  state.reflectionChoice = null;
  state.status = 'idle'; state.hintsUsed = 0; state.currentStep = 0; state.simulation = null;
  saveProgress();
  render();
}

function selectStage(id) {
  const stage = STAGES.find(item => item.id === id);
  if (!stage) return;
  const next = stage.missionIds.find(missionId => !state.completed[missionId - 1] && isMissionUnlocked(missionId - 1));
  selectMission((next || stage.missionIds.find(missionId => isMissionUnlocked(missionId - 1)) || 0) - 1);
  document.querySelector('.mission-heading').scrollIntoView({ block: 'start', behavior: calmMotion() ? 'auto' : 'smooth' });
}

function resumeMission() {
  const next = learningSummary(state.progress, MISSIONS).nextMissionIndex;
  selectMission(next === null ? 0 : next);
  document.querySelector('.mission-heading').scrollIntoView({ block: 'start', behavior: calmMotion() ? 'auto' : 'smooth' });
}

function answerReflection(choice) {
  const question = currentMission().reflection;
  if (!state.completed[state.missionIndex] || state.progress.understood[state.missionIndex]
    || state.status === 'running' || !Number.isInteger(choice) || choice < 0 || choice >= question.choices.length) return;
  state.reflectionChoice = choice;
  state.progress = recordReflection(state.progress, state.missionIndex, choice === question.correctIndex);
  state.completed = state.progress.completed;
  saveProgress();
  render();
  if (choice === question.correctIndex) {
    const explanation = document.querySelector('.reflection-feedback');
    explanation.tabIndex = -1;
    explanation.focus({ preventScroll: true });
  }
  feedback.play(choice === question.correctIndex ? 'pickup' : 'hint');
  feedback.speak(question.explanations[choice]);
}

function showSummary() {
  pauseProgram();
  state.summaryOpen = true;
  const summary = document.querySelector('#learning-summary');
  summary.open = true;
  summary.querySelector('summary').focus({ preventScroll: true });
  summary.scrollIntoView({ block: 'start', behavior: calmMotion() ? 'auto' : 'smooth' });
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
  document.querySelectorAll('.reflection-choice').forEach(button => { button.disabled = running || state.progress.understood[state.missionIndex]; });
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
  if (state.simulation.success) {
    state.progress = recordCompletion(state.progress, state.missionIndex);
    state.completed = state.progress.completed;
    saveProgress();
  }
  render();
  if (state.simulation.success) {
    celebrate(); feedback.play('success'); feedback.speak('Kasus terpecahkan! Buku sudah diantar.');
  } else {
    feedback.play('error'); feedback.speak('Belum tepat. Mari amati langkahnya dan coba lagi.');
  }
}

function nextMission() {
  if (state.missionIndex === MISSIONS.length - 1) { showSummary(); return; }
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
    if (action === 'open-help') { pauseProgram(); document.querySelector('#help-dialog').showModal(); }
    if (action === 'close-help') document.querySelector('#help-dialog').close();
    if (action === 'resume-mission' || action === 'resume-summary') resumeMission();
    if (action === 'select-stage') selectStage(Number(button.dataset.stage));
    if (action === 'jump-mission') {
      selectMission(Number(button.dataset.index));
      document.querySelector('.mission-heading').scrollIntoView({ block: 'start', behavior: calmMotion() ? 'auto' : 'smooth' });
    }
    if (action === 'answer-reflection') answerReflection(Number(button.dataset.choice));
    if (action === 'show-summary') showSummary();
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
  document.addEventListener('toggle', event => { if (event.target.id === 'learning-summary') state.summaryOpen = event.target.open; }, true);
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => { applyMotionPreference(); render(); });

  render();
}

export { COMMANDS, MISSIONS, STAGES, mapSize, simulate };
