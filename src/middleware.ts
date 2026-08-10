import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  ADMIN_INACTIVITY_MS,
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

  // Check if user is an admin
  let isAdmin = false;
  if (user) {
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = !!adminUser;
  }

  // Check if user has admin cookie for coming soon page
  const hasAdminCookie = request.cookies.has(ADMIN_LAST_ACTIVITY_COOKIE);
  const isPublicRoute = !request.nextUrl.pathname.startsWith("/admin") && 
                        !request.nextUrl.pathname.startsWith("/api") &&
                        !request.nextUrl.pathname.startsWith("/login") &&
                        !request.nextUrl.pathname.startsWith("/coming-soon");

  if (isPublicRoute && !hasAdminCookie && !isAdmin) {
    return NextResponse.redirect(new URL("/coming-soon", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/api/admin")) {
    const isServerAction = isServerActionRequest(request);

    if (!user) {
      if (isServerAction) {
        return response;
      }

      return NextResponse.redirect(new URL("/login", request.url));
    }

    const lastActivity = request.cookies.get(ADMIN_LAST_ACTIVITY_COOKIE)?.value;

    if (lastActivity) {
      const elapsed = Date.now() - Number(lastActivity);

      if (!Number.isNaN(elapsed) && elapsed > ADMIN_INACTIVITY_MS) {
        if (isServerAction) {
          return response;
        }

        const redirectResponse = NextResponse.redirect(
          new URL("/login?reason=inactivity", request.url)
        );

        const signOutClient = createServerClient(url, anonKey, {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                redirectResponse.cookies.set(name, value, options);
              });
            },
          },
        });

        await signOutClient.auth.signOut();
        redirectResponse.cookies.delete(ADMIN_LAST_ACTIVITY_COOKIE);

        return redirectResponse;
      }
    }

    response.cookies.set(
      ADMIN_LAST_ACTIVITY_COOKIE,
      String(Date.now()),
      adminActivityCookieOptions
    );
  }

  return response;
}

export const config = {
  matcher: [
    // Exclude media upload so large multipart bodies are not buffered/truncated
    // by the Next.js proxy layer (see proxyClientMaxBodySize in next.config).
    "/((?!_next/static|_next/image|favicon.ico|api/admin/media/upload|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
