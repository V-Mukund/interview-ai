"use client";

import { useEffect } from "react";

/**
 * RegisterSW — Handles service worker lifecycle events.
 *
 * Note: next-pwa (with register: true in next.config.mjs) handles the initial
 * SW registration automatically. This component only listens for update events
 * so we can prompt users when a new version is available.
 */
export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
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
