"use client";

import { useEffect } from "react";

export function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // NEXT_PUBLIC_BASE_PATH is set to "/roznaamcha" for GitHub Pages builds;
      // empty string in local dev (no basePath).
      const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      navigator.serviceWorker.register(`${base}/sw.js`).catch(() => undefined);
    }
  }, []);
  return null;
}
