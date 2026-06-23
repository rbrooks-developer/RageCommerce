"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/store";
import type { Product } from "@/types";

type ProductProps = Pick<
  Product,
  "id" | "name" | "price" | "images" | "weight_oz" | "length_in" | "width_in" | "height_in" | "inventory"
>;

export function AddToCartButton({ product }: { product: ProductProps }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: qty,
      image: ((product.images as string[]) ?? [])[0] ?? null,
      weight_oz: Number(product.weight_oz),
      length_in: Number(product.length_in),
      width_in: Number(product.width_in),
      height_in: Number(product.height_in),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (product.inventory === 0) {
    return (
      <button disabled className="w-full rounded-md bg-gray-200 py-4 text-sm font-semibold text-gray-400 cursor-not-allowed">
        Out of Stock
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Qty</span>
        <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-medium">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.inventory, q + 1))}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <span className="text-xs text-gray-400">{product.inventory} available</span>
      </div>

      <button
        onClick={handleAdd}
        className="w-full rounded-md bg-gray-900 py-4 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
      >
        {added ? "Added to Cart!" : "Add to Cart"}
      </button>
    </div>
  );
}
