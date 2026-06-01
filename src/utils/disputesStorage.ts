const DISPUTES_KEY = 'talentforge_disputes';

export type DisputeStatus = 'open' | 'in_review' | 'resolved';

export interface Dispute {
  id: string;
  contractId: string;
  jobId: string;
  reporterId: string;
  reporterRole: 'client' | 'freelancer';
  subject: string;
  description: string;
  status: DisputeStatus;
  notes: Array<{ authorId: string; text: string; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
}

export function getDisputes(filters?: { contractId?: string; jobId?: string; reporterId?: string }): Dispute[] {
  try {
    const data = localStorage.getItem(DISPUTES_KEY);
    const all: Dispute[] = data ? JSON.parse(data) : [];
    if (!filters) return all;
    return all.filter((d) => {
      if (filters.contractId && d.contractId !== filters.contractId) return false;
      if (filters.jobId && d.jobId !== filters.jobId) return false;
      if (filters.reporterId && d.reporterId !== filters.reporterId) return false;
      return true;
    });
  } catch {
    return [];
  }
}

export function getDisputeById(id: string): Dispute | null {
  return getDisputes().find((d) => d.id === id) ?? null;
}

export function createDispute(d: Omit<Dispute, 'id' | 'notes' | 'createdAt' | 'updatedAt'>): Dispute {
  const data = localStorage.getItem(DISPUTES_KEY);
  const all: Dispute[] = data ? JSON.parse(data) : [];
  const now = new Date().toISOString();
  const dispute: Dispute = {
    ...d,
    id: crypto.randomUUID(),
    notes: [],
    createdAt: now,
    updatedAt: now,
  };
  all.push(dispute);
  localStorage.setItem(DISPUTES_KEY, JSON.stringify(all));
  return dispute;
}

export function updateDisputeStatus(id: string, status: DisputeStatus): Dispute | null {
  const data = localStorage.getItem(DISPUTES_KEY);
  const all: Dispute[] = data ? JSON.parse(data) : [];
  const idx = all.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], status, updatedAt: new Date().toISOString() };
  localStorage.setItem(DISPUTES_KEY, JSON.stringify(all));
  return all[idx];
}

export function addDisputeNote(id: string, authorId: string, text: string): Dispute | null {
  const data = localStorage.getItem(DISPUTES_KEY);
  const all: Dispute[] = data ? JSON.parse(data) : [];
  const idx = all.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  const note = { authorId, text, createdAt: new Date().toISOString() };
  all[idx].notes.push(note);
  all[idx].updatedAt = new Date().toISOString();
  localStorage.setItem(DISPUTES_KEY, JSON.stringify(all));
  return all[idx];
}
