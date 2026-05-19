import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const RENEWAL_COOKIE = "skl-keys-renewed-for";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/login";
  const isProtected =
    pathname.startsWith("/skills") ||
    pathname.startsWith("/settings") ||
    pathname === "/";

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/skills";
    return NextResponse.redirect(url);
  }

  if (user?.email?.toLowerCase().endsWith(".gov.sg") && user.last_sign_in_at) {
    const cookieValue = request.cookies.get(RENEWAL_COOKIE)?.value;
    if (cookieValue !== user.last_sign_in_at) {
      try {
        const admin = createAdminClient();
        const newExpiry = new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000
        ).toISOString();
        await admin
          .from("api_keys")
          .update({
            expires_at: newExpiry,
            expiry_warning_sent_at: null,
          })
          .eq("owner_email", user.email)
          .is("revoked_at", null);
      } catch {
        // Don't block the request if the bump fails.
      }
      supabaseResponse.cookies.set(RENEWAL_COOKIE, user.last_sign_in_at, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
