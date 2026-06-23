import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import type { Order, OrderItem, Product } from "@/types";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let order: Order | null = null;
  let orderItems: (OrderItem & { products: { name: string; images: unknown } | null })[] = [];

  if (session_id) {
    const supabase = await createClient();
    const { data: orderRaw } = await supabase
      .from("orders")
      .select("*")
      .eq("stripe_session_id", session_id)
      .maybeSingle();

    if (orderRaw) {
      order = orderRaw as Order;
      const { data: itemsRaw } = await supabase
        .from("order_items")
        .select("*, products(name, images)")
        .eq("order_id", order.id);
      orderItems = (itemsRaw ?? []) as (OrderItem & { products: { name: string; images: unknown } | null })[];
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center mb-8">
        <CheckCircle className="mx-auto h-14 w-14 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500">
          {order
            ? `Order #${order.id.slice(0, 8).toUpperCase()} has been placed.`
            : "Your order has been placed."}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          You'll receive a confirmation email shortly.
        </p>
      </div>

      {order && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
          {orderItems.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Items Ordered</h2>
              <ul className="space-y-2">
                {orderItems.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.products?.name ?? "Product"} × {item.quantity}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {formatPrice(Number(item.price) * item.quantity * 100)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(Number(order.subtotal) * 100)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{formatPrice(Number(order.shipping_cost) * 100)}</span>
            </div>
            {Number(order.tax_amount) > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatPrice(Number(order.tax_amount) * 100)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-gray-900 pt-1.5 border-t border-gray-100">
              <span>Total</span>
              <span>{formatPrice(Number(order.total_price) * 100)}</span>
            </div>
          </div>

          {order.shipping_address_line1 && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Shipping to</p>
              <p className="text-sm text-gray-700">
                {order.shipping_name}<br />
                {order.shipping_address_line1}
                {order.shipping_address_line2 ? `, ${order.shipping_address_line2}` : ""}<br />
                {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/products"
          className="rounded-md bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors text-center"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
