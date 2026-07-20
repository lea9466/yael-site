"use client";

import { useId, useState } from "react";

import { formatIngredientLine } from "@/lib/recipes/format-ingredient";
import type { RecipeIngredient } from "@/lib/recipes/types";
import { cn } from "@/lib/utils/cn";

type RecipeIngredientsProps = {
  ingredients: RecipeIngredient[];
  className?: string;
  headingLevel?: "h2" | "h3";
  showTitle?: boolean;
  titleId?: string;
};

function hasIngredientContent(ingredient: RecipeIngredient): boolean {
  return formatIngredientLine(ingredient).length > 0;
}

export function RecipeIngredients({
  ingredients,
  className,
  headingLevel = "h2",
  showTitle = true,
  titleId,
}: RecipeIngredientsProps) {
  const generatedId = useId();
  const baseId = titleId ?? `${generatedId}-title`;
  const items = ingredients.filter(hasIngredientContent);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const HeadingTag = headingLevel;

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby={showTitle ? baseId : undefined}
      aria-label={showTitle ? undefined : "רכיבים"}
      className={cn("recipe-ingredients", className)}
    >
      <div className="recipe-ingredients__card">
        {showTitle ? (
          <HeadingTag id={baseId} className="recipe-ingredients__title">
            רכיבים
          </HeadingTag>
        ) : null}

        <ul className="recipe-ingredients__list">
          {items.map((ingredient, index) => {
            const quantity =
              typeof ingredient.quantity === "string"
                ? ingredient.quantity.trim()
                : "";
            const unit =
              typeof ingredient.unit === "string" ? ingredient.unit.trim() : "";
            const name =
              typeof ingredient.name === "string" ? ingredient.name.trim() : "";
            const measure = [quantity, unit].filter(Boolean).join(" ");
            const checkboxId = `${generatedId}-ingredient-${index}`;
            const isChecked = Boolean(checked[index]);

            return (
              <li key={`${index}-${formatIngredientLine(ingredient)}`}>
                <label
                  htmlFor={checkboxId}
                  className={cn(
                    "recipe-ingredients__item",
                    isChecked && "recipe-ingredients__item--checked"
                  )}
                >
                  <input
                    id={checkboxId}
                    type="checkbox"
                    className="recipe-ingredients__checkbox"
                    checked={isChecked}
                    onChange={() => {
                      setChecked((current) => ({
                        ...current,
                        [index]: !current[index],
                      }));
                    }}
                  />
                  <span className="recipe-ingredients__text">
                    {measure ? (
                      <span className="recipe-ingredients__measure">
                        {measure}
                      </span>
                    ) : null}
                    {name ? (
                      <span className="recipe-ingredients__name">{name}</span>
                    ) : null}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
