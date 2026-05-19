"use client";

import {
  addMonths,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/finance/stat-card";
import { Modal } from "@/components/ui/modal";
import {
  calendarDays,
  filterByRange,
  getSummary,
  transactionsByDate,
} from "@/lib/finance";
import { exportCalendarPdf } from "@/lib/export";
import { cn } from "@/lib/utils";
import { useHideValues } from "@/contexts/hide-values-context";
import { Transaction } from "@/types/finance";

type CalendarViewProps = {
  transactions: Transaction[];
  currencyCode: string;
  onAdd: (date: string) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};

export function CalendarView({
  transactions,
  currencyCode,
  onAdd,
  onEdit,
  onDelete,
}: CalendarViewProps) {
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const days = useMemo(() => calendarDays(month), [month]);
  const weeks = useMemo(
    () =>
      Array.from({ length: Math.ceil(days.length / 7) }, (_, index) =>
        days.slice(index * 7, index * 7 + 7),
      ),
    [days],
  );
  const grouped = useMemo(() => transactionsByDate(transactions), [transactions]);
  const monthTransactions = useMemo(
    () => filterByRange(transactions, startOfMonth(month), endOfMonth(month)),
    [transactions, month],
  );
  const monthSummary = useMemo(() => getSummary(monthTransactions), [monthTransactions]);
  const selectedTransactions = selectedDate ? grouped[selectedDate] || [] : [];
  const selectedSummary = getSummary(selectedTransactions);
  const { format: fmtCurrency } = useHideValues();

  return (
    <>
      <section aria-label="Monthly finance summary" className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total income"
          value={fmtCurrency(monthSummary.income, currencyCode)}
          helper={`For ${format(month, "MMMM yyyy")}`}
          icon={ArrowUpRight}
          tone="income"
        />
        <StatCard
          label="Total expense"
          value={fmtCurrency(monthSummary.expense, currencyCode)}
          helper={`${monthSummary.count} transactions this month`}
          icon={ArrowDownRight}
          tone="expense"
        />
        <StatCard
          label="Current balance"
          value={fmtCurrency(monthSummary.balance, currencyCode)}
          helper="Income minus expense"
          icon={Wallet}
          valueClassName={monthSummary.balance < 0 ? "text-expense" : undefined}
        />
      </section>

      <Card className="overflow-hidden p-0">
        <CardHeader className="m-0 border-b border-border p-4">
          <div>
            <CardTitle>{format(month, "MMMM yyyy")}</CardTitle>
            <p className="mt-1 text-sm text-muted">Click any day to inspect or add entries</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="secondary"
              className="h-9"
              disabled={!monthTransactions.length}
              onClick={() => exportCalendarPdf(monthTransactions, month, currencyCode)}
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <Button
              variant="secondary"
              className="h-9 w-9 px-0"
              onClick={() => setMonth(subMonths(month, 1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              className="h-9 w-9 px-0"
              onClick={() => setMonth(addMonths(month, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <div className="min-w-225">
            <div className="grid grid-cols-[repeat(7,minmax(0,1fr))_11rem] border-b border-border bg-panel-soft text-center text-xs font-semibold uppercase text-muted">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="px-2 py-3">
                  {day}
                </div>
              ))}
              <div className="border-l border-border px-2 py-3">Week total</div>
            </div>
            <div>
              {weeks.map((week) => {
                const weekTransactions = week.flatMap((day) => grouped[day.key] || []);
                const weekSummary = getSummary(weekTransactions);
                const weekLabel = `${format(week[0].date, "MMM d")} - ${format(
                  week[week.length - 1].date,
                  "MMM d",
                )}`;

                return (
                  <div
                    key={week[0].key}
                    className="grid grid-cols-[repeat(7,minmax(0,1fr))_11rem]"
                  >
                    {week.map((day) => {
                      const dayTransactions = grouped[day.key] || [];
                      const summary = getSummary(dayTransactions);
                      const active = selectedDate === day.key;

                      return (
                        <button
                          key={day.key}
                          type="button"
                          aria-label={`Open transactions for ${format(day.date, "PPP")}`}
                          className={cn(
                            "min-h-32 border-b border-r border-border p-2 text-left transition hover:bg-panel-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                            !day.inMonth && "bg-panel-soft/45 text-muted",
                            active && "bg-primary/10",
                          )}
                          onClick={() => setSelectedDate(day.key)}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={cn(
                                "grid h-7 w-7 place-items-center rounded-md text-sm font-semibold",
                                isSameDay(day.date, new Date()) &&
                                  "bg-primary text-primary-foreground",
                              )}
                            >
                              {format(day.date, "d")}
                            </span>
                            {dayTransactions.length ? <Badge>{dayTransactions.length}</Badge> : null}
                          </div>
                          <div className="mt-3 grid gap-1 text-xs">
                            {summary.income ? (
                              <span className="text-income">
                                +{fmtCurrency(summary.income, currencyCode)}
                              </span>
                            ) : null}
                            {summary.expense ? (
                              <span className="text-expense">
                                -{fmtCurrency(summary.expense, currencyCode)}
                              </span>
                            ) : null}
                            {summary.count ? (
                              <span className="font-semibold">
                                {fmtCurrency(summary.balance, currencyCode)}
                              </span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                    <div
                      className="min-h-32 border-b border-l border-border bg-panel-soft/55 p-3"
                      aria-label={`Weekly income and expense for ${weekLabel}`}
                    >
                      <p className="text-xs font-semibold uppercase text-muted">{weekLabel}</p>
                      <div className="mt-4 grid gap-2 text-sm tabular-nums">
                        <div>
                          <p className="text-xs text-muted">Income</p>
                          <p className="truncate font-semibold text-income">
                            +{fmtCurrency(weekSummary.income, currencyCode)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted">Expense</p>
                          <p className="truncate font-semibold text-expense">
                            -{fmtCurrency(weekSummary.expense, currencyCode)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <Modal
        open={Boolean(selectedDate)}
        title={selectedDate ? format(parseISO(selectedDate), "PPP") : "Daily transactions"}
        onClose={() => setSelectedDate(null)}
      >
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md bg-income/10 p-3">
              <p className="text-xs text-muted">Income</p>
              <p className="font-semibold text-income">{fmtCurrency(selectedSummary.income, currencyCode)}</p>
            </div>
            <div className="rounded-md bg-expense/10 p-3">
              <p className="text-xs text-muted">Expense</p>
              <p className="font-semibold text-expense">{fmtCurrency(selectedSummary.expense, currencyCode)}</p>
            </div>
            <div className="rounded-md bg-panel-soft p-3">
              <p className="text-xs text-muted">Balance</p>
              <p className="font-semibold">{fmtCurrency(selectedSummary.balance, currencyCode)}</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              if (!selectedDate) return;
              onAdd(selectedDate);
              setSelectedDate(null);
            }}
          >
            <Plus className="h-4 w-4" />
            Add on this date
          </Button>
          <div className="grid gap-2">
            {selectedTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge tone={transaction.type === "income" ? "income" : "expense"}>{transaction.type}</Badge>
                    <span className="font-semibold">{transaction.category}</span>
                  </div>
                  <p className="mt-1 truncate text-sm text-muted">{transaction.description || transaction.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{fmtCurrency(transaction.amount, currencyCode)}</span>
                  <Button variant="ghost" className="h-8 px-2" onClick={() => onEdit(transaction)}>
                    Edit
                  </Button>
                  <Button variant="ghost" className="h-8 px-2 text-expense" onClick={() => onDelete(transaction)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {!selectedTransactions.length ? (
              <p className="rounded-md bg-panel-soft p-4 text-sm text-muted">No entries on this date yet.</p>
            ) : null}
          </div>
        </div>
      </Modal>
    </>
  );
}
