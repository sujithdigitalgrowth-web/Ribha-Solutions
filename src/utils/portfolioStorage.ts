const PORTFOLIO_KEY = 'talentforge_portfolio';

export interface PortfolioItem {
  id: string;
  freelancerId: string;
  title: string;
  description: string;
  imageUrl: string; // data URL or placeholder
  projectUrl?: string;
  skills: string[];
  createdAt: string;
}

export function getPortfolioItems(freelancerId: string): PortfolioItem[] {
  try {
    const data = localStorage.getItem(PORTFOLIO_KEY);
    const all: PortfolioItem[] = data ? JSON.parse(data) : [];
    return all.filter((p) => p.freelancerId === freelancerId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function addPortfolioItem(item: Omit<PortfolioItem, 'id' | 'createdAt'>): PortfolioItem {
  const data = localStorage.getItem(PORTFOLIO_KEY);
  const all: PortfolioItem[] = data ? JSON.parse(data) : [];
  const p: PortfolioItem = { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  all.push(p);
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(all));
  return p;
}

export function removePortfolioItem(id: string): void {
  const data = localStorage.getItem(PORTFOLIO_KEY);
  const all: PortfolioItem[] = data ? JSON.parse(data) : [];
  const filtered = all.filter((p) => p.id !== id);
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(filtered));
}
