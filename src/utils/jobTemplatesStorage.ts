const TEMPLATES_KEY = 'talentforge_job_templates';

export interface JobTemplate {
  id: string;
  clientId: string;
  name: string;
  title: string;
  description: string;
  budget: string;
  projectType: 'fixed' | 'hourly';
  skills: string[];
  category: string;
  timeline?: string;
  deliverables?: string;
  requirements?: string;
  createdAt: string;
}

export function getTemplateById(id: string): JobTemplate | null {
  try {
    const data = localStorage.getItem(TEMPLATES_KEY);
    const all: JobTemplate[] = data ? JSON.parse(data) : [];
    return all.find((t) => t.id === id) || null;
  } catch {
    return null;
  }
}

export function getTemplates(clientId: string): JobTemplate[] {
  try {
    const data = localStorage.getItem(TEMPLATES_KEY);
    const all: JobTemplate[] = data ? JSON.parse(data) : [];
    return all.filter((t) => t.clientId === clientId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function saveTemplate(template: Omit<JobTemplate, 'id' | 'createdAt'>): JobTemplate {
  const data = localStorage.getItem(TEMPLATES_KEY);
  const all: JobTemplate[] = data ? JSON.parse(data) : [];
  const t: JobTemplate = { ...template, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  all.push(t);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(all));
  return t;
}

export function deleteTemplate(id: string): void {
  const data = localStorage.getItem(TEMPLATES_KEY);
  const all: JobTemplate[] = data ? JSON.parse(data) : [];
  const filtered = all.filter((t) => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
}
