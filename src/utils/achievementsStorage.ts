const ACHIEVEMENTS_KEY = 'talentforge_achievements';

export interface Achievement {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

const ACHIEVEMENT_DEFS: Record<string, { title: string; description: string; icon: string }> = {
  first_hire: { title: 'First Hire', description: 'Landed your first contract', icon: '🏆' },
  ten_projects: { title: '10 Projects', description: 'Completed 10 projects', icon: '⭐' },
  fifty_projects: { title: '50 Projects', description: 'Completed 50 projects', icon: '🌟' },
  first_review: { title: 'First Review', description: 'Received your first 5-star review', icon: '⭐' },
  top_rated: { title: 'Top Rated', description: 'Achieved 4.8+ average rating', icon: '👑' },
  early_bird: { title: 'Early Bird', description: 'Applied to a job within 1 hour of posting', icon: '🐦' },
  client_favorite: { title: 'Client Favorite', description: 'Hired by the same client 3+ times', icon: '❤️' },
  profile_complete: { title: 'Profile Complete', description: '100% profile completion', icon: '✅' },
  first_proposal: { title: 'First Proposal', description: 'Submitted your first proposal', icon: '📝' },
  milestone_master: { title: 'Milestone Master', description: 'Completed 25 milestones', icon: '🎯' },
};

export function getAchievements(userId: string): Achievement[] {
  try {
    const data = localStorage.getItem(ACHIEVEMENTS_KEY);
    const all: Achievement[] = data ? JSON.parse(data) : [];
    return all.filter((a) => a.userId === userId).sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime());
  } catch {
    return [];
  }
}

export function awardAchievement(userId: string, type: string): Achievement | null {
  const def = ACHIEVEMENT_DEFS[type];
  if (!def) return null;
  const existing = getAchievements(userId).some((a) => a.type === type);
  if (existing) return null;
  const data = localStorage.getItem(ACHIEVEMENTS_KEY);
  const all: Achievement[] = data ? JSON.parse(data) : [];
  const a: Achievement = {
    id: crypto.randomUUID(),
    userId,
    type,
    title: def.title,
    description: def.description,
    icon: def.icon,
    earnedAt: new Date().toISOString(),
  };
  all.push(a);
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(all));
  return a;
}

export function getAchievementDefs(): typeof ACHIEVEMENT_DEFS {
  return ACHIEVEMENT_DEFS;
}
