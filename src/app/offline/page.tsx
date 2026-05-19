"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-panel p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <WifiOff className="h-7 w-7 text-primary" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold">You&rsquo;re offline</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
          RozNaamcha couldn&rsquo;t reach the internet. Check your connection and
          try again.
        </p>
        <button
          className="mt-8 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    </main>
  );
}
