import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Plus } from "lucide-react";
import { DeleteProductButton, TogglePublishedButton } from "./ProductActions";
import Image from "next/image";
import type { Product } from "@/types";

type ProductRow = Product & { categories: { name: string } | null };

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: raw } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });
  const products = (raw ?? []) as ProductRow[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 h-11 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Product
        </Link>
      </div>

      {/* Mobile card view */}
      <div className="space-y-3 md:hidden">
        {products.map((product) => (
          <div key={product.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex gap-3">
              {(product.images as string[])[0] && (
                <div className="relative h-16 w-16 shrink-0 rounded-md overflow-hidden">
                  <Image src={(product.images as string[])[0]} alt={product.name} fill className="object-cover" sizes="64px" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-sm text-gray-500">{formatPrice(Number(product.price) * 100)}</p>
                <p className="text-xs text-gray-400">{product.categories?.name ?? "—"}</p>
              </div>
              <Badge variant={product.is_published ? "success" : "outline"}>
                {product.is_published ? "Live" : "Draft"}
              </Badge>
            </div>
            <div className="mt-3 flex gap-2">
              <Link href={`/admin/products/${product.id}/edit`} className="text-sm text-blue-600 hover:underline">Edit</Link>
              <TogglePublishedButton id={product.id} isPublished={product.is_published} />
              <DeleteProductButton id={product.id} />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Product</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Price</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Inventory</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {(product.images as string[])[0] ? (
                        <div className="relative h-10 w-10 rounded-md overflow-hidden shrink-0">
                          <Image src={(product.images as string[])[0]} alt={product.name} fill className="object-cover" sizes="40px" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-gray-100 shrink-0" />
                      )}
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{product.categories?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{formatPrice(Number(product.price) * 100)}</td>
                  <td className="px-4 py-3 text-gray-700">{product.inventory}</td>
                  <td className="px-4 py-3">
                    <Badge variant={product.is_published ? "success" : "outline"}>
                      {product.is_published ? "Live" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${product.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                      <TogglePublishedButton id={product.id} isPublished={product.is_published} />
                      <DeleteProductButton id={product.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="py-12 text-center text-sm text-gray-400">No products yet. Create your first product.</p>
          )}
        </div>
      </div>
    </div>
  );
}
