"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("ServiceWorker registered successfully:", reg))
          .catch((err) => console.error("ServiceWorker registration failed:", err));
      });
    }
  }, []);

  return null;
}
