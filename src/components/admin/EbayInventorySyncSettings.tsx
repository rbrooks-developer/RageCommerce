"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { saveEbayInventorySyncSettings } from "@/lib/actions/ebay";
import type { EbayConfig } from "@/types";

export function EbayInventorySyncSettings({ config }: { config: EbayConfig | null }) {
  const isConnected = !!config?.access_token;

  const [enabled,  setEnabled]  = useState(config?.inventory_sync_enabled          ?? false);
  const [interval, setInterval] = useState(config?.inventory_sync_interval_minutes ?? 60);
  const [saving,   startSave]   = useTransition();
  const [msg,      setMsg]      = useState<{ ok: boolean; text: string } | null>(null);

  function handleSave() {
    setMsg(null);
    startSave(async () => {
      const result = await saveEbayInventorySyncSettings(enabled, interval);
      setMsg(result.error
        ? { ok: false, text: result.error }
        : { ok: true,  text: "Settings saved." });
    });
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Inventory Sync Service</h2>
        <p className="mt-1 text-sm text-gray-500">
          Automatically updates product inventory from eBay on a schedule. eBay is the source
          of truth — quantities are pulled via the Trading API and written to the website.
          If a listing no longer exists on eBay, the product inventory is set to 0 (out of stock).
          Requires Vercel Pro for intervals under 60 minutes.
        </p>
      </div>

      {/* Enable toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            disabled={!isConnected}
          />
          <div className="w-10 h-6 rounded-full bg-gray-200 peer-checked:bg-indigo-600 transition-colors" />
          <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
        </div>
        <span className="text-sm font-medium text-gray-700">Enable automatic sync</span>
      </label>

      {/* Interval */}
      <div className="flex items-center gap-3">
        <label htmlFor="inv-sync-interval" className="text-sm text-gray-700 shrink-0 w-40">
          Sync every (minutes)
        </label>
        <input
          id="inv-sync-interval"
          type="number"
          min={5}
          max={1440}
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
          disabled={!isConnected || !enabled}
          className="w-24 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        />
        <span className="text-xs text-gray-400">min 5, max 1440 (24 h)</span>
      </div>

      {/* Last run */}
      {config?.inventory_sync_last_run && (
        <p className="text-sm text-gray-500" suppressHydrationWarning>
          Last synced: {new Date(config.inventory_sync_last_run).toLocaleString()}
        </p>
      )}

      {/* Feedback */}
      {msg && (
        <div className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm border ${
          msg.ok
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {msg.ok ? <CheckCircle className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
          {msg.text}
        </div>
      )}

      <Button onClick={handleSave} disabled={!isConnected || saving} loading={saving} variant="outline">
        Save Sync Settings
      </Button>

      {!isConnected && (
        <p className="text-xs text-gray-400">Connect your eBay account above to enable inventory sync.</p>
      )}
    </section>
  );
}
