import { API_ENABLED } from '@/config/api';
import { createProposal as createProposalApi } from '@/services/dynamicDataApi';

const PROPOSALS_KEY = 'talentforge_proposals';

export interface Proposal {
  id: string;
  jobId: string;
  freelancerId: string;
  freelancerName?: string;
  coverLetter: string;
  proposedRate: string;
  timeline: string;
  ndaSigned: boolean;
  ndaSignedAt?: string;
  ndaAddress?: string;
  ndaDisclosureAccepted?: boolean;
  ndaSignatureDataUrl?: string;
  createdAt: string;
  attachments?: Array<{ id: string; name: string; url: string; size?: number }>;
  status?: 'new' | 'viewed' | 'shortlisted' | 'declined';
  whyGoodFit?: string;
}

// Extras allowed when submitting (stored in proposal)
type ProposalSubmitExtras = { freelancerName?: string; ndaAddress?: string; ndaDisclosureAccepted?: boolean; ndaSignatureDataUrl?: string; whyGoodFit?: string };

export function getProposals(filters?: { jobId?: string; freelancerId?: string }): Proposal[] {
  try {
    const data = localStorage.getItem(PROPOSALS_KEY);
    const proposals: Proposal[] = data ? JSON.parse(data) : [];
    if (!filters) return proposals;
    return proposals.filter((p) => {
      if (filters.jobId && p.jobId !== filters.jobId) return false;
      if (filters.freelancerId && p.freelancerId !== filters.freelancerId) return false;
      return true;
    });
  } catch {
    return [];
  }
}

export function getApplicantCount(jobId: string): number {
  return getProposals({ jobId }).length;
}

export function hasApplied(jobId: string, freelancerId: string): boolean {
  return getProposals({ jobId, freelancerId }).length > 0;
}

/** Submit proposal locally and to API when enabled. */
export async function submitProposal(proposal: Omit<Proposal, 'id' | 'createdAt'> & ProposalSubmitExtras): Promise<Proposal> {
  const proposals = getProposals();
  const existing = proposals.find((p) => p.jobId === proposal.jobId && p.freelancerId === proposal.freelancerId);
  if (existing) return existing;
  if (API_ENABLED) {
    const payload = {
      jobId: proposal.jobId,
      freelancerId: proposal.freelancerId,
      freelancerName: proposal.freelancerName,
      coverLetter: proposal.coverLetter,
      proposedRate: proposal.proposedRate,
      timeline: proposal.timeline,
      ndaSigned: proposal.ndaSigned,
      ndaSignedAt: proposal.ndaSignedAt,
      ndaAddress: proposal.ndaAddress,
      ndaDisclosureAccepted: proposal.ndaDisclosureAccepted,
      ndaSignatureDataUrl: proposal.ndaSignatureDataUrl,
      whyGoodFit: proposal.whyGoodFit,
    };
    const res = await createProposalApi(payload);
    if (res.success && res.proposal && typeof res.proposal === 'object' && 'id' in res.proposal) {
      const apiProposal = res.proposal as Proposal;
      proposals.push(apiProposal);
      localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));
      return apiProposal;
    }
  }
  const newProposal: Proposal = {
    ...proposal,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  proposals.push(newProposal);
  localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));
  return newProposal;
}

export function updateProposalStatus(proposalId: string, status: 'new' | 'viewed' | 'shortlisted' | 'declined'): Proposal | null {
  const data = localStorage.getItem(PROPOSALS_KEY);
  const all: Proposal[] = data ? JSON.parse(data) : [];
  const idx = all.findIndex((p) => p.id === proposalId);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], status };
  localStorage.setItem(PROPOSALS_KEY, JSON.stringify(all));
  return all[idx];
}
