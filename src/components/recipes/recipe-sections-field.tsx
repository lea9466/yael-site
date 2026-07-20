"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";

import { RecipeSectionDeleteDialog } from "@/components/recipes/recipe-section-delete-dialog";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { IconButton } from "@/components/ui/icon-button";
import {
  createRepeaterItemId,
  RepeaterField,
  RepeaterTextareaField,
  RepeaterTextField,
} from "@/components/services/service-repeater-field";
import { RECIPE_REPEATER_LIMITS } from "@/lib/recipes/constants";
import { getFieldErrorMessage } from "@/lib/forms/recipe-validation-feedback";
import { cn } from "@/lib/utils/cn";

export type IngredientRepeaterItem = {
  id: string;
  text: string;
};

export type StepRepeaterItem = {
  id: string;
  text: string;
};

export type SectionRepeaterItem = {
  id: string;
  title: string;
  ingredients: IngredientRepeaterItem[];
  steps: StepRepeaterItem[];
};

type RecipeSectionsFieldProps = {
  sections: SectionRepeaterItem[];
  fieldErrors: Record<string, string>;
  onChange: (sections: SectionRepeaterItem[]) => void;
};

function createEmptyIngredient(): IngredientRepeaterItem {
  return {
    id: createRepeaterItemId(),
    text: "",
  };
}

function createEmptyStep(): StepRepeaterItem {
  return {
    id: createRepeaterItemId(),
    text: "",
  };
}

export function createEmptyRecipeSection(): SectionRepeaterItem {
  return {
    id: createRepeaterItemId(),
    title: "",
    ingredients: [createEmptyIngredient()],
    steps: [createEmptyStep()],
  };
}

