"use client";

import { AlertTriangle, PiggyBank } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { budgetUsage, monthKey } from "@/lib/finance";
import { percent } from "@/lib/utils";
import { useHideValues } from "@/contexts/hide-values-context";
import { Budget, Transaction } from "@/types/finance";

type BudgetCardProps = {
  transactions: Transaction[];
  budget?: Budget;
  currencyCode: string;
  onSave: (input: { month: string; limit: number; alertAt: number }) => Promise<void>;
};

export function BudgetCard({ transactions, budget, currencyCode, onSave }: BudgetCardProps) {
  const usage = budgetUsage(transactions, budget);
  const { format } = useHideValues();
  const [limitDraft, setLimitDraft] = useState<number | null>(null);
  const [alertDraft, setAlertDraft] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const limit = limitDraft ?? budget?.limit ?? 0;
  const alertAt = alertDraft ?? budget?.alertAt ?? 80;
  const hasBudget = usage.limit > 0;

  const save = async () => {
    setSaving(true);
    try {
      await onSave({ month: monthKey(), limit, alertAt });
      // Reset drafts so fresh Firestore values are shown
      setLimitDraft(null);
      setAlertDraft(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Monthly budget</CardTitle>
          <p className="mt-1 text-sm text-muted">{monthKey()}</p>
        </div>
        {usage.exceeded || usage.nearLimit ? (
          <AlertTriangle className="h-5 w-5 text-warning" />
        ) : (
          <PiggyBank className="h-5 w-5 text-primary" />
        )}
      </CardHeader>
      <div className="grid gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-muted">Spent</span>
            <span className="wrap-break-word text-right font-semibold tabular-nums">
              {hasBudget
                ? `${format(usage.spent, currencyCode)} / ${format(usage.limit, currencyCode)}`
                : format(usage.spent, currencyCode)}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-panel-soft">
            <div
              className="h-full rounded-full bg-primary transition-all data-[over=true]:bg-expense"
              data-over={usage.exceeded}
              style={{ width: hasBudget ? `${Math.min(usage.ratio * 100, 100)}%` : "0%" }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            {hasBudget
              ? `${percent(usage.ratio)} used, ${format(usage.remaining, currencyCode)} remaining`
              : "Set a monthly budget to enable warnings and progress tracking"}
          </p>
        </div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <Field label="Limit">
            <Input min="0" type="number" value={limit} onChange={(event) => setLimitDraft(Number(event.target.value))} />
          </Field>
          <Field label="Alert %">
            <Input
              max="100"
              min="1"
              type="number"
              value={alertAt}
              onChange={(event) => setAlertDraft(Number(event.target.value))}
            />
          </Field>
          <div className="flex items-end sm:col-span-2">
            <Button type="button" className="w-full" disabled={saving} onClick={save}>
              {saving ? "Saving..." : "Save budget"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
