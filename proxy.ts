import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";

export async function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const ip = clientIpFromHeaders(request.headers);
  const throttle = await rateLimit({
    key: `admin:path:${ip}`,
    windowMs: 60_000,
    limit: 120,
  });
  if (!throttle.allowed) {
    return new NextResponse("Too many requests", {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, Math.ceil((throttle.resetAt - Date.now()) / 1000))),
      },
    });
  }

  if (request.nextUrl.pathname.startsWith("/admin/sign-in")) {
    return NextResponse.next();
  }

  const queryBypass =
    process.env.NODE_ENV !== "production" &&
    request.nextUrl.searchParams.get("e2e_admin") === "1";
  if (queryBypass) {
    return NextResponse.next();
  }

  const bypassToken = process.env.E2E_ADMIN_BYPASS_TOKEN;
  const bypassCookie = request.cookies.get("gh_e2e_admin_bypass")?.value;
  const isExplicitE2E =
    process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_E2E === "true";
  const isE2EBypassActive =
    process.env.NODE_ENV !== "production" &&
    Boolean(bypassToken) &&
    bypassToken === bypassCookie;
  if (isE2EBypassActive || isExplicitE2E) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/admin/sign-in", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
