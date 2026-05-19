"use client";

import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { HideValuesProvider } from "@/contexts/hide-values-context";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SwRegister } from "@/components/providers/sw-register";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <HideValuesProvider>
        <AuthProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
          <SwRegister />
        </AuthProvider>
      </HideValuesProvider>
    </ThemeProvider>
  );
}
