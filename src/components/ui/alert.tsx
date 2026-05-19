import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Alert({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-expense/25 bg-expense/10 p-4 text-sm text-expense",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-semibold">{title}</p>
        <div className="mt-1 text-expense/85">{children}</div>
      </div>
    </div>
  );
}
