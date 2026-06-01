const SEARCH_HISTORY_KEY = 'talentforge_search_history';

export interface SearchEntry {
  id: string;
  userId: string;
  query: string;
  filters: Record<string, string>;
  type: 'jobs' | 'freelancers';
  createdAt: string;
}

export function getSearchHistory(userId: string, type: 'jobs' | 'freelancers', limit = 10): SearchEntry[] {
  try {
    const data = localStorage.getItem(SEARCH_HISTORY_KEY);
    const all: SearchEntry[] = data ? JSON.parse(data) : [];
    return all
      .filter((s) => s.userId === userId && s.type === type)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  } catch {
    return [];
  }
}

export function addSearchHistory(entry: Omit<SearchEntry, 'id' | 'createdAt'>): void {
  const data = localStorage.getItem(SEARCH_HISTORY_KEY);
  const all: SearchEntry[] = data ? JSON.parse(data) : [];
  all.unshift({
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(all.slice(0, 50)));
}
