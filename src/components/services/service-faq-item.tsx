"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type ServiceFaqItemProps = {
  index: number;
  question: string;
  answer: string;
};

export function ServiceFaqItem({
  index,
  question,
  answer,
}: ServiceFaqItemProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonId = useId();

  const hasQuestion = question.trim().length > 0;
  const hasAnswer = answer.trim().length > 0;

  return (
    <div className={cn("service-page__faq-item", open && "is-open")}>
      <button
        id={buttonId}
        type="button"
        className="service-page__faq-summary public-focus-ring"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="service-page__faq-index" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="service-page__faq-question">
          {hasQuestion ? question : "שאלה"}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="service-page__faq-chevron"
        />
      </button>

      {hasAnswer ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="service-page__faq-panel"
        >
          <div className="service-page__faq-panel-inner">
            <div className="service-page__faq-answer">
              <p>{answer}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
