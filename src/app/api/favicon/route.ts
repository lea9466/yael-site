import { createSiteFaviconResponse } from "@/lib/seo/favicon-image";

export const dynamic = "force-dynamic";

const size = {
  width: 32,
  height: 32,
};

export async function GET(): Promise<Response> {
  const result = await createSiteFaviconResponse(size);

  if (result instanceof Response) {
    return result;
  }

  // ImageResponse extends Response in next/og — return as-is for the fallback.
  return result;
}
