"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { adminDeleteOffer } from "@/lib/actions/offers";
import { useRouter } from "next/navigation";

export function AdminDeleteButton({ offerId }: { offerId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    await adminDeleteOffer(offerId);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex gap-1.5 items-center">
        <span className="text-xs text-gray-500">Delete?</span>
        <button
          onClick={handleDelete}
          disabled={busy}
          className="rounded px-2 py-1 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {busy ? "…" : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded px-2 py-1 text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
      aria-label="Delete offer"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
