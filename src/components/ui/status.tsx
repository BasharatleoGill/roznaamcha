import { Loader2, PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingState({ label = "Loading RozNaamcha" }: { label?: string }) {
  return (
    <div
      className="grid min-h-[50vh] place-items-center"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex items-center gap-3 rounded-lg border border-border bg-panel px-5 py-3.5 text-sm text-muted shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
        <span>{label}</span>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  className,
}: {
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-border bg-panel-soft/60 p-10 text-center",
        className,
      )}
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-panel-soft">
        <PackageOpen className="h-5 w-5 text-muted" aria-hidden="true" />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p>
    </div>
  );
}
