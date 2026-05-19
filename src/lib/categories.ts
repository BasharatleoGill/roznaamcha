import { TransactionCategory, TransactionType } from "@/types/finance";

export const incomeCategories: TransactionCategory[] = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Gift",
  "Other",
];

export const expenseCategories: TransactionCategory[] = [
  "Food",
  "Transport",
  "Housing",
  "Utilities",
  "Healthcare",
  "Shopping",
  "Education",
  "Entertainment",
  "Travel",
  "Savings",
  "Other",
];

export const allCategories: TransactionCategory[] = Array.from(
  new Set([...incomeCategories, ...expenseCategories]),
);

export function categoriesForType(type: TransactionType) {
  return type === "income" ? incomeCategories : expenseCategories;
}
