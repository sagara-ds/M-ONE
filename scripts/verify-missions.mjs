import assert from 'node:assert/strict';
import { COMMANDS, MISSIONS, simulate } from '../src/app.js';
import { STAGES, mapSize } from '../src/missions.js';

let passed = 0;
const failures = [];
function check(name, test) {
  try {
    test();
    passed += 1;
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
  }
}

check('Tersedia dua belas misi dengan ID berurutan', () => {
  assert.deepEqual(MISSIONS.map(({ id }) => id), Array.from({ length: 12 }, (_, index) => index + 1));
});

check('Enam misi lama mempertahankan identitas, posisi, dan programnya', () => {
  const original = [
    { id: 1, start: { x: 0, y: 2, dir: 0 }, book: { x: 2, y: 2 }, target: { x: 3, y: 2 },
      solution: ['forward', 'forward', 'pickup', 'forward', 'deliver'],
      initial: ['forward', 'right', 'pickup', 'forward', 'deliver'] },
    { id: 2, start: { x: 0, y: 3, dir: 0 }, book: { x: 1, y: 3 }, target: { x: 1, y: 1 },
      solution: ['forward', 'pickup', 'left', 'forward', 'forward', 'deliver'],
      initial: ['forward', 'pickup', 'right', 'forward', 'forward', 'deliver'] },
    { id: 3, start: { x: 0, y: 2, dir: 0 }, book: { x: 3, y: 2 }, target: { x: 4, y: 2 },
      solution: ['loop3', 'pickup', 'forward', 'deliver'],
      initial: ['loop2', 'pickup', 'forward', 'deliver'] },
    { id: 4, start: { x: 0, y: 3, dir: 0 }, book: { x: 0, y: 1 }, target: { x: 3, y: 1 },
      solution: ['left', 'loop2', 'pickup', 'right', 'loop3', 'deliver'],
      initial: ['left', 'loop2', 'pickup', 'left', 'loop3', 'deliver'] },
    { id: 5, start: { x: 0, y: 2, dir: 0 }, book: { x: 2, y: 2 }, target: { x: 2, y: 0 },
      solution: ['forward', 'forward', 'pickup', 'left', 'loop2', 'deliver'],
      initial: ['forward', 'left', 'pickup', 'loop2', 'deliver'] },
    { id: 6, start: { x: 0, y: 3, dir: 0 }, book: { x: 2, y: 3 }, target: { x: 4, y: 1 },
      solution: ['loop2', 'pickup', 'left', 'loop2', 'right', 'loop2', 'deliver'],
      initial: ['loop2', 'pickup', 'left', 'loop3', 'right', 'loop2', 'deliver'] },
  ];
  assert.deepEqual(MISSIONS.slice(0, 6).map(({ id, start, book, target, solution, initial }) =>
    ({ id, start, book, target, solution, initial })), original);
});

for (const mission of MISSIONS) {
  check(`Misi ${mission.id}: solusi mengantar buku`, () => {
    const result = simulate(mission.solution, mission);
    assert.equal(result.success, true, result.error);
    assert.equal(result.end.delivered, true);
    assert.equal(result.end.x, mission.target.x);
    assert.equal(result.end.y, mission.target.y);
    assert.ok(result.steps.every(({ robot }) => !robot.invalid));
  });
  check(`Misi ${mission.id}: program awal belum berhasil`, () => {
    assert.equal(simulate(mission.initial, mission).success, false);
    assert.ok([...mission.initial, ...mission.solution].every(command => Object.hasOwn(COMMANDS, command)), 'Program hanya memakai kartu yang tersedia.');
    assert.equal(mission.hints.length, 3);
    assert.ok(mission.hints.every((hint) => typeof hint === 'string' && hint.length > 0));
  });
  check(`Misi ${mission.id}: pertanyaan konsep memiliki jawaban dan penjelasan`, () => {
    const reflection = mission.reflection;
    assert.equal(typeof reflection?.question, 'string');
    assert.ok(reflection.question.trim().length > 0);
    assert.equal(reflection.choices.length, 3);
    assert.ok(reflection.choices.every(choice => typeof choice === 'string' && choice.trim().length > 0));
    assert.equal(new Set(reflection.choices).size, 3, 'Pilihan harus dapat dibedakan.');
    assert.ok(Number.isInteger(reflection.correctIndex) && reflection.correctIndex >= 0 && reflection.correctIndex < 3);
    assert.equal(reflection.explanations.length, 3);
    assert.ok(reflection.explanations.every(explanation => typeof explanation === 'string' && explanation.trim().length > 0));
  });
}

