// utils/api.ts – Axios instance for authentication, JWT, and regular data saving
import axios, { AxiosInstance } from "axios";

/**
 * Default timeout (ms) for quick/synchronous requests.
 * Can be overridden with NEXT_PUBLIC_API_TIMEOUT.
 */
const timeout = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 5000;

export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://interview-ai-production-517f.up.railway.app',
  timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT from localStorage (client‑side only) to every request.
// Checks both 'token' (used by login page) and 'accessToken' for compatibility.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
