const ONBOARDING_KEY = 'talentforge_onboarding';

export interface OnboardingState {
  userId: string;
  completedSteps: string[];
  dismissed: boolean;
  updatedAt: string;
}

export function getOnboardingState(userId: string): OnboardingState | null {
  try {
    const data = localStorage.getItem(ONBOARDING_KEY);
    const map: Record<string, OnboardingState> = data ? JSON.parse(data) : {};
    return map[userId] || null;
  } catch {
    return null;
  }
}

export function completeOnboardingStep(userId: string, step: string): void {
  const data = localStorage.getItem(ONBOARDING_KEY);
  const map: Record<string, OnboardingState> = data ? JSON.parse(data) : {};
  const current = map[userId] || { userId, completedSteps: [], dismissed: false, updatedAt: new Date().toISOString() };
  if (!current.completedSteps.includes(step)) {
    current.completedSteps.push(step);
  }
  current.updatedAt = new Date().toISOString();
  map[userId] = current;
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(map));
}

export function dismissOnboarding(userId: string): void {
  const data = localStorage.getItem(ONBOARDING_KEY);
  const map: Record<string, OnboardingState> = data ? JSON.parse(data) : {};
  map[userId] = {
    userId,
    completedSteps: map[userId]?.completedSteps || [],
    dismissed: true,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(map));
}