check('Tiga stage masing-masing berisi empat misi berurutan', () => {
  assert.deepEqual(STAGES.map(({ id }) => id), [1, 2, 3]);
  for (const stage of STAGES) {
    const ids = MISSIONS.filter(mission => mission.stageId === stage.id).map(({ id }) => id);
    assert.deepEqual(ids, Array.from({ length: 4 }, (_, index) => (stage.id - 1) * 4 + index + 1));
  }
});

check('Semua posisi, dinding, dan jejak simulasi berada di peta tanpa menembus rak', () => {
  for (const mission of MISSIONS) {
    const { width, height } = mapSize(mission);
    assert.ok(Number.isInteger(width) && width > 0 && Number.isInteger(height) && height > 0);
    const onMap = ({ x, y }) => Number.isInteger(x) && x >= 0 && x < width && Number.isInteger(y) && y >= 0 && y < height;
    const occupied = new Set(mission.walls.map(({ x, y }) => `${x},${y}`));
    assert.equal(occupied.size, mission.walls.length, `Misi ${mission.id}: rak tidak berulang.`);
    for (const position of [mission.start, mission.book, mission.target, ...mission.walls]) {
      assert.ok(onMap(position), `Misi ${mission.id}: posisi di luar peta.`);
    }
    for (const position of [mission.start, mission.book, mission.target]) {
      assert.ok(!occupied.has(`${position.x},${position.y}`), `Misi ${mission.id}: start/buku/tujuan tidak di dalam rak.`);
    }
    for (const program of [mission.solution, mission.initial]) {
      for (const { robot } of simulate(program, mission).steps) {
        assert.ok(onMap(robot), `Misi ${mission.id}: robot keluar dari peta.`);
        assert.ok(!occupied.has(`${robot.x},${robot.y}`), `Misi ${mission.id}: robot menembus rak.`);
      }
    }
  }
});

check('Semua misi menerima program alternatif yang menghasilkan pengantaran benar', () => {
  for (const mission of MISSIONS) {
    const expanded = mission.solution.flatMap(command => COMMANDS[command].repeat
      ? Array(COMMANDS[command].repeat).fill('forward') : [command]);
    const result = simulate(['left', 'left', 'left', 'left', ...expanded], mission);
    assert.equal(result.success, true, `Misi ${mission.id}: ${result.error}`);
  }
});

check('Rak pada misi nyata menahan robot yang mencoba maju ke dalamnya', () => {
  const vectors = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  let checked = 0;
  for (const mission of MISSIONS) {
    const { width, height } = mapSize(mission);
    const walls = new Set(mission.walls.map(({ x, y }) => `${x},${y}`));
    for (const wall of mission.walls) {
      for (const [dir, [dx, dy]] of vectors.entries()) {
        const start = { x: wall.x - dx, y: wall.y - dy, dir };
        if (start.x < 0 || start.x >= width || start.y < 0 || start.y >= height || walls.has(`${start.x},${start.y}`)) continue;
        const result = simulate(['forward'], { ...mission, start });
        assert.equal(result.end.x, start.x);
        assert.equal(result.end.y, start.y);
        assert.equal(result.end.invalid, true);
        assert.equal(result.success, false);
        checked += 1;
      }
    }
  }
  assert.ok(checked > 0, 'Misi baru memuat rak penghalang yang dapat didekati.');
});

const basic = MISSIONS[0];
check('Ukuran bawaan misi lama tetap lima kolom dan empat baris', () => {
  for (const mission of MISSIONS.slice(0, 6)) assert.deepEqual(mapSize(mission), { width: 5, height: 4 });
});

