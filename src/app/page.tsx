import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Download,
  Lock,
  PieChart,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { FaqAccordion } from "@/components/landing/faq-accordion";
import { MockDashboard } from "@/components/landing/mock-dashboard";
import { NavAuth, HeroAuth, CtaAuth } from "@/components/landing/auth-buttons";
import { ThemeToggle } from "@/components/landing/theme-toggle";

export const metadata: Metadata = {
  title: "RozNaamcha | Smart Finance & Budget Tracking",
  description:
    "Take control of your money. Track your income, expenses, budgets, savings, and financial goals in one simple, secure dashboard.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground shadow-sm">
              R
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">RozNaamcha</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NavAuth />
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-panel to-background pt-24 lg:pt-32">
        {/* Subtle background decoration */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
          <div className="h-[40rem] w-[40rem] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Take Control of Your Money with{" "}
            <span className="text-primary">Smart Finance Tracking</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted sm:text-xl">
            Track your income, expenses, budgets, savings, and financial goals in one simple, secure, and beautiful dashboard.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <HeroAuth />
          </div>
        </div>

        {/* Dashboard Mockup Wrapper */}
        <div id="dashboard-demo" className="relative mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
          <MockDashboard />
        </div>
      </section>

      {/* ── Trust / Benefits Section ── */}
      <section className="border-y border-border bg-panel py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Wallet className="h-6 w-6" />
              </div>
              <p className="font-semibold text-foreground">Simple expense tracking</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <PieChart className="h-6 w-6" />
              </div>
              <p className="font-semibold text-foreground">Smart budget planning</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="font-semibold text-foreground">Secure & private data</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BarChart3 className="h-6 w-6" />
              </div>
              <p className="font-semibold text-foreground">Monthly visual reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to master your money
            </h2>
            <p className="mt-4 text-lg text-muted">
              Powerful tools wrapped in a clean, intuitive interface.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Income & Expense Tracking",
                description: "Log your daily transactions instantly. Categorize them to see exactly where your money goes.",
                icon: Wallet,
              },
              {
                title: "Budget Management",
                description: "Set monthly limits for your spending and get visual alerts when you're getting close to the edge.",
                icon: PieChart,
              },
              {
                title: "Calendar View",
                description: "Visualize your cashflow on a real calendar to understand your daily spending habits.",
                icon: CalendarDays,
              },
              {
                title: "Detailed Analytics",
                description: "Beautiful charts that break down your spending by category, month, and year.",
                icon: BarChart3,
              },
              {
                title: "Export & Backup",
                description: "Download your financial records as PDF reports or CSV spreadsheets for your personal archives.",
                icon: Download,
              },
              {
                title: "Bank-grade Security",
                description: "Your data is stored securely using Firebase's enterprise-grade infrastructure. Strictly private to you.",
                icon: Lock,
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-border bg-panel p-8 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-foreground">{feature.title}</h3>
                <p className="text-muted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-panel py-24 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How RozNaamcha works
          </h2>
          <p className="mt-4 text-lg text-muted mb-16">
            Get your finances organized in four simple steps.
          </p>
          
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: "01", title: "Create account", desc: "Sign up securely using your Email or Google account." },
              { step: "02", title: "Log transactions", desc: "Add your income and expenses as they happen." },
              { step: "03", title: "Set budgets", desc: "Define monthly limits to keep your spending in check." },
              { step: "04", title: "Track progress", desc: "Review visual charts to understand your money better." },
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-black text-primary">
                  {item.step}
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">{item.title}</h3>
                <p className="text-muted max-w-xs">{item.desc}</p>
                {/* Connector line for desktop */}
                {i !== 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Built for clarity, speed, and absolute control
              </h2>
              <p className="mt-6 text-lg text-muted leading-relaxed">
                RozNaamcha isn't just another complicated spreadsheet. It's designed to be instantly understandable, helping you build better financial habits without the learning curve.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Clean, distraction-free interface",
                  "Helps reduce unnecessary spending",
                  "Plan and stick to monthly budgets",
                  "Works seamlessly on all devices",
                  "No bloatware, just the tools you need",
                ].map((point, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium text-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-panel p-8 shadow-xl border border-border flex flex-col justify-center items-center">
                <Smartphone className="h-32 w-32 text-primary/20 mb-8" />
                <h3 className="text-2xl font-bold text-center">Mobile Optimized</h3>
                <p className="text-center text-muted mt-2">Log expenses instantly on the go.</p>
              </div>
              <div className="absolute -z-10 inset-0 bg-primary/5 blur-3xl rounded-full scale-110" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="bg-panel py-24 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24 bg-primary text-primary-foreground text-center px-4">
        <h2 className="text-3xl font-bold sm:text-4xl">Start tracking your finances today</h2>
        <p className="mt-4 text-primary-foreground/80 text-lg max-w-2xl mx-auto">
          Join RozNaamcha and take the first step towards better money management and financial freedom.
        </p>
        <div className="mt-10">
          <CtaAuth />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-background py-12 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary font-bold text-primary-foreground text-xs shadow-sm">
              R
            </div>
            <span className="font-semibold text-foreground">RozNaamcha</span>
          </div>
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} RozNaamcha. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted">
            <Link href="/login" className="hover:text-primary transition-colors">Log In</Link>
            <Link href="/register" className="hover:text-primary transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
