import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function currency(amount: number, code = "PKR") {
  // Use en-PK for PKR (correct grouping) and en for all other currencies
  const locale = code === "PKR" ? "en-PK" : "en";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function percent(value: number) {
  return new Intl.NumberFormat("en", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function initials(name?: string | null, email?: string | null) {
  const source = name || email || "Roz Naamcha";
  return source
    .split(/[ .@_-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join("");
}
