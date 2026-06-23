import { createClient } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";
import type { Product, Category } from "@/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const supabase = await createClient();

  const [productsRes, categoriesRes] = await Promise.all([
    supabase.from("products").select("slug, updated_at").eq("is_published", true),
    supabase.from("categories").select("slug, updated_at"),
  ]);

  const products = (productsRes.data ?? []) as Pick<Product, "slug" | "updated_at">[];
  const categories = (categoriesRes.data ?? []) as Pick<Category, "slug" | "updated_at">[];

  const productUrls = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryUrls = categories.map((c) => ({
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
