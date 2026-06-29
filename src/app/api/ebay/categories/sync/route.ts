import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getValidEbayConfig, getAppToken, saveEbayConfig } from "@/lib/ebay/auth";
import { fetchAndFlattenCategoryTree } from "@/lib/ebay/taxonomy";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
// Syncing ~20k categories can take 30–60s
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

  try {
    const config = await getValidEbayConfig();
    if (!config?.app_id || !config?.cert_id) {
      return NextResponse.json(
        { error: "eBay credentials not configured." },
        { status: 400 }
      );
    }

    // Client credentials token — no user consent required for Taxonomy API
    const appToken = await getAppToken(config);

    const categories = await fetchAndFlattenCategoryTree(appToken);

    const supabase = createServiceClient();

    // Clear existing cache then re-insert
    await supabase.from("ebay_categories").delete().gte("level", 1);

    const now = new Date().toISOString();
    const BATCH = 500;
    for (let i = 0; i < categories.length; i += BATCH) {
      const { error } = await supabase
        .from("ebay_categories")
        .insert(categories.slice(i, i + BATCH).map(c => ({ ...c, synced_at: now })));
      if (error) throw new Error(`Insert batch ${i / BATCH + 1} failed: ${error.message}`);
    }

    await saveEbayConfig({
      categories_synced_at: now,
      categories_count: categories.length,
    });

    return NextResponse.json({ success: true, count: categories.length });
  } catch (err) {
    console.error("[ebay/categories/sync]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
