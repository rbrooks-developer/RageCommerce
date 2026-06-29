import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ categories: [] });

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("ebay_categories")
    .select("ebay_category_id, name, category_path, is_leaf")
    .ilike("category_path", `%${q}%`)
    .order("category_path")
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Score: name starts with query → name contains query → path only
  const lower = q.toLowerCase();
  const scored = (data ?? [])
    .map(c => {
      const nl = c.name.toLowerCase();
      const score = nl.startsWith(lower) ? 0 : nl.includes(lower) ? 1 : 2;
      return { ...c, score };
    })
    .sort((a, b) => a.score - b.score || a.category_path.localeCompare(b.category_path))
    .slice(0, 100)
    .map(({ score, ...c }) => c);

  return NextResponse.json({ categories: scored });
}
