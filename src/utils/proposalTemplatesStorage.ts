const PROPOSAL_TEMPLATES_KEY = 'talentforge_proposal_templates';

export interface ProposalTemplate {
  id: string;
  userId: string;
  name: string;
  coverLetter: string;
  proposedRate: string;
  timeline: string;
  createdAt: string;
}

export function getProposalTemplates(userId: string): ProposalTemplate[] {
  try {
    const data = localStorage.getItem(PROPOSAL_TEMPLATES_KEY);
    const all: ProposalTemplate[] = data ? JSON.parse(data) : [];
    return all.filter((t) => t.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function addProposalTemplate(template: Omit<ProposalTemplate, 'id' | 'createdAt'>): ProposalTemplate {
  const data = localStorage.getItem(PROPOSAL_TEMPLATES_KEY);
  const all: ProposalTemplate[] = data ? JSON.parse(data) : [];
  const t: ProposalTemplate = { ...template, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  all.push(t);
  localStorage.setItem(PROPOSAL_TEMPLATES_KEY, JSON.stringify(all));
  return t;
}

export function updateProposalTemplate(id: string, updates: Partial<Omit<ProposalTemplate, 'id' | 'userId' | 'createdAt'>>): ProposalTemplate | null {
  const data = localStorage.getItem(PROPOSAL_TEMPLATES_KEY);
  const all: ProposalTemplate[] = data ? JSON.parse(data) : [];
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates };
  localStorage.setItem(PROPOSAL_TEMPLATES_KEY, JSON.stringify(all));
  return all[idx];
}

export function removeProposalTemplate(id: string): void {
  const data = localStorage.getItem(PROPOSAL_TEMPLATES_KEY);
  const all: ProposalTemplate[] = data ? JSON.parse(data) : [];
  const filtered = all.filter((t) => t.id !== id);
  localStorage.setItem(PROPOSAL_TEMPLATES_KEY, JSON.stringify(filtered));
}
