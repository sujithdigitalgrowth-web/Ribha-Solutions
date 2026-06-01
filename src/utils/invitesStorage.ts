const INVITES_KEY = 'talentforge_invites';

export interface Invite {
  id: string;
  jobId: string;
  freelancerId: string;
  clientId: string;
  createdAt: string;
  message?: string;
  timelineExpect?: string;
  paymentTerms?: string;
  requireNDA?: boolean;
  additionalRequirements?: string;
}

export function getInvites(filters?: { jobId?: string; freelancerId?: string; clientId?: string }): Invite[] {
  try {
    const data = localStorage.getItem(INVITES_KEY);
    const invites: Invite[] = data ? JSON.parse(data) : [];
    if (!filters) return invites;
    return invites.filter((i) => {
      if (filters.jobId && i.jobId !== filters.jobId) return false;
      if (filters.freelancerId && i.freelancerId !== filters.freelancerId) return false;
      if (filters.clientId && i.clientId !== filters.clientId) return false;
      return true;
    });
  } catch {
    return [];
  }
}

export function sendInvite(
  jobId: string,
  freelancerId: string,
  clientId: string,
  extras?: Partial<Pick<Invite, 'message' | 'timelineExpect' | 'paymentTerms' | 'requireNDA' | 'additionalRequirements'>>
): Invite {
  const invites = getInvites();
  const existing = invites.find((i) => i.jobId === jobId && i.freelancerId === freelancerId);
  if (existing) return existing;
  const invite: Invite = {
    id: crypto.randomUUID(),
    jobId,
    freelancerId,
    clientId,
    createdAt: new Date().toISOString(),
    ...extras,
  };
  invites.push(invite);
  localStorage.setItem(INVITES_KEY, JSON.stringify(invites));
  return invite;
}
