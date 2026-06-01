const TIME_LOGS_KEY = 'talentforge_time_logs';

export interface TimeLog {
  id: string;
  contractId: string;
  freelancerId: string;
  type: 'manual' | 'timer';
  hours: number;
  minutes: number;
  memo?: string;
  date: string; // ISO date
  createdAt: string;
  approved?: boolean;
  approvedAt?: string;
  approvedBy?: string;
}

export interface TimerState {
  contractId: string;
  freelancerId: string;
  startedAt: string;
  memo?: string;
}

const TIMER_KEY = 'talentforge_active_timer';

export function getTimeLogs(contractId: string): TimeLog[] {
  try {
    const data = localStorage.getItem(TIME_LOGS_KEY);
    const all: TimeLog[] = data ? JSON.parse(data) : [];
    return all.filter((l) => l.contractId === contractId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function addTimeLog(log: Omit<TimeLog, 'id' | 'createdAt'>): TimeLog {
  const data = localStorage.getItem(TIME_LOGS_KEY);
  const all: TimeLog[] = data ? JSON.parse(data) : [];
  const entry: TimeLog = {
    ...log,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  all.push(entry);
  localStorage.setItem(TIME_LOGS_KEY, JSON.stringify(all));
  return entry;
}

export function approveTimeLog(id: string, approvedBy: string): TimeLog | null {
  const data = localStorage.getItem(TIME_LOGS_KEY);
  const all: TimeLog[] = data ? JSON.parse(data) : [];
  const idx = all.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  all[idx] = {
    ...all[idx],
    approved: true,
    approvedAt: new Date().toISOString(),
    approvedBy,
  };
  localStorage.setItem(TIME_LOGS_KEY, JSON.stringify(all));
  return all[idx];
}

export function getActiveTimer(): TimerState | null {
  try {
    const data = localStorage.getItem(TIMER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function startTimer(contractId: string, freelancerId: string, memo?: string): TimerState {
  const state: TimerState = { contractId, freelancerId, startedAt: new Date().toISOString(), memo };
  localStorage.setItem(TIMER_KEY, JSON.stringify(state));
  return state;
}

export function stopTimer(): TimerState | null {
  const state = getActiveTimer();
  if (!state) return null;
  localStorage.removeItem(TIMER_KEY);
  return state;
}

export function getTotalLoggedHours(contractId: string, approvedOnly = false): number {
  const logs = getTimeLogs(contractId);
  const filtered = approvedOnly ? logs.filter((l) => l.approved) : logs;
  return filtered.reduce((sum, l) => sum + l.hours + l.minutes / 60, 0);
}
