import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/data/settings";
import { ProductCard } from "@/components/storefront/ProductCard";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Category, Product } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("name").eq("slug", slug).maybeSingle();
  if (!data) return {};
  const category = data as Pick<Category, "name">;
  const settings = await getSettings();
  return { title: `${category.name} | ${settings?.site_title ?? "Store"}` };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
  if (!data) notFound();
  const category = data as Category;

  const { data: rawProducts } = await supabase
    .from("products")
    .select("id, slug, name, price, images")
    .eq("category_id", category.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  const products = (rawProducts ?? []) as Pick<Product, "id" | "slug" | "name" | "price" | "images">[];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{category.name}</h1>

      {products.length === 0 ? (
        <p className="text-center py-20 text-gray-400">No products in this category yet.</p>
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
