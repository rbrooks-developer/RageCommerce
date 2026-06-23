import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/data/settings";
import { ProductCard } from "@/components/storefront/ProductCard";
import Link from "next/link";
import type { Metadata } from "next";
import type { Product, Category } from "@/types";

type ProductRow = Pick<Product, "id" | "slug" | "name" | "price" | "images"> & { category_id: string | null };
type CategoryRow = Pick<Category, "id" | "slug" | "name">;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return { title: `All Products | ${settings?.site_title ?? "Store"}` };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from("products")
      .select("id, slug, name, price, images, category_id")
      .eq("is_published", true)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("id, slug, name").order("name"),
  ]);

  const products = (productsRes.data ?? []) as ProductRow[];
  const categories = (categoriesRes.data ?? []) as CategoryRow[];

  const filtered = category
    ? products.filter((p) => {
        const cat = categories.find((c) => c.slug === category);
        return cat ? p.category_id === cat.id : true;
      })
    : products;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-6 md:flex-row">
        {categories.length > 0 && (
          <aside className="md:w-48 lg:w-56 shrink-0">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Categories</h2>
            <nav className="flex flex-row flex-wrap gap-2 md:flex-col md:gap-1">
              <Link
                href="/products"
                className={`text-sm px-3 py-1.5 rounded-md ${!category ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className={`text-sm px-3 py-1.5 rounded-md ${category === cat.slug ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </aside>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-bold text-gray-900">
              {category ? categories.find((c) => c.slug === category)?.name ?? "Products" : "All Products"}
            </h1>
            <span className="text-sm text-gray-400">{filtered.length} products</span>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center py-20 text-gray-400">No products found.</p>
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
