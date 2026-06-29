import { getEbayConfig } from "@/lib/ebay/auth";
import { EbaySettings } from "@/components/admin/EbaySettings";

export const dynamic = "force-dynamic";

export default async function EbayAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const [config, params] = await Promise.all([getEbayConfig(), searchParams]);
  const success = params.success ?? null;
  const error   = params.error   ?? null;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">eBay API Sync</h1>
        <p className="mt-1 text-sm text-gray-500">
          Connect your eBay seller account and sync the eBay category tree.
        </p>
      </div>
      <EbaySettings config={config} successParam={success} errorParam={error} />
    </div>
  );
}
