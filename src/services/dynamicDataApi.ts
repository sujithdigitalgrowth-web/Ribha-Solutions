/**
 * Fetch and sync dynamic data (jobs, proposals, contracts, milestones) from API.
 * Merges with seed/local data so we show both.
 */
import { API_ENABLED, api } from '@/config/api';
import { setAttempts as setExamAttemptsForUser, markSynced as markExamAttemptsSynced } from '@/utils/examAttemptsStorage';
import { setOnboardingData } from '@/utils/freelancerOnboardingStorage';

let syncInFlight: Promise<void> | null = null;
let lastSyncAt = 0;

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const method = (options?.method ?? 'GET').toUpperCase();
  const hasBody = typeof options?.body !== 'undefined';
  const res = await fetch(url, {
    ...options,
    // Avoid forcing JSON Content-Type on GET; it triggers CORS preflight and causes lots of extra network noise in dev.
    headers: {
      ...(hasBody || (method !== 'GET' && method !== 'HEAD') ? { 'Content-Type': 'application/json' } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    let details = '';
    try {
      details = await res.text();
    } catch {
      // ignore
    }
    throw new Error(`API ${res.status}: ${res.statusText}${details ? ` - ${details}` : ''}`);
  }
  return res.json() as Promise<T>;
}

export interface PublicUserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  mobile?: string | null;
  gender?: string | null;
}

/** Registered users from API (passwords never included). */
export async function fetchPublicUsers(): Promise<PublicUserRecord[]> {
  if (!API_ENABLED || !api.users) return [];
  try {
    const data = await fetchJson<PublicUserRecord[]>(api.users);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchJobs(clientId?: string): Promise<unknown[]> {
  if (!API_ENABLED || !api.jobs) return [];
  try {
    const url = clientId ? `${api.jobs}?clientId=${encodeURIComponent(clientId)}` : api.jobs;
    return await fetchJson<unknown[]>(url);
  } catch {
    return [];
  }
}

export async function fetchProposals(filters?: { jobId?: string; freelancerId?: string }): Promise<unknown[]> {
  if (!API_ENABLED || !api.proposals) return [];
  try {
    const params = new URLSearchParams();
    if (filters?.jobId) params.set('jobId', filters.jobId);
    if (filters?.freelancerId) params.set('freelancerId', filters.freelancerId);
    const qs = params.toString();
    const url = qs ? `${api.proposals}?${qs}` : api.proposals;
    return await fetchJson<unknown[]>(url);
  } catch {
    return [];
  }
}

export async function fetchContracts(filters?: { jobId?: string; clientId?: string; freelancerId?: string }): Promise<unknown[]> {
  if (!API_ENABLED || !api.contracts) return [];
  try {
    const params = new URLSearchParams();
    if (filters?.jobId) params.set('jobId', filters.jobId);
    if (filters?.clientId) params.set('clientId', filters.clientId);
    if (filters?.freelancerId) params.set('freelancerId', filters.freelancerId);
    const qs = params.toString();
    const url = qs ? `${api.contracts}?${qs}` : api.contracts;
    return await fetchJson<unknown[]>(url);
  } catch {
    return [];
  }
}

export async function fetchMilestones(contractId: string): Promise<unknown[]> {
  if (!API_ENABLED || !api.milestones || !contractId) return [];
  try {
    const url = `${api.milestones}?contractId=${encodeURIComponent(contractId)}`;
    return await fetchJson<unknown[]>(url);
  } catch {
    return [];
  }
}

export async function fetchAllMilestones(): Promise<unknown[]> {
  if (!API_ENABLED || !api.milestones) return [];
  try {
    // milestones.php supports listing all milestones when contractId is not provided
    return await fetchJson<unknown[]>(api.milestones);
  } catch {
    return [];
  }
}

export async function createJob(payload: Record<string, unknown>): Promise<{ success: boolean; job?: unknown }> {
  if (!API_ENABLED || !api.jobs) return { success: false };
  try {
    const data = await fetchJson<{ success: boolean; job?: unknown }>(api.jobs, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data;
  } catch {
    return { success: false };
  }
}

export async function createProposal(payload: Record<string, unknown>): Promise<{ success: boolean; proposal?: unknown }> {
  if (!API_ENABLED || !api.proposals) return { success: false };
  try {
    const data = await fetchJson<{ success: boolean; proposal?: unknown }>(api.proposals, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data;
  } catch {
    return { success: false };
  }
}

export async function createContract(payload: Record<string, unknown>): Promise<{ success: boolean; contract?: unknown }> {
  if (!API_ENABLED || !api.contracts) return { success: false };
  try {
    const data = await fetchJson<{ success: boolean; contract?: unknown }>(api.contracts, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data;
  } catch {
    return { success: false };
  }
}

export async function addMilestoneApi(payload: Record<string, unknown>): Promise<{ success: boolean; milestone?: unknown }> {
  if (!API_ENABLED || !api.milestones) return { success: false };
  try {
    const data = await fetchJson<{ success: boolean; milestone?: unknown }>(api.milestones, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data;
  } catch {
    return { success: false };
  }
}

export async function updateMilestoneStatusApi(id: string, status: string): Promise<{ success: boolean; milestone?: unknown; error?: string }> {
  if (!API_ENABLED || !api.milestones) return { success: false };
  try {
    const data = await fetchJson<{ success: boolean; milestone?: unknown }>(api.milestones, {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
    });
    return data;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Helps debugging when API returns 4xx/5xx or CORS issues
    console.error('updateMilestoneStatusApi failed:', msg);
    return { success: false, error: msg };
  }
}

/** Sync API jobs into localStorage (merge by id). Call on app load so seed + API jobs show. */
export async function syncJobsFromApi(): Promise<void> {
  const list = await fetchJobs();
  if (list.length === 0) return;
  try {
    const key = 'talentforge_jobs';
    const raw = localStorage.getItem(key);
    const local: unknown[] = raw ? JSON.parse(raw) : [];
    const ids = new Set((local as { id?: string }[]).map((j) => j.id));
    for (const j of list as { id?: string }[]) {
      if (j.id && !ids.has(j.id)) {
        local.push(j);
        ids.add(j.id);
      }
    }
    localStorage.setItem(key, JSON.stringify(local));
  } catch {
    // ignore
  }
}

/** Sync API proposals into localStorage. */
export async function syncProposalsFromApi(): Promise<void> {
  const list = await fetchProposals();
  if (list.length === 0) return;
  try {
    const key = 'talentforge_proposals';
    const raw = localStorage.getItem(key);
    const local: unknown[] = raw ? JSON.parse(raw) : [];
    const ids = new Set((local as { id?: string }[]).map((p) => p.id));
    for (const p of list as { id?: string }[]) {
      if (p.id && !ids.has(p.id)) {
        local.push(p);
        ids.add(p.id);
      }
    }
    localStorage.setItem(key, JSON.stringify(local));
  } catch {
    // ignore
  }
}

/**
 * Fetch latest proposals (bids) for one job from API and merge into localStorage.
 * Call when client opens JobDetail so they see all current bids.
 */
export async function syncProposalsForJob(jobId: string): Promise<void> {
  if (!API_ENABLED || !jobId) return;
  try {
    const list = await fetchProposals({ jobId });
    const key = 'talentforge_proposals';
    const raw = localStorage.getItem(key);
    const local: { id?: string; jobId?: string }[] = raw ? JSON.parse(raw) : [];
    const other = local.filter((p) => p.jobId !== jobId);
    const merged = [...other, ...(list as { id?: string; jobId?: string }[])];
    localStorage.setItem(key, JSON.stringify(merged));
  } catch {
    // ignore
  }
}

/** Sync API contracts into localStorage. */
export async function syncContractsFromApi(): Promise<void> {
  const list = await fetchContracts();
  if (list.length === 0) return;
  try {
    const key = 'talentforge_contracts';
    const raw = localStorage.getItem(key);
    const local: unknown[] = raw ? JSON.parse(raw) : [];
    const ids = new Set((local as { id?: string }[]).map((c) => c.id));
    for (const c of list as { id?: string }[]) {
      if (c.id && !ids.has(c.id)) {
        local.push(c);
        ids.add(c.id);
      }
    }
    localStorage.setItem(key, JSON.stringify(local));
  } catch {
    // ignore
  }
}

/** Sync API milestones into localStorage. API is source of truth for status/timestamps; merge by id so clearance state persists after login. */
export async function syncMilestonesFromApi(): Promise<void> {
  if (!API_ENABLED || !api.milestones) return;
  try {
    const key = 'talentforge_milestones';
    const raw = localStorage.getItem(key);
    const local = (raw ? JSON.parse(raw) : []) as { id?: string; contractId?: string; status?: string; submittedAt?: string; completedAt?: string; paidAt?: string; cancelledAt?: string }[];
    const byId = new Map<string, (typeof local)[number]>();
    for (const m of local) {
      if (m.id) byId.set(m.id, m);
    }
    const list = (await fetchAllMilestones()) as { id?: string; contractId?: string; status?: string; submittedAt?: string; completedAt?: string; paidAt?: string; cancelledAt?: string }[];
    for (const m of list) {
      if (!m.id) continue;
      const existing = byId.get(m.id);
      if (existing) {
        // Update existing so API status (submitted/completed/paid/cancelled) persists after logout/login
        existing.status = m.status ?? existing.status;
        if (m.submittedAt != null) existing.submittedAt = m.submittedAt;
        if (m.completedAt != null) existing.completedAt = m.completedAt;
        if (m.paidAt != null) existing.paidAt = m.paidAt;
        if (m.cancelledAt != null) existing.cancelledAt = m.cancelledAt;
      } else {
        local.push(m);
        byId.set(m.id, m);
      }
    }
    localStorage.setItem(key, JSON.stringify(local));
  } catch {
    // ignore
  }
}

/**
 * Fetch latest milestones for one contract from API and merge into localStorage by id.
 * API status wins so "request clearance" state persists after refresh/login.
 */
export async function syncMilestonesForContract(contractId: string): Promise<void> {
  if (!API_ENABLED || !contractId) return;
  try {
    const list = (await fetchMilestones(contractId)) as { id?: string; contractId?: string; status?: string; submittedAt?: string; completedAt?: string; paidAt?: string; cancelledAt?: string }[];
    const key = 'talentforge_milestones';
    const raw = localStorage.getItem(key);
    const local = (raw ? JSON.parse(raw) : []) as { id?: string; contractId?: string }[];
    const other = local.filter((m) => m.contractId !== contractId);
    const apiIds = new Set(list.map((m) => m.id).filter(Boolean));
    const fromApi = list.map((m) => ({ ...m, contractId }));
    const localOnly = local.filter((m) => m.contractId === contractId && m.id && !apiIds.has(m.id));
    localStorage.setItem(key, JSON.stringify([...other, ...fromApi, ...localOnly]));
  } catch {
    // ignore
  }
}

/** Run all syncs (jobs, proposals, contracts, milestones). Call once on app load when API is enabled. */
export async function syncAllDynamicDataFromApi(): Promise<void> {
  if (!API_ENABLED) return;
  // Prevent duplicate sync storms in React dev StrictMode / rapid auth transitions.
  const now = Date.now();
  if (syncInFlight) return syncInFlight;
  if (now - lastSyncAt < 1500) return;

  syncInFlight = (async () => {
    try {
      await Promise.all([
        syncJobsFromApi(),
        syncProposalsFromApi(),
        syncContractsFromApi(),
      ]);
      await syncMilestonesFromApi();
    } finally {
      lastSyncAt = Date.now();
      syncInFlight = null;
    }
  })();

  return syncInFlight;
}

// --- Exam (definitions + attempts) ---

export interface ExamDefinition {
  skillId: string;
  skillName: string;
  icon: string;
  passingScore: number;
  timeLimitMinutes: number;
  questions: { id: string; question: string; options: string[]; correctIndex: number }[];
}

export interface ExamAttempt {
  id?: string;
  userId: string;
  skillId: string;
  skillName: string;
  score: number;
  passed: boolean;
  passedAt: string;
}

export async function fetchExamDefinitions(): Promise<ExamDefinition[]> {
  if (!API_ENABLED || !api.examDefinitions) return [];
  try {
    return await fetchJson<ExamDefinition[]>(api.examDefinitions);
  } catch {
    return [];
  }
}

export async function fetchExamAttempts(userId: string): Promise<ExamAttempt[]> {
  if (!API_ENABLED || !api.examAttempts || !userId) return [];
  try {
    const url = `${api.examAttempts}?userId=${encodeURIComponent(userId)}`;
    return await fetchJson<ExamAttempt[]>(url);
  } catch {
    return [];
  }
}

export async function submitExamAttempt(payload: {
  userId: string;
  skillId: string;
  skillName: string;
  score: number;
  passed: boolean;
  passedAt: string;
}): Promise<{ success: boolean; attempt?: ExamAttempt }> {
  if (!API_ENABLED || !api.examAttempts) return { success: false };
  try {
    const data = await fetchJson<{ success: boolean; attempt?: ExamAttempt }>(api.examAttempts, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data;
  } catch {
    return { success: false };
  }
}

/** Sync exam attempts for a user from API into localStorage (for hasFreelancerPassedExam). */
export async function syncExamAttemptsForUser(userId: string): Promise<void> {
  if (!API_ENABLED || !userId) return;
  const attempts = await fetchExamAttempts(userId);
  setExamAttemptsForUser(userId, attempts);
  markExamAttemptsSynced(userId);
}

// --- Freelancer onboarding (profile completion: technology, resume, bank details) ---

export interface OnboardingRecord {
  userId: string;
  type: 'individual' | 'organisation';
  pan: string;
  gstin?: string | null;
  nameAsPerBank: string;
  ifsc: string;
  accountNumber: string;
  technology?: string | null;
  resumeFileName?: string | null;
  organisationName?: string | null;
  cin?: string | null;
  companyProfileFileName?: string | null;
  submittedAt?: string;
}

export async function fetchOnboarding(userId: string): Promise<OnboardingRecord | null> {
  if (!API_ENABLED || !api.onboarding || !userId) return null;
  try {
    const url = `${api.onboarding}?userId=${encodeURIComponent(userId)}`;
    const data = await fetchJson<OnboardingRecord | null>(url);
    return data && 'userId' in data ? data : null;
  } catch {
    return null;
  }
}

/** Full onboarding list from API (onboarding.json) — GET with no userId. */
export async function fetchAllOnboardingRecords(): Promise<OnboardingRecord[]> {
  if (!API_ENABLED || !api.onboarding) return [];
  try {
    const data = await fetchJson<OnboardingRecord[]>(api.onboarding);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function saveOnboardingApi(payload: {
  userId: string;
  type: string;
  pan: string;
  gstin?: string;
  nameAsPerBank: string;
  ifsc: string;
  accountNumber: string;
  technology?: string;
  resumeFileName?: string;
  organisationName?: string;
  cin?: string;
  companyProfileFileName?: string;
}): Promise<{ success: boolean }> {
  if (!API_ENABLED || !api.onboarding) return { success: false };
  try {
    const data = await fetchJson<{ success: boolean }>(api.onboarding, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data;
  } catch {
    return { success: false };
  }
}

/** Sync onboarding for a user from API into localStorage (for hasCompletedOnboarding). */
export async function syncOnboardingForUser(userId: string): Promise<void> {
  if (!API_ENABLED || !userId) return;
  const record = await fetchOnboarding(userId);
  if (record) setOnboardingData(userId, { ...record } as Record<string, unknown>);
}
