// utils/api.ts – Axios instance for authentication, JWT, and regular data saving
import axios, { AxiosInstance } from "axios";

/**
 * Base URL for your backend API. Adjust via NEXT_PUBLIC_API_URL in .env.local.
 */
const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

/**
 * Default timeout (ms) for quick/synchronous requests.
 * Can be overridden with NEXT_PUBLIC_API_TIMEOUT.
 */
const timeout = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 5000;

/**
 * Axios instance used for login, token refresh, and other short‑lived requests.
 */
export const api: AxiosInstance = axios.create({
  baseURL,
  timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT from localStorage (client‑side only) to every request.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
