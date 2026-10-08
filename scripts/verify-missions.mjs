import assert from 'node:assert/strict';
import { MISSIONS, simulate } from '../src/app.js';

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
    assert.equal(mission.hints.length, 3);
    assert.ok(mission.hints.every((hint) => typeof hint === 'string' && hint.length > 0));
  });
}

const basic = MISSIONS[0];
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
  console.log(`Pemeriksaan mesin simulasi lulus: ${passed} kasus untuk ${MISSIONS.length} misi, urutan, pengulangan, batas peta, dan hasil akhir.`);
}
