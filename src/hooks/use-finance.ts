"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { monthKey } from "@/lib/finance";
import {
  Budget,
  BudgetInput,
  Transaction,
  TransactionInput,
  UserSettings,
} from "@/types/finance";

const defaultSettings: UserSettings = {
  currency: "PKR",
};

function sortTransactions(items: Transaction[]) {
  return [...items].sort((a, b) =>
    `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`),
  );
}

function mapTransactionDoc(
  item: { id: string; data: () => Record<string, unknown> },
  userId: string,
): Transaction {
  const data = item.data();

  return {
    id: item.id,
    userId,
    type: data.type as Transaction["type"],
    amount: Number(data.amount || 0),
    category: data.category as Transaction["category"],
    description: String(data.description || ""),
    date: String(data.date || ""),
    time: String(data.time || ""),
    createdAt:
      typeof data.createdAt === "object" &&
      data.createdAt !== null &&
      "toDate" in data.createdAt
        ? (data.createdAt as { toDate: () => Date }).toDate()
        : undefined,
    updatedAt:
      typeof data.updatedAt === "object" &&
      data.updatedAt !== null &&
      "toDate" in data.updatedAt
        ? (data.updatedAt as { toDate: () => Date }).toDate()
        : undefined,
  };
}

export function useFinance(userId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const transactionsRef = collection(db, "users", userId, "transactions");
    const budgetsRef = collection(db, "users", userId, "budgets");
    const settingsRef = doc(db, "users", userId, "settings", "profile");
    const transactionsQuery = query(
      transactionsRef,
      orderBy("date", "desc"),
      limit(2000),
    );

    const unsubscribeTransactions = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        setTransactions(
          sortTransactions(
            snapshot.docs.map((item) => mapTransactionDoc(item, userId)),
          ),
        );
        setError(null);
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    const unsubscribeBudgets = onSnapshot(
      query(budgetsRef, orderBy("month", "desc"), limit(36)),
      (snapshot) => {
        setBudgets(
          snapshot.docs.map((item) => {
            const data = item.data();
            return {
              id: item.id,
              userId,
              month: data.month,
              limit: Number(data.limit || 0),
              alertAt: Number(data.alertAt || 80),
              createdAt: data.createdAt?.toDate?.(),
              updatedAt: data.updatedAt?.toDate?.(),
            };
          }),
        );
      },
    );

    const unsubscribeSettings = onSnapshot(settingsRef, (snapshot) => {
      setSettings({
        ...defaultSettings,
        ...(snapshot.data() as Partial<UserSettings>),
      });
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeBudgets();
      unsubscribeSettings();
    };
  }, [userId]);

  const addTransaction = useCallback(
    async (input: TransactionInput) => {
      if (!userId) return;

      const docRef = await addDoc(collection(db, "users", userId, "transactions"), {
        ...input,
        userId,
        amount: Number(input.amount),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const savedTransaction: Transaction = {
        id: docRef.id,
        userId,
        ...input,
        amount: Number(input.amount),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setTransactions((current) =>
        sortTransactions([
          savedTransaction,
          ...current.filter((item) => item.id !== docRef.id),
        ]),
      );
      toast.success("Transaction saved");
    },
    [userId],
  );

  const updateTransaction = useCallback(
    async (id: string, input: TransactionInput) => {
      if (!userId) return;

      await updateDoc(doc(db, "users", userId, "transactions", id), {
        ...input,
        amount: Number(input.amount),
        updatedAt: serverTimestamp(),
      });

      setTransactions((current) =>
        sortTransactions(
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...input,
                  amount: Number(input.amount),
                  updatedAt: new Date(),
                }
              : item,
          ),
        ),
      );
      toast.success("Transaction updated");
    },
    [userId],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!userId) return;

      await deleteDoc(doc(db, "users", userId, "transactions", id));
      setTransactions((current) => current.filter((item) => item.id !== id));
      toast.success("Transaction deleted");
    },
    [userId],
  );

  const saveBudget = useCallback(
    async (input: BudgetInput) => {
      if (!userId) return;

      await setDoc(
        doc(db, "users", userId, "budgets", input.month),
        {
          ...input,
          userId,
          limit: Number(input.limit),
          alertAt: Number(input.alertAt),
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );
      toast.success("Budget saved");
    },
    [userId],
  );

  const saveSettings = useCallback(
    async (input: UserSettings) => {
      if (!userId) return;

      await setDoc(
        doc(db, "users", userId, "settings", "profile"),
        { ...input, updatedAt: serverTimestamp() },
        { merge: true },
      );
      toast.success("Settings saved");
    },
    [userId],
  );

  const currentBudget = useMemo(
    () => budgets.find((budget) => budget.month === monthKey()),
    [budgets],
  );

  return {
    transactions,
    budgets,
    currentBudget,
    settings,
    loading: userId ? loading : false,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    saveBudget,
    saveSettings,
  };
}
