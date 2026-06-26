"use client";

import { useState } from "react";
import { approveOffer, declineOffer } from "@/lib/actions/offers";
import { useRouter } from "next/navigation";

export function OfferActions({ offerId }: { offerId: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "declining">("idle");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleApprove() {
    setBusy(true);
    await approveOffer(offerId);
    router.refresh();
  }

  async function handleDecline() {
    setBusy(true);
    await declineOffer(offerId, reason.trim() || undefined);
    router.refresh();
  }

  if (mode === "declining") {
    return (
      <div className="space-y-2 min-w-[200px]">
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Reason (optional)"
          rows={2}
          className="w-full rounded border border-gray-300 px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
        />
        <div className="flex gap-2">
          <button
            onClick={handleDecline}
            disabled={busy}
            className="flex-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {busy ? "…" : "Confirm Decline"}
          </button>
          <button
            onClick={() => setMode("idle")}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleApprove}
        disabled={busy}
        className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        Approve
      </button>
      <button
        onClick={() => setMode("declining")}
        disabled={busy}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        Decline
      </button>
    </div>
  );
}
