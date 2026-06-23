export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Header will be added in Phase 2 */}
      <main className="flex-1">{children}</main>
      {/* Footer will be added in Phase 2 */}
    </>
  );
}
