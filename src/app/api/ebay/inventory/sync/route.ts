import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getValidEbayConfig, saveEbayConfig } from "@/lib/ebay/auth";
import { runEbayInventorySync } from "@/lib/ebay/inventorySync";

export const dynamic     = "force-dynamic";
export const maxDuration = 300;

export async function POST(_request: NextRequest): Promise<Response> {
  const auth = await requireAdmin();
  if (auth.error) {
    return new Response(JSON.stringify({ type: "fatal", message: "Unauthorized" }) + "\n", {
      status: 401,
      headers: { "Content-Type": "application/x-ndjson" },
    });
  }

  const encoder = new TextEncoder();
  const stream  = new TransformStream<Uint8Array, Uint8Array>();
  const writer  = stream.writable.getWriter();

  const send = (data: object) =>
    writer.write(encoder.encode(JSON.stringify(data) + "\n"));

  // Run sync in the background so we can return the stream immediately
  (async () => {
    try {
      const config = await getValidEbayConfig();
      if (!config?.access_token) {
        await send({ type: "fatal", message: "eBay account not connected" });
        return;
      }

      await send({ type: "fetching" });

      const result = await runEbayInventorySync(config, {
        onTotal: (total) => send({ type: "total", count: total }),
        onItem:  (p)     => send({ type: "item", ...p }),
      });

      await saveEbayConfig({ inventory_sync_last_run: new Date().toISOString() });
      await send({ type: "done", ...result });
    } catch (err) {
      const message = (err as Error).message;
      console.error("[ebay/inventory/sync] fatal", message);
      await send({ type: "fatal", message: message || "Sync failed" });
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type":      "application/x-ndjson",
      "Cache-Control":      "no-cache",
      "X-Accel-Buffering":  "no",
    },
  });
}
