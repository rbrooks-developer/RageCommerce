"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart/store";
import { formatPrice } from "@/lib/utils";
import { Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Add some products to get started.</p>
        <Link
          href="/products"
          className="inline-block rounded-md bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items list */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4"
            >
              {item.image ? (
                <div className="relative h-20 w-20 shrink-0 rounded-md overflow-hidden">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                </div>
              ) : (
                <div className="h-20 w-20 shrink-0 rounded-md bg-gray-100" />
              )}

              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.productId}`}
                  className="font-medium text-gray-900 hover:underline line-clamp-2 text-sm"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-gray-500 mt-0.5">{formatPrice(item.price * 100)} each</p>

                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-sm"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-sm"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="shrink-0 font-semibold text-gray-900 text-sm">
                {formatPrice(item.price * item.quantity * 100)}
              </p>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:w-72 shrink-0">
          <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4 sticky top-24">
            <h2 className="font-semibold text-gray-900">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                <span>{formatPrice(subtotal * 100)}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-xs">
                <span>Shipping & tax</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between font-semibold text-gray-900">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal * 100)}</span>
            </div>

            <Link
              href="/checkout"
              className="block w-full rounded-md bg-gray-900 py-3.5 text-center text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/products"
              className="block text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
