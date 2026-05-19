"use client";

import {
  BarChart3,
  CalendarDays,
  Eye,
  EyeOff,
  LayoutDashboard,
  LogOut,
  Moon,
  Plus,
  ReceiptText,
  Settings,
  Sun,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useHideValues } from "@/contexts/hide-values-context";
import { TransactionForm } from "@/components/finance/transaction-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn, initials } from "@/lib/utils";
import { useFinance } from "@/hooks/use-finance";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/transactions", label: "Transactions", icon: ReceiptText },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const { hidden, toggle: toggleHidden } = useHideValues();
  const finance = useFinance(user?.uid);
  const [fabOpen, setFabOpen] = useState(false);

  const activeTitle = useMemo(
    () => navItems.find((item) => pathname.startsWith(item.href))?.label || "Dashboard",
    [pathname],
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden border-r border-border bg-panel/90 backdrop-blur lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col" aria-label="Sidebar navigation">
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-black text-primary-foreground shadow-sm">
            R
          </div>
          <div>
            <p className="font-semibold leading-tight">RozNaamcha</p>
            <p className="text-xs text-muted">Daily finance tracker</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3" aria-label="Main navigation">
          <ul className="grid gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted hover:bg-panel-soft hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        active ? "text-primary" : "text-muted",
                      )}
                      aria-hidden="true"
                    />
                    {item.label}
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User + actions */}
        <div className="border-t border-border p-3">
          <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-sm font-bold text-accent"
              aria-hidden="true"
            >
              {initials(user?.displayName, user?.email)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user?.displayName || "Finance owner"}
              </p>
              <p className="truncate text-xs text-muted">{user?.email}</p>
            </div>
          </div>
          <Button
            className="w-full justify-start"
            variant="ghost"
            onClick={logout}
            aria-label="Sign out of RozNaamcha"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                RozNaamcha
              </p>
              <h1 className="truncate text-xl font-semibold">{activeTitle}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                className="h-9 w-9 px-0"
                onClick={toggleHidden}
                title={hidden ? "Show values" : "Hide values"}
                aria-label={hidden ? "Show balance values" : "Hide balance values"}
              >
                {hidden ? (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-9 w-9 px-0"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                <Sun className="hidden h-4 w-4 dark:block" aria-hidden="true" />
                <Moon className="h-4 w-4 dark:hidden" aria-hidden="true" />
              </Button>
              <div
                className="hidden h-9 items-center gap-2 rounded-lg border border-border bg-panel px-3 text-xs text-muted sm:flex"
                aria-label="Cloud sync active"
              >
                <WalletCards className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Cloud synced
              </div>
            </div>
          </div>

          {/* Mobile nav tabs */}
          <nav
            className="flex gap-0.5 overflow-x-auto border-t border-border px-3 py-2 lg:hidden"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-w-max items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted hover:bg-panel-soft hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        {/* Page content */}
        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>

      {/* ── Mobile FAB (quick-add transaction) ── */}
      <div className="fixed bottom-6 right-6 z-40 lg:hidden" aria-label="Quick add transaction">
        <button
          type="button"
          onClick={() => setFabOpen(true)}
          aria-label="Add transaction"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition hover:brightness-95 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {/* FAB modal */}
      <Modal
        open={fabOpen}
        title="Add transaction"
        onClose={() => setFabOpen(false)}
      >
        <TransactionForm
          onSubmit={async (input) => {
            await finance.addTransaction(input);
          }}
          onDone={() => setFabOpen(false)}
        />
      </Modal>
    </div>
  );
}
