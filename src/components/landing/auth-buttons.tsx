"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";

export function NavAuth() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return <div className="h-10 w-48 animate-pulse rounded-md bg-panel-soft" />;
  }

  if (user) {
    return (
      <Link
        href="/dashboard"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Go to Dashboard
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="text-sm font-semibold text-muted transition hover:text-foreground"
      >
        Log in
      </Link>
      <Link
        href="/register"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Get Started
      </Link>
    </>
  );
}

export function HeroAuth() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex gap-4">
        <div className="h-12 w-48 animate-pulse rounded-md bg-panel-soft" />
        <div className="h-12 w-48 animate-pulse rounded-md bg-panel-soft" />
      </div>
    );
  }

  if (user) {
    return (
      <Link
        href="/dashboard"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Go to Dashboard <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/register"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Get Started Free <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        href="#dashboard-demo"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-panel px-8 text-base font-semibold text-foreground transition hover:bg-panel-soft active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        View Dashboard Demo
      </Link>
    </>
  );
}

export function CtaAuth() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return <div className="h-14 w-48 animate-pulse rounded-full bg-white/20" />;
  }

  return (
    <Link
      href={user ? "/dashboard" : "/register"}
      className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-10 text-lg font-bold text-primary shadow-xl transition hover:bg-white/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
    >
      {user ? "Go to Dashboard" : "Get Started Free"}
    </Link>
  );
}