const extended = { ...basic, size: { width: 6, height: 5 }, walls: [] };
check('Peta yang lebih besar dapat mencapai kolom dan baris tambahan', () => {
  const mission = { ...extended, start: { x: 4, y: 3, dir: 0 }, book: { x: 5, y: 3 }, target: { x: 5, y: 4 } };
  const result = simulate(['forward', 'pickup', 'right', 'forward', 'deliver'], mission);
  assert.deepEqual(mapSize(mission), { width: 6, height: 5 });
  assert.equal(result.success, true, result.error);
  assert.equal(result.end.x, 5);
  assert.equal(result.end.y, 4);
});

for (const [name, start] of [
  ['kanan', { x: 5, y: 3, dir: 0 }],
  ['bawah', { x: 3, y: 4, dir: 1 }],
  ['kiri', { x: 0, y: 3, dir: 2 }],
  ['atas', { x: 3, y: 0, dir: 3 }],
]) {
  check(`Tepi ${name} mengikuti ukuran peta yang lebih besar`, () => {
    const result = simulate(['forward'], { ...extended, start });
    assert.equal(result.end.x, start.x);
    assert.equal(result.end.y, start.y);
    assert.equal(result.end.invalid, true);
    assert.equal(result.success, false);
  });
}

check('Pengulangan menahan posisi ketika langkah berikutnya terhalang rak', () => {
  const mission = { ...extended, start: { x: 0, y: 1, dir: 0 }, walls: [{ x: 2, y: 1 }] };
  const result = simulate(['loop3'], mission);
  assert.deepEqual(result.steps.map(({ robot }) => [robot.x, robot.y]), [[0, 1], [1, 1], [1, 1], [1, 1]]);
  assert.deepEqual(result.steps.map(({ robot }) => robot.invalid), [false, false, true, true]);
  assert.equal(result.success, false);
});

check('Robot dapat mengambil rute memutar yang tidak menembus rak', () => {
  const mission = { ...basic, walls: [{ x: 1, y: 2 }] };
  const result = simulate(['left', 'forward', 'right', 'loop2', 'right', 'forward', 'pickup', 'left', 'forward', 'deliver'], mission);
  assert.equal(result.success, true, result.error);
  assert.ok(result.steps.every(({ robot }) => robot.x !== 1 || robot.y !== 2));
});

check('Jejak misi pertama mengikuti urutan tiap kartu', () => {
  const result = simulate(basic.solution, basic);
  assert.deepEqual(result.steps.map(({ robot }) => [robot.x, robot.y]), [
    [0, 2], [1, 2], [2, 2], [2, 2], [3, 2], [3, 2],
  ]);
  assert.deepEqual(result.steps.map(({ robot }) => robot.carrying), [false, false, false, true, true, true]);
  assert.deepEqual(result.steps.map(({ robot }) => robot.delivered), [false, false, false, false, false, true]);
});

check('Pengulangan menampilkan setiap gerakan atomik', () => {
  const result = simulate(['loop3'], MISSIONS[2]);
  assert.deepEqual(result.steps.slice(1).map(({ robot }) => [robot.x, robot.y]), [[1, 2], [2, 2], [3, 2]]);
  assert.deepEqual(result.steps.slice(1).map(({ command, repeatIndex, repeatTotal }) => [command, repeatIndex, repeatTotal]), [
    ['loop3', 1, 3], ['loop3', 2, 3], ['loop3', 3, 3],
  ]);
  assert.deepEqual(result.end, simulate(['forward', 'forward', 'forward'], MISSIONS[2]).end);
});

check('Setiap langkah menunjuk kartu asal, termasuk pengulangan', () => {
  const result = simulate(['loop3', 'pickup', 'forward', 'deliver'], MISSIONS[2]);
  assert.deepEqual(result.steps.slice(1).map(({ programIndex }) => programIndex), [0, 0, 0, 1, 2, 3]);
});

check('Keberhasilan berasal dari simulasi, termasuk program alternatif', () => {
  const result = simulate(['loop2', 'pickup', 'forward', 'deliver'], basic);
  assert.equal(result.success, true, result.error);
});

