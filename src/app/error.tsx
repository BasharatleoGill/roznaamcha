"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-lg rounded-lg border border-border bg-panel p-6 text-center shadow-sm">
        <p className="text-sm font-semibold text-expense">Something went wrong</p>
        <h1 className="mt-2 text-2xl font-semibold">RozNaamcha could not load this view</h1>
        <p className="mt-3 text-sm text-muted">
          {error.message || "Please try again. If the issue continues, check your Firebase configuration and browser console."}
        </p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