function sectionHasContent(section: SectionRepeaterItem): boolean {
  return (
    section.title.trim().length > 0 ||
    section.ingredients.some((item) => item.text.trim().length > 0) ||
    section.steps.some((item) => item.text.trim().length > 0)
  );
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function RecipeSectionsField({
  sections,
  fieldErrors,
  onChange,
}: RecipeSectionsFieldProps) {
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(
    null
  );
  const requiresTitles = sections.length > 1;
  const canAddSection = sections.length < RECIPE_REPEATER_LIMITS.sections.max;
  const rootError = getFieldErrorMessage(fieldErrors, "content.recipe_sections");

  const updateSection = (index: number, nextSection: SectionRepeaterItem) => {
    onChange(
      sections.map((section, currentIndex) =>
        currentIndex === index ? nextSection : section
      )
    );
  };

  const handleAddSection = () => {
    if (!canAddSection) {
      return;
    }

    onChange([...sections, createEmptyRecipeSection()]);
  };

  const handleRequestRemove = (index: number) => {
    if (sections.length <= 1) {
      onChange([createEmptyRecipeSection()]);
      return;
    }

    const section = sections[index];

    if (section && sectionHasContent(section)) {
      setPendingDeleteIndex(index);
      return;
    }

    onChange(sections.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleConfirmRemove = () => {
    if (pendingDeleteIndex === null) {
      return;
    }

    onChange(
      sections.filter((_, currentIndex) => currentIndex !== pendingDeleteIndex)
    );
    setPendingDeleteIndex(null);
  };

  const handleDragStart =
    (index: number) => (event: React.DragEvent<HTMLLIElement>) => {
      event.dataTransfer.setData("text/plain", String(index));
      event.dataTransfer.effectAllowed = "move";
    };

  const handleDrop =
    (targetIndex: number) => (event: React.DragEvent<HTMLLIElement>) => {
      event.preventDefault();
      const sourceIndex = Number(event.dataTransfer.getData("text/plain"));

      if (Number.isNaN(sourceIndex)) {
        return;
      }

      onChange(moveItem(sections, sourceIndex, targetIndex));
    };

  const pendingLabel =
    pendingDeleteIndex === null
      ? ""
      : sections[pendingDeleteIndex]?.title.trim() ||
        `חלק ${pendingDeleteIndex + 1}`;

  return (
    <div className="space-y-6">
      {rootError ? (
        <p role="alert" className="text-caption text-[var(--color-error)]">
          {rootError}
        </p>
      ) : null}

      <ul className="space-y-6">
        {sections.map((section, index) => {
          const titleError =
            fieldErrors[`content.recipe_sections.${index}.title`];
          const ingredientsError = getFieldErrorMessage(
            fieldErrors,
            `content.recipe_sections.${index}.ingredients`
          );
          const stepsError = getFieldErrorMessage(
            fieldErrors,
            `content.recipe_sections.${index}.steps`
          );
          const headerTitle = section.title.trim() || null;

          return (
            <li
              key={section.id}
              id={`recipe-section-${index}`}
              draggable
              onDragStart={handleDragStart(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop(index)}
              className={cn(
                "admin-interactive rounded-[var(--radius-xl)] bg-[var(--color-surface)] p-5",
                "ring-1 ring-[var(--color-border)]/80",
                (titleError || ingredientsError || stepsError) &&
                  "ring-[var(--color-error)]/40"
              )}
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <button
                    type="button"
                    aria-label={`גרירה לסידור מחדש — חלק ${index + 1}`}
                    className="admin-interactive shrink-0 cursor-grab rounded-[var(--radius-sm)] p-1 text-[var(--color-text-muted)] opacity-60 transition-opacity hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-primary)] active:cursor-grabbing"
                  >
                    <GripVertical aria-hidden="true" className="size-4" />
                  </button>
                  <h3 className="min-w-0 truncate text-sm font-semibold text-[var(--color-text)]">
                    חלק {index + 1}
                    {headerTitle ? ` — ${headerTitle}` : ""}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <IconButton
                    label="העלאת החלק"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => onChange(moveItem(sections, index, index - 1))}
                  >
                    <ChevronUp aria-hidden="true" className="size-4" />
                  </IconButton>
                  <IconButton
                    label="הורדת החלק"
                    size="sm"
                    disabled={index === sections.length - 1}
                    onClick={() => onChange(moveItem(sections, index, index + 1))}
                  >
                    <ChevronDown aria-hidden="true" className="size-4" />
                  </IconButton>
                  <IconButton
                    label={
                      sections.length <= 1
                        ? "איפוס החלק"
                        : `מחיקת חלק ${index + 1}`
                    }
                    size="sm"
                    onClick={() => handleRequestRemove(index)}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </IconButton>
                </div>
              </div>

              <div className="space-y-6">
                <FormField
                  label="שם החלק"
                  htmlFor={`recipe-section-title-${index}`}
                  required={requiresTitles}
                  hint={
                    requiresTitles
                      ? undefined
                      : "במתכון עם חלק אחד אפשר להשאיר את הכותרת ריקה"
                  }
                  error={titleError}
                >
                  <RepeaterTextField
                    id={`recipe-section-title-${index}`}
                    value={section.title}
                    placeholder="לדוגמה: לעוגה, לציפוי, לרוטב"
                    error={Boolean(titleError)}
                    onChange={(title) =>
                      updateSection(index, { ...section, title })
                    }
                  />
                </FormField>

                <div id={`recipe-section-ingredients-${index}`}>
                  <RepeaterField
                    label="רכיבים"
                    description="שורת טקסט אחת לכל רכיב. Enter בשורה האחרונה מוסיף רכיב חדש."
                    items={section.ingredients}
                    minItems={0}
                    maxItems={RECIPE_REPEATER_LIMITS.ingredients.max}
                    addLabel="הוספת רכיב"
                    emptyLabel="הוסיפו רכיבים לחלק זה"
                    error={ingredientsError}
                    addButtonPlacement="bottom"
                    createItem={createEmptyIngredient}
                    onChange={(ingredients) =>
                      updateSection(index, { ...section, ingredients })
                    }
                    renderFields={(item, _itemIndex, updateItem, helpers) => (
                      <div className="min-w-0">
                        <label
                          htmlFor={`ingredient-text-${item.id}`}
                          className="sr-only"
                        >
                          רכיב
                        </label>
                        <RepeaterTextField
                          id={`ingredient-text-${item.id}`}
                          value={item.text}
                          placeholder="לדוגמה: 2 כוסות קמח"
                          className="w-full"
                          onChange={(text) => updateItem({ ...item, text })}
                          onKeyDown={(event) => {
                            if (event.key !== "Enter") {
                              return;
                            }

                            event.preventDefault();

                            if (!helpers.isLast) {
                              return;
                            }

                            if (item.text.trim().length === 0) {
                              return;
                            }

                            helpers.requestAdd();
                          }}
                        />
                      </div>
                    )}
                  />
                </div>

                <div id={`recipe-section-steps-${index}`}>
                  <RepeaterField
                    label="שלבי הכנה"
                    description="Enter לירידת שורה. Ctrl/Cmd + Enter מוסיף שלב חדש."
                    variant="article"
                    items={section.steps}
                    minItems={0}
                    maxItems={RECIPE_REPEATER_LIMITS.steps.max}
                    addLabel="הוספת שלב"
                    emptyLabel="הוסיפו שלבי הכנה לחלק זה"
                    error={stepsError}
                    addButtonPlacement="bottom"
                    createItem={createEmptyStep}
                    onChange={(steps) =>
                      updateSection(index, { ...section, steps })
                    }
                    renderFields={(item, _itemIndex, updateItem, helpers) => (
                      <RepeaterTextareaField
                        id={`step-text-${item.id}`}
                        value={item.text}
                        placeholder="כתבי את שלב ההכנה"
                        autoResize
                        minHeightPx={64}
                        maxHeightPx={220}
                        onChange={(text) => updateItem({ ...item, text })}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter") {
                            return;
                          }

                          if (!(event.ctrlKey || event.metaKey)) {
                            return;
                          }

                          event.preventDefault();
                          helpers.requestAdd();
                        }}
                      />
                    )}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <Button
        type="button"
        variant="outline"
        disabled={!canAddSection}
        onClick={handleAddSection}
      >
        <Plus aria-hidden="true" className="size-4" />
        הוספת חלק למתכון
      </Button>

      <RecipeSectionDeleteDialog
        open={pendingDeleteIndex !== null}
        sectionLabel={pendingLabel}
        onClose={() => setPendingDeleteIndex(null)}
        onConfirm={handleConfirmRemove}
      />
    </div>
  );
}
