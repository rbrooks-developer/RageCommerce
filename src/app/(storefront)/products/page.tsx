import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/data/settings";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CategorySidebar } from "@/components/storefront/CategorySidebar";
import type { Metadata } from "next";
import type { Product, Category, HomepageConfig } from "@/types";

type ProductRow = Pick<Product, "id" | "slug" | "name" | "price" | "images" | "inventory"> & { category_id: string | null };
type CategoryRow = Pick<Category, "id" | "slug" | "name"> & { parent_id: string | null };

/** Collects a category's ID plus all descendant IDs (recursive). */
function collectIds(rootId: string, all: CategoryRow[]): string[] {
  const children = all.filter((c) => c.parent_id === rootId);
  return [rootId, ...children.flatMap((c) => collectIds(c.id, all))];
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteTitle = settings?.site_title ?? "Store";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return {
    title: `All Products | ${siteTitle}`,
    description: settings?.meta_description ?? `Shop all products at ${siteTitle}.`,
    alternates: { canonical: `${appUrl}/products` },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  const [productsRes, categoriesRes, settings] = await Promise.all([
    supabase
      .from("products")
      .select("id, slug, name, price, images, inventory, category_id")
      .eq("is_published", true)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("id, slug, name, parent_id").order("name"),
    getSettings(),
  ]);

  const homepage = settings?.homepage_config as HomepageConfig | null;
  const fontColor = homepage?.font_color ?? "#111827";
  const bgColor = homepage?.bg_color ?? "#ffffff";

  const products = (productsRes.data ?? []) as ProductRow[];
  const categories = (categoriesRes.data ?? []) as CategoryRow[];

  // When a category is selected, also include products in all descendant categories
  const selectedCat = category ? categories.find((c) => c.slug === category) : null;
  const filterIds = selectedCat ? collectIds(selectedCat.id, categories) : null;
  const filtered = filterIds
    ? products.filter((p) => p.category_id && filterIds.includes(p.category_id))
    : products;

  const heading = selectedCat?.name ?? "All Products";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        {categories.length > 0 && (
          <aside className="md:w-52 shrink-0">
            <CategorySidebar
              categories={categories}
              activeSlug={category}
              fontColor={fontColor}
              bgColor={bgColor}
            />
          </aside>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-bold">{heading}</h1>
            <span className="text-sm" style={{ opacity: 0.5 }}>{filtered.length} products</span>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center py-20" style={{ opacity: 0.4 }}>No products found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
