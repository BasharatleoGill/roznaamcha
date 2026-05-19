import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "neutral" | "income" | "expense" | "accent";
  valueClassName?: string;
};

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "neutral",
  valueClassName,
}: StatCardProps) {
  const tones = {
    neutral: "bg-panel-soft text-primary",
    income: "bg-income/12 text-income",
    expense: "bg-expense/12 text-expense",
    accent: "bg-accent/15 text-accent",
  };

  return (
    <Card className="group transition hover:shadow-md hover:shadow-black/[0.06]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{label}</p>
          <p
            className={cn(
              "mt-3 truncate text-2xl font-semibold tracking-tight tabular-nums",
              valueClassName,
            )}
          >
            {value}
          </p>
        </div>
        <div
          className={cn(
            "shrink-0 rounded-lg p-2.5 transition group-hover:scale-105",
            tones[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-5 text-sm text-muted">{helper}</p>
    </Card>
  );
}
