import { getSettings } from "@/lib/data/settings";
import { NextResponse } from "next/server";

export async function GET() {
  const settings = await getSettings();
  const faviconUrl = settings?.favicon_url ?? null;
  const siteTitle  = settings?.site_title  ?? "My Store";

  const manifest = {
    name: siteTitle,
    short_name: siteTitle,
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: faviconUrl
      ? [
          { src: faviconUrl, sizes: "any", type: "image/png", purpose: "any maskable" },
        ]
      : [],
  };

  return NextResponse.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
