import { createSiteFaviconResponse } from "@/lib/seo/favicon-image";

export const dynamic = "force-dynamic";

// 96px = a multiple of 48, which is what Google wants for the search-result
// favicon (served here for the /favicon.ico rewrite).
const size = {
  width: 96,
  height: 96,
};

export async function GET(): Promise<Response> {
  const result = await createSiteFaviconResponse(size);

  if (result instanceof Response) {
    return result;
  }

  // ImageResponse extends Response in next/og — return as-is for the fallback.
  return result;
}
