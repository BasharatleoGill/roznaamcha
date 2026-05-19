"use client";

import { Edit3, RotateCcw, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/status";
import { Field, Input, Select } from "@/components/ui/field";
import { allCategories } from "@/lib/categories";
import { useHideValues } from "@/contexts/hide-values-context";
import { Transaction, TransactionFilters } from "@/types/finance";

const defaultFilters: TransactionFilters = {
  query: "",
  type: "all",
  category: "all",
  from: "",
  to: "",
  sort: "date-desc",
};

type TransactionTableProps = {
  transactions: Transaction[];
  currencyCode: string;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  compact?: boolean;
};

export function useFilteredTransactions(transactions: Transaction[]) {
  const [filters, setFilters] = useState<TransactionFilters>(defaultFilters);

  const filtered = useMemo(() => {
    return [...transactions]
      .filter((transaction) => {
        const query = filters.query.trim().toLowerCase();
        const matchesQuery =
          !query ||
          transaction.description.toLowerCase().includes(query) ||
          transaction.category.toLowerCase().includes(query);
        const matchesType = filters.type === "all" || transaction.type === filters.type;
        const matchesCategory =
          filters.category === "all" || transaction.category === filters.category;
        const matchesFrom = !filters.from || transaction.date >= filters.from;
        const matchesTo = !filters.to || transaction.date <= filters.to;

        return matchesQuery && matchesType && matchesCategory && matchesFrom && matchesTo;
      })
      .sort((a, b) => {
        if (filters.sort === "amount-asc") return a.amount - b.amount;
        if (filters.sort === "amount-desc") return b.amount - a.amount;
        const aDate = `${a.date} ${a.time}`;
        const bDate = `${b.date} ${b.time}`;
        return filters.sort === "date-asc" ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate);
      });
  }, [filters, transactions]);

  return { filters, setFilters, filtered };
}

export function TransactionTable({
  transactions,
  currencyCode,
  onEdit,
  onDelete,
  compact = false,
}: TransactionTableProps) {
  const { filters, setFilters, filtered } = useFilteredTransactions(transactions);
  const { format } = useHideValues();

  return (
    <div className="grid gap-4">
      {!compact ? (
        <div className="grid gap-3 rounded-lg border border-border bg-panel p-4 md:grid-cols-2 xl:grid-cols-[1.4fr_0.9fr_1fr_0.9fr_0.9fr_1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" />
            <Input
              className="pl-9"
              placeholder="Search notes or categories"
              value={filters.query}
              onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
            />
          </div>
          <Select
            aria-label="Filter by type"
            value={filters.type}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, type: event.target.value as TransactionFilters["type"] }))
            }
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
          <Select
            aria-label="Filter by category"
            value={filters.category}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, category: event.target.value as TransactionFilters["category"] }))
            }
          >
            <option value="all">All categories</option>
            {allCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          <Field label="From">
            <Input
              type="date"
              value={filters.from}
              onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
            />
          </Field>
          <Field label="To">
            <Input
              type="date"
              value={filters.to}
              onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
            />
          </Field>
          <Field label="Sort">
            <Select
              value={filters.sort}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, sort: event.target.value as TransactionFilters["sort"] }))
              }
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="amount-desc">Highest amount</option>
              <option value="amount-asc">Lowest amount</option>
            </Select>
          </Field>
          <div className="flex items-end">
            <Button
              type="button"
              variant="secondary"
              className="w-full px-3"
              onClick={() => setFilters(defaultFilters)}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      ) : null}

      {filtered.length ? (
        <div className="overflow-hidden rounded-lg border border-border bg-panel">
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 text-left text-sm">
              <thead className="border-b border-border bg-panel-soft text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Note</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((transaction) => (
                  <tr key={transaction.id} className="transition hover:bg-panel-soft/70">
                    <td className="px-4 py-3 text-muted">
                      {transaction.date} <span className="text-xs">{transaction.time}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={transaction.type === "income" ? "income" : "expense"}>
                        {transaction.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium">{transaction.category}</td>
                    <td className="max-w-70 truncate px-4 py-3 text-muted">
                      {transaction.description || "No note"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {format(transaction.amount, currencyCode)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {onEdit ? (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-8 w-8 px-0"
                            onClick={() => onEdit(transaction)}
                          >
                            <Edit3 className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        ) : null}
                        {onDelete ? (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-8 w-8 px-0 text-expense"
                            onClick={() => onDelete(transaction)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No transactions found"
          body="Add a transaction or adjust filters to see your finance records here."
        />
      )}
    </div>
  );
}
