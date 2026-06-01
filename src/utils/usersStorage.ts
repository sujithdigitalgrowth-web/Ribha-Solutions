const USERS_KEY = 'talentforge_users'; // Same as AuthContext - public info only

export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'freelancer';
  mobile?: string;
  gender?: Gender;
}

function getStoredUsers(): PublicUser[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    const raw = data ? JSON.parse(data) : [];
    return raw.map((u: { id: string; name: string; email: string; role: string; mobile?: string; gender?: Gender }) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as 'client' | 'freelancer',
      mobile: u.mobile,
      gender: u.gender,
    }));
  } catch {
    return [];
  }
}

export function getUsersByRole(role: 'client' | 'freelancer'): PublicUser[] {
  return getStoredUsers().filter((u) => u.role === role);
}

/** All locally cached signups (excludes static admin session if never written here). */
export function getAllPublicUsers(): PublicUser[] {
  return getStoredUsers();
}

export function getUserById(id: string): PublicUser | null {
  return getStoredUsers().find((u) => u.id === id) ?? null;
}

export function emailExists(email: string): boolean {
  return getStoredUsers().some((u) => u.email.toLowerCase() === email.toLowerCase());
}
