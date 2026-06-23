import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Account" };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </div>
  );
}
