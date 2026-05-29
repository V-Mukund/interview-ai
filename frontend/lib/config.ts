/**
 * Dynamically resolves the API Base URL at runtime.
 *
 * This completely avoids Docker/Next.js build-time environment baking bugs:
 * - If running on a production domain (Railway) → uses the Railway backend URL.
 * - If running on localhost → uses local env (http://localhost:8000).
 */
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return 'https://interview-ai-production-517f.up.railway.app';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://interview-ai-production-517f.up.railway.app';
};

export const API_BASE_URL = getApiBaseUrl();

if (typeof window !== 'undefined') {
  console.log(`[API Config] Dynamic API Base URL resolved to: ${API_BASE_URL}`);
}
