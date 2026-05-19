import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const variants: Record<ButtonVariant, string> = {
      primary:
        "bg-primary text-primary-foreground shadow-sm hover:brightness-95 active:scale-[0.98] focus-visible:ring-primary",
      secondary:
        "border border-border bg-panel text-foreground hover:bg-panel-soft active:scale-[0.98] focus-visible:ring-primary",
      ghost:
        "text-muted hover:bg-panel-soft hover:text-foreground active:scale-[0.98] focus-visible:ring-primary",
      danger:
        "bg-expense text-white shadow-sm hover:brightness-95 active:scale-[0.98] focus-visible:ring-expense",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          variants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
