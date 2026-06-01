import { API_ENABLED } from '@/config/api';
import { hasPassed as hasPassedExamFromAttempts, isSynced as isExamAttemptsSynced } from '@/utils/examAttemptsStorage';

const PROFILES_KEY = 'talentforge_freelancer_profiles';

export interface SkillTestResult {
  skillId: string;
  skillName: string;
  score: number;
  passed: boolean;
  passedAt: string;
}

export interface FreelancerProfile {
  userId: string;
  title: string;
  bio: string;
  hourlyRate: string;
  skills: string[];
  availability: string;
  experience: string;
  portfolioUrl?: string;
  updatedAt: string;
  // Verification badges
  emailVerified?: boolean;
  phoneVerified?: boolean;
  idVerified?: boolean;
  location?: string;
  availabilityStatus?: 'available_now' | 'available_soon' | 'part_time' | 'full_time' | 'not_available';
  responseTime?: string; // e.g. "Within 24 hours"
  profileVisibility?: 'public' | 'private' | 'open_to_work';
  skillBadges?: SkillTestResult[];
}

export function hasFreelancerPassedExam(userId: string): boolean {
  if (API_ENABLED) {
    return hasPassedExamFromAttempts(userId);
  }
  const profile = getProfile(userId);
  return (profile?.skillBadges?.length ?? 0) > 0;
}

export function isFreelancerExamStatusReady(userId: string): boolean {
  if (!API_ENABLED) return true;
  return isExamAttemptsSynced(userId);
}

export function getProfile(userId: string): FreelancerProfile | null {
  try {
    const data = localStorage.getItem(PROFILES_KEY);
    const map: Record<string, FreelancerProfile> = data ? JSON.parse(data) : {};
    return map[userId] || null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: Omit<FreelancerProfile, 'updatedAt'>): FreelancerProfile {
  const data = localStorage.getItem(PROFILES_KEY);
  const map: Record<string, FreelancerProfile> = data ? JSON.parse(data) : {};
  const p: FreelancerProfile = { ...profile, updatedAt: new Date().toISOString() };
  map[profile.userId] = p;
  localStorage.setItem(PROFILES_KEY, JSON.stringify(map));
  return p;
}
