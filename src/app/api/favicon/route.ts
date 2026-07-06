import { getSettings } from "@/lib/data/settings";
import { NextResponse } from "next/server";
import sharp from "sharp";

export async function GET(request: Request) {
  const settings = await getSettings();
  const faviconUrl = settings?.favicon_url ?? null;

  if (!faviconUrl) {
    return new NextResponse(null, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const size = Math.min(Math.max(parseInt(searchParams.get("size") ?? "192", 10), 16), 512);

  try {
    const res = await fetch(faviconUrl, { next: { revalidate: 3600 } });
    if (!res.ok) return new NextResponse(null, { status: 502 });

    const buffer = Buffer.from(await res.arrayBuffer());
    const png = await sharp(buffer).resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();

    return new NextResponse(png, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
