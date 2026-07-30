import { NextResponse, type NextRequest } from "next/server";

import { fetchPublishedPressArticleBySlug } from "@/lib/press/queries";
import { normalizeRouteSlug } from "@/lib/slug/normalize-route-slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function buildPdfFileName(title: string, slug: string): string {
  const raw = (title.trim() || slug.trim() || "article")
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

  const withExtension = raw.toLowerCase().endsWith(".pdf") ? raw : `${raw}.pdf`;
  return withExtension;
}

function toAsciiFallbackFileName(fileName: string): string {
  const ascii = fileName
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/["\\]/g, "")
    .trim();

  if (ascii.length > 0 && ascii.toLowerCase().endsWith(".pdf")) {
    return ascii;
  }

  if (ascii.length > 0) {
    return `${ascii}.pdf`;
  }

  return "article.pdf";
}

function buildContentDisposition(
  disposition: "inline" | "attachment",
  fileName: string
): string {
  const fallback = toAsciiFallbackFileName(fileName);
  const encoded = encodeURIComponent(fileName);

  return `${disposition}; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

/**
 * Download endpoint. Viewing uses the direct storage URL so browsers
 * can issue HTTP range requests (needed for embedded PDF images).
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { slug: rawSlug } = await context.params;
  const slug = normalizeRouteSlug(rawSlug);

  if (!slug) {
    return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  }

  const article = await fetchPublishedPressArticleBySlug(slug);

  if (!article?.pdfUrl) {
    return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  }

  const wantsDownload = request.nextUrl.searchParams.get("download") === "1";

  if (!wantsDownload) {
    return NextResponse.redirect(article.pdfUrl, 302);
  }

  let upstream: Response;

  try {
    upstream = await fetch(article.pdfUrl, { cache: "no-store" });
  } catch {
    return NextResponse.json({ error: "לא ניתן לטעון את הקובץ" }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json({ error: "לא ניתן לטעון את הקובץ" }, { status: 502 });
  }

  const bytes = Buffer.from(await upstream.arrayBuffer());
  const fileName = buildPdfFileName(article.title, article.slug);

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": buildContentDisposition("attachment", fileName),
      "Cache-Control": "private, no-store",
    },
  });
}
