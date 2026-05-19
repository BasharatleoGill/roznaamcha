"use client";

import { Download, FileText, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TransactionForm } from "@/components/finance/transaction-form";
import { TransactionTable } from "@/components/finance/transaction-table";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { LoadingState } from "@/components/ui/status";
import { useAuth } from "@/contexts/auth-context";
import { useFinance } from "@/hooks/use-finance";
import { exportReportPdf, exportTransactionsCsv } from "@/lib/export";
import { Transaction, TransactionInput } from "@/types/finance";

export default function TransactionsPage() {
  const { user } = useAuth();
  const finance = useFinance(user?.uid);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const save = async (input: TransactionInput) => {
    try {
      if (editing) {
        await finance.updateTransaction(editing.id, input);
      } else {
        await finance.addTransaction(input);
      }
      setEditing(null);
      setAdding(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save transaction");
    }
  };

  if (finance.loading) return <LoadingState />;

  return (
    <div className="grid gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold">Transactions</h2>
          <p className="mt-1 text-sm text-muted">
            Search, filter, sort, edit, delete, and export your ledger.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Transaction actions">
          <Button
            variant="secondary"
            disabled={!finance.transactions.length}
            onClick={() => exportTransactionsCsv(finance.transactions)}
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="secondary"
            disabled={!finance.transactions.length}
            onClick={() => exportReportPdf(finance.transactions, finance.settings.currency)}
          >
            <FileText className="h-4 w-4" />
            PDF
          </Button>
          <Button onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {finance.error ? (
        <Alert title="Firestore could not load transactions">
          {finance.error}
        </Alert>
      ) : null}

      <TransactionTable
        transactions={finance.transactions}
        currencyCode={finance.settings.currency}
        onEdit={setEditing}
        onDelete={setDeleting}
      />

      <Modal
        open={adding || Boolean(editing)}
        title={editing ? "Edit transaction" : "Add transaction"}
        onClose={() => {
          setEditing(null);
          setAdding(false);
        }}
      >
        <TransactionForm
          initial={editing}
          onSubmit={save}
          onDone={() => {
            setEditing(null);
            setAdding(false);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete transaction"
        description="This transaction will be permanently removed from Firestore. This action cannot be undone."
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
