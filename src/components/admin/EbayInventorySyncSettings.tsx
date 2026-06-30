import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getValidEbayConfig, saveEbayConfig } from "@/lib/ebay/auth";
import { runEbayInventorySync } from "@/lib/ebay/inventorySync";
import type { EbayConfig } from "@/types";

export function EbayInventorySyncSettings({
  config,
  syncResult,
  syncError,
}: {
  config: EbayConfig | null;
  syncResult?: { total: number; updated: number; zeroed: number; unchanged: number; errors: number } | null;
  syncError?: string | null;
}) {
  const isConnected  = !!config?.access_token;
  const enabled      = config?.inventory_sync_enabled          ?? false;
  const intervalHours = Math.max(1, Math.round((config?.inventory_sync_interval_minutes ?? 60) / 60));
  const lastRun      = config?.inventory_sync_last_run         ?? null;

  async function saveSettings(formData: FormData) {
    "use server";
    const auth = await requireAdmin();
    if (auth.error) return;
    const isEnabled = formData.has("enabled");
    const hours     = Math.max(1, Math.min(24, Number(formData.get("interval_hours")) || 1));
    await saveEbayConfig({
      inventory_sync_enabled:          isEnabled,
      inventory_sync_interval_minutes: hours * 60,
    });
    revalidatePath("/admin/ebay");
  }

  async function syncNow() {
    "use server";
    const auth = await requireAdmin();
    if (auth.error) redirect(`/admin/ebay?syncError=${encodeURIComponent(auth.error)}`);

    const liveConfig = await getValidEbayConfig();
    if (!liveConfig?.access_token) {
      redirect(`/admin/ebay?syncError=${encodeURIComponent("eBay is not connected.")}`);
    }

    let target: string;
    try {
      const result = await runEbayInventorySync(liveConfig);
      await saveEbayConfig({ inventory_sync_last_run: new Date().toISOString() });
      const qs = new URLSearchParams({
        total:     String(result.total),
        updated:   String(result.updated),
        zeroed:    String(result.zeroed),
        unchanged: String(result.unchanged),
        errors:    String(result.errors),
      });
      target = `/admin/ebay?${qs.toString()}`;
    } catch (err: any) {
      target = `/admin/ebay?syncError=${encodeURIComponent(err.message)}`;
    }
    redirect(target);
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Inventory Sync Service</h2>
        <p className="mt-1 text-sm text-gray-500">
          Automatically updates product inventory from eBay on a schedule. eBay is the
          source of truth — quantities are pulled via the Trading API and written to the
          website. If a listing no longer exists on eBay, the product inventory is set to
          0 (out of stock). On the Hobby plan the cron runs once daily.
        </p>
      </div>

      {syncResult && (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Sync complete — {syncResult.total} checked, {syncResult.updated} updated,{" "}
          {syncResult.zeroed} zeroed out, {syncResult.unchanged} unchanged
          {syncResult.errors > 0 && `, ${syncResult.errors} errors`}.
        </div>
      )}

      {syncError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Sync failed: {syncError}
        </div>
      )}

      {lastRun && (
        <p className="text-sm text-gray-500" suppressHydrationWarning>
          Last synced: {new Date(lastRun).toLocaleString()}
        </p>
      )}

      <form action={saveSettings} className="space-y-5">
        <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={enabled}
            disabled={!isConnected}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
          />
          <span className="text-sm font-medium text-gray-700">Enable automatic sync</span>
        </label>

        <div className="flex items-center gap-3">
          <label htmlFor="inv-interval" className="text-sm text-gray-700 shrink-0 w-40">
            Sync every (hours)
          </label>
          <input
            id="inv-interval"
            type="number"
            name="interval_hours"
            defaultValue={intervalHours}
            min={1}
            max={24}
            disabled={!isConnected}
            className="w-24 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
          <span className="text-xs text-gray-400">1–24 hours</span>
        </div>

        <button
          type="submit"
          disabled={!isConnected}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium
                     text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50
                     disabled:cursor-not-allowed transition-colors"
        >
          Save Sync Settings
        </button>

        {!isConnected && (
          <p className="text-xs text-gray-400">
            Connect your eBay account above to enable inventory sync.
          </p>
        )}
      </form>

      <form action={syncNow} className="pt-1 border-t border-gray-100">
        <button
          type="submit"
          disabled={!isConnected}
          className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white
                     shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
        >
          Sync Now
        </button>
        <p className="mt-2 text-xs text-gray-400">
          Runs the sync immediately, regardless of the schedule above. May take a moment for
          large catalogs.
        </p>
      </form>
    </section>
  );
}
