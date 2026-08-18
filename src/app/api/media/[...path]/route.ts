import type { NextRequest } from "next/server";

import { getUpstreamSupabaseMediaUrl } from "@/lib/media/public-url";

// Headers worth forwarding in both directions to support correct caching,
// content negotiation, and byte-range video seeking through the proxy.
const REQUEST_HEADERS_TO_FORWARD = ["range", "if-none-match", "if-modified-since"];
const RESPONSE_HEADERS_TO_FORWARD = [
  "content-type",
  "content-length",
  "content-range",
  "accept-ranges",
  "cache-control",
  "etag",
  "last-modified",
];

// Every storage path is a fresh randomUUID() at upload time (see
// buildOptimizedStoragePath in process-image.ts, and the equivalents in
// process-video.ts/process-pdf.ts) and nothing ever overwrites an existing
// path — a re-upload just creates a new path. So once a path resolves, its
// content can never change, which makes it safe to cache forever.
const IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable";

function isValidStorageSegment(segment: string): boolean {
  return segment.length > 0 && segment !== "." && segment !== "..";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path } = await params;

  if (path.length === 0 || !path.every(isValidStorageSegment)) {
    return new Response("Not found", { status: 404 });
  }

  const upstreamUrl = getUpstreamSupabaseMediaUrl(path.join("/"));

  if (!upstreamUrl) {
    return new Response("Not found", { status: 404 });
  }

  const upstreamHeaders = new Headers();
  for (const header of REQUEST_HEADERS_TO_FORWARD) {
    const value = request.headers.get(header);
    if (value) {
      upstreamHeaders.set(header, value);
    }
  }

  // Range requests (video seeking) and conditional requests (a browser's own
  // revalidation) are inherently request-specific — caching those risks
  // serving the wrong byte range, or a stale 304, to a different client. A
  // plain full-content GET (an <img>/<video poster> load, the overwhelming
  // majority of hits on a media-heavy site) has no such risk and is exactly
  // what was re-hitting this function and Supabase on every single page view.
  const isRangeOrConditional =
    upstreamHeaders.has("range") || upstreamHeaders.has("if-none-match") || upstreamHeaders.has("if-modified-since");

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(
      upstreamUrl,
      isRangeOrConditional
        ? { headers: upstreamHeaders, cache: "no-store" }
        : { headers: upstreamHeaders, next: { revalidate: 31536000 } }
    );
  } catch (error) {
    console.error("[media-proxy] upstream fetch failed", { path: path.join("/"), error });
    return new Response("Not found", { status: 404 });
  }

  if (!upstreamResponse.ok && upstreamResponse.status !== 206 && upstreamResponse.status !== 304) {
    console.error("[media-proxy] upstream returned non-ok status", {
      path: path.join("/"),
      status: upstreamResponse.status,
    });
    return new Response("Not found", { status: 404 });
  }

  const responseHeaders = new Headers();
  for (const header of RESPONSE_HEADERS_TO_FORWARD) {
    const value = upstreamResponse.headers.get(header);
    if (value) {
      responseHeaders.set(header, value);
    }
  }

  // Overrides whatever cache-control Supabase Storage happened to forward —
  // this is what actually gets Vercel's Edge Network to serve repeat
  // requests straight from cache without invoking this function again.
  if (!isRangeOrConditional && upstreamResponse.status === 200) {
    responseHeaders.set("cache-control", IMMUTABLE_CACHE_CONTROL);
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}
