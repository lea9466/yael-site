import { createEmptyStoredSeo } from "@/lib/seo/resolve";
import {
  legacyIngredientToText,
  toRecipeIngredient,
} from "@/lib/recipes/format-ingredient";
import type {
  RecipeContent,
  RecipeGalleryItem,
  RecipeIngredient,
  RecipeSection,
  RecipeStep,
} from "@/lib/recipes/types";

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeIngredient(value: unknown): RecipeIngredient | null {
  return toRecipeIngredient(value);
}

function normalizeStep(value: unknown): RecipeStep | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const text = asTrimmedString((value as Partial<RecipeStep>).text);

  if (!text) {
    return null;
  }

  return { text };
}

function normalizeSection(value: unknown): RecipeSection | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const record = value as Partial<RecipeSection>;
  const ingredients = Array.isArray(record.ingredients)
    ? record.ingredients
        .map((item) => normalizeIngredient(item))
        .filter((item): item is RecipeIngredient => item !== null)
    : [];
  const steps = Array.isArray(record.steps)
    ? record.steps
        .map((item) => normalizeStep(item))
        .filter((item): item is RecipeStep => item !== null)
    : [];

  if (ingredients.length === 0 && steps.length === 0) {
    return null;
  }

  return {
    title: asTrimmedString(record.title),
    ingredients,
    steps,
  };
}

function mapIngredientForEditor(value: unknown): RecipeIngredient {
  return { text: legacyIngredientToText(value) };
}

function mapStepForEditor(value: unknown): RecipeStep {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { text: "" };
  }

  const step = value as Partial<RecipeStep>;

  return {
    text: typeof step.text === "string" ? step.text : "",
  };
}

/**
 * Returns a unified RecipeSection[] from either the new recipe_sections
 * shape or the legacy top-level ingredients/steps arrays.
 * Does not mutate stored database content.
 * Ingredients are normalized in-memory to `{ text }` (including legacy rows).
 */
export function normalizeRecipeSections(
  content: RecipeContent | Partial<RecipeContent> | null | undefined
): RecipeSection[] {
  if (!content || typeof content !== "object") {
    return [{ title: "", ingredients: [], steps: [] }];
  }

  if (
    Array.isArray(content.recipe_sections) &&
    content.recipe_sections.length > 0
  ) {
    const sections = content.recipe_sections
      .map((section) => {
        if (
          typeof section !== "object" ||
          section === null ||
          Array.isArray(section)
        ) {
          return null;
        }

        const record = section as Partial<RecipeSection>;
        const ingredients = Array.isArray(record.ingredients)
          ? record.ingredients.map((item) => mapIngredientForEditor(item))
          : [];
        const steps = Array.isArray(record.steps)
          ? record.steps.map((item) => mapStepForEditor(item))
          : [];

        return {
          title: typeof record.title === "string" ? record.title : "",
          ingredients,
          steps,
        };
      })
      .filter(
        (section): section is NonNullable<typeof section> => section !== null
      );

    if (sections.length > 0) {
      return sections;
    }
  }

  const legacyIngredients = Array.isArray(content.ingredients)
    ? content.ingredients.map((item) => mapIngredientForEditor(item))
    : [];

  const legacySteps = Array.isArray(content.steps)
    ? content.steps.map((item) => mapStepForEditor(item))
    : [];

  return [
    {
      title: "",
      ingredients: legacyIngredients,
      steps: legacySteps,
    },
  ];
}

export function sanitizeRecipeSectionsForSave(
  sections: RecipeSection[]
): RecipeSection[] {
  return sections
    .map((section) => normalizeSection(section))
    .filter((section): section is RecipeSection => section !== null);
}

export function createDefaultRecipeContent(): RecipeContent {
  return {
    recipe_sections: [
      {
        title: "",
        ingredients: [],
        steps: [],
      },
    ],
    yael_tip: null,
    gallery: [],
  };
}

export function createDefaultRecipeSeo() {
  return createEmptyStoredSeo();
}

export function normalizeGalleryForSave(
  gallery: RecipeGalleryItem[] | undefined
): RecipeGalleryItem[] {
  return (gallery ?? [])
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((item, index) => ({
      media_id: item.media_id,
      order: index,
    }));
}

export function normalizeRecipeContent(content: unknown): RecipeContent {
  if (
    typeof content !== "object" ||
    content === null ||
    Array.isArray(content)
  ) {
    return createDefaultRecipeContent();
  }

  const record = content as Partial<RecipeContent>;
  const hasRecipeSections =
    Array.isArray(record.recipe_sections) && record.recipe_sections.length > 0;

  return {
    ...(hasRecipeSections
      ? { recipe_sections: record.recipe_sections }
      : {
          ingredients: Array.isArray(record.ingredients)
            ? record.ingredients
            : [],
          steps: Array.isArray(record.steps) ? record.steps : [],
        }),
    yael_tip:
      typeof record.yael_tip === "string" && record.yael_tip.trim().length > 0
        ? record.yael_tip
        : null,
    gallery: Array.isArray(record.gallery) ? record.gallery : [],
  };
}

export type RecipeContentForSave = {
  recipe_sections: RecipeSection[];
  yael_tip: string | null;
  gallery: RecipeGalleryItem[];
};

export function buildRecipeContentForSave(input: {
  recipe_sections: RecipeSection[];
  yael_tip: string | null | undefined;
  gallery: RecipeGalleryItem[] | undefined;
}): RecipeContentForSave {
  const tip =
    typeof input.yael_tip === "string" && input.yael_tip.trim().length > 0
      ? input.yael_tip.trim()
      : null;

  return {
    recipe_sections: sanitizeRecipeSectionsForSave(input.recipe_sections),
    yael_tip: tip,
    gallery: normalizeGalleryForSave(input.gallery),
  };
}
