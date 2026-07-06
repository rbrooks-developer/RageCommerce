import { createClient } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";
import type { Product, Category } from "@/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const supabase = await createClient();

  const [productsRes, categoriesRes, productCategoryRes] = await Promise.all([
    supabase.from("products").select("slug, updated_at, category_id").eq("is_published", true),
    supabase.from("categories").select("id, slug, updated_at, parent_id"),
    supabase.from("products").select("category_id").eq("is_published", true).not("category_id", "is", null),
  ]);

  const products = (productsRes.data ?? []) as Pick<Product, "slug" | "updated_at">[];
  const allCategories = (categoriesRes.data ?? []) as (Pick<Category, "slug" | "updated_at"> & { id: string; parent_id: string | null })[];

  // Only include categories (and their ancestors) that have at least one published product
  const directCategoryIds = new Set(
    ((productCategoryRes.data ?? []) as { category_id: string }[]).map((r) => r.category_id)
  );

  // Walk up the tree so parent categories are included if any descendant has products
  function hasProductsInSubtree(id: string): boolean {
    if (directCategoryIds.has(id)) return true;
    return allCategories.some((c) => c.parent_id === id && hasProductsInSubtree(c.id));
  }

  const categoriesWithProducts = allCategories.filter((c) => hasProductsInSubtree(c.id));

  const productUrls = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryUrls = categoriesWithProducts.map((c) => ({
    url: `${base}/category/${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...categoryUrls,
    ...productUrls,
  ];
}
