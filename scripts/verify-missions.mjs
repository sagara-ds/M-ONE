import { MISSIONS, simulate } from '../src/app.js';

const failures = [];

MISSIONS.forEach((mission) => {
  const solved = simulate(mission.solution, mission);
  const buggy = simulate(mission.initial, mission);
  if (!solved.success) failures.push(`Misi ${mission.id} tidak berhasil dengan solusi: ${solved.error}`);
  if (buggy.success) failures.push(`Misi ${mission.id} tidak memiliki keadaan awal yang salah.`);
  if (mission.hints.length !== 3) failures.push(`Misi ${mission.id} tidak memiliki tiga petunjuk bertahap.`);
});

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Smoke test mesin simulasi lulus: ${MISSIONS.length} misi, solusi benar dan program awal salah.`);
}
