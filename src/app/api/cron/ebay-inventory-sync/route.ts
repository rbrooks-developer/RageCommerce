import { NextRequest } from "next/server";
import { getValidEbayConfig, saveEbayConfig } from "@/lib/ebay/auth";
import { runEbayInventorySync } from "@/lib/ebay/inventorySync";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await getValidEbayConfig();
  if (!config?.access_token) {
    return Response.json({ skipped: true, reason: "No valid eBay token" });
  }

  if (!config.inventory_sync_enabled) {
    return Response.json({ skipped: true, reason: "Inventory sync disabled" });
  }

  const intervalMs = Math.max(60, config.inventory_sync_interval_minutes ?? 60) * 60 * 1000;
  const lastRun    = config.inventory_sync_last_run ? new Date(config.inventory_sync_last_run).getTime() : 0;
  if (Date.now() - lastRun < intervalMs) {
    const nextRun = new Date(lastRun + intervalMs).toISOString();
    return Response.json({ skipped: true, reason: "Interval not elapsed", nextRun });
  }

  // Mark as running immediately to prevent overlapping invocations
  await saveEbayConfig({ inventory_sync_last_run: new Date().toISOString() });

  const result = await runEbayInventorySync(config);

  return Response.json({
    success: true,
    ...result,
    ran_at: new Date().toISOString(),
  });
}
