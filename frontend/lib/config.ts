/**
 * Single source of truth for the backend API base URL.
 *
 * In development  → set via NEXT_PUBLIC_API_URL in frontend/.env.local (http://localhost:8000)
 * In production   → set via NEXT_PUBLIC_API_URL in Railway env vars
 * Fallback        → hardcoded Railway backend URL (last resort)
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://interview-ai-production-517f.up.railway.app';

if (typeof window !== 'undefined') {
  console.log(`[API Config] Centralized API Base URL set to: ${API_BASE_URL}`);
}
