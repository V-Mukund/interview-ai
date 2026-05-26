"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "development") {
        // Automatically unregister stale service worker to prevent ERR_FAILED in local development
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (let registration of registrations) {
            registration.unregister().then((success) => {
              if (success) {
                console.log("Unregistered service worker successfully in development mode.");
                // Reload the page once to clear cache control and restore direct network requests
                window.location.reload();
              }
            });
          }
        });
      } else {
        // Register in production
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("SW registered successfully:", reg))
          .catch((err) => console.error("SW registration failed:", err));
      }
    }
  }, []);

  return null;
}