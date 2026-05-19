"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/status";
import { categoryBreakdown, dailySeries } from "@/lib/finance";
import { useHideValues } from "@/contexts/hide-values-context";
import { Transaction } from "@/types/finance";

const palette = [
  "var(--chart-a)",
  "var(--chart-b)",
  "var(--chart-c)",
  "var(--chart-d)",
  "var(--chart-e)",
];

/** Shared tooltip style that respects light/dark mode via CSS vars */
const tooltipStyle = {
  contentStyle: {
    backgroundColor: "var(--tooltip-bg)",
    border: "1px solid var(--tooltip-border)",
    borderRadius: "8px",
    color: "var(--tooltip-text)",
    fontSize: "12px",
  },
  cursor: { fill: "color-mix(in srgb, var(--primary) 8%, transparent)" },
};

export function CashflowChart({
  transactions,
  currencyCode,
}: {
  transactions: Transaction[];
  currencyCode: string;
}) {
  const { hidden, format } = useHideValues();
  const data = dailySeries(transactions, 30);
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  return (
    <Card className="min-h-96">
      <CardHeader>
        <CardTitle>30-day cashflow</CardTitle>
      </CardHeader>
      {hasData ? (
        <div className="h-72" style={{ minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "var(--muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v) =>
                  hidden ? "•••" : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
              />
              <Tooltip
                {...tooltipStyle}
                formatter={(value) => [format(Number(value), currencyCode)]}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                iconType="square"
              />
              <Area
                dataKey="income"
                name="Income"
                stroke="var(--income)"
                fill="var(--income)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Area
                dataKey="expense"
                name="Expense"
                stroke="var(--expense)"
                fill="var(--expense)"
                fillOpacity={0.12}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState
          title="No cashflow data yet"
          body="Add income or expense transactions to see your 30-day cashflow trend."
        />
      )}
    </Card>
  );
}

export function CategoryChart({
  transactions,
  currencyCode,
}: {
  transactions: Transaction[];
  currencyCode: string;
}) {
  const { format } = useHideValues();
  const data = categoryBreakdown(transactions).slice(0, 6);

  return (
    <Card className="min-h-96">
      <CardHeader>
        <CardTitle>Expense categories</CardTitle>
      </CardHeader>
      {data.length > 0 ? (
        <div className="h-72" style={{ minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={88}
                innerRadius={32}
                paddingAngle={2}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={palette[index % palette.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip
                {...tooltipStyle}
                formatter={(value) => [format(Number(value), currencyCode)]}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                iconType="square"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState
          title="No expense data"
          body="Add expense transactions to see category breakdown."
        />
      )}
    </Card>
  );
}

export function PeriodBarChart({
  title,
  data,
  xKey,
  currencyCode,
}: {
  title: string;
  data: Array<Record<string, string | number>>;
  xKey: string;
  currencyCode: string;
}) {
  const { hidden, format } = useHideValues();
  const hasData = data.some(
    (d) => Number(d.income) > 0 || Number(d.expense) > 0,
  );

  return (
    <Card className="min-h-96">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      {hasData ? (
        <div className="h-72" style={{ minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ left: 0, right: 8, top: 4, bottom: 0 }}
              barCategoryGap="30%"
            >
              <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey={xKey}
                tick={{ fill: "var(--muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "var(--muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v) =>
                  hidden ? "•••" : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
              />
              <Tooltip
                {...tooltipStyle}
                formatter={(value) => [format(Number(value), currencyCode)]}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                iconType="square"
              />
              <Bar
                dataKey="income"
                name="Income"
                fill="var(--income)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="var(--expense)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState
          title="No data for this period"
          body="Add transactions within this period to see the chart."
        />
      )}
    </Card>
  );
}
