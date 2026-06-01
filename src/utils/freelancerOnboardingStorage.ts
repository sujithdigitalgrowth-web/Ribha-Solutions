const ONBOARDING_KEY = 'talentforge_freelancer_onboarding';

export type OnboardingType = 'individual' | 'organisation';

export interface FreelancerOnboardingData {
  userId: string;
  type: OnboardingType;
  submittedAt?: string; // Set by saveOnboardingData if not provided
  // Individual
  technology?: string;
  resumeFileName?: string;
  // Organisation
  organisationName?: string;
  cin?: string;
  companyProfileFileName?: string;
  // Common
  pan: string;
  gstin?: string;
  nameAsPerBank: string;
  ifsc: string;
  accountNumber: string;
}

function getRaw(): Record<string, FreelancerOnboardingData> {
  try {
    const data = localStorage.getItem(ONBOARDING_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function hasCompletedOnboarding(userId: string): boolean {
  return !!getRaw()[userId];
}

export function getOnboardingData(userId: string): FreelancerOnboardingData | null {
  return getRaw()[userId] ?? null;
}

export function saveOnboardingData(data: FreelancerOnboardingData): void {
  const raw = getRaw();
  raw[data.userId] = { ...data, submittedAt: new Date().toISOString() };
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(raw));
}

/** Set onboarding for a user (used when syncing from API). */
export function setOnboardingData(userId: string, data: FreelancerOnboardingData | Record<string, unknown>): void {
  const raw = getRaw();
  const submittedAt = 'submittedAt' in data && typeof data.submittedAt === 'string' ? data.submittedAt : new Date().toISOString();
  raw[userId] = { ...data, userId, submittedAt } as FreelancerOnboardingData;
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(raw));
}
