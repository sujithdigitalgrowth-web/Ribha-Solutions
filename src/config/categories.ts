export interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
  path: string;
}

export const JOB_CATEGORIES: CategoryConfig[] = [
  { id: 'ai', name: 'AI Services', icon: '🤖', path: '/find-talent?cat=ai' },
  { id: 'development', name: 'Development & IT', icon: '💻', path: '/find-talent?cat=development' },
  { id: 'design', name: 'Design & Creative', icon: '🎨', path: '/find-talent?cat=design' },
  { id: 'marketing', name: 'Sales & Marketing', icon: '📈', path: '/find-talent?cat=marketing' },
  { id: 'writing', name: 'Writing & Translation', icon: '✍️', path: '/find-talent?cat=writing' },
  { id: 'admin', name: 'Admin & Support', icon: '📋', path: '/find-talent?cat=admin' },
  { id: 'finance', name: 'Finance & Accounting', icon: '💰', path: '/find-talent?cat=finance' },
  { id: 'legal', name: 'Legal', icon: '⚖️', path: '/find-talent?cat=legal' },
];

/** Maps category id to skills - used to filter freelancers by category */
export const CATEGORY_SKILLS_MAP: Record<string, string[]> = {
  ai: ['Python', 'Analytics', 'Machine Learning', 'Data Analysis'],
  development: ['React', 'Node.js', 'TypeScript', 'Python', 'Vue.js', 'Angular', 'PHP', 'Laravel', 'Java', 'Swift', 'Flutter', 'MongoDB', 'PostgreSQL', 'GraphQL', 'WordPress', 'Shopify', 'REST API', 'CI/CD', 'Testing', 'QA', 'Kubernetes', 'AWS', 'Docker'],
  design: ['Figma', 'Adobe XD', 'Illustrator', 'Sketch', 'Photoshop'],
  marketing: ['SEO', 'Google Ads', 'Social Media', 'Email Marketing', 'Analytics', 'Copywriting'],
  writing: ['Content Writing', 'Copywriting', 'Technical Writing'],
  admin: ['Data Entry', 'Project Management'],
  finance: ['Analytics', 'Data Entry', 'Project Management'],
  legal: ['Technical Writing', 'Project Management'],
};

/** Skill-based title mapping: skills (or patterns) → display title. Used so freelancer title matches their skills. */
const SKILL_TITLE_MAP: Array<{ skills: string[]; title: string }> = [
  { skills: ['Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator'], title: 'UI/UX Designer' },
  { skills: ['React', 'Vue.js', 'Angular', 'TypeScript'], title: 'Frontend Developer' },
  { skills: ['Laravel', 'PHP', 'Node.js', 'REST API', 'GraphQL'], title: 'Backend Developer' },
  { skills: ['Python', 'Machine Learning', 'Data Analysis', 'Analytics'], title: 'Data Analyst' },
  { skills: ['Swift', 'Flutter', 'React Native'], title: 'Mobile App Developer' },
  { skills: ['WordPress', 'Shopify'], title: 'WordPress / E‑commerce Developer' },
  { skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'], title: 'DevOps Engineer' },
  { skills: ['QA', 'Testing'], title: 'QA Engineer' },
  { skills: ['MongoDB', 'PostgreSQL', 'Java'], title: 'Full Stack Developer' },
  { skills: ['SEO', 'Google Ads', 'Social Media', 'Email Marketing', 'Copywriting'], title: 'Marketing Specialist' },
  { skills: ['Content Writing', 'Technical Writing', 'Copywriting'], title: 'Content Writer' },
  { skills: ['Project Management', 'Data Entry'], title: 'Project Manager' },
];

/**
 * Returns a title derived from the freelancer's skills so title and skills are aligned.
 * Picks the skill group with the most matching skills; falls back to category-based title if none match.
 */
export function getTitleFromSkills(skills: string[]): string {
  if (!skills?.length) return 'Freelancer';
  const skillSet = new Set(skills.map((s) => s.toLowerCase().trim()));
  let bestTitle = '';
  let bestCount = 0;
  for (const { skills: group, title } of SKILL_TITLE_MAP) {
    const matchCount = group.filter((s) => skillSet.has(s.toLowerCase())).length;
    if (matchCount > bestCount) {
      bestCount = matchCount;
      bestTitle = title;
    }
  }
  if (bestTitle) return bestTitle;
  // Fallback: which category has the most matching skills?
  let bestCategory = '';
  let bestCatCount = 0;
  for (const [cat, catSkills] of Object.entries(CATEGORY_SKILLS_MAP)) {
    const count = catSkills.filter((s) => skillSet.has(s.toLowerCase())).length;
    if (count > bestCatCount) {
      bestCatCount = count;
      bestCategory = cat;
    }
  }
  if (bestCategory === 'development') return 'Developer';
  if (bestCategory === 'design') return 'Designer';
  if (bestCategory === 'marketing') return 'Marketing Specialist';
  if (bestCategory === 'writing') return 'Content Writer';
  if (bestCategory === 'ai') return 'Data Analyst';
  if (bestCategory) return (JOB_CATEGORIES.find((c) => c.id === bestCategory)?.name?.split(' ')[0] ?? '') + ' Professional' || 'Freelancer';
  return 'Freelancer';
}

export const PROJECT_TAGS = [
  'Startup',
  'Enterprise',
  'SMB',
  'Non-profit',
  'Agency',
  'Personal',
  'Government',
  'Education',
] as const;

export const RESPONSE_TIME_OPTIONS = [
  { value: 'within_1h', label: 'Within 1 hour' },
  { value: 'within_24h', label: 'Within 24 hours' },
  { value: 'within_24_48h', label: 'Within 24-48 hours' },
  { value: 'within_1_week', label: 'Within 1 week' },
] as const;
