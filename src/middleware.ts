import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  ADMIN_LAST_ACTIVITY_COOKIE,
  adminActivityCookieOptions,
} from "@/lib/auth/constants";

function isServerActionRequest(request: NextRequest): boolean {
  return (
    request.method === "POST" &&
    (request.headers.has("Next-Action") || request.headers.has("next-action"))
  );
}

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The "coming soon" gate for public pages was removed (the site is public).
  // If it is ever brought back, public routes must be re-added to the matcher
  // below — and note that running this middleware on every public request was
  // the single biggest source of Vercel CPU time.

  if (request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/api/admin")) {
    const isServerAction = isServerActionRequest(request);

    if (!user) {
      if (isServerAction) {
        return response;
      }

      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Mark that an admin session is active in this browser (used to keep the
    // "coming soon" gate open for the site owner). There is no inactivity
    // timeout — the admin stays signed in until they log out explicitly.
    response.cookies.set(
      ADMIN_LAST_ACTIVITY_COOKIE,
      String(Date.now()),
      adminActivityCookieOptions
    );
  }

  return response;
}

export const config = {
  // Only run where auth matters: the admin area, admin APIs and the login page.
  // Public pages don't need it — running it there cost a Supabase auth call on
  // every page view, prefetch and bot hit.
  matcher: [
    "/admin/:path*",
    // Exclude media upload so large multipart bodies are not buffered/truncated
    // by the Next.js proxy layer (see proxyClientMaxBodySize in next.config).
    "/api/admin/((?!media/upload).*)",
    "/login",
  ],
};
