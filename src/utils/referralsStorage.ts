const REFERRALS_KEY = 'talentforge_referrals';

export interface Referral {
  id: string;
  referrerId: string;
  referredEmail: string;
  code: string;
  signedUp: boolean;
  createdAt: string;
}

export function getReferrals(referrerId: string): Referral[] {
  try {
    const data = localStorage.getItem(REFERRALS_KEY);
    const all: Referral[] = data ? JSON.parse(data) : [];
    return all.filter((r) => r.referrerId === referrerId);
  } catch {
    return [];
  }
}

export function createReferral(referrerId: string, referredEmail: string): Referral {
  const data = localStorage.getItem(REFERRALS_KEY);
  const all: Referral[] = data ? JSON.parse(data) : [];
  const code = `TF-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const r: Referral = {
    id: crypto.randomUUID(),
    referrerId,
    referredEmail,
    code,
    signedUp: false,
    createdAt: new Date().toISOString(),
  };
  all.push(r);
  localStorage.setItem(REFERRALS_KEY, JSON.stringify(all));
  return r;
}

export function getReferralCode(referrerId: string): string {
  return `TF-REF-${referrerId.slice(0, 8)}`;
}
