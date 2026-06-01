const ESCROW_KEY = 'talentforge_escrow';

export interface Escrow {
  contractId: string;
  jobId: string;
  clientId: string;
  freelancerId: string;
  totalFunded: number;
  totalReleased: number;
  status: 'empty' | 'funded' | 'partial' | 'released';
  fundedAt?: string;
  updatedAt: string;
}

function getRaw(): Record<string, Escrow> {
  try {
    const data = localStorage.getItem(ESCROW_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function save(escrows: Record<string, Escrow>) {
  localStorage.setItem(ESCROW_KEY, JSON.stringify(escrows));
}

export function getEscrow(contractId: string): Escrow | null {
  return getRaw()[contractId] ?? null;
}

export function getOrCreateEscrow(contractId: string, jobId: string, clientId: string, freelancerId: string): Escrow {
  const escrows = getRaw();
  if (escrows[contractId]) return escrows[contractId];
  const escrow: Escrow = {
    contractId,
    jobId,
    clientId,
    freelancerId,
    totalFunded: 0,
    totalReleased: 0,
    status: 'empty',
    updatedAt: new Date().toISOString(),
  };
  escrows[contractId] = escrow;
  save(escrows);
  return escrow;
}

export function fundEscrow(contractId: string, amount: number): Escrow | null {
  const escrows = getRaw();
  const e = escrows[contractId];
  if (!e) return null;
  const totalFunded = Math.round((e.totalFunded + amount) * 100) / 100;
  const status = totalFunded > 0
    ? e.totalReleased >= totalFunded ? 'released' : 'funded'
    : 'empty';
  const updated: Escrow = {
    ...e,
    totalFunded,
    status,
    fundedAt: e.fundedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  escrows[contractId] = updated;
  save(escrows);
  return updated;
}

export function releaseFromEscrow(contractId: string, amount: number): Escrow | null {
  const escrows = getRaw();
  const e = escrows[contractId];
  if (!e || e.totalFunded - e.totalReleased < amount) return null;
  const totalReleased = Math.round((e.totalReleased + amount) * 100) / 100;
  const status = totalReleased >= e.totalFunded ? 'released' : 'partial';
  const updated: Escrow = {
    ...e,
    totalReleased,
    status,
    updatedAt: new Date().toISOString(),
  };
  escrows[contractId] = updated;
  save(escrows);
  return updated;
}

export function getAvailableEscrowBalance(contractId: string): number {
  const e = getEscrow(contractId);
  if (!e) return 0;
  return Math.round((e.totalFunded - e.totalReleased) * 100) / 100;
}

/** Refund from escrow to client. Amount must be <= available balance. */
export function refundToClient(contractId: string, amount: number): Escrow | null {
  const escrows = getRaw();
  const e = escrows[contractId];
  const available = e ? e.totalFunded - e.totalReleased : 0;
  if (!e || amount <= 0 || amount > available) return null;
  const totalFunded = Math.round((e.totalFunded - amount) * 100) / 100;
  const status = totalFunded <= 0 ? 'empty' : e.totalReleased >= totalFunded ? 'released' : 'funded';
  const updated: Escrow = {
    ...e,
    totalFunded,
    status,
    updatedAt: new Date().toISOString(),
  };
  escrows[contractId] = updated;
  save(escrows);
  return updated;
}
