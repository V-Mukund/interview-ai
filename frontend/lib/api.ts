// utils/api.ts – Axios instance for authentication, JWT, and regular data saving
import axios, { AxiosInstance } from "axios";
import { API_BASE_URL } from "./config";

/**
 * Default timeout (ms) for quick/synchronous requests.
 * Can be overridden with NEXT_PUBLIC_API_TIMEOUT.
 */
const timeout = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 5000;

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT from IndexedDB (client‑side only) to every request.
api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const { getAuthValue } = await import("./auth-store");
    const token = await getAuthValue("token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
