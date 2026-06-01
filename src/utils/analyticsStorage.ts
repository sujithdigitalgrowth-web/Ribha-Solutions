const ANALYTICS_KEY = 'talentforge_analytics';

export interface ProfileView {
  id: string;
  freelancerId: string;
  viewerId: string;
  viewedAt: string;
}

export interface JobView {
  id: string;
  jobId: string;
  viewerId: string;
  viewedAt: string;
}

export function getProfileViews(freelancerId: string): ProfileView[] {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    const raw = data ? JSON.parse(data) : { profileViews: [], jobViews: [] };
    const views: ProfileView[] = raw.profileViews || [];
    return views.filter((v) => v.freelancerId === freelancerId);
  } catch {
    return [];
  }
}

export function getJobViews(jobId: string): JobView[] {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    const raw = data ? JSON.parse(data) : { profileViews: [], jobViews: [] };
    const views: JobView[] = raw.jobViews || [];
    return views.filter((v) => v.jobId === jobId);
  } catch {
    return [];
  }
}

export function recordProfileView(freelancerId: string, viewerId: string): void {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    const raw = data ? JSON.parse(data) : { profileViews: [], jobViews: [] };
    const views: ProfileView[] = raw.profileViews || [];
    views.push({
      id: crypto.randomUUID(),
      freelancerId,
      viewerId,
      viewedAt: new Date().toISOString(),
    });
    raw.profileViews = views.slice(-1000);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(raw));
  } catch {
    // ignore
  }
}

export function recordJobView(jobId: string, viewerId: string): void {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    const raw = data ? JSON.parse(data) : { profileViews: [], jobViews: [] };
    const views: JobView[] = raw.jobViews || [];
    views.push({
      id: crypto.randomUUID(),
      jobId,
      viewerId,
      viewedAt: new Date().toISOString(),
    });
    raw.jobViews = views.slice(-1000);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(raw));
  } catch {
    // ignore
  }
}
