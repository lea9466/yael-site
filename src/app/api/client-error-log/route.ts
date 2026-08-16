import { NextResponse } from "next/server";

type ClientErrorPayload = {
  message?: unknown;
  stack?: unknown;
  source?: unknown;
  url?: unknown;
  userAgent?: unknown;
};

function toLoggableString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.slice(0, maxLength);
}

export async function POST(request: Request): Promise<NextResponse> {
  let payload: ClientErrorPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  console.error("[client-error]", {
    message: toLoggableString(payload.message, 500),
    source: toLoggableString(payload.source, 100),
    url: toLoggableString(payload.url, 300),
    userAgent: toLoggableString(payload.userAgent, 300),
    stack: toLoggableString(payload.stack, 2000),
  });

  return NextResponse.json({ ok: true });
}
