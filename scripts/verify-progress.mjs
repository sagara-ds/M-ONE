import assert from 'node:assert/strict';
import {
  PROGRESS_KEY, emptyProgress, readProgress, writeProgress, isUnlocked,
  recordCompletion, recordReflection, earnedBadges, learningSummary,
} from '../src/progress.js';

const missions = Array.from({ length: 12 }, (_, index) => ({ id: index + 1 }));
const stages = [
  { id: 'urutan', missionIds: [1, 2, 3, 4] },
  { id: 'pola', missionIds: [5, 6, 7, 8] },
  { id: 'rute', missionIds: [9, 10, 11, 12] },
];
function memoryStorage(value = null) {
  return {
    value,
    getItem(key) { assert.equal(key, PROGRESS_KEY); return this.value; },
    setItem(key, saved) { assert.equal(key, PROGRESS_KEY); this.value = saved; },
  };
}

const empty = emptyProgress(missions);
assert.deepEqual(empty, {
  completed: Array(12).fill(false), understood: Array(12).fill(false), lastMissionIndex: 0,
});
assert.notEqual(empty.completed, empty.understood);

// All six old mission flags survive, and mission seven opens without invented answers.
const migrated = readProgress(missions, memoryStorage(JSON.stringify({ completed: Array(6).fill(true) })));
assert.deepEqual(migrated.completed, [...Array(6).fill(true), ...Array(6).fill(false)]);
assert.deepEqual(migrated.understood, Array(12).fill(false));
assert.equal(migrated.lastMissionIndex, 6);
assert.equal(isUnlocked(6, migrated.completed), true);
assert.equal(isUnlocked(7, migrated.completed), false);

// Preserve genuine old completions after a gap; strings/numbers do not earn progress.
const hole = readProgress(missions, memoryStorage(JSON.stringify({
  completed: [true, false, true, 'false', 1, 'true'],
  understood: [true, true, true, true], lastMissionIndex: 10,
})));
assert.deepEqual(hole.completed.slice(0, 6), [true, false, true, false, false, false]);
assert.deepEqual(hole.understood.slice(0, 6), [true, false, true, false, false, false]);
assert.equal(hole.lastMissionIndex, 1);
assert.equal(isUnlocked(2, hole.completed), true);
assert.equal(isUnlocked(3, hole.completed), true);
assert.equal(isUnlocked(4, hole.completed), false);
for (const index of [-1, 12, 50, 1.5, '1', NaN]) assert.equal(isUnlocked(index, hole.completed), false);
assert.equal(isUnlocked(0, []), false);

const truncated = readProgress(missions, memoryStorage(JSON.stringify({
  completed: Array(20).fill(true), understood: Array(20).fill(true), lastMissionIndex: 11,
})));
assert.equal(truncated.completed.length, 12);
assert.equal(truncated.understood.length, 12);
assert.equal(truncated.lastMissionIndex, 11);

for (const value of ['{broken', 'null', '[]', '42', '{}', '{"completed":"yes"}']) {
  assert.deepEqual(readProgress(missions, memoryStorage(value)), empty);
}
assert.deepEqual(readProgress(missions, null), empty);
const privateStorage = { getItem() { throw Error('denied'); }, setItem() { throw Error('denied'); } };
assert.deepEqual(readProgress(missions, privateStorage), empty);
assert.equal(writeProgress(migrated, privateStorage), false);
assert.equal(writeProgress(migrated, null), false);
assert.equal(writeProgress(null, memoryStorage()), false);

// The localStorage getter can throw before getItem; the default must still be safe.
const oldDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
try {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw Error('unavailable'); } });
  assert.deepEqual(readProgress(missions), empty);
  assert.equal(writeProgress(migrated), false);
} finally {
  if (oldDescriptor) Object.defineProperty(globalThis, 'localStorage', oldDescriptor);
  else delete globalThis.localStorage;
}

const frozen = Object.freeze({
  completed: Object.freeze([...empty.completed]),
  understood: Object.freeze([...empty.understood]), lastMissionIndex: 0,
});
const firstDone = recordCompletion(frozen, 0);
assert.equal(firstDone.completed[0], true);
assert.equal(frozen.completed[0], false);
assert.notEqual(firstDone.completed, frozen.completed);
assert.notEqual(firstDone.understood, frozen.understood);
for (const index of [-1, 12, 0.5, '0']) {
  assert.deepEqual(recordCompletion(frozen, index), frozen);
  assert.deepEqual(recordReflection(frozen, index, true), frozen);
}
assert.equal(recordReflection(firstDone, 1, true).understood[1], false);
assert.equal(recordReflection(firstDone, 0, 'true').understood[0], false);
const firstUnderstood = recordReflection(firstDone, 0, true);
assert.equal(firstUnderstood.understood[0], true);
assert.equal(firstDone.understood[0], false);
assert.equal(recordReflection(firstUnderstood, 0, false).understood[0], true);
assert.deepEqual(recordCompletion(firstUnderstood, 0), firstUnderstood);

let stageProgress = emptyProgress(missions);
for (let index = 0; index < 3; index += 1) stageProgress = recordCompletion(stageProgress, index);
assert.deepEqual(earnedBadges(stageProgress, stages), []);
stageProgress = recordCompletion(stageProgress, 3);
assert.deepEqual(earnedBadges(stageProgress, stages), ['urutan']);
for (let index = 4; index < 8; index += 1) stageProgress = recordCompletion(stageProgress, index);
assert.deepEqual(earnedBadges(stageProgress, stages), ['urutan', 'pola']);
assert.deepEqual(earnedBadges(stageProgress, [
  { id: 'empty', missionIds: [] }, { id: 'bad', missionIds: [0] },
  { id: 'outside', missionIds: [13] }, { id: 'string', missionIds: ['1'] },
]), []);
for (let index = 8; index < 12; index += 1) stageProgress = recordCompletion(stageProgress, index);
assert.deepEqual(earnedBadges(stageProgress, stages), ['urutan', 'pola', 'rute']);
assert.deepEqual(learningSummary(stageProgress, missions), {
  completed: 12, total: 12, understood: 0, nextMissionIndex: null,
});
assert.deepEqual(learningSummary(hole, missions), {
  completed: 2, total: 12, understood: 2, nextMissionIndex: 1,
});

const storage = memoryStorage();
assert.equal(writeProgress(firstUnderstood, storage), true);
assert.deepEqual(readProgress(missions, storage), firstUnderstood);
// Persist only the documented progress shape, without unrelated user data.
assert.equal(writeProgress({ ...firstUnderstood, name: 'must not persist' }, storage), true);
assert.deepEqual(Object.keys(JSON.parse(storage.value)).sort(), ['completed', 'lastMissionIndex', 'understood']);

console.log('Progress checks passed: six-mission migration, strict flags, storage failures, unlocks, immutable updates, reflection replay, badges, summary, and persistence.');
