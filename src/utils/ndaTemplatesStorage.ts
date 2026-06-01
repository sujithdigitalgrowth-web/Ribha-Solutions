const NDA_KEY = 'talentforge_nda_templates';

export interface NDATemplate {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

const DEFAULT_TEMPLATES: NDATemplate[] = [
  {
    id: 'standard',
    name: 'Standard NDA',
    content: `This Non-Disclosure Agreement ("Agreement") is entered into between the Client and the Freelancer.

1. Confidential Information: "Confidential Information" means any data, designs, code, or business information disclosed by either party.

2. Obligations: The receiving party agrees to (a) hold Confidential Information in strict confidence, (b) not disclose to third parties without prior written consent, (c) use only for the purpose of the project.

3. Term: This Agreement remains in effect for 2 years after project completion.

4. Return of Materials: Upon request, all Confidential Information shall be returned or destroyed.

By accepting this project, both parties agree to these terms.`,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mutual',
    name: 'Mutual NDA',
    content: `Mutual Non-Disclosure Agreement

Both parties agree to protect each other's confidential information. Neither party shall disclose, use, or allow access to the other's proprietary information except as necessary for the project. This includes but is not limited to: source code, business plans, customer data, and trade secrets. The obligations survive for 3 years after project completion.`,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'unilateral',
    name: 'Unilateral NDA (Client protects)',
    content: `Unilateral NDA - Client Information Protected

The Freelancer agrees to protect all Confidential Information disclosed by the Client. Confidential Information includes project specifications, business strategies, and any materials marked as confidential. The Freelancer shall not use such information for any purpose other than performing the project. Duration: 2 years post-project.`,
    createdAt: new Date().toISOString(),
  },
];

function getRaw(): NDATemplate[] {
  try {
    const data = localStorage.getItem(NDA_KEY);
    if (!data) return DEFAULT_TEMPLATES;
    const custom = JSON.parse(data) as NDATemplate[];
    return [...DEFAULT_TEMPLATES, ...custom.filter((c) => !DEFAULT_TEMPLATES.some((d) => d.id === c.id))];
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

export function getNDATemplates(): NDATemplate[] {
  return getRaw();
}

export function getNDATemplateById(id: string): NDATemplate | null {
  return getRaw().find((t) => t.id === id) ?? null;
}

export function addNDATemplate(name: string, content: string): NDATemplate {
  const data = localStorage.getItem(NDA_KEY);
  const custom: NDATemplate[] = data ? JSON.parse(data) : [];
  const t: NDATemplate = {
    id: crypto.randomUUID(),
    name,
    content,
    createdAt: new Date().toISOString(),
  };
  custom.push(t);
  localStorage.setItem(NDA_KEY, JSON.stringify(custom));
  return t;
}
