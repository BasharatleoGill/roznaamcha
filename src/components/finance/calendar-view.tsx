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

const MAX_INLINE_TX = 4;

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
            <p className="mt-1 text-sm text-muted">Click any day to view or add entries</p>
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
            {/* Column headers — matches PDF day-name header row */}
            <div className="grid grid-cols-[repeat(7,minmax(0,1fr))_11rem] border-b border-border bg-panel-soft">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div
                  key={day}
                  className="border-r border-border px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-widest text-muted"
                >
                  {day}
                </div>
              ))}
              <div className="border-l border-border px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-widest text-muted">
                Weekly Total
              </div>
            </div>

            {/* Week rows */}
            {weeks.map((week) => {
              const weekTransactions = week.flatMap((day) => grouped[day.key] || []);
              const weekSummary = getSummary(weekTransactions);
              const weekLabel = `${format(week[0].date, "MMM d")} – ${format(
                week[week.length - 1].date,
                "MMM d",
              )}`;

              return (
                <div key={week[0].key} className="border-b border-border">
                  {/* Day cells */}
                  <div className="grid grid-cols-[repeat(7,minmax(0,1fr))_11rem]">
                    {week.map((day) => {
                      const dayTransactions = grouped[day.key] || [];
                      const active = selectedDate === day.key;
                      const isToday = isSameDay(day.date, new Date());
                      const inlineTx = dayTransactions.slice(0, MAX_INLINE_TX);
                      const overflow = dayTransactions.length - MAX_INLINE_TX;

                      return (
                        <button
                          key={day.key}
                          type="button"
                          aria-label={`Open transactions for ${format(day.date, "PPP")}`}
                          onClick={() => setSelectedDate(day.key)}
                          className={cn(
                            "group flex min-h-36 flex-col border-r border-border text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                            !day.inMonth && "bg-panel-soft/50",
                            active && "bg-primary/10 ring-2 ring-inset ring-primary",
                          )}
                        >
                          {/* Date number row */}
                          <div className="flex items-center justify-between px-2 pt-2 pb-1">
                            <span
                              className={cn(
                                "flex h-6 w-6 items-center justify-center rounded text-sm font-bold leading-none",
                                isToday && "bg-primary text-primary-foreground",
                                !isToday && day.inMonth && "text-foreground",
                                !isToday && !day.inMonth && "text-muted/50",
                              )}
                            >
                              {format(day.date, "d")}
                            </span>
                            {dayTransactions.length > 0 && (
                              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-primary">
                                {dayTransactions.length}
                              </span>
                            )}
                          </div>

                          {/* DESCRIPTION / AMOUNT sub-header — matches PDF column label */}
                          <div className="grid grid-cols-[1fr_auto] gap-1 border-t border-border/50 px-2 py-0.5">
                            <span className="text-[8.5px] font-semibold uppercase tracking-wider text-muted/60">
                              Description
                            </span>
                            <span className="text-[8.5px] font-semibold uppercase tracking-wider text-muted/60">
                              Amount
                            </span>
                          </div>

                          {/* Inline transaction list */}
                          <div className="flex-1 space-y-px px-2 py-0.5">
                            {inlineTx.map((tx) => (
                              <div
                                key={tx.id}
                                className="grid grid-cols-[1fr_auto] gap-1 text-[10px]"
                              >
                                <span
                                  className={cn(
                                    "truncate",
                                    !day.inMonth && "opacity-60",
                                  )}
                                >
                                  {tx.category}
                                </span>
                                <span
                                  className={cn(
                                    "tabular-nums font-medium",
                                    tx.type === "income" ? "text-income" : "text-expense",
                                  )}
                                >
                                  {fmtCurrency(tx.amount, currencyCode)}
                                </span>
                              </div>
                            ))}
                            {overflow > 0 && (
                              <p className="text-[9px] text-muted">+{overflow} more…</p>
                            )}
                          </div>
                        </button>
                      );
                    })}

                    {/* Week total panel — right column */}
                    <div
                      className="flex flex-col border-l border-border bg-panel-soft/60 p-3"
                      aria-label={`Weekly totals for ${weekLabel}`}
                    >
                      <p className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-muted">
                        {weekLabel}
                      </p>
                      <div className="flex flex-1 flex-col justify-center gap-2 text-xs tabular-nums">
                        <div>
                          <p className="text-[9px] text-muted">Income</p>
                          <p className="font-bold text-income">
                            +{fmtCurrency(weekSummary.income, currencyCode)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted">Expense</p>
                          <p className="font-bold text-expense">
                            −{fmtCurrency(weekSummary.expense, currencyCode)}
                          </p>
                        </div>
                        <div className="border-t border-border/60 pt-1.5">
                          <p className="text-[9px] text-muted">Net</p>
                          <p
                            className={cn(
                              "font-bold tabular-nums",
                              weekSummary.balance < 0 ? "text-expense" : "text-income",
                            )}
                          >
                            {fmtCurrency(weekSummary.balance, currencyCode)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TOTAL row — matches the PDF's per-week TOTAL band */}
                  <div className="grid grid-cols-[repeat(7,minmax(0,1fr))_11rem] border-t border-border/70 bg-panel-soft/40">
                    {week.map((day, i) => {
                      const dayTransactions = grouped[day.key] || [];
                      const daySummary = getSummary(dayTransactions);
                      const hasData = daySummary.count > 0;

                      return (
                        <div
                          key={day.key}
                          className="flex items-center gap-1.5 border-r border-border/60 px-2 py-1.5"
                        >
                          {i === 0 && (
                            <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-primary">
                              Total
                            </span>
                          )}
                          <span
                            className={cn(
                              "text-[10px] tabular-nums font-semibold",
                              !hasData && "text-muted/50",
                              hasData && daySummary.balance < 0 && "text-expense",
                              hasData && daySummary.balance >= 0 && daySummary.income > 0 && "text-income",
                              hasData && daySummary.balance === 0 && daySummary.income === 0 && "text-muted/50",
                            )}
                          >
                            {hasData ? fmtCurrency(daySummary.balance, currencyCode) : "$0.00"}
                          </span>
                        </div>
                      );
                    })}
                    {/* Weekly net in last column */}
                    <div className="border-l border-border/60 px-2 py-1.5">
                      <span
                        className={cn(
                          "text-[10px] tabular-nums font-bold",
                          weekSummary.count === 0 && "text-muted/50",
                          weekSummary.count > 0 && weekSummary.balance < 0 && "text-expense",
                          weekSummary.count > 0 && weekSummary.balance >= 0 && "text-income",
                        )}
                      >
                        {weekSummary.count ? fmtCurrency(weekSummary.balance, currencyCode) : "$0.00"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
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
              <p className="font-semibold text-income">
                {fmtCurrency(selectedSummary.income, currencyCode)}
              </p>
            </div>
            <div className="rounded-md bg-expense/10 p-3">
              <p className="text-xs text-muted">Expense</p>
              <p className="font-semibold text-expense">
                {fmtCurrency(selectedSummary.expense, currencyCode)}
              </p>
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
              <div
                key={transaction.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge tone={transaction.type === "income" ? "income" : "expense"}>
                      {transaction.type}
                    </Badge>
                    <span className="font-semibold">{transaction.category}</span>
                  </div>
                  <p className="mt-1 truncate text-sm text-muted">
                    {transaction.description || transaction.time}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {fmtCurrency(transaction.amount, currencyCode)}
                  </span>
                  <Button variant="ghost" className="h-8 px-2" onClick={() => onEdit(transaction)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-expense"
                    onClick={() => onDelete(transaction)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {!selectedTransactions.length ? (
              <p className="rounded-md bg-panel-soft p-4 text-sm text-muted">
                No entries on this date yet.
              </p>
            ) : null}
          </div>
        </div>
      </Modal>
    </>
  );
}
