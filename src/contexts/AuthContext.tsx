import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { saveProfile } from '@/utils/profilesStorage';
import { saveClientProfile } from '@/utils/clientProfilesStorage';
import { API_ENABLED, api } from '@/config/api';
import { isStaticAdminEmail, STATIC_ADMIN_EMAIL, STATIC_ADMIN_USER_ID } from '@/config/admin';

export type UserRole = 'client' | 'freelancer' | 'admin';

export interface SkillTestResult {
  skillId: string;
  skillName: string;
  score: number;
  passed: boolean;
  passedAt: string;
}

export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  mobile?: string;
  gender?: Gender;
}

export interface SignupOptions {
  skillBadge?: SkillTestResult;
  companyName?: string;
  primaryCategory?: string;
  mobile?: string;
  gender?: Gender;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  signup: (name: string, email: string, password: string, role: UserRole, options?: SignupOptions) => Promise<{ success: boolean; error?: string }>;
  completeRegistrationFromVerify: (user: User, password: string, role: UserRole, options?: SignupOptions) => void;
  updateProfile: (email: string, password: string, updates: { name?: string; mobile?: string }) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
}

const STORAGE_KEY = 'talentforge_users';
const AUTH_KEY = 'talentforge_auth';

function getStoredUsers(): Array<{ email: string; password: string; name: string; role: UserRole; id: string; mobile?: string; gender?: Gender }> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: Array<{ email: string; password: string; name: string; role: UserRole; id: string; mobile?: string; gender?: Gender }>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getStoredAuth(): User | null {
  try {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function setStoredAuth(user: User | null) {
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

function syncUserToLocalStorage(user: User, password: string) {
  const users = getStoredUsers();
  const exists = users.some((u) => u.id === user.id);
  if (!exists) {
    users.push({
      id: user.id,
      name: user.name,
      email: user.email,
      password,
      role: user.role,
      mobile: user.mobile,
      gender: user.gender,
    });
    saveUsers(users);
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Load stored auth synchronously to avoid a "logged-out" first render that can cause blank/redirect flicker.
  const [user, setUser] = useState<User | null>(() => getStoredAuth());

  const login = useCallback(async (email: string, password: string) => {
    const emailTrim = email.trim();
    if (isStaticAdminEmail(emailTrim) && password.length > 0) {
      const userData: User = {
        id: STATIC_ADMIN_USER_ID,
        name: 'Administrator',
        email: STATIC_ADMIN_EMAIL,
        role: 'admin',
      };
      setUser(userData);
      setStoredAuth(userData);
      return { success: true, user: userData };
    }

    if (API_ENABLED && api.login) {
      try {
        const res = await fetch(api.login, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          const userData: User = data.user;
          setUser(userData);
          setStoredAuth(userData);
          syncUserToLocalStorage(userData, password);
          return { success: true, user: userData };
        }
        return { success: false, error: data.error || 'Login failed' };
      } catch {
        return { success: false, error: 'Unable to connect to server' };
      }
    }
    const users = getStoredUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) {
      return { success: false, error: 'Invalid email or password' };
    }
    const userData: User = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
      gender: found.gender,
    };
    setUser(userData);
    setStoredAuth(userData);
    return { success: true, user: userData };
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, role: UserRole, options?: SignupOptions) => {
    if (isStaticAdminEmail(email)) {
      return { success: false, error: 'This email is reserved for admin sign-in. Use Log in with any password.' };
    }
    if (role === 'admin') {
      return { success: false, error: 'Invalid role' };
    }
    if (API_ENABLED && api.register) {
      try {
        const res = await fetch(api.register, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            role,
            mobile: options?.mobile?.trim(),
            gender: options?.gender,
            companyName: options?.companyName?.trim(),
            primaryCategory: options?.primaryCategory,
          }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          const userData: User = data.user;
          const id = userData.id;
          setUser(userData);
          setStoredAuth(userData);
          syncUserToLocalStorage(userData, password);

          if (role === 'freelancer') {
            saveProfile({
              userId: id,
              title: 'Freelancer',
              bio: '',
              hourlyRate: 'To be discussed',
              skills: [],
              availability: '',
              experience: 'intermediate',
              skillBadges: options?.skillBadge ? [options.skillBadge] : [],
              emailVerified: true,
            });
          }

          if (role === 'client' && (options?.companyName || options?.primaryCategory)) {
            saveClientProfile({
              userId: id,
              companyName: options.companyName?.trim() || 'My Company',
              description: '',
              industry: options.primaryCategory,
            });
          }

          return { success: true };
        }
        return { success: false, error: data.error || 'Registration failed' };
      } catch {
        return { success: false, error: 'Unable to connect to server' };
      }
    }

    const users = getStoredUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    const id = crypto.randomUUID();
    users.push({ id, name, email, password, role, mobile: options?.mobile?.trim(), gender: options?.gender });
    saveUsers(users);
    const userData: User = { id, name, email, role, gender: options?.gender };
    setUser(userData);
    setStoredAuth(userData);

    if (role === 'freelancer') {
      saveProfile({
        userId: id,
        title: 'Freelancer',
        bio: '',
        hourlyRate: 'To be discussed',
        skills: [],
        availability: '',
        experience: 'intermediate',
        skillBadges: options?.skillBadge ? [options.skillBadge] : [],
        emailVerified: true,
      });
    }

    if (role === 'client' && (options?.companyName || options?.primaryCategory)) {
      saveClientProfile({
        userId: id,
        companyName: options.companyName?.trim() || 'My Company',
        description: '',
        industry: options.primaryCategory,
      });
    }

    return { success: true };
  }, []);

  const updateProfile = useCallback(async (email: string, password: string, updates: { name?: string; mobile?: string }) => {
    if (API_ENABLED && api.updateProfile) {
      try {
        const res = await fetch(api.updateProfile, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password, ...updates }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          const userData: User = data.user;
          setUser(userData);
          setStoredAuth(userData);
          const users = getStoredUsers();
          const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
          if (idx >= 0) {
            users[idx] = { ...users[idx], name: userData.name, mobile: userData.mobile };
            saveUsers(users);
          }
          return { success: true, user: userData };
        }
        return { success: false, error: data.error || 'Update failed' };
      } catch {
        return { success: false, error: 'Unable to connect to server' };
      }
    }
    const users = getStoredUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) return { success: false, error: 'Invalid email or password' };
    if (updates.name) found.name = updates.name;
    if (updates.mobile !== undefined) found.mobile = updates.mobile;
    const idx = users.findIndex((u) => u.id === found.id);
    if (idx >= 0) {
      users[idx] = found;
      saveUsers(users);
    }
    const userData: User = { id: found.id, name: found.name, email: found.email, role: found.role, mobile: found.mobile, gender: found.gender };
    setUser(userData);
    setStoredAuth(userData);
    return { success: true, user: userData };
  }, []);

  const completeRegistrationFromVerify = useCallback((userData: User, password: string, role: UserRole, options?: SignupOptions) => {
    setUser(userData);
    setStoredAuth(userData);
    syncUserToLocalStorage(userData, password);
    if (role === 'freelancer') {
      saveProfile({
        userId: userData.id,
        title: 'Freelancer',
        bio: '',
        hourlyRate: 'To be discussed',
        skills: [],
        availability: '',
        experience: 'intermediate',
        skillBadges: options?.skillBadge ? [options.skillBadge] : [],
        emailVerified: true,
      });
    }
    if (role === 'client' && (options?.companyName || options?.primaryCategory)) {
      saveClientProfile({
        userId: userData.id,
        companyName: options.companyName?.trim() || 'My Company',
        description: '',
        industry: options.primaryCategory,
      });
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setStoredAuth(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    completeRegistrationFromVerify,
    updateProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
