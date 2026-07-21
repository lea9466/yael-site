import { readFile } from "node:fs/promises";
import path from "node:path";

import { getWebsiteSettings } from "@/lib/public/queries";

export const dynamic = "force-dynamic";

const FALLBACK_CACHE =
  "public, max-age=3600, stale-while-revalidate=86400";
const REMOTE_CACHE =
  "public, max-age=3600, stale-while-revalidate=86400";

export async function GET(): Promise<Response> {
  const settings = await getWebsiteSettings();
  const faviconUrl = settings.favicon?.url?.trim();

  if (faviconUrl) {
    try {
      const upstream = await fetch(faviconUrl, {
        next: { revalidate: 3600 },
      });

      if (upstream.ok) {
        const buffer = await upstream.arrayBuffer();
        const contentType =
          upstream.headers.get("Content-Type") ?? "image/webp";

        return new Response(buffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": REMOTE_CACHE,
          },
        });
      }
    } catch {
      // Fall through to the local brand icon.
    }
  }

  const svgPath = path.join(process.cwd(), "public", "icon.svg");
  const svg = await readFile(svgPath);

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": FALLBACK_CACHE,
    },
  });
}
