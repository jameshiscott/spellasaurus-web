import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createServiceClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";

/**
 * Handles Supabase email confirmation redirect.
 * Exchanges the auth code for a session, then creates the profile row
 * from user_metadata (role, full_name) stored during registration.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const response = NextResponse.redirect(`${origin}/auth/confirmed`);

  // Exchange the code for a session (sets auth cookies on the response)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            // eslint-disable-next-line
            response.cookies.set(name, value, options as any)
          );
        },
      },
    }
  );

  const {
    data: { user },
    error: exchangeError,
  } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !user) {
    return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
  }

  // Create the profile row using service client (bypasses RLS)
  const serviceClient = createServiceClient();
  const meta = user.user_metadata ?? {};
  const role = meta.role ?? "parent";
  const fullName = meta.full_name ?? "";

  // Check if profile already exists (idempotent — handles double-clicks)
  const { data: existing } = await serviceClient
    .from(TABLES.USERS)
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!existing) {
    await serviceClient.from(TABLES.USERS).insert({
      id: user.id,
      role,
      full_name: fullName,
      email: user.email ?? "",
      onboarding_complete: true,
    });
  }

  return response;
}
