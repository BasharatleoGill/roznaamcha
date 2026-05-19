"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

type FAQ = {
  question: string;
  answer: string;
};

const faqs: FAQ[] = [
  {
    question: "Is my financial data secure?",
    answer:
      "Yes. Your data is securely isolated in your personal Firebase account. No one else has access to your transactions, budgets, or settings.",
  },
  {
    question: "Can I track my monthly expenses automatically?",
    answer:
      "RozNaamcha provides an intuitive interface to add and categorize your expenses daily, giving you a precise manual tracking system that builds better financial habits.",
  },
  {
    question: "Can I create and manage budgets?",
    answer:
      "Absolutely. You can set a custom monthly budget limit and receive visual alerts when your spending approaches or exceeds your target.",
  },
  {
    question: "Can I view detailed financial reports?",
    answer:
      "Yes, the dashboard provides interactive weekly, monthly, and yearly cashflow charts, along with category-wise spending breakdowns.",
  },
  {
    question: "Does it work well on mobile devices?",
    answer:
      "Yes, RozNaamcha is designed as a fully responsive web application. It looks and works beautifully on smartphones, tablets, and desktop computers.",
  },
];

export function FaqAccordion() {
  const uid = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mx-auto w-full max-w-3xl divide-y divide-border rounded-xl border border-border bg-panel shadow-sm">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        const panelId = `${uid}-faq-panel-${index}`;
        const buttonId = `${uid}-faq-btn-${index}`;
        return (
          <div key={index} className="group">
            <button
              id={buttonId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none focus-visible:bg-panel-soft"
            >
              <span className="text-base font-medium text-foreground transition-colors group-hover:text-primary">
                {faq.question}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "h-5 w-5 shrink-0 text-muted transition-transform duration-200",
                  isOpen ? "rotate-180 text-primary" : "",
                )}
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!isOpen}
              className={cn(
                "grid transition-all duration-200 ease-in-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 pt-0 text-sm leading-relaxed text-muted">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
