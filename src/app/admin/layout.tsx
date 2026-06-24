import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col lg:flex-row overflow-hidden bg-gray-50 text-gray-900" style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}>
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
