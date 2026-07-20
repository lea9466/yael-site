"use client";

import { useState } from "react";
import { Check, Printer, Share2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type RecipeActionsProps = {
  title: string;
  className?: string;
};

export function RecipeActions({ title, className }: RecipeActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={cn("recipe-actions", className)}>
      <button
        type="button"
        className="recipe-actions__button recipe-actions__button--primary public-focus-ring"
        onClick={() => window.print()}
      >
        <Printer
          aria-hidden="true"
          className="recipe-actions__icon"
          strokeWidth={1.75}
        />
        <span>הדפסת מתכון</span>
      </button>

      <button
        type="button"
        className="recipe-actions__button recipe-actions__button--secondary public-focus-ring"
        onClick={() => {
          void handleShare();
        }}
      >
        {copied ? (
          <Check
            aria-hidden="true"
            className="recipe-actions__icon"
            strokeWidth={1.75}
          />
        ) : (
          <Share2
            aria-hidden="true"
            className="recipe-actions__icon"
            strokeWidth={1.75}
          />
        )}
        <span>{copied ? "הקישור הועתק" : "שיתוף"}</span>
      </button>

      <p className="sr-only" aria-live="polite">
        {copied ? "הקישור הועתק" : ""}
      </p>
    </div>
  );
}
