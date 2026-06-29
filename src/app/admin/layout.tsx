import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if ((profile as { role: string } | null)?.role !== "admin") redirect("/");

  const { count: unreadCount } = await supabase
    .from("admin_notifications")
    .select("*", { count: "exact", head: true })
    .is("read_at", null);

  return (
    <div className="flex h-screen flex-col lg:flex-row overflow-hidden bg-gray-50 text-gray-900" style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}>
      <AdminSidebar unreadNotifications={unreadCount ?? 0} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
