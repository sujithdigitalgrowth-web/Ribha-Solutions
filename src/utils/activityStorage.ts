const ACTIVITY_KEY = 'talentforge_activity';

export type ActivityType =
  | 'job_posted'
  | 'proposal_submitted'
  | 'hired'
  | 'job_completed'
  | 'review_added'
  | 'milestone_completed'
  | 'payment_released'
  | 'profile_updated'
  | 'message_sent';

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  title: string;
  description?: string;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export function getActivity(userId: string, limit = 20): Activity[] {
  try {
    const data = localStorage.getItem(ACTIVITY_KEY);
    const all: Activity[] = data ? JSON.parse(data) : [];
    return all
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  } catch {
    return [];
  }
}

export function addActivity(a: Omit<Activity, 'id' | 'createdAt'>): Activity {
  const data = localStorage.getItem(ACTIVITY_KEY);
  const all: Activity[] = data ? JSON.parse(data) : [];
  const activity: Activity = {
    ...a,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  all.unshift(activity);
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(all.slice(0, 500)));
  return activity;
}
