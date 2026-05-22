export type TransactionType = "income" | "expense";

export type TransactionCategory =
  | "Salary"
  | "Freelance"
  | "Business"
  | "Investment"
  | "Gift"
  | "Food"
  | "Transport"
  | "Housing"
  | "Utilities"
  | "Healthcare"
  | "Shopping"
  | "Education"
  | "Entertainment"
  | "Travel"
  | "Savings"
  | "Other";

export type Transaction = {
  id: string;
  userId: string;
  workspaceId?: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  description: string;
  date: string;
  time: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TransactionInput = Omit<
  Transaction,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

export type Budget = {
  id: string;
  userId: string;
  month: string;
  limit: number;
  alertAt: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type BudgetInput = Pick<Budget, "month" | "limit" | "alertAt">;

export type UserSettings = {
  currency: string;
  monthlyBudget?: number;
};

export type Summary = {
  income: number;
  expense: number;
  balance: number;
  count: number;
};

export type TransactionFilters = {
  query: string;
  type: "all" | TransactionType;
  category: "all" | TransactionCategory;
  from: string;
  to: string;
  sort: "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
};
