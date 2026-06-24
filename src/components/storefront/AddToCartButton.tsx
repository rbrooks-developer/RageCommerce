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
      <button
        disabled
        className="w-full rounded-md py-4 text-sm font-semibold cursor-not-allowed"
        style={{ opacity: 0.35, border: "1px solid currentColor" }}
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm" style={{ opacity: 0.6 }}>Qty</span>
        <div
          className="flex items-center rounded-md overflow-hidden"
          style={{ border: "1px solid currentColor", opacity: 0.85 }}
        >
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center transition-opacity hover:opacity-60"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-medium">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.inventory, q + 1))}
            className="w-10 h-10 flex items-center justify-center transition-opacity hover:opacity-60"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <span className="text-xs" style={{ opacity: 0.45 }}>{product.inventory} available</span>
      </div>

      <button
        onClick={handleAdd}
        className="w-full rounded-md py-4 text-sm font-semibold transition-opacity hover:opacity-85"
        style={{
          backgroundColor: "var(--site-fg)",
          color: "var(--site-bg)",
        }}
      >
        {added ? "Added to Cart!" : "Add to Cart"}
      </button>
    </div>
  );
}
