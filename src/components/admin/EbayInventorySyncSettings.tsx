import type { EbayConfig } from "@/types";

export function EbayInventorySyncSettings({ config }: { config: EbayConfig | null }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-base font-semibold text-gray-900">Inventory Sync Service</h2>
      <p className="mt-1 text-sm text-gray-500">eBay connected: {config?.access_token ? "yes" : "no"}</p>
    </section>
  );
}
