import type { AboutPageData } from "@/lib/validations/about";
import type { AboutMediaPreview } from "@/lib/about/queries";

export function aboutContentToEditorMediaUrls(
  content: AboutPageData["content"],
  mediaMap: Map<string, AboutMediaPreview>
): Map<string, { url: string; alt: string }> {
  const urls = new Map<string, { url: string; alt: string }>();

  for (const block of content.blocks) {
    if (block.type !== "image") {
      continue;
    }

    const preview = mediaMap.get(block.media_id);

    if (preview) {
      urls.set(block.media_id, {
        url: preview.url,
        alt: preview.alt,
      });
    }
  }

  return urls;
}
