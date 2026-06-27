import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/data/settings";
import { ProductCard } from "@/components/storefront/ProductCard";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Category, Product, HomepageConfig } from "@/types";

type CategoryRow = Pick<Category, "id" | "slug" | "name"> & { parent_id: string | null };

/** Collects a category's ID plus all descendant IDs (recursive). */
function collectIds(rootId: string, all: CategoryRow[]): string[] {
  const children = all.filter((c) => c.parent_id === rootId);
  return [rootId, ...children.flatMap((c) => collectIds(c.id, all))];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("name").eq("slug", slug).maybeSingle();
  if (!data) return {};
  const settings = await getSettings();
  return { title: `${(data as Pick<Category, "name">).name} | ${settings?.site_title ?? "Store"}` };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const [{ data }, allCatsRes, settings] = await Promise.all([
    supabase.from("categories").select("id, slug, name, parent_id").eq("slug", slug).maybeSingle(),
    supabase.from("categories").select("id, slug, name, parent_id"),
    getSettings(),
  ]);

  if (!data) notFound();
  const category = data as CategoryRow;
  const allCategories = (allCatsRes.data ?? []) as CategoryRow[];

  // Include products from all descendant categories
  const ids = collectIds(category.id, allCategories);
  const { data: rawProducts } = await supabase
    .from("products")
    .select("id, slug, name, price, images, inventory")
    .in("category_id", ids)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const products = (rawProducts ?? []) as Pick<Product, "id" | "slug" | "name" | "price" | "images" | "inventory">[];

  const homepage = settings?.homepage_config as HomepageConfig | null;
  const fontColor = homepage?.font_color ?? "#111827";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{category.name}</h1>
        <span className="text-sm" style={{ opacity: 0.5 }}>{products.length} products</span>
      </div>

      {products.length === 0 ? (
        <p className="text-center py-20" style={{ opacity: 0.4 }}>No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
