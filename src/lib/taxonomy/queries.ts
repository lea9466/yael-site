import { createClient } from "@/lib/auth/session";
import type { ArticleTagSummary } from "@/lib/articles/types";
import type {
  RecipeCategorySummary,
  RecipeTagSummary,
} from "@/lib/recipes/types";

export async function fetchRecipeCategories(): Promise<RecipeCategorySummary[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .eq("type", "recipe")
      .order("name", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data;
  } catch {
    return [];
  }
}

export async function fetchRecipeTags(
  search = ""
): Promise<RecipeTagSummary[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("tags")
      .select("id, name")
      .eq("type", "recipe")
      .order("name", { ascending: true })
      .limit(50);

    if (search.trim().length > 0) {
      const pattern = `%${search.trim().replace(/[%_\\]/g, "\\$&")}%`;
      query = query.ilike("name", pattern);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data;
  } catch {
    return [];
  }
}

export async function verifyRecipeCategory(
  categoryId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, type")
    .eq("id", categoryId)
    .maybeSingle();

  return !error && data?.type === "recipe";
}

export async function verifyRecipeTags(tagIds: string[]): Promise<boolean> {
  if (tagIds.length === 0) {
    return true;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("id, type")
    .in("id", tagIds);

  if (error || !data || data.length !== tagIds.length) {
    return false;
  }

  return data.every((tag) => tag.type === "recipe");
}

export async function fetchArticleTags(
  search = ""
): Promise<ArticleTagSummary[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("tags")
      .select("id, name")
      .eq("type", "article")
      .order("name", { ascending: true })
      .limit(50);

    if (search.trim().length > 0) {
      const pattern = `%${search.trim().replace(/[%_\\]/g, "\\$&")}%`;
      query = query.ilike("name", pattern);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data;
  } catch {
    return [];
  }
}

export async function verifyArticleTags(tagIds: string[]): Promise<boolean> {
  if (tagIds.length === 0) {
    return true;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("id, type")
    .in("id", tagIds);

  if (error || !data || data.length !== tagIds.length) {
    return false;
  }

  return data.every((tag) => tag.type === "article");
}


