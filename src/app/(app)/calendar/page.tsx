"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarView } from "@/components/finance/calendar-view";
import { TransactionForm } from "@/components/finance/transaction-form";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { LoadingState } from "@/components/ui/status";
import { useAuth } from "@/contexts/auth-context";
import { useFinance } from "@/hooks/use-finance";
import { Transaction, TransactionInput } from "@/types/finance";

export default function CalendarPage() {
  const { user } = useAuth();
  const finance = useFinance(user?.uid);
  const [date, setDate] = useState<string | null>(null);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const save = async (input: TransactionInput) => {
    try {
      if (editing) {
        await finance.updateTransaction(editing.id, input);
      } else {
        await finance.addTransaction(input);
      }
      setDate(null);
      setEditing(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save transaction");
    }
  };

  if (finance.loading) return <LoadingState />;

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-semibold">Calendar finance</h2>
        <p className="mt-1 text-sm text-muted">
          Monthly cashflow with daily income, expense, and balance.
        </p>
      </div>
      {finance.error ? (
        <Alert title="Firestore could not load transactions">
          {finance.error}
        </Alert>
      ) : null}
      <CalendarView
        transactions={finance.transactions}
        currencyCode={finance.settings.currency}
        onAdd={setDate}
        onEdit={setEditing}
        onDelete={setDeleting}
      />
      <Modal
        open={Boolean(date || editing)}
        title={editing ? "Edit transaction" : "Add daily transaction"}
        onClose={() => {
          setDate(null);
          setEditing(null);
        }}
      >
        <TransactionForm
          initial={editing}
          defaultDate={date || undefined}
          onSubmit={save}
          onDone={() => {
            setDate(null);
            setEditing(null);
          }}
        />
      </Modal>
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete transaction"
        description="This calendar entry will be permanently removed from Firestore."
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
