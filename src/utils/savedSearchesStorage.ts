const SAVED_SEARCHES_KEY = 'talentforge_saved_searches';

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  searchQuery: string;
  category: string;
  projectType: 'all' | 'fixed' | 'hourly';
  skills: string[];
  postedWithin: 'all' | '24h' | '7d';
  urgentOnly: boolean;
  notifyOnMatch: boolean;
  matchCount?: number;
  lastCheckedAt?: string;
  createdAt: string;
}

export function getSavedSearches(userId: string): SavedSearch[] {
  try {
    const data = localStorage.getItem(SAVED_SEARCHES_KEY);
    const all: SavedSearch[] = data ? JSON.parse(data) : [];
    return all.filter((s) => s.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function addSavedSearch(search: Omit<SavedSearch, 'id' | 'createdAt'>): SavedSearch {
  const data = localStorage.getItem(SAVED_SEARCHES_KEY);
  const all: SavedSearch[] = data ? JSON.parse(data) : [];
  const s: SavedSearch = { ...search, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  all.push(s);
  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(all));
  return s;
}

export function removeSavedSearch(id: string): void {
  const data = localStorage.getItem(SAVED_SEARCHES_KEY);
  const all: SavedSearch[] = data ? JSON.parse(data) : [];
  const filtered = all.filter((s) => s.id !== id);
  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(filtered));
}

export function updateSavedSearchMatchCount(id: string, matchCount: number): void {
  const data = localStorage.getItem(SAVED_SEARCHES_KEY);
  const all: SavedSearch[] = data ? JSON.parse(data) : [];
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], matchCount, lastCheckedAt: new Date().toISOString() };
  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(all));
}
