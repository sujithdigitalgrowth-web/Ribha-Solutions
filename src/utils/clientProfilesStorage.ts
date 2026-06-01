const CLIENT_PROFILES_KEY = 'talentforge_client_profiles';

export interface ClientProfile {
  userId: string;
  companyName: string;
  description: string;
  website?: string;
  logoUrl?: string;
  industry?: string;
  updatedAt: string;
}

export function getClientProfile(userId: string): ClientProfile | null {
  try {
    const data = localStorage.getItem(CLIENT_PROFILES_KEY);
    const map: Record<string, ClientProfile> = data ? JSON.parse(data) : {};
    return map[userId] || null;
  } catch {
    return null;
  }
}

export function saveClientProfile(profile: Omit<ClientProfile, 'updatedAt'>): ClientProfile {
  const data = localStorage.getItem(CLIENT_PROFILES_KEY);
  const map: Record<string, ClientProfile> = data ? JSON.parse(data) : {};
  const p: ClientProfile = { ...profile, updatedAt: new Date().toISOString() };
  map[profile.userId] = p;
  localStorage.setItem(CLIENT_PROFILES_KEY, JSON.stringify(map));
  return p;
}
