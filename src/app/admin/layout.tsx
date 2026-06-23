export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar will be added in Phase 4 */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
