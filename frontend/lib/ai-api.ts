// utils/ai-api.ts – Axios instance for AI and long‑running operations
import axios, { AxiosInstance } from "axios";
import { API_BASE_URL } from "./config";

/**
 * Timeout for long‑running AI requests (default 60 seconds).
 * Can be overridden with NEXT_PUBLIC_AI_API_TIMEOUT.
 */
const rawTimeout = Number(process.env.NEXT_PUBLIC_AI_API_TIMEOUT) || 60000;
export const timeout = Math.min(Math.max(rawTimeout, 30000), 120000); // 30‑120 s clamp

export const aiApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT if needed (same logic as api.ts)
aiApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

export default aiApi;

/**
 * Helper to perform an AI request with retry logic.
 * @param requestFn Function that returns a Promise (e.g., () => aiApi.post(...))
 * @param retries Number of retry attempts (default 2)
 * @param delayMs Initial delay between retries (default 1000ms, doubles each retry)
 */
export async function performAiRequest<T>(
  requestFn: () => Promise<T>,
  retries = 2,
  delayMs = 1000
): Promise<T> {
  let attempt = 0;
  let lastError: any;
  while (attempt <= retries) {
    try {
      return await requestFn();
    } catch (err: any) {
      lastError = err;
      const shouldRetry =
        err.isTimeout ||
        err.code === "ECONNABORTED" ||
        (err.response && err.response.status >= 500);
      if (!shouldRetry || attempt === retries) {
        break;
      }
      const wait = delayMs * Math.pow(2, attempt);
      await new Promise((res) => setTimeout(res, wait));
      attempt++;
    }
  }
  throw lastError;
}
