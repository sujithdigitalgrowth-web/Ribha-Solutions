const SAVED_KEY = 'talentforge_saved_jobs';

export interface SavedJobEntry {
  jobId: string;
  notes?: string;
  savedAt: string;
  folderId?: string;
}

function getRawMap(): Record<string, SavedJobEntry[]> {
  try {
    const data = localStorage.getItem(SAVED_KEY);
    const parsed = data ? JSON.parse(data) : {};
    const result: Record<string, SavedJobEntry[]> = {};
    for (const [userId, val] of Object.entries(parsed)) {
      if (Array.isArray(val)) {
        result[userId] = val.every((x) => typeof x === 'object' && x?.jobId)
          ? (val as SavedJobEntry[])
          : (val as string[]).map((jobId) => ({ jobId, savedAt: new Date().toISOString() }));
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function getSavedJobs(freelancerId: string): SavedJobEntry[] {
  const map = getRawMap();
  return (map[freelancerId] || []).sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

export function getSavedJobIds(freelancerId: string): string[] {
  return getSavedJobs(freelancerId).map((e) => e.jobId);
}

export function isJobSaved(jobId: string, freelancerId: string): boolean {
  return getSavedJobs(freelancerId).some((e) => e.jobId === jobId);
}

export function toggleSavedJob(jobId: string, freelancerId: string, notes?: string, folderId?: string): boolean {
  const map = getRawMap();
  const list: SavedJobEntry[] = map[freelancerId] || [];
  const idx = list.findIndex((e) => e.jobId === jobId);
  if (idx === -1) {
    list.push({ jobId, notes, savedAt: new Date().toISOString(), folderId });
  } else {
    list.splice(idx, 1);
  }
  map[freelancerId] = list;
  localStorage.setItem(SAVED_KEY, JSON.stringify(map));
  return idx === -1;
}

export function moveSavedJobToFolder(freelancerId: string, jobId: string, folderId: string | null): void {
  const map = getRawMap();
  const list: SavedJobEntry[] = map[freelancerId] || [];
  const entry = list.find((e) => e.jobId === jobId);
  if (entry) {
    entry.folderId = folderId ?? undefined;
    map[freelancerId] = list;
    localStorage.setItem(SAVED_KEY, JSON.stringify(map));
  }
}

export function getSavedJobsByFolder(freelancerId: string): Record<string, SavedJobEntry[]> {
  const jobs = getSavedJobs(freelancerId);
  const byFolder: Record<string, SavedJobEntry[]> = { _none: [] };
  for (const j of jobs) {
    const key = j.folderId || '_none';
    if (!byFolder[key]) byFolder[key] = [];
    byFolder[key].push(j);
  }
  return byFolder;
}

export function updateSavedJobNote(freelancerId: string, jobId: string, notes: string): void {
  const map = getRawMap();
  const list: SavedJobEntry[] = map[freelancerId] || [];
  const entry = list.find((e) => e.jobId === jobId);
  if (entry) entry.notes = notes;
  map[freelancerId] = list;
  localStorage.setItem(SAVED_KEY, JSON.stringify(map));
}
