const FOLDERS_KEY = 'talentforge_saved_job_folders';

export interface SavedJobFolder {
  id: string;
  freelancerId: string;
  name: string;
  color?: string;
  order: number;
  createdAt: string;
}

export function getFolders(freelancerId: string): SavedJobFolder[] {
  try {
    const data = localStorage.getItem(FOLDERS_KEY);
    const all: SavedJobFolder[] = data ? JSON.parse(data) : [];
    return all.filter((f) => f.freelancerId === freelancerId).sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

export function addFolder(freelancerId: string, name: string, color?: string): SavedJobFolder {
  const data = localStorage.getItem(FOLDERS_KEY);
  const all: SavedJobFolder[] = data ? JSON.parse(data) : [];
  const order = all.filter((f) => f.freelancerId === freelancerId).length;
  const folder: SavedJobFolder = {
    id: crypto.randomUUID(),
    freelancerId,
    name,
    color,
    order,
    createdAt: new Date().toISOString(),
  };
  all.push(folder);
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(all));
  return folder;
}

export function updateFolder(id: string, updates: Partial<Pick<SavedJobFolder, 'name' | 'color' | 'order'>>): SavedJobFolder | null {
  const data = localStorage.getItem(FOLDERS_KEY);
  const all: SavedJobFolder[] = data ? JSON.parse(data) : [];
  const idx = all.findIndex((f) => f.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates };
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(all));
  return all[idx];
}

export function removeFolder(id: string): void {
  const data = localStorage.getItem(FOLDERS_KEY);
  const all: SavedJobFolder[] = data ? JSON.parse(data) : [];
  const filtered = all.filter((f) => f.id !== id);
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(filtered));
}
