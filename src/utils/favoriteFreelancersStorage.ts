const FAVORITES_KEY = 'talentforge_favorite_freelancers';

export interface FavoriteFreelancer {
  freelancerId: string;
  notes?: string;
  savedAt: string;
}

function getRaw(): Record<string, FavoriteFreelancer[]> {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    const parsed = data ? JSON.parse(data) : {};
    const result: Record<string, FavoriteFreelancer[]> = {};
    for (const [clientId, val] of Object.entries(parsed)) {
      result[clientId] = Array.isArray(val) ? (val as FavoriteFreelancer[]) : [];
    }
    return result;
  } catch {
    return {};
  }
}

function save(raw: Record<string, FavoriteFreelancer[]>) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(raw));
}

export function getFavorites(clientId: string): FavoriteFreelancer[] {
  const raw = getRaw();
  return (raw[clientId] || []).sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

export function isFavorite(freelancerId: string, clientId: string): boolean {
  return getFavorites(clientId).some((f) => f.freelancerId === freelancerId);
}

export function addFavorite(clientId: string, freelancerId: string, notes?: string): void {
  const raw = getRaw();
  const list = raw[clientId] || [];
  if (list.some((f) => f.freelancerId === freelancerId)) return;
  list.push({ freelancerId, notes, savedAt: new Date().toISOString() });
  raw[clientId] = list;
  save(raw);
}

export function removeFavorite(clientId: string, freelancerId: string): void {
  const raw = getRaw();
  const list = (raw[clientId] || []).filter((f) => f.freelancerId !== freelancerId);
  raw[clientId] = list;
  save(raw);
}

export function toggleFavorite(clientId: string, freelancerId: string, notes?: string): boolean {
  const isFav = isFavorite(freelancerId, clientId);
  if (isFav) {
    removeFavorite(clientId, freelancerId);
    return false;
  }
  addFavorite(clientId, freelancerId, notes);
  return true;
}

export function updateFavoriteNote(clientId: string, freelancerId: string, notes: string): void {
  const raw = getRaw();
  const list = raw[clientId] || [];
  const entry = list.find((f) => f.freelancerId === freelancerId);
  if (entry) entry.notes = notes;
  raw[clientId] = list;
  save(raw);
}
