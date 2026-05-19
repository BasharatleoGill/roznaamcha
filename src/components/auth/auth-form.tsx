"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BarChart3, CalendarDays, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Enter your full name (at least 2 characters)"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

/** Google "G" logo SVG — official brand asset */
function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

const features = [
  {
    icon: CalendarDays,
    label: "Calendar-based cashflow",
    description: "See income and expenses mapped to every day of the month",
  },
  {
    icon: BarChart3,
    label: "Reports & insights",
    description: "Weekly, monthly, and yearly charts with PDF export",
  },
  {
    icon: ShieldCheck,
    label: "Secure cloud sync",
    description: "Per-user Firebase storage with real-time snapshots",
  },
];

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, configured } = useAuth();
  const [busy, setBusy] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/dashboard");
  const schema = mode === "login" ? loginSchema : registerSchema;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    // Only allow same-origin relative paths to prevent open-redirect attacks
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      setRedirectTo(next);
    }
  }, []);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues | RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", name: "" } as RegisterValues,
  });

  const onSubmit = async (values: LoginValues | RegisterValues) => {
    try {
      setBusy(true);
      if (mode === "login") {
        await signIn(values.email, values.password);
      } else {
        await signUp((values as RegisterValues).name, values.email, values.password);
      }
      router.push(redirectTo);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const googleLogin = async () => {
    try {
      setBusy(true);
      await signInWithGoogle();
      router.push(redirectTo);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-xl border border-border bg-panel shadow-xl lg:grid-cols-[1.1fr_0.9fr]">

        {/* Left panel — brand */}
        <section
          className="relative flex flex-col justify-between overflow-hidden bg-primary p-8 text-primary-foreground lg:p-12"
          aria-hidden="true"
        >
          {/* Subtle pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          {/* Bottom gradient */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/20 to-transparent" />

          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-foreground text-lg font-black text-primary shadow-sm">
              R
            </div>
            <h1 className="mt-8 max-w-md text-4xl font-bold leading-tight tracking-tight">
              RozNaamcha
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-7 text-primary-foreground/80">
              Your daily finance companion. Track income, manage expenses, set
              budgets, and understand your money — all in one place.
            </p>
          </div>

          <div className="relative mt-12 grid gap-4">
            {features.map(({ icon: Icon, label, description }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/15">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="mt-0.5 text-xs leading-5 text-primary-foreground/70">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right panel — form */}
        <section className="flex items-center p-6 sm:p-10 lg:p-12" aria-label="Authentication form">
          <div className="w-full">
            <p className="text-sm font-semibold text-primary">
              {mode === "login" ? "Welcome back" : "Create your workspace"}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              {mode === "login" ? "Sign in to RozNaamcha" : "Start tracking today"}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {mode === "login"
                ? "Use your email or Google account to continue."
                : "Your records stay isolated and secure under your Firebase account."}
            </p>

            {!configured ? (
              <div
                role="alert"
                className="mt-6 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning"
              >
                <p className="font-semibold">Firebase not configured</p>
                <p className="mt-1 text-warning/80">
                  Fill in your Firebase credentials in{" "}
                  <code className="rounded bg-warning/15 px-1 py-0.5 font-mono text-xs">
                    .env.local
                  </code>{" "}
                  before using authentication.
                </p>
              </div>
            ) : null}

            <form
              className="mt-8 grid gap-4"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              aria-label={mode === "login" ? "Sign in form" : "Register form"}
            >
              {mode === "register" ? (
                <Field
                  label="Full name"
                  error={(errors as Record<string, { message?: string }>).name?.message}
                >
                  <div className="relative">
                    <UserRound
                      className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted"
                      aria-hidden="true"
                    />
                    <Input
                      className="pl-9"
                      placeholder="Ayesha Khan"
                      autoComplete="name"
                      {...register("name" as keyof RegisterValues)}
                    />
                  </div>
                </Field>
              ) : null}

              <Field label="Email" error={errors.email?.message}>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted"
                    aria-hidden="true"
                  />
                  <Input
                    className="pl-9"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete={mode === "login" ? "email" : "username"}
                    {...register("email")}
                  />
                </div>
              </Field>

              <Field label="Password" error={errors.password?.message}>
                <div className="relative">
                  <LockKeyhole
                    className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted"
                    aria-hidden="true"
                  />
                  <Input
                    className="pl-9"
                    type="password"
                    placeholder="Minimum 6 characters"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    {...register("password")}
                  />
                </div>
              </Field>

              <Button disabled={busy || !configured} className="mt-2 w-full" type="submit">
                {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs uppercase text-muted">
              <div className="h-px flex-1 bg-border" aria-hidden="true" />
              <span>or</span>
              <div className="h-px flex-1 bg-border" aria-hidden="true" />
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={busy || !configured}
              onClick={googleLogin}
              aria-label="Continue with Google"
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            <p className="mt-8 text-center text-sm text-muted">
              {mode === "login" ? "New to RozNaamcha?" : "Already have an account?"}{" "}
              <Link
                className="font-semibold text-primary underline-offset-4 hover:underline"
                href={mode === "login" ? "/register" : "/login"}
              >
                {mode === "login" ? "Create an account" : "Sign in"}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
