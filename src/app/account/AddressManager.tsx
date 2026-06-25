"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { deleteAddress, setDefaultAddress } from "@/lib/actions/addresses";
import { AddressForm } from "./AddressForm";
import { Pencil, Trash2, Plus } from "lucide-react";
import { getCountryName } from "@/lib/data/countries";
import type { Country } from "@/lib/data/countries";
import type { UserAddress } from "@/types";

type AddressType = "shipping" | "billing";

function AddressSection({
  type,
  addresses,
  allowedCountries,
  isPending,
  onSetDefault,
  onDelete,
  onRefresh,
}: {
  type: AddressType;
  addresses: UserAddress[];
  allowedCountries: Country[];
  isPending: boolean;
  onSetDefault: (id: string, type: AddressType) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const editingAddress = editingId ? addresses.find((a) => a.id === editingId) ?? null : null;
  const defaultField = type === "shipping" ? "is_default_shipping" : "is_default_billing";
  const title = type === "shipping" ? "Shipping Addresses" : "Billing Addresses";

  const handleSuccess = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    onRefresh();
  }, [onRefresh]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ opacity: 0.6 }}>{title}</h3>

      {addresses.length === 0 && !showForm && (
        <p className="text-sm" style={{ opacity: 0.4 }}>No {type} addresses saved yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="relative rounded-lg p-4 flex flex-col gap-3"
            style={{
              border: "1px solid color-mix(in srgb, var(--site-fg) 20%, transparent)",
              backgroundColor: "var(--checkout-input-bg, color-mix(in srgb, var(--site-fg) 8%, var(--site-bg)))",
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {addr[defaultField] && (
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                    Default
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => { setShowForm(false); setEditingId(addr.id); setConfirmDeleteId(null); }}
                  className="p-1.5 rounded transition-opacity hover:opacity-70"
                  style={{ opacity: 0.45 }}
                  aria-label="Edit address"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                {!addr[defaultField] && (
                  confirmDeleteId === addr.id ? (
                    <span className="flex items-center gap-1">
                      <button
                        onClick={() => { onDelete(addr.id); setConfirmDeleteId(null); }}
                        disabled={isPending}
                        className="text-xs font-medium text-red-600 hover:text-red-700 px-1"
                      >
                        {isPending ? "…" : "Delete?"}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs px-1 transition-opacity hover:opacity-70"
                        style={{ opacity: 0.45 }}
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(addr.id)}
                      className="p-1.5 rounded transition-colors hover:text-red-600"
                      style={{ opacity: 0.45 }}
                      aria-label="Delete address"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Address details */}
            <div className="text-sm leading-relaxed">
              <p className="font-medium">{addr.first_name} {addr.last_name}</p>
              {addr.company && <p style={{ opacity: 0.55 }}>{addr.company}</p>}
              <p>{addr.address_line1}</p>
              {addr.address_line2 && <p>{addr.address_line2}</p>}
              <p>{addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.zip}</p>
              {addr.country !== "US" && <p style={{ opacity: 0.55 }}>{getCountryName(addr.country)}</p>}
              {addr.phone && <p className="mt-0.5" style={{ opacity: 0.55 }}>{addr.phone}</p>}
            </div>

            {/* Make Default link */}
            {!addr[defaultField] && (
              <button
                onClick={() => onSetDefault(addr.id, type)}
                disabled={isPending}
                className="self-start text-xs underline underline-offset-2 transition-opacity hover:opacity-100 disabled:opacity-30"
                style={{ opacity: 0.5 }}
              >
                Make Default
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Edit form */}
      {editingId && editingAddress && (
        <AddressForm
          address={editingAddress}
          addressType={type}
          allowedCountries={allowedCountries}
          onClose={() => setEditingId(null)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Add form */}
      {showForm && !editingId && (
        <AddressForm
          addressType={type}
          allowedCountries={allowedCountries}
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Add link */}
      {!showForm && !editingId && (
        <button
          onClick={() => { setShowForm(true); setConfirmDeleteId(null); }}
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-100"
          style={{ opacity: 0.55 }}
        >
          <Plus className="h-4 w-4" />
          Add {type === "shipping" ? "Shipping" : "Billing"} Address
        </button>
      )}
    </div>
  );
}

export function AddressManager({ addresses, allowedCountries }: { addresses: UserAddress[]; allowedCountries: Country[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(() => router.refresh(), [router]);

  const handleSetDefault = (id: string, type: AddressType) => {
    startTransition(async () => {
      await setDefaultAddress(id, type);
      refresh();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteAddress(id);
      refresh();
    });
  };

  const shippingAddresses = addresses.filter((a) => a.label === "shipping");
  const billingAddresses = addresses.filter((a) => a.label === "billing");

  return (
    <div className="space-y-8">
      <AddressSection
        type="shipping"
        addresses={shippingAddresses}
        allowedCountries={allowedCountries}
        isPending={isPending}
        onSetDefault={handleSetDefault}
        onDelete={handleDelete}
        onRefresh={refresh}
      />
      <AddressSection
        type="billing"
        addresses={billingAddresses}
        allowedCountries={allowedCountries}
        isPending={isPending}
        onSetDefault={handleSetDefault}
        onDelete={handleDelete}
        onRefresh={refresh}
      />
    </div>
  );
}
