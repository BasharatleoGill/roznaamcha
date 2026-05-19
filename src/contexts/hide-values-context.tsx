"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { currency } from "@/lib/utils";

const STORAGE_KEY = "roznaamcha-values-hidden";
const MASK = "••••••";

type HideValuesContextType = {
  hidden: boolean;
  toggle: () => void;
  format: (amount: number, code?: string) => string;
};

const HideValuesContext = createContext<HideValuesContextType>({
  hidden: false,
  toggle: () => undefined,
  format: (amount, code) => currency(amount, code),
});

export function HideValuesProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);

  // Read localStorage after mount to avoid SSR/hydration mismatch
  useEffect(() => {
    try {
      setHidden(localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      // localStorage blocked (e.g. some private-browsing modes)
    }
  }, []);

  const toggle = useCallback(() => {
    setHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const format = useCallback(
    (amount: number, code?: string) => (hidden ? MASK : currency(amount, code)),
    [hidden],
  );

  return (
    <HideValuesContext.Provider value={{ hidden, toggle, format }}>
      {children}
    </HideValuesContext.Provider>
  );
}

export function useHideValues() {
  return useContext(HideValuesContext);
}
