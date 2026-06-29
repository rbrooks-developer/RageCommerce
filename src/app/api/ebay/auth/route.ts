import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getEbayConfig, buildAuthorizeUrl } from "@/lib/ebay/auth";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const config = await getEbayConfig();
  if (!config?.app_id || !config?.cert_id || !config?.ru_name) {
    return NextResponse.redirect(
      new URL("/admin/ebay?error=missing_credentials", request.url)
    );
  }

  const state = randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("ebay_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(buildAuthorizeUrl(config, state));
}
