import { API_ENABLED } from '@/config/api';
import { createContract as createContractApi } from '@/services/dynamicDataApi';

const CONTRACTS_KEY = 'talentforge_contracts';

export interface Contract {
  id: string;
  jobId: string;
  clientId: string;
  freelancerId: string;
  freelancerName: string;
  status: 'active' | 'completed';
  hiredAt: string;
  completedAt?: string;
  totalAmount?: string;
  escrowStatus?: 'none' | 'funded' | 'partial' | 'released';
}

export function getContracts(filters?: { jobId?: string; clientId?: string; freelancerId?: string }): Contract[] {
  try {
    const data = localStorage.getItem(CONTRACTS_KEY);
    const all: Contract[] = data ? JSON.parse(data) : [];
    if (!filters) return all;
    return all.filter((c) => {
      if (filters.jobId && c.jobId !== filters.jobId) return false;
      if (filters.clientId && c.clientId !== filters.clientId) return false;
      if (filters.freelancerId && c.freelancerId !== filters.freelancerId) return false;
      return true;
    });
  } catch {
    return [];
  }
}

/** Create contract (hire) locally and in API when enabled. */
export async function hireFreelancer(jobId: string, clientId: string, freelancerId: string, freelancerName: string): Promise<Contract> {
  const data = localStorage.getItem(CONTRACTS_KEY);
  const all: Contract[] = data ? JSON.parse(data) : [];
  const existing = all.find((c) => c.jobId === jobId);
  if (existing) return existing;
  if (API_ENABLED) {
    const res = await createContractApi({ jobId, clientId, freelancerId, freelancerName });
    if (res.success && res.contract && typeof res.contract === 'object' && 'id' in res.contract) {
      const apiContract = res.contract as Contract;
      all.push(apiContract);
      localStorage.setItem(CONTRACTS_KEY, JSON.stringify(all));
      return apiContract;
    }
  }
  const c: Contract = {
    id: crypto.randomUUID(),
    jobId,
    clientId,
    freelancerId,
    freelancerName,
    status: 'active',
    hiredAt: new Date().toISOString(),
  };
  all.push(c);
  localStorage.setItem(CONTRACTS_KEY, JSON.stringify(all));
  return c;
}

export function getContractById(id: string): Contract | null {
  return getContracts().find((c) => c.id === id) ?? null;
}

export function completeContract(id: string): Contract | null {
  const data = localStorage.getItem(CONTRACTS_KEY);
  const all: Contract[] = data ? JSON.parse(data) : [];
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  all[idx] = {
    ...all[idx],
    status: 'completed',
    completedAt: new Date().toISOString(),
  };
  localStorage.setItem(CONTRACTS_KEY, JSON.stringify(all));
  return all[idx];
}
