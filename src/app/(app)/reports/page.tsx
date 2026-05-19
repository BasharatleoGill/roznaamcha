"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Lightbulb, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryChart, PeriodBarChart } from "@/components/charts/finance-charts";
import { StatCard } from "@/components/finance/stat-card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { LoadingState } from "@/components/ui/status";
import { useAuth } from "@/contexts/auth-context";
import { useHideValues } from "@/contexts/hide-values-context";
import { useFinance } from "@/hooks/use-finance";
import { exportReportPdf } from "@/lib/export";
import { filterByRange, getSummary, monthKey, monthSeries, todayKey, yearKey } from "@/lib/finance";
import { cn } from "@/lib/utils";

type ReportPeriod = "weekly" | "monthly" | "yearly";

export default function ReportsPage() {
  const { user } = useAuth();
  const finance = useFinance(user?.uid);
  const { format: fmtCurrency } = useHideValues();
  const [period, setPeriod] = useState<ReportPeriod>("monthly");
  const [weekDate, setWeekDate] = useState(todayKey());
  const [month, setMonth] = useState(monthKey());
  const [year, setYear] = useState(yearKey());

  const report = useMemo(() => {
    if (period === "weekly") {
      const anchor = parseISO(weekDate);
      const start = startOfWeek(anchor, { weekStartsOn: 1 });
      const end = endOfWeek(anchor, { weekStartsOn: 1 });
      const transactions = filterByRange(finance.transactions, start, end);
      const data = eachDayOfInterval({ start, end }).map((date) => {
        const dateKey = format(date, "yyyy-MM-dd");
        const daySummary = getSummary(
          transactions.filter((transaction) => transaction.date === dateKey),
        );

        return {
          label: format(date, "EEE d"),
          income: daySummary.income,
          expense: daySummary.expense,
          balance: daySummary.balance,
        };
      });

      return {
        title: `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`,
        transactions,
        chartTitle: "Weekly income vs expense",
        chartData: data,
        xKey: "label",
        bestLabel: "Best day",
        bestItem: [...data].sort((a, b) => b.balance - a.balance)[0],
      };
    }

    if (period === "monthly") {
      const start = startOfMonth(parseISO(`${month}-01`));
      const end = endOfMonth(start);
      const transactions = filterByRange(finance.transactions, start, end);
      const data = eachDayOfInterval({ start, end }).map((date) => {
        const dateKey = format(date, "yyyy-MM-dd");
        const daySummary = getSummary(
          transactions.filter((transaction) => transaction.date === dateKey),
        );

        return {
          label: format(date, "d"),
          income: daySummary.income,
          expense: daySummary.expense,
          balance: daySummary.balance,
        };
      });

      return {
        title: format(start, "MMMM yyyy"),
        transactions,
        chartTitle: "Monthly daily income vs expense",
        chartData: data,
        xKey: "label",
        bestLabel: "Best day",
        bestItem: [...data].sort((a, b) => b.balance - a.balance)[0],
      };
    }

    const transactions = finance.transactions.filter((transaction) =>
      transaction.date.startsWith(year),
    );
    const data = monthSeries(transactions, year).map((item) => ({
      label: item.month,
      income: item.income,
      expense: item.expense,
      balance: item.balance,
    }));

    return {
      title: year,
      transactions,
      chartTitle: "Yearly monthly income vs expense",
      chartData: data,
      xKey: "label",
      bestLabel: "Best month",
      bestItem: [...data].sort((a, b) => b.balance - a.balance)[0],
    };
  }, [finance.transactions, month, period, weekDate, year]);

  const summary = useMemo(() => getSummary(report.transactions), [report.transactions]);
  const averageExpense = report.chartData.length
    ? report.chartData.reduce((sum, item) => sum + Number(item.expense), 0) /
      report.chartData.length
    : 0;

  if (finance.loading) return <LoadingState />;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold">Reports and insights</h2>
          <p className="mt-1 text-sm text-muted">
            Weekly, monthly, yearly, category-wise, and trend analytics.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div
            className="flex rounded-lg border border-border bg-panel p-1"
            role="group"
            aria-label="Report period"
          >
            {(["weekly", "monthly", "yearly"] as ReportPeriod[]).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={period === item}
                className={cn(
                  "h-9 rounded px-3 text-sm font-semibold capitalize text-muted transition hover:bg-panel-soft",
                  period === item && "bg-primary text-primary-foreground hover:bg-primary",
                )}
                onClick={() => setPeriod(item)}
              >
                {item}
              </button>
            ))}
          </div>
          {period === "weekly" ? (
            <Input type="date" value={weekDate} onChange={(event) => setWeekDate(event.target.value)} />
          ) : null}
          {period === "monthly" ? (
            <Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          ) : null}
          {period === "yearly" ? (
            <Select value={year} onChange={(event) => setYear(event.target.value)}>
              {Array.from({ length: 6 }, (_, index) => String(new Date().getFullYear() - index)).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          ) : null}
          <Button
            variant="secondary"
            disabled={!report.transactions.length}
            onClick={() => exportReportPdf(report.transactions, finance.settings.currency)}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {finance.error ? (
        <Alert title="Firestore could not load report data">
          {finance.error}
        </Alert>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label={`${report.title} income`}
          value={fmtCurrency(summary.income, finance.settings.currency)}
          helper={`Total received in this ${period.replace("ly", "")}`}
          icon={TrendingUp}
          tone="income"
        />
        <StatCard
          label={`${report.title} expenses`}
          value={fmtCurrency(summary.expense, finance.settings.currency)}
          helper={`Total spent in this ${period.replace("ly", "")}`}
          icon={TrendingDown}
          tone="expense"
        />
        <StatCard
          label="Net result"
          value={fmtCurrency(summary.balance, finance.settings.currency)}
          helper={`${summary.count} records included`}
          icon={Lightbulb}
          tone="accent"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <PeriodBarChart
          title={report.chartTitle}
          data={report.chartData}
          xKey={report.xKey}
          currencyCode={finance.settings.currency}
        />
        <CategoryChart transactions={report.transactions} currencyCode={finance.settings.currency} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Financial insights</CardTitle>
        </CardHeader>
        <div className="grid gap-3 md:grid-cols-3">
          <Insight
            title={report.bestLabel}
            value={report.bestItem ? `${report.bestItem.label}: ${fmtCurrency(Number(report.bestItem.balance), finance.settings.currency)}` : "No data"}
          />
          <Insight
            title="Savings ratio"
            value={summary.income ? `${Math.round((summary.balance / summary.income) * 100)}%` : "0%"}
          />
          <Insight title="Average expense" value={fmtCurrency(averageExpense, finance.settings.currency)} />
        </div>
      </Card>
    </div>
  );
}

function Insight({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md bg-panel-soft p-4">
      <p className="text-sm text-muted">{title}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}
