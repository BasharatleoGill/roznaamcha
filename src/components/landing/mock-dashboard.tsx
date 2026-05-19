"use client";

import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, PiggyBank, WalletCards } from "lucide-react";
import { CashflowChart, CategoryChart } from "@/components/charts/finance-charts";
import { StatCard } from "@/components/finance/stat-card";
import { Transaction, TransactionCategory } from "@/types/finance";
import { subDays, formatISO } from "date-fns";

const EXPENSE_CATEGORIES: TransactionCategory[] = ["Food", "Transport", "Utilities", "Shopping", "Entertainment"];

export function MockDashboard() {
  const now = useMemo(() => new Date(), []);

  const mockTransactions: Transaction[] = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      const isIncome = i % 5 === 0;
      const date = subDays(now, Math.floor(i / 1.5));
      return {
        id: `mock-${i}`,
        userId: "landing-page",
        type: isIncome ? "income" : "expense",
        amount: isIncome ? 8500 + (i * 317) % 4000 : 120 + (i * 137) % 900,
        category: isIncome ? "Salary" : EXPENSE_CATEGORIES[i % 5],
        date: formatISO(date, { representation: "date" }),
        time: "10:00",
        description: "Sample transaction",
        createdAt: date,
      } as Transaction;
    });
  }, [now]);

  return (
    <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl shadow-primary/10">
      {/* Fake dashboard header */}
      <div className="flex items-center justify-between border-b border-border bg-panel/80 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary font-bold text-primary-foreground">
            R
          </div>
          <span className="font-semibold text-foreground hidden sm:inline">RozNaamcha Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-64 rounded-md bg-panel-soft hidden md:block border border-border"></div>
          <div className="h-8 w-8 rounded-full bg-accent/20"></div>
        </div>
      </div>

      {/* Fake dashboard content */}
      <div className="p-6 pointer-events-none grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Balance"
            value="Rs 124,500"
            helper="+12% from last month"
            icon={WalletCards}
            tone="neutral"
          />
          <StatCard
            label="Monthly Income"
            value="Rs 85,000"
            helper="Salary & Investments"
            icon={ArrowUpRight}
            tone="income"
          />
          <StatCard
            label="Monthly Expenses"
            value="Rs 32,450"
            helper="Across 14 categories"
            icon={ArrowDownRight}
            tone="expense"
          />
          <StatCard
            label="Savings Goal"
            value="Rs 52,550"
            helper="On track to hit goal"
            icon={PiggyBank}
            tone="accent"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="scale-[0.98] origin-top-left lg:scale-100">
            <CashflowChart transactions={mockTransactions} currencyCode="PKR" />
          </div>
          <div className="scale-[0.98] origin-top-right lg:scale-100">
            <CategoryChart transactions={mockTransactions} currencyCode="PKR" />
          </div>
        </div>
      </div>
    </div>
  );
}
