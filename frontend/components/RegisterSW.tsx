"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    async function registerSW() {
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");

          console.log("SW REGISTERED:", registration);
        } catch (error) {
          console.error("SW FAILED:", error);
        }
      }
    }

    registerSW();
  }, []);

  return null;
}