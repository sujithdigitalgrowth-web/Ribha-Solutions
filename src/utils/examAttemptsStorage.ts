/**
 * Exam attempts storage (synced from API or updated after local submit).
 * Used to know if a freelancer has passed the exam so we don't show exam again after login.
 */
export const EXAM_ATTEMPTS_KEY = 'talentforge_exam_attempts_sync';
const EXAM_ATTEMPTS_SYNCED_KEY = 'talentforge_exam_attempts_synced';

export interface ExamAttempt {
  id?: string;
  userId: string;
  skillId: string;
  skillName: string;
  score: number;
  passed: boolean;
  passedAt: string;
}

function getMap(): Record<string, ExamAttempt[]> {
  try {
    const data = localStorage.getItem(EXAM_ATTEMPTS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function setMap(map: Record<string, ExamAttempt[]>) {
  localStorage.setItem(EXAM_ATTEMPTS_KEY, JSON.stringify(map));
}

function getSyncedMap(): Record<string, boolean> {
  try {
    const data = localStorage.getItem(EXAM_ATTEMPTS_SYNCED_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function setSyncedMap(map: Record<string, boolean>) {
  localStorage.setItem(EXAM_ATTEMPTS_SYNCED_KEY, JSON.stringify(map));
}

export function markSynced(userId: string): void {
  const map = getSyncedMap();
  map[userId] = true;
  setSyncedMap(map);
}

export function isSynced(userId: string): boolean {
  return !!getSyncedMap()[userId];
}

export function getAttempts(userId: string): ExamAttempt[] {
  return getMap()[userId] ?? [];
}

export function setAttempts(userId: string, attempts: ExamAttempt[]): void {
  const map = getMap();
  map[userId] = attempts;
  setMap(map);
  markSynced(userId);
}

export function addAttempt(userId: string, attempt: ExamAttempt): void {
  const map = getMap();
  const list = map[userId] ?? [];
  list.unshift(attempt);
  map[userId] = list;
  setMap(map);
  markSynced(userId);
}

export function hasPassed(userId: string): boolean {
  return getAttempts(userId).some((a) => a.passed);
}
