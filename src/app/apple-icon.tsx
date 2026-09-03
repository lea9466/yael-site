import { createSiteFaviconResponse } from "@/lib/seo/favicon-image";

// Read the current favicon from the CMS on each request (CDN-cached for an
// hour by createSiteFaviconResponse). Falls back to the brand mark when none
// is configured.
export const dynamic = "force-dynamic";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default async function AppleIcon() {
  return createSiteFaviconResponse(size);
}