check('Belok kiri dan kanan mengubah arah serta gerak berikutnya', () => {
  const mission = { ...basic, start: { x: 2, y: 2, dir: 0 } };
  assert.deepEqual(simulate(['left', 'forward'], mission).steps.map(({ robot }) => [robot.x, robot.y, robot.dir]), [
    [2, 2, 0], [2, 2, 3], [2, 1, 3],
  ]);
  assert.deepEqual(simulate(['right', 'forward'], mission).steps.map(({ robot }) => [robot.x, robot.y, robot.dir]), [
    [2, 2, 0], [2, 2, 1], [2, 3, 1],
  ]);
  assert.equal(simulate(['left', 'left', 'left', 'left'], mission).end.dir, 0);
  assert.equal(simulate(['right', 'right', 'right', 'right'], mission).end.dir, 0);
});

for (const [name, start] of [
  ['kanan', { x: 4, y: 2, dir: 0 }],
  ['bawah', { x: 2, y: 3, dir: 1 }],
  ['kiri', { x: 0, y: 2, dir: 2 }],
  ['atas', { x: 2, y: 0, dir: 3 }],
]) {
  check(`Tepi ${name} menahan posisi dan menandai kesalahan`, () => {
    const result = simulate(['forward'], { ...basic, start });
    assert.equal(result.end.x, start.x);
    assert.equal(result.end.y, start.y);
    assert.equal(result.end.invalid, true);
    assert.equal(result.success, false);
    assert.match(result.error, /tepi peta/);
  });
}

check('Pengulangan tidak melewati tepi walau sebagian langkah valid', () => {
  const result = simulate(['loop3'], { ...basic, start: { x: 3, y: 2, dir: 0 } });
  assert.deepEqual(result.steps.map(({ robot }) => robot.x), [3, 4, 4, 4]);
  assert.deepEqual(result.steps.map(({ robot }) => robot.invalid), [false, false, true, true]);
  assert.equal(result.success, false);
});

check('Ambil buku di tempat salah gagal tanpa membawa buku', () => {
  const result = simulate(['pickup'], basic);
  assert.equal(result.end.carrying, false);
  assert.equal(result.end.invalid, true);
  assert.equal(result.success, false);
  assert.match(result.error, /Buku belum/);
});

check('Mengantar memerlukan buku dan petak perpustakaan', () => {
  const noBook = simulate(['forward', 'forward', 'forward', 'deliver'], basic);
  assert.equal(noBook.end.delivered, false);
  assert.equal(noBook.success, false);
  const wrongPlace = simulate(['forward', 'forward', 'pickup', 'deliver'], basic);
  assert.equal(wrongPlace.end.carrying, true);
  assert.equal(wrongPlace.end.delivered, false);
  assert.equal(wrongPlace.success, false);
});

check('Kesalahan awal tetap membuat seluruh percobaan belum berhasil', () => {
  const result = simulate(['pickup', ...basic.solution], basic);
  assert.equal(result.end.delivered, true);
  assert.equal(result.end.invalid, true);
  assert.equal(result.success, false);
});

check('Program kosong memiliki satu keadaan awal dan belum berhasil', () => {
  const result = simulate([], basic);
  assert.equal(result.steps.length, 1);
  assert.equal(result.steps[0].command, 'start');
  assert.equal(result.success, false);
  assert.equal(result.end.x, basic.start.x);
  assert.equal(result.end.y, basic.start.y);
});

check('Simulasi tidak mengubah input dan menyimpan snapshot langkah terpisah', () => {
  const mission = structuredClone(basic);
  const program = [...mission.solution];
  const before = JSON.stringify({ mission, program });
  const result = simulate(program, mission);
  assert.equal(JSON.stringify({ mission, program }), before);
  assert.equal(new Set(result.steps.map(({ robot }) => robot)).size, result.steps.length);
  const firstX = result.steps[0].robot.x;
  result.steps.at(-1).robot.x = 99;
  assert.equal(result.steps[0].robot.x, firstX);
});

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Pemeriksaan mesin simulasi lulus: ${passed} kasus untuk ${MISSIONS.length} misi, stage, pertanyaan konsep, urutan, pengulangan, ukuran peta, rak penghalang, dan hasil akhir.`);
}
