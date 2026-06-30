"use client";

import { useFormStatus } from "react-dom";
import { Spinner } from "@/components/ui/spinner";

export function EbaySyncNowButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="mt-4 flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium
                 text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors"
    >
      {pending && <Spinner className="h-4 w-4" />}
      {pending ? "Syncing…" : "Sync Now"}
    </button>
  );
}
