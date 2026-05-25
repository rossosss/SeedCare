export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role?: "USER" | "ADMIN";
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  careMode?: "SIMPLE" | "EXPERT";
};

export const SESSION_COOKIE_NAME = "seedcare_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
