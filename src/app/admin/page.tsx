import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { Package, FolderOpen, ShoppingCart, DollarSign } from "lucide-react";
import type { Order, Product } from "@/types";

async function getStats() {
  const supabase = await createClient();
  const [products, categories, orders] = await Promise.all([
    supabase.from("products").select("id, is_published", { count: "exact" }),
    supabase.from("categories").select("id", { count: "exact" }),
    supabase.from("orders").select("id, total_price, status", { count: "exact" }),
  ]);

  const orderRows = (orders.data ?? []) as Pick<Order, "id" | "total_price" | "status">[];
  const productRows = (products.data ?? []) as Pick<Product, "id" | "is_published">[];

  const revenue = orderRows
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total_price), 0);

  return {
    productCount: products.count ?? 0,
    publishedCount: productRows.filter((p) => p.is_published).length,
    categoryCount: categories.count ?? 0,
    orderCount: orders.count ?? 0,
    revenue,
  };
}

type RecentOrder = Pick<Order, "id" | "status" | "total_price" | "created_at" | "shipping_name">;

async function getRecentOrders(): Promise<RecentOrder[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, status, total_price, created_at, shipping_name")
    .order("created_at", { ascending: false })
    .limit(5);
  return (data ?? []) as RecentOrder[];
}

export default async function AdminDashboard() {
  const [stats, recentOrders] = await Promise.all([getStats(), getRecentOrders()]);

  const statCards = [
    { label: "Total Products", value: stats.productCount, sub: `${stats.publishedCount} published`, icon: Package },
    { label: "Categories", value: stats.categoryCount, icon: FolderOpen },
    { label: "Total Orders", value: stats.orderCount, icon: ShoppingCart },
    { label: "Revenue", value: formatPrice(stats.revenue * 100), icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{card.label}</span>
                <Icon className="h-4 w-4 text-gray-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
              {card.sub && <p className="mt-0.5 text-xs text-gray-400">{card.sub}</p>}
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
        </div>
        {recentOrders.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">No orders yet.</p>
        ) : (
          <div className="divide-y">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{order.shipping_name}</p>
                  <p className="text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-700">{formatPrice(Number(order.total_price) * 100)}</span>
                  <span className="capitalize text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
