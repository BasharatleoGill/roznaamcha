import {
  addDays,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { Budget, Summary, Transaction } from "@/types/finance";

export const todayKey = () => format(new Date(), "yyyy-MM-dd");
export const monthKey = (date = new Date()) => format(date, "yyyy-MM");
export const yearKey = (date = new Date()) => format(date, "yyyy");

export function getSummary(transactions: Transaction[]): Summary {
  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const expense = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    income,
    expense,
    balance: income - expense,
    count: transactions.length,
  };
}

export function filterByRange(
  transactions: Transaction[],
  start: Date,
  end: Date,
) {
  return transactions.filter((transaction) =>
    isWithinInterval(parseISO(transaction.date), { start, end }),
  );
}

export function periodSummaries(transactions: Transaction[]) {
  const now = new Date();
  // Use startOfDay/endOfDay so the full calendar day is captured
  const today = filterByRange(transactions, startOfDay(now), endOfDay(now));
  const week = filterByRange(
    transactions,
    startOfWeek(now, { weekStartsOn: 1 }),
    endOfWeek(now, { weekStartsOn: 1 }),
  );
  const month = filterByRange(transactions, startOfMonth(now), endOfMonth(now));

  return {
    today: getSummary(today),
    week: getSummary(week),
    month: getSummary(month),
    all: getSummary(transactions),
  };
}

export function dailySeries(transactions: Transaction[], days = 30) {
  const end = new Date();
  const start = subDays(end, days - 1);

  return eachDayOfInterval({ start, end }).map((date) => {
    const key = format(date, "yyyy-MM-dd");
    const summary = getSummary(
      transactions.filter((transaction) => transaction.date === key),
    );

    return {
      date: format(date, "MMM d"),
      income: summary.income,
      expense: summary.expense,
      balance: summary.balance,
    };
  });
}

export function monthSeries(transactions: Transaction[], year: string) {
  return Array.from({ length: 12 }, (_, index) => {
    const key = `${year}-${String(index + 1).padStart(2, "0")}`;
    const summary = getSummary(
      transactions.filter((transaction) => transaction.date.startsWith(key)),
    );

    return {
      month: format(new Date(Number(year), index, 1), "MMM"),
      income: summary.income,
      expense: summary.expense,
      balance: summary.balance,
    };
  });
}

export function categoryBreakdown(transactions: Transaction[]) {
  const totals = new Map<string, number>();
  transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      totals.set(
        transaction.category,
        (totals.get(transaction.category) || 0) + transaction.amount,
      );
    });

  return [...totals.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function calendarDays(month: Date) {
  const first = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const last = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  return eachDayOfInterval({ start: first, end: last }).map((date) => ({
    date,
    key: format(date, "yyyy-MM-dd"),
    inMonth: date.getMonth() === month.getMonth(),
  }));
}

export function transactionsByDate(transactions: Transaction[]) {
  return transactions.reduce<Record<string, Transaction[]>>((acc, item) => {
    acc[item.date] = [...(acc[item.date] || []), item];
    return acc;
  }, {});
}

export function budgetUsage(transactions: Transaction[], budget?: Budget) {
  const key = budget?.month || monthKey();
  const spent = transactions
    .filter(
      (transaction) =>
        transaction.type === "expense" && transaction.date.startsWith(key),
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const limit = budget?.limit || 0;
  const ratio = limit > 0 ? spent / limit : 0;

  return {
    spent,
    limit,
    ratio,
    remaining: Math.max(limit - spent, 0),
    exceeded: limit > 0 && spent > limit,
    nearLimit: limit > 0 && ratio >= ((budget?.alertAt || 80) / 100),
  };
}

export function projectedMonthlyExpense(transactions: Transaction[]) {
  const now = new Date();
  const elapsed = Math.max(now.getDate(), 1);
  const totalDays = endOfMonth(now).getDate();
  const monthExpense = periodSummaries(transactions).month.expense;

  return Math.round((monthExpense / elapsed) * totalDays);
}

export function bestSavingsDay(transactions: Transaction[]) {
  return dailySeries(transactions, 30)
    .map((day) => ({ ...day, score: day.income - day.expense }))
    .sort((a, b) => b.score - a.score)[0];
}

export function nextDateKey(date: Date, amount: number) {
  return format(addDays(date, amount), "yyyy-MM-dd");
}
