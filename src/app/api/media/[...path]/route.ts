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

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      headers: upstreamHeaders,
      cache: "no-store",
    });
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

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}
