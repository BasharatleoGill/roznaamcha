"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { categoriesForType } from "@/lib/categories";
import { Transaction, TransactionInput, TransactionType } from "@/types/finance";

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z
    .number()
    .positive("Amount must be greater than zero")
    .max(1_000_000_000, "Amount is too large"),
  category: z.string().min(1, "Choose a category"),
  description: z.string().max(160, "Keep notes under 160 characters").optional(),
  date: z.string().min(1, "Choose a date"),
  time: z.string().min(1, "Choose a time"),
});

type Values = z.infer<typeof schema>;

type TransactionFormProps = {
  initial?: Transaction | null;
  defaultType?: TransactionType;
  defaultDate?: string;
  onSubmit: (input: TransactionInput) => Promise<void>;
  onDone?: () => void;
};

export function TransactionForm({
  initial,
  defaultType = "expense",
  defaultDate,
  onSubmit,
  onDone,
}: TransactionFormProps) {
  const now = new Date();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: initial?.type || defaultType,
      // Use undefined for new transactions so the input starts empty, not "0"
      amount: initial?.amount ?? (undefined as unknown as number),
      category: initial?.category || categoriesForType(defaultType)[0],
      description: initial?.description || "",
      date: initial?.date || defaultDate || format(now, "yyyy-MM-dd"),
      time: initial?.time || format(now, "HH:mm"),
    },
  });

  const type = useWatch({ control, name: "type" });
  const categories = useMemo(() => categoriesForType(type), [type]);

  const submit = async (values: Values) => {
    await onSubmit({
      type: values.type,
      amount: values.amount,
      category: values.category as TransactionInput["category"],
      description: values.description || "",
      date: values.date,
      time: values.time,
    });
    // Only close/navigate after a successful save
    onDone?.();
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type" error={errors.type?.message}>
          <Select
            {...register("type")}
            onChange={(event) => {
              const nextType = event.target.value as TransactionType;
              setValue("type", nextType);
              setValue("category", categoriesForType(nextType)[0]);
            }}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
        </Field>
        <Field label="Amount" error={errors.amount?.message}>
          <Input
            min="0.01"
            step="any"
            type="number"
            placeholder="0"
            {...register("amount", { valueAsNumber: true })}
          />
        </Field>
      </div>

      <Field label="Category" error={errors.category?.message}>
        <Select {...register("category")}>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date" error={errors.date?.message}>
          <Input type="date" {...register("date")} />
        </Field>
        <Field label="Time" error={errors.time?.message}>
          <Input type="time" {...register("time")} />
        </Field>
      </div>

      <Field label="Description / note" error={errors.description?.message}>
        <Textarea placeholder="Optional context for this transaction" {...register("description")} />
      </Field>

      <div className="flex justify-end gap-2">
        {onDone ? (
          <Button type="button" variant="secondary" onClick={onDone}>
            Cancel
          </Button>
        ) : null}
        <Button disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initial ? "Update transaction" : "Add transaction"}
        </Button>
      </div>
    </form>
  );
}
