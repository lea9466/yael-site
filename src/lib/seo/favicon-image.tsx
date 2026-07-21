import { ImageResponse } from "next/og";
import sharp from "sharp";

import { getWebsiteSettings } from "@/lib/public/queries";

type FaviconImageSize = {
  width: number;
  height: number;
};

export async function loadCmsFaviconPng(
  url: string,
  size: FaviconImageSize
): Promise<Buffer | null> {
  try {
    const upstream = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!upstream.ok) {
      return null;
    }

    const input = Buffer.from(await upstream.arrayBuffer());

    return sharp(input)
      .resize(size.width, size.height, {
        fit: "cover",
        position: "centre",
      })
      .png()
      .toBuffer();
  } catch {
    return null;
  }
}

export function createBrandFallbackIcon(
  size: FaviconImageSize
): ImageResponse {
  const markSize = Math.round(size.width * 0.44);
  const radius = Math.round(size.width * 0.25);
  const markRadius = Math.round(markSize / 2);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#3F5F47",
          borderRadius: radius,
        }}
      >
        <div
          style={{
            width: markSize,
            height: markSize,
            borderRadius: markRadius,
            background: "#E3C7A6",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}

export async function createSiteFaviconResponse(
  size: FaviconImageSize
): Promise<Response | ImageResponse> {
  const settings = await getWebsiteSettings();
  const faviconUrl = settings.favicon?.url?.trim();

  if (faviconUrl) {
    const png = await loadCmsFaviconPng(faviconUrl, size);

    if (png) {
      return new Response(new Uint8Array(png), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control":
            "public, max-age=3600, stale-while-revalidate=86400",
        },
      });
    }
  }

  return createBrandFallbackIcon(size);
}
