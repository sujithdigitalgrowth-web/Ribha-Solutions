const TALENT_SHORTLIST_KEY = 'talentforge_talent_shortlist';

export interface ShortlistEntry {
  id: string;
  clientId: string;
  freelancerId: string;
  freelancerName: string;
  notes?: string;
  createdAt: string;
}

export function getShortlist(clientId: string): ShortlistEntry[] {
  try {
    const data = localStorage.getItem(TALENT_SHORTLIST_KEY);
    const all: ShortlistEntry[] = data ? JSON.parse(data) : [];
    return all.filter((e) => e.clientId === clientId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function isShortlisted(clientId: string, freelancerId: string): boolean {
  return getShortlist(clientId).some((e) => e.freelancerId === freelancerId);
}

export function addToShortlist(entry: Omit<ShortlistEntry, 'id' | 'createdAt'>): ShortlistEntry {
  const data = localStorage.getItem(TALENT_SHORTLIST_KEY);
  const all: ShortlistEntry[] = data ? JSON.parse(data) : [];
  const existing = all.find((e) => e.clientId === entry.clientId && e.freelancerId === entry.freelancerId);
  if (existing) return existing;
  const e: ShortlistEntry = { ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  all.push(e);
  localStorage.setItem(TALENT_SHORTLIST_KEY, JSON.stringify(all));
  return e;
}

export function removeFromShortlist(id: string): void {
  const data = localStorage.getItem(TALENT_SHORTLIST_KEY);
  const all: ShortlistEntry[] = data ? JSON.parse(data) : [];
  const filtered = all.filter((e) => e.id !== id);
  localStorage.setItem(TALENT_SHORTLIST_KEY, JSON.stringify(filtered));
}

export function removeFromShortlistByFreelancer(clientId: string, freelancerId: string): void {
  const data = localStorage.getItem(TALENT_SHORTLIST_KEY);
  const all: ShortlistEntry[] = data ? JSON.parse(data) : [];
  const filtered = all.filter((e) => !(e.clientId === clientId && e.freelancerId === freelancerId));
  localStorage.setItem(TALENT_SHORTLIST_KEY, JSON.stringify(filtered));
}

export function updateShortlistNote(id: string, notes: string): ShortlistEntry | null {
  const data = localStorage.getItem(TALENT_SHORTLIST_KEY);
  const all: ShortlistEntry[] = data ? JSON.parse(data) : [];
  const idx = all.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], notes };
  localStorage.setItem(TALENT_SHORTLIST_KEY, JSON.stringify(all));
  return all[idx];
}
