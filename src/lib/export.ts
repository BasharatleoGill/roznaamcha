import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { Transaction } from "@/types/finance";
import { currency } from "@/lib/utils";
import { calendarDays, getSummary, transactionsByDate } from "@/lib/finance";

export function exportTransactionsCsv(transactions: Transaction[]) {
  const headers = ["Date", "Time", "Type", "Category", "Amount", "Note"];
  const rows = transactions.map((item) => [
    item.date,
    item.time,
    item.type,
    item.category,
    String(item.amount),
    item.description,
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");

  downloadBlob(csv, `roznaamcha-transactions-${format(new Date(), "yyyy-MM-dd")}.csv`, "text/csv");
}

export function exportReportPdf(transactions: Transaction[], code = "PKR") {
  const doc = new jsPDF();
  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const expense = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  doc.setFontSize(18);
  doc.text("RozNaamcha Financial Report", 14, 18);
  doc.setFontSize(10);
  doc.text(`Generated ${format(new Date(), "PPP p")}`, 14, 26);
  doc.text(`Income: ${currency(income, code)}`, 14, 36);
  doc.text(`Expense: ${currency(expense, code)}`, 80, 36);
  doc.text(`Balance: ${currency(income - expense, code)}`, 146, 36);

  autoTable(doc, {
    startY: 46,
    head: [["Date", "Time", "Type", "Category", "Amount", "Note"]],
    body: transactions.map((item) => [
      item.date,
      item.time,
      item.type,
      item.category,
      currency(item.amount, code),
      item.description,
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [23, 107, 93] },
  });

  doc.save(`roznaamcha-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

export function exportCalendarPdf(
  transactions: Transaction[],
  month: Date,
  code = "PKR",
) {
  const doc = new jsPDF();
  const tableDoc = doc as jsPDF & { lastAutoTable?: { finalY: number } };
  const monthTitle = format(month, "MMMM yyyy");
  const monthSummary = getSummary(transactions);
  const days = calendarDays(month);
  const weeks = Array.from({ length: Math.ceil(days.length / 7) }, (_, index) =>
    days.slice(index * 7, index * 7 + 7),
  );
  const grouped = transactionsByDate(transactions);

  doc.setFontSize(18);
  doc.text("RozNaamcha Calendar Finance", 14, 18);
  doc.setFontSize(10);
  doc.text(monthTitle, 14, 26);
  doc.text(`Generated ${format(new Date(), "PPP p")}`, 14, 32);
  doc.text(`Income: ${currency(monthSummary.income, code)}`, 14, 42);
  doc.text(`Expense: ${currency(monthSummary.expense, code)}`, 80, 42);
  doc.text(`Balance: ${currency(monthSummary.balance, code)}`, 146, 42);

  autoTable(doc, {
    startY: 52,
    head: [["Week", "Income", "Expense", "Balance", "Transactions"]],
    body: weeks.map((week) => {
      const weekTransactions = week.flatMap((day) => grouped[day.key] || []);
      const summary = getSummary(weekTransactions);

      return [
        `${format(week[0].date, "MMM d")} - ${format(
          week[week.length - 1].date,
          "MMM d",
        )}`,
        currency(summary.income, code),
        currency(summary.expense, code),
        currency(summary.balance, code),
        String(summary.count),
      ];
    }),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [23, 107, 93] },
  });

  autoTable(doc, {
    startY: (tableDoc.lastAutoTable?.finalY || 52) + 10,
    head: [["Date", "Income", "Expense", "Balance", "Transactions"]],
    body: days
      .filter((day) => day.inMonth)
      .map((day) => {
        const summary = getSummary(grouped[day.key] || []);

        return [
          format(day.date, "MMM d, yyyy"),
          currency(summary.income, code),
          currency(summary.expense, code),
          currency(summary.balance, code),
          String(summary.count),
        ];
      }),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [23, 107, 93] },
  });

  autoTable(doc, {
    startY: (tableDoc.lastAutoTable?.finalY || 52) + 10,
    head: [["Date", "Time", "Type", "Category", "Amount", "Note"]],
    body: transactions.map((item) => [
      item.date,
      item.time,
      item.type,
      item.category,
      currency(item.amount, code),
      item.description,
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [23, 107, 93] },
  });

  doc.save(`roznaamcha-calendar-${format(month, "yyyy-MM")}.pdf`);
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  // Must be in the DOM for Firefox to trigger the download
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Delay revoke so the browser has time to start the download
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
