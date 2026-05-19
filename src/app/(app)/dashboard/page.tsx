"use client";

import { endOfMonth, startOfMonth } from "date-fns";
import { ArrowDownRight, ArrowUpRight, Landmark, Plus, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CashflowChart, CategoryChart } from "@/components/charts/finance-charts";
import { BudgetCard } from "@/components/finance/budget-card";
import { StatCard } from "@/components/finance/stat-card";
import { TransactionForm } from "@/components/finance/transaction-form";
import { TransactionTable } from "@/components/finance/transaction-table";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { LoadingState } from "@/components/ui/status";
import { useAuth } from "@/contexts/auth-context";
import { useHideValues } from "@/contexts/hide-values-context";
import { useFinance } from "@/hooks/use-finance";
import { filterByRange, getSummary, periodSummaries, projectedMonthlyExpense } from "@/lib/finance";
import { Transaction, TransactionInput, TransactionType } from "@/types/finance";

export default function DashboardPage() {
  const { user } = useAuth();
  const finance = useFinance(user?.uid);
  const { format } = useHideValues();
  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    type?: TransactionType;
    transaction?: Transaction;
  } | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const summaries = useMemo(() => periodSummaries(finance.transactions), [finance.transactions]);
  const monthTransactions = useMemo(
    () => filterByRange(finance.transactions, startOfMonth(new Date()), endOfMonth(new Date())),
    [finance.transactions],
  );
  const monthSummary = useMemo(() => getSummary(monthTransactions), [monthTransactions]);
  const projectedExpense = useMemo(() => projectedMonthlyExpense(finance.transactions), [finance.transactions]);

  const saveTransaction = async (input: TransactionInput) => {
    try {
      if (modal?.mode === "edit" && modal.transaction) {
        await finance.updateTransaction(modal.transaction.id, input);
      } else {
        await finance.addTransaction(input);
      }
      setModal(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save transaction");
    }
  };

  if (finance.loading) return <LoadingState />;

  return (
    <div className="grid gap-6">
      {finance.error ? (
        <Alert title="Firestore could not load finance data">
          {finance.error}
        </Alert>
      ) : null}

      <section aria-label="Summary statistics" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total income"
          value={format(summaries.all.income, finance.settings.currency)}
          helper={`${summaries.all.count} transactions tracked`}
          icon={ArrowUpRight}
          tone="income"
        />
        <StatCard
          label="Total expense"
          value={format(summaries.all.expense, finance.settings.currency)}
          helper={`This month: ${format(monthSummary.expense, finance.settings.currency)}`}
          icon={ArrowDownRight}
          tone="expense"
        />
        <StatCard
          label="Current balance"
          value={format(summaries.all.balance, finance.settings.currency)}
          helper={`Monthly balance: ${format(monthSummary.balance, finance.settings.currency)}`}
          icon={Wallet}
          valueClassName={summaries.all.balance < 0 ? "text-expense" : undefined}
        />
        <StatCard
          label="Projected expense"
          value={format(projectedExpense, finance.settings.currency)}
          helper="Estimated month-end spend from daily pace"
          icon={Landmark}
          tone="accent"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Quick add</CardTitle>
              <p className="mt-1 text-sm text-muted">Capture income or expenses without leaving the dashboard.</p>
            </div>
          </CardHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button onClick={() => setModal({ mode: "add", type: "income" })}>
              <Plus className="h-4 w-4" />
              Add income
            </Button>
            <Button variant="secondary" onClick={() => setModal({ mode: "add", type: "expense" })}>
              <Plus className="h-4 w-4" />
              Add expense
            </Button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Today", summaries.today],
              ["This week", summaries.week],
              ["This month", summaries.month],
            ].map(([label, summary]) => (
              <div key={String(label)} className="rounded-md bg-panel-soft p-4">
                <p className="text-sm font-medium text-muted">{String(label)}</p>
                <p className="mt-2 font-semibold">{format((summary as typeof summaries.today).balance, finance.settings.currency)}</p>
                <p className="mt-1 text-xs text-muted">
                  In {format((summary as typeof summaries.today).income, finance.settings.currency)} / Out{" "}
                  {format((summary as typeof summaries.today).expense, finance.settings.currency)}
                </p>
              </div>
            ))}
          </div>
        </Card>
        <BudgetCard
          budget={finance.currentBudget}
          transactions={finance.transactions}
          currencyCode={finance.settings.currency}
          onSave={finance.saveBudget}
        />
      </section>

      <section aria-label="Charts" className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <CashflowChart transactions={finance.transactions} currencyCode={finance.settings.currency} />
        <CategoryChart transactions={finance.transactions} currencyCode={finance.settings.currency} />
      </section>

      <section aria-label="Recent transactions">
        <CardHeader className="px-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">Recent transactions</h2>
            <p className="mt-1 text-sm text-muted">Latest activity synced from Firestore.</p>
          </div>
        </CardHeader>
        <TransactionTable
          compact
          transactions={finance.transactions.slice(0, 8)}
          currencyCode={finance.settings.currency}
          onEdit={(transaction) => setModal({ mode: "edit", transaction })}
          onDelete={setDeleting}
        />
      </section>

      <Modal
        open={Boolean(modal)}
        title={modal?.mode === "edit" ? "Edit transaction" : "Add transaction"}
        onClose={() => setModal(null)}
      >
        <TransactionForm
          initial={modal?.transaction}
          defaultType={modal?.type}
          onSubmit={saveTransaction}
          onDone={() => setModal(null)}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete transaction"
        description="This transaction will be permanently removed from your ledger."
        busy={deleteBusy}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          setDeleteBusy(true);
          try {
            await finance.deleteTransaction(deleting.id);
            setDeleting(null);
          } finally {
            setDeleteBusy(false);
          }
        }}
      />
    </div>
  );
}
