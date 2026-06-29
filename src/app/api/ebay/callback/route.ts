import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getEbayConfig,
  saveEbayConfig,
  exchangeCodeForTokens,
  getEbayIdentity,
} from "@/lib/ebay/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code      = searchParams.get("code");
  const state     = searchParams.get("state");
  const ebayError = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  if (ebayError) {
    return NextResponse.redirect(`${appUrl}/admin/ebay?error=access_denied`);
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("ebay_oauth_state")?.value;
  cookieStore.delete("ebay_oauth_state");

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(`${appUrl}/admin/ebay?error=invalid_state`);
  }

  try {
    const config = await getEbayConfig();
    if (!config?.app_id || !config?.cert_id || !config?.ru_name) {
      return NextResponse.redirect(`${appUrl}/admin/ebay?error=missing_credentials`);
    }

    const tokens   = await exchangeCodeForTokens(config, code);
    const identity = await getEbayIdentity(tokens.access_token);

    await saveEbayConfig({
      access_token:     tokens.access_token,
      refresh_token:    tokens.refresh_token,
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      ebay_user_id:     identity.userId   || null,
      ebay_username:    identity.username || null,
    });

    return NextResponse.redirect(`${appUrl}/admin/ebay?success=connected`);
  } catch (err) {
    console.error("[ebay/callback] token exchange failed:", err);
    return NextResponse.redirect(`${appUrl}/admin/ebay?error=token_exchange_failed`);
  }
}
