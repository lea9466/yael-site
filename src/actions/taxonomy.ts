"use server";

import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { fetchArticleTags, fetchRecipeTags } from "@/lib/taxonomy/queries";

export async function searchRecipeTagsAction(
  query: string
): Promise<{ success: true; items: Array<{ id: string; name: string }> } | { success: false; error: string }> {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return { success: false, error: "אין הרשאה." };
  }

  const items = await fetchRecipeTags(query);

  return { success: true, items };
}

export async function searchArticleTagsAction(
  query: string
): Promise<{ success: true; items: Array<{ id: string; name: string }> } | { success: false; error: string }> {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return { success: false, error: "אין הרשאה." };
  }

  const items = await fetchArticleTags(query);

  return { success: true, items };
}
