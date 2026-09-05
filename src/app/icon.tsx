import { createSiteFaviconResponse } from "@/lib/seo/favicon-image";

// Read the current favicon from the CMS on each request (CDN-cached for an
// hour by createSiteFaviconResponse). Falls back to the brand mark when none
// is configured.
export const dynamic = "force-dynamic";

// Google requires the search-result favicon to be a multiple of 48px square;
// a 32px icon can be ignored. 96px downscales cleanly for the browser tab too.
export const size = {
  width: 96,
  height: 96,
};

export const contentType = "image/png";

export default async function Icon() {
  return createSiteFaviconResponse(size);
}
