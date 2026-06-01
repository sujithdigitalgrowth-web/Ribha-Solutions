/**
 * API configuration for Ribha Solutions
 * Set VITE_API_URL to override. Uses API in both local and production.
 */
const DEFAULT_API_URL = 'https://app.ribhasolutions.com/api';
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;

export const API_ENABLED = !!API_BASE_URL;

const base = API_BASE_URL ? API_BASE_URL.replace(/\/$/, '') : '';
export const api = {
  register: base ? `${base}/register.php` : '',
  login: base ? `${base}/login.php` : '',
  health: base ? `${base}/health.php` : '',
  sendOtp: base ? `${base}/send-otp.php` : '',
  verifyRegister: base ? `${base}/verify-register.php` : '',
  updateProfile: base ? `${base}/update-profile.php` : '',
  jobs: base ? `${base}/jobs.php` : '',
  proposals: base ? `${base}/proposals.php` : '',
  contracts: base ? `${base}/contracts.php` : '',
  milestones: base ? `${base}/milestones.php` : '',
  examDefinitions: base ? `${base}/exam_definitions.php` : '',
  examAttempts: base ? `${base}/exam_attempts.php` : '',
  onboarding: base ? `${base}/onboarding.php` : '',
  /** Public user list (no passwords) — for admin UI */
  users: base ? `${base}/users.php` : '',
};
