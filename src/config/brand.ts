/**
 * Brand configuration - distinct from other platforms
 */
export const BRAND = {
  name: 'Ribha Solutions',
  tagline: 'Connect with skilled freelancers. Build what matters.',
} as const;

export const COLORS = {
  primary: '#6366f1',      // Indigo-500
  primaryHover: '#4f46e5', // Indigo-600
  primaryLight: '#818cf8', // Indigo-400
} as const;

/** Platform fee as decimal (e.g. 0.05 = 5%) - deducted from freelancer payout */
export const PLATFORM_FEE = 0.05;

/** Currency: INR (Indian Rupee) used across the app */
export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';
