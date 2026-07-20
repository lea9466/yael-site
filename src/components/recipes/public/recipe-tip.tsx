import { Lightbulb } from "lucide-react";

import { MultilineText } from "@/components/ui/multiline-text";
import { sanitizePlainText } from "@/lib/services/sanitize";
import { cn } from "@/lib/utils/cn";

type RecipeTipProps = {
  tip: string | null | undefined;
  className?: string;
};

export function RecipeTip({ tip, className }: RecipeTipProps) {
  const cleaned = tip ? sanitizePlainText(tip) : "";

  if (!cleaned) {
    return null;
  }

  return (
    <aside
      aria-labelledby="recipe-tip-title"
      className={cn("recipe-tip", className)}
    >
      <div className="recipe-tip__accent" aria-hidden="true" />
      <div className="recipe-tip__content">
        <div className="recipe-tip__header">
          <Lightbulb aria-hidden="true" className="recipe-tip__icon" />
          <h2 id="recipe-tip-title" className="recipe-tip__title">
            הטיפ של יעל
          </h2>
        </div>
        <MultilineText as="p" className="recipe-tip__text">
          {cleaned}
        </MultilineText>
      </div>
    </aside>
  );
}
