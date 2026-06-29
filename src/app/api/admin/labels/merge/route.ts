import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// EasyPost label size: 4×6 inches at 72 pts/inch
const LABEL_WIDTH_PT  = 4 * 72;
const LABEL_HEIGHT_PT = 6 * 72;

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { urls } = (await request.json()) as { urls: string[] };
  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
  }

  const merged = await PDFDocument.create();

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const contentType = res.headers.get("content-type") ?? "";
      const bytes = await res.arrayBuffer();

      if (contentType.includes("application/pdf")) {
        // Already a PDF — copy pages directly
        const doc   = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      } else {
        // PNG or JPEG (EasyPost default) — embed as full-page image
        const page = merged.addPage([LABEL_WIDTH_PT, LABEL_HEIGHT_PT]);
        let img;
        if (contentType.includes("jpeg") || contentType.includes("jpg") || url.match(/\.jpe?g/i)) {
          img = await merged.embedJpg(bytes);
        } else {
          img = await merged.embedPng(bytes);
        }
        page.drawImage(img, {
          x:      0,
          y:      0,
          width:  LABEL_WIDTH_PT,
          height: LABEL_HEIGHT_PT,
        });
      }
    } catch (err) {
      console.error("[labels/merge] failed for", url, err);
    }
  }

  if (merged.getPageCount() === 0) {
    return NextResponse.json({ error: "No labels could be loaded" }, { status: 502 });
  }

  const pdfBytes = await merged.save();

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `inline; filename="labels-${Date.now()}.pdf"`,
    },
  });
}
