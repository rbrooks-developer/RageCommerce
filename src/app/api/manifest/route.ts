import { getSettings } from "@/lib/data/settings";
import { NextResponse } from "next/server";

export async function GET() {
  const settings = await getSettings();
  const faviconUrl = settings?.favicon_url ?? null;
  const siteTitle  = settings?.site_title  ?? "My Store";
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const manifest = {
    name: siteTitle,
    short_name: siteTitle,
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: faviconUrl
      ? [
          { src: `${appUrl}/api/favicon?size=192`, sizes: "192x192", type: "image/png", purpose: "any" },
          { src: `${appUrl}/api/favicon?size=512`, sizes: "512x512", type: "image/png", purpose: "maskable" },
        ]
      : [],
  };

  return NextResponse.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
