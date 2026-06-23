import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/badge";
import { logout } from "@/lib/actions/auth";
import type { Order } from "@/types";

type OrderRow = Pick<Order, "id" | "status" | "total_price" | "created_at" | "tracking_number">;

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: raw } = await supabase
    .from("orders")
    .select("id, status, total_price, created_at, tracking_number")
    .eq("user_id", user.id)
    .neq("status", "pending")
    .order("created_at", { ascending: false });

  const orders = (raw ?? []) as OrderRow[];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
          <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order History</h2>

        {orders.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-400 text-sm mb-4">You haven&apos;t placed any orders yet.</p>
            <Link
              href="/products"
              className="inline-block rounded-md bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-sm font-medium text-gray-900">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <OrderStatusBadge status={order.status} />
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {formatPrice(Number(order.total_price) * 100)}
                      </p>
                    </div>
                  </div>
                  {order.tracking_number && (
                    <p className="text-xs text-gray-400 mt-2">
                      Tracking: <span className="font-mono">{order.tracking_number}</span>
                    </p>
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block rounded-lg border border-gray-200 bg-white overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Order</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Date</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Total</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Tracking</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-mono text-xs font-medium text-gray-900">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(order.created_at)}</td>
                      <td className="px-5 py-3"><OrderStatusBadge status={order.status} /></td>
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {formatPrice(Number(order.total_price) * 100)}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">
                        {order.tracking_number ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
