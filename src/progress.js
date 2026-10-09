// Local, anonymous progress. Keep this key so the original six missions migrate.
export const PROGRESS_KEY = 'detektif-bug-progress-v1';

function missionCount(missions) {
  return Array.isArray(missions) ? missions.length : 0;
}

function availableStorage(storage) {
  if (storage !== undefined) return storage;
  // Access to localStorage itself may throw in private/restricted browser modes.
  try { return globalThis.localStorage; } catch { return null; }
}

export function emptyProgress(missions) {
  const count = missionCount(missions);
  return {
    completed: Array(count).fill(false),
    understood: Array(count).fill(false),
    lastMissionIndex: 0,
  };
}

export function isUnlocked(index, completed) {
  if (!Array.isArray(completed) || !Number.isInteger(index)
    || index < 0 || index >= completed.length) return false;
  // Preserve access to a previously completed mission even if old data has gaps.
  return index === 0 || completed[index] === true || completed[index - 1] === true;
}

function normalizeProgress(value, count) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const savedCompleted = Array.isArray(source.completed) ? source.completed : [];
  const savedUnderstood = Array.isArray(source.understood) ? source.understood : [];
  // Only literal true counts. Strings such as "false" must never unlock missions.
  // Do not fill gaps or erase real completed flags from the original version.
  const completed = Array.from({ length: count }, (_, index) => savedCompleted[index] === true);
  const understood = completed.map((done, index) => done && savedUnderstood[index] === true);
  const next = completed.findIndex((done) => !done);
  const lastMissionIndex = isUnlocked(source.lastMissionIndex, completed)
    ? source.lastMissionIndex : Math.max(0, next);
  return { completed, understood, lastMissionIndex };
}

export function readProgress(missions, storage) {
  const empty = emptyProgress(missions);
  try {
    const target = availableStorage(storage);
    if (!target || typeof target.getItem !== 'function') return empty;
    const saved = target.getItem(PROGRESS_KEY);
    if (saved === null || saved === undefined) return empty;
    return normalizeProgress(JSON.parse(saved), empty.completed.length);
  } catch {
    // The game still works when saved data is damaged or storage is unavailable.
    return empty;
  }
}

export function writeProgress(progress, storage) {
  try {
    const target = availableStorage(storage);
    if (!target || typeof target.setItem !== 'function' || !Array.isArray(progress?.completed)) return false;
    const safe = normalizeProgress(progress, progress.completed.length);
    target.setItem(PROGRESS_KEY, JSON.stringify(safe));
    return true;
  } catch {
    return false;
  }
}

export function recordCompletion(progress, index) {
  const count = Array.isArray(progress?.completed) ? progress.completed.length : 0;
  const next = normalizeProgress(progress, count);
  if (Number.isInteger(index) && index >= 0 && index < count) next.completed[index] = true;
  return next;
}

export function recordReflection(progress, index, correct) {
  const count = Array.isArray(progress?.completed) ? progress.completed.length : 0;
  const next = normalizeProgress(progress, count);
  if (Number.isInteger(index) && index >= 0 && index < count
    && next.completed[index] && correct === true) next.understood[index] = true;
  // A later wrong answer never removes a concept answer already recorded correct.
  return next;
}

export function earnedBadges(progress, stages) {
  const completed = Array.isArray(progress?.completed) ? progress.completed : [];
  if (!Array.isArray(stages)) return [];
  return stages.filter((stage) => {
    if (!stage || !(typeof stage.id === 'string' || (typeof stage.id === 'number' && Number.isFinite(stage.id)))
      || !Array.isArray(stage.missionIds) || stage.missionIds.length === 0) return false;
    // Mission ids are the stable, one-based ids used by the mission definitions.
    return stage.missionIds.every((id) => Number.isInteger(id) && id >= 1
      && id <= completed.length && completed[id - 1] === true);
  }).map((stage) => stage.id);
}

export function learningSummary(progress, missions) {
  const normalized = normalizeProgress(progress, missionCount(missions));
  const next = normalized.completed.findIndex((done) => !done);
  return {
    completed: normalized.completed.filter((done) => done).length,
    total: normalized.completed.length,
    understood: normalized.understood.filter((correct) => correct).length,
    nextMissionIndex: next < 0 ? null : next,
  };
}
