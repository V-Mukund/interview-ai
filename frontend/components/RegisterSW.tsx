"use client";

import { useEffect } from "react";

/**
 * RegisterSW — Handles service worker lifecycle events and handles
 * programmatic service worker migrations to prevent stale/broken caches.
 */
export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // ─── STALE SW MIGRATION ──────────────────────────────────────────
    // Forcefully unregisters any legacy/stale service workers once.
    // This resolves the PWA preflight/CORS caching issues programmatically
    // without requiring manual DevTools clearing from the user.
    const SW_MIGRATION_KEY = "sw_migration_v4_fixed";
    if (localStorage.getItem(SW_MIGRATION_KEY) !== "true") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        if (registrations.length > 0) {
          console.log("[SW Migration] Clearing stale service workers...");
          Promise.all(registrations.map(r => r.unregister())).then(() => {
            localStorage.setItem(SW_MIGRATION_KEY, "true");
            console.log("[SW Migration] Stale cache cleared. Reloading page...");
            window.location.reload();
          });
        } else {
          localStorage.setItem(SW_MIGRATION_KEY, "true");
        }
      });
      return;
    }

    // Listen for SW controller change (new version activated)
    let refreshing = false;
    const handleControllerChange = () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    // Check for waiting service worker on page load
    navigator.serviceWorker.ready.then((registration) => {
      // Force update check on page load to ensure latest version is active
      registration.update().catch(() => {});

      // If there's already a waiting worker, it means an update is available
      if (registration.waiting) {
        console.log("[SW] Update available, activating...");
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      // Listen for future updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            console.log("[SW] New version installed, activating...");
            newWorker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });
    });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  return null;
}
