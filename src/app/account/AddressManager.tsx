"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { deleteAddress, setDefaultAddress } from "@/lib/actions/addresses";
import { AddressForm } from "./AddressForm";
import { Pencil, Trash2, Plus, Package, CreditCard } from "lucide-react";
import type { UserAddress } from "@/types";

export function AddressManager({ addresses }: { addresses: UserAddress[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleSuccess = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    refresh();
  }, [refresh]);

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteAddress(id);
      setConfirmDeleteId(null);
      refresh();
    });
  };

  const handleSetDefault = (id: string, type: "shipping" | "billing") => {
    startTransition(async () => {
      await setDefaultAddress(id, type);
      refresh();
    });
  };

  const editingAddress = editingId ? addresses.find((a) => a.id === editingId) : null;

  return (
    <div className="space-y-4">
      {addresses.length === 0 && !showForm && (
        <p className="text-sm text-gray-400">No saved addresses yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="relative rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {addr.city}, {addr.state}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => { setShowForm(false); setEditingId(addr.id); setConfirmDeleteId(null); }}
                  className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Edit address"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                {confirmDeleteId === addr.id ? (
                  <span className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(addr.id)}
                      disabled={isPending}
                      className="text-xs font-medium text-red-600 hover:text-red-700 px-1"
                    >
                      {isPending ? "…" : "Delete?"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-xs text-gray-400 hover:text-gray-600 px-1"
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(addr.id)}
                    className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label="Delete address"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Address details */}
            <div className="text-sm text-gray-700 leading-relaxed">
              <p className="font-medium">{addr.first_name} {addr.last_name}</p>
              {addr.company && <p className="text-gray-500">{addr.company}</p>}
              <p>{addr.address_line1}</p>
              {addr.address_line2 && <p>{addr.address_line2}</p>}
              <p>{addr.city}, {addr.state} {addr.zip}</p>
              {addr.phone && <p className="text-gray-500 mt-0.5">{addr.phone}</p>}
            </div>

            {/* Default badges */}
            {(addr.is_default_shipping || addr.is_default_billing) && (
              <div className="flex flex-wrap gap-1.5">
                {addr.is_default_shipping && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-600">
                    <Package className="h-3 w-3" /> Default Shipping
                  </span>
                )}
                {addr.is_default_billing && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-100 px-2 py-0.5 text-[11px] font-medium text-purple-600">
                    <CreditCard className="h-3 w-3" /> Default Billing
                  </span>
                )}
              </div>
            )}

            {/* Set default buttons */}
            {(!addr.is_default_shipping || !addr.is_default_billing) && (
              <div className="flex flex-wrap gap-2 pt-0.5 border-t border-gray-100">
                {!addr.is_default_shipping && (
                  <button
                    onClick={() => handleSetDefault(addr.id, "shipping")}
                    disabled={isPending}
                    className="text-xs text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50"
                  >
                    Set as shipping default
                  </button>
                )}
                {!addr.is_default_billing && (
                  <button
                    onClick={() => handleSetDefault(addr.id, "billing")}
                    disabled={isPending}
                    className="text-xs text-gray-500 hover:text-purple-600 transition-colors disabled:opacity-50"
                  >
                    Set as billing default
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit form */}
      {editingId && editingAddress && (
        <AddressForm
          address={editingAddress}
          onClose={() => setEditingId(null)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Add form */}
      {showForm && !editingId && (
        <AddressForm
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Add button — hidden while a form is open */}
      {!showForm && !editingId && (
        <button
          onClick={() => { setShowForm(true); setConfirmDeleteId(null); }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Address
        </button>
      )}
    </div>
  );
}
