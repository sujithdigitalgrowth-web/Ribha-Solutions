/** Static admin: any non-empty password grants access when email matches. */
export const STATIC_ADMIN_EMAIL = 'info@ribhasolutions.com';

export const STATIC_ADMIN_USER_ID = 'static-admin-ribha';

export function isStaticAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === STATIC_ADMIN_EMAIL.toLowerCase();
}
