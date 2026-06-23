import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/data/settings";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { ProductImages } from "./ProductImages";
import type { Metadata } from "next";
import type { Product } from "@/types";

type ProductWithCategory = Product & {
  categories: { name: string; slug: string } | null;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("name, seo_title, seo_description, images")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return {};
  const product = data as Pick<Product, "name" | "seo_title" | "seo_description" | "images">;
  const settings = await getSettings();
  return {
    title: product.seo_title ?? `${product.name} | ${settings?.site_title ?? "Store"}`,
    description: product.seo_description ?? undefined,
    openGraph: {
      title: product.seo_title ?? product.name,
      description: product.seo_description ?? undefined,
      images: (product.images as string[]).slice(0, 1),
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!data) notFound();
  const product = data as ProductWithCategory;
  const images = product.images as string[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: product.inventory > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="lg:w-1/2">
            <ProductImages images={images} name={product.name} />
          </div>

          <div className="lg:w-1/2 space-y-5">
            {product.categories && (
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                {product.categories.name}
              </p>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-2xl font-semibold text-gray-800">{formatPrice(Number(product.price) * 100)}</p>

            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            )}

            <div className="pt-2">
              {product.inventory > 0 ? (
                <p className="text-sm text-green-600 font-medium">{product.inventory} in stock</p>
              ) : (
                <p className="text-sm text-red-500 font-medium">Out of stock</p>
              )}
            </div>

            <button
              disabled={product.inventory === 0}
              className="w-full rounded-md bg-gray-900 py-4 text-sm font-semibold text-white hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.inventory > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
