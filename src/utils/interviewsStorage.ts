const INTERVIEWS_KEY = 'talentforge_interviews';

export interface InterviewSlot {
  id: string;
  jobId: string;
  proposalId: string;
  clientId: string;
  freelancerId: string;
  proposedAt: string;
  proposedBy: 'client' | 'freelancer';
  status: 'pending' | 'accepted' | 'declined';
  notes?: string;
  createdAt: string;
}

export function getInterviews(filters?: { jobId?: string; clientId?: string; freelancerId?: string }): InterviewSlot[] {
  try {
    const data = localStorage.getItem(INTERVIEWS_KEY);
    const all: InterviewSlot[] = data ? JSON.parse(data) : [];
    if (!filters) return all;
    return all.filter((i) => {
      if (filters.jobId && i.jobId !== filters.jobId) return false;
      if (filters.clientId && i.clientId !== filters.clientId) return false;
      if (filters.freelancerId && i.freelancerId !== filters.freelancerId) return false;
      return true;
    });
  } catch {
    return [];
  }
}

export function createInterviewSlot(slot: Omit<InterviewSlot, 'id' | 'createdAt'>): InterviewSlot {
  const data = localStorage.getItem(INTERVIEWS_KEY);
  const all: InterviewSlot[] = data ? JSON.parse(data) : [];
  const s: InterviewSlot = { ...slot, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  all.push(s);
  localStorage.setItem(INTERVIEWS_KEY, JSON.stringify(all));
  return s;
}

export function updateInterviewStatus(id: string, status: 'accepted' | 'declined'): InterviewSlot | null {
  const data = localStorage.getItem(INTERVIEWS_KEY);
  const all: InterviewSlot[] = data ? JSON.parse(data) : [];
  const idx = all.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], status };
  localStorage.setItem(INTERVIEWS_KEY, JSON.stringify(all));
  return all[idx];
}
