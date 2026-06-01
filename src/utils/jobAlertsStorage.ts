const JOB_ALERTS_KEY = 'talentforge_job_alerts';

export interface JobAlert {
  id: string;
  userId: string;
  name: string;
  searchQuery: string;
  category: string;
  projectType: 'all' | 'fixed' | 'hourly';
  skills: string[];
  maxBudget?: string;
  minBudget?: string;
  createdAt: string;
}

export function getJobAlerts(userId: string): JobAlert[] {
  try {
    const data = localStorage.getItem(JOB_ALERTS_KEY);
    const all: JobAlert[] = data ? JSON.parse(data) : [];
    return all.filter((a) => a.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function addJobAlert(alert: Omit<JobAlert, 'id' | 'createdAt'>): JobAlert {
  const data = localStorage.getItem(JOB_ALERTS_KEY);
  const all: JobAlert[] = data ? JSON.parse(data) : [];
  const a: JobAlert = { ...alert, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  all.push(a);
  localStorage.setItem(JOB_ALERTS_KEY, JSON.stringify(all));
  return a;
}

export function removeJobAlert(id: string): void {
  const data = localStorage.getItem(JOB_ALERTS_KEY);
  const all: JobAlert[] = data ? JSON.parse(data) : [];
  const filtered = all.filter((a) => a.id !== id);
  localStorage.setItem(JOB_ALERTS_KEY, JSON.stringify(filtered));
}
