/**
 * Email verification for signup.
 * Without a backend, we simulate OTP - in production, send via SendGrid/Resend/etc.
 */

const PENDING_KEY = 'talentforge_pending_verification';
const OTP_EXPIRY_MINUTES = 10;

export interface PendingVerification {
  email: string;
  otp: string;
  signupData: {
    name: string;
    password: string;
    role: 'client' | 'freelancer';
    mobile?: string;
    options?: Record<string, unknown>;
  };
  createdAt: string;
}

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getPending(): PendingVerification | null {
  try {
    const data = sessionStorage.getItem(PENDING_KEY);
    if (!data) return null;
    const p: PendingVerification = JSON.parse(data);
    const age = (Date.now() - new Date(p.createdAt).getTime()) / 60000;
    if (age > OTP_EXPIRY_MINUTES) {
      sessionStorage.removeItem(PENDING_KEY);
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

export function createPendingVerification(
  email: string,
  signupData: PendingVerification['signupData']
): { otp: string } {
  const otp = generateOTP();
  const pending: PendingVerification = {
    email: email.toLowerCase().trim(),
    otp,
    signupData,
    createdAt: new Date().toISOString(),
  };
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  return { otp };
}

export function verifyOTP(email: string, otp: string): PendingVerification | null {
  const pending = getPending();
  if (!pending) return null;
  if (pending.email !== email.toLowerCase().trim()) return null;
  if (pending.otp !== otp.trim()) return null;
  sessionStorage.removeItem(PENDING_KEY);
  return pending;
}

export function getPendingForEmail(email: string): PendingVerification | null {
  const pending = getPending();
  if (!pending || pending.email !== email.toLowerCase().trim()) return null;
  return pending;
}

export function clearPending(): void {
  sessionStorage.removeItem(PENDING_KEY);
}
