"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { disconnectEbay } from "@/lib/actions/ebay";
import { CheckCircle, XCircle, Loader2, RefreshCw, Link2Off, Tag, PlugZap } from "lucide-react";
import type { EbayConfig } from "@/types";

interface Props {
  config: EbayConfig | null;
  credentialsConfigured: boolean;
  successParam: string | null;
  errorParam: string | null;
}

function errorMessage(code: string | null) {
  if (!code) return null;
  const map: Record<string, string> = {
    access_denied:         "You cancelled the eBay authorisation.",
    token_exchange_failed: "Token exchange failed — check your Vercel env vars (EBAY_APP_ID, EBAY_CERT_ID, EBAY_RU_NAME).",
    missing_credentials:   "eBay credentials are not configured. Add EBAY_APP_ID, EBAY_CERT_ID, and EBAY_RU_NAME to your Vercel environment variables.",
    invalid_state:         "The authorisation request expired. Please try again.",
    server_error:          "An unexpected server error occurred. Check Vercel function logs.",
    unauthorized:          "You must be logged in as admin.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
}

export function EbaySettings({ config, credentialsConfigured, successParam, errorParam }: Props) {
  const isConnected = !!config?.access_token;

  const [discState, discAction, discPending] = useActionState(disconnectEbay, null) as [
    { error?: string; success?: true } | null,
    (payload: FormData) => void,
    boolean,
  ];

  const [syncState, setSyncState] = useState<
    | { status: "idle" }
    | { status: "syncing" }
    | { status: "done"; count: number }
    | { status: "error"; message: string }
  >({ status: "idle" });

  async function handleSync() {
    setSyncState({ status: "syncing" });
    try {
      const res  = await fetch("/api/ebay/categories/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sync failed");
      setSyncState({ status: "done", count: data.count });
    } catch (err) {
      setSyncState({ status: "error", message: (err as Error).message });
    }
  }

  return (
    <div className="space-y-8">

      {/* ── OAuth result notices ───────────────────────────────── */}
      {successParam === "connected" && (
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>eBay account connected successfully.</span>
        </div>
      )}
      {errorParam && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{errorMessage(errorParam)}</span>
        </div>
      )}

      {/* ── 1. Credentials status ─────────────────────────────── */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Developer Credentials</h2>
            <p className="mt-1 text-sm text-gray-500">
              Set via Vercel environment variables — no form needed.
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              credentialsConfigured
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {credentialsConfigured ? (
              <><CheckCircle className="h-3 w-3" /> Configured</>
            ) : (
              <><XCircle className="h-3 w-3" /> Missing</>
            )}
          </span>
        </div>

        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {(["EBAY_APP_ID", "EBAY_DEV_ID", "EBAY_CERT_ID", "EBAY_RU_NAME"] as const).map((varName) => (
            <div key={varName} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
              <dt className="font-mono text-xs text-gray-500">{varName}</dt>
              <dd className="text-xs text-gray-400">set in Vercel</dd>
            </div>
          ))}
        </dl>

        {!credentialsConfigured && (
          <p className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
            Add <code className="font-mono">EBAY_APP_ID</code>, <code className="font-mono">EBAY_CERT_ID</code>,
            and <code className="font-mono">EBAY_RU_NAME</code> (and optionally <code className="font-mono">EBAY_DEV_ID</code>)
            to your Vercel project environment variables, then redeploy.
          </p>
        )}
      </section>

      {/* ── 2. Account Connection ─────────────────────────────── */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Account Connection</h2>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isConnected
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isConnected ? (
              <><CheckCircle className="h-3 w-3" /> Connected</>
            ) : (
              <><XCircle className="h-3 w-3" /> Not connected</>
            )}
          </span>
        </div>

        {isConnected && config ? (
          <dl className="text-sm space-y-2">
            {config.ebay_username && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Seller ID</dt>
                <dd className="font-mono font-medium">{config.ebay_username}</dd>
              </div>
            )}
            {config.token_expires_at && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Token expires</dt>
                <dd>{new Date(config.token_expires_at).toLocaleString()}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-sm text-gray-500">
            No eBay account connected. Click below to authorise via eBay's secure OAuth flow.
          </p>
        )}

        {discState?.error && (
          <p className="text-sm text-red-600">{discState.error}</p>
        )}

        <div className="flex gap-3">
          <a href="/api/ebay/auth">
            <Button variant="default" disabled={!credentialsConfigured}>
              {isConnected ? (
                <><RefreshCw className="h-4 w-4" /> Reconnect</>
              ) : (
                <><PlugZap className="h-4 w-4" /> Connect eBay Account</>
              )}
            </Button>
          </a>
          {isConnected && (
            <form action={discAction}>
              <Button type="submit" variant="outline" loading={discPending}>
                <Link2Off className="h-4 w-4" />
                Disconnect
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* ── 3. Category Sync ──────────────────────────────────── */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">eBay Category Tree</h2>
          <p className="mt-1 text-sm text-gray-500">
            Downloads the full US eBay category tree (~20,000 categories) and stores it
            locally so you can map your store categories to eBay categories. Re-sync if eBay
            updates their taxonomy.
          </p>
        </div>

        {config?.categories_synced_at && (
          <dl className="text-sm space-y-1">
            <div className="flex justify-between">
              <dt className="text-gray-500">Last synced</dt>
              <dd>{new Date(config.categories_synced_at).toLocaleString()}</dd>
            </div>
            {config.categories_count != null && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Categories stored</dt>
                <dd className="font-medium">{config.categories_count.toLocaleString()}</dd>
              </div>
            )}
          </dl>
        )}

        {syncState.status === "done" && (
          <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Sync complete — {syncState.count.toLocaleString()} categories stored.</span>
          </div>
        )}
        {syncState.status === "error" && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{syncState.message}</span>
          </div>
        )}

        <Button
          onClick={handleSync}
          disabled={!credentialsConfigured || syncState.status === "syncing"}
          loading={syncState.status === "syncing"}
          variant="outline"
        >
          <Tag className="h-4 w-4" />
          {syncState.status === "syncing" ? "Syncing (this takes ~30s)…" : "Sync eBay Categories"}
        </Button>
      </section>
    </div>
  );
}
