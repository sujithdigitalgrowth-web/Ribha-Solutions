import { API_ENABLED } from '@/config/api';
import { addMilestoneApi, updateMilestoneStatusApi } from '@/services/dynamicDataApi';

const MILESTONES_KEY = 'talentforge_milestones';

export interface Milestone {
  id: string;
  contractId: string;
  jobId: string;
  title: string;
  description: string;
  amount: string;
  /** pending → submitted (freelancer requests) → completed (client approves) → paid (client releases); or cancelled */
  status: 'pending' | 'in_progress' | 'submitted' | 'completed' | 'paid' | 'cancelled';
  dueDate?: string;
  submittedAt?: string;
  completedAt?: string;
  paidAt?: string;
  cancelledAt?: string;
  order: number;
  createdAt: string;
}

export function getMilestones(contractId: string): Milestone[] {
  try {
    const data = localStorage.getItem(MILESTONES_KEY);
    const all: Milestone[] = data ? JSON.parse(data) : [];
    return all.filter((m) => m.contractId === contractId).sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

export function getMilestonesByJobId(jobId: string): Milestone[] {
  try {
    const data = localStorage.getItem(MILESTONES_KEY);
    const all: Milestone[] = data ? JSON.parse(data) : [];
    return all.filter((m) => m.jobId === jobId).sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

export function getAllMilestones(): Milestone[] {
  try {
    const data = localStorage.getItem(MILESTONES_KEY);
    const all: Milestone[] = data ? JSON.parse(data) : [];
    return all;
  } catch {
    return [];
  }
}

/** Add milestone locally and to API when enabled (client submits milestone after hire). */
export async function addMilestone(m: Omit<Milestone, 'id' | 'createdAt'>): Promise<Milestone> {
  if (API_ENABLED) {
    const res = await addMilestoneApi({
      contractId: m.contractId,
      jobId: m.jobId,
      title: m.title,
      description: m.description ?? '',
      amount: m.amount,
      order: m.order,
      dueDate: m.dueDate,
    });
    if (res.success && res.milestone && typeof res.milestone === 'object' && 'id' in res.milestone) {
      const apiMilestone = res.milestone as Milestone;
      const data = localStorage.getItem(MILESTONES_KEY);
      const all: Milestone[] = data ? JSON.parse(data) : [];
      all.push(apiMilestone);
      localStorage.setItem(MILESTONES_KEY, JSON.stringify(all));
      return apiMilestone;
    }
  }
  const data = localStorage.getItem(MILESTONES_KEY);
  const all: Milestone[] = data ? JSON.parse(data) : [];
  const milestone: Milestone = {
    ...m,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  all.push(milestone);
  localStorage.setItem(MILESTONES_KEY, JSON.stringify(all));
  return milestone;
}

export function updateMilestone(id: string, updates: Partial<Omit<Milestone, 'id' | 'contractId' | 'jobId' | 'createdAt'>>): Milestone | null {
  const data = localStorage.getItem(MILESTONES_KEY);
  const all: Milestone[] = data ? JSON.parse(data) : [];
  const idx = all.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates };
  localStorage.setItem(MILESTONES_KEY, JSON.stringify(all));
  return all[idx];
}

/** Freelancer requests clearance (client must then approve and release). Persists to API when enabled so status survives logout/login. */
export async function requestMilestoneClearance(id: string): Promise<Milestone | null> {
  const updated = updateMilestone(id, { status: 'submitted', submittedAt: new Date().toISOString() });
  if (updated && API_ENABLED) {
    await updateMilestoneStatusApi(id, 'submitted').catch(() => ({}));
  }
  return updated;
}

/** Client approves work (only after freelancer requested clearance). */
export function completeMilestone(id: string): Milestone | null {
  const updated = updateMilestone(id, { status: 'completed', completedAt: new Date().toISOString() });
  if (updated && API_ENABLED) {
    updateMilestoneStatusApi(id, 'completed').catch(() => {});
  }
  return updated;
}

/** Client releases payment to freelancer. */
export function releasePayment(id: string): Milestone | null {
  const updated = updateMilestone(id, { status: 'paid', paidAt: new Date().toISOString() });
  if (updated && API_ENABLED) {
    updateMilestoneStatusApi(id, 'paid').catch(() => {});
  }
  return updated;
}

/** Client (or freelancer) cancels a milestone. Only for pending/in_progress/submitted (not completed/paid). */
export async function cancelMilestone(id: string): Promise<Milestone | null> {
  const data = localStorage.getItem(MILESTONES_KEY);
  const all: Milestone[] = data ? JSON.parse(data) : [];
  const m = all.find((x) => x.id === id);
  if (!m || m.status === 'completed' || m.status === 'paid') return null;

  // If API is enabled, persist first so refresh/login uses API truth.
  if (API_ENABLED) {
    const res = await updateMilestoneStatusApi(id, 'cancelled').catch(() => ({ success: false } as { success: boolean; milestone?: unknown }));
    // If the milestone isn't in the API (e.g. locally-seeded data), still allow cancelling locally.
    if (!res.success) {
      return updateMilestone(id, { status: 'cancelled', cancelledAt: new Date().toISOString() });
    }
    const cancelledAt =
      res.milestone && typeof res.milestone === 'object' && 'cancelledAt' in res.milestone && typeof (res.milestone as { cancelledAt?: unknown }).cancelledAt === 'string'
        ? (res.milestone as { cancelledAt: string }).cancelledAt
        : new Date().toISOString();
    return updateMilestone(id, { status: 'cancelled', cancelledAt });
  }

  return updateMilestone(id, { status: 'cancelled', cancelledAt: new Date().toISOString() });
}
