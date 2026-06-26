"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/store";
import { deleteOffer, checkOfferInventory } from "@/lib/actions/offers";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type OfferRow = {
  id: string;
  product_id: string;
  quantity: number;
  offer_price: number;
  status: string;
  decline_reason: string | null;
  expires_at: string | null;
  created_at: string;
  products: {
    name: string;
    slug: string;
    images: string[];
    weight_oz: number;
    length_in: number;
    width_in: number;
    height_in: number;
  } | null;
};

function daysLeft(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function StatusBadge({ status, expiresAt }: { status: string; expiresAt: string | null }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending:      { label: "Pending Review", bg: "#fef9c3", color: "#854d0e" },
    approved:     { label: "Approved",       bg: "#dcfce7", color: "#166534" },
    declined:     { label: "Declined",       bg: "#fee2e2", color: "#991b1b" },
    purchased:    { label: "Purchased",      bg: "#e0e7ff", color: "#3730a3" },
    expired:      { label: "Expired",        bg: "#f3f4f6", color: "#6b7280" },
    out_of_stock: { label: "Out of Stock",   bg: "#fff7ed", color: "#9a3412" },
  };
  const s = map[status] ?? { label: status, bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span className="text-xs font-semibold rounded-full px-2.5 py-0.5" style={{ backgroundColor: s.bg, color: s.color, WebkitTextFillColor: s.color }}>
      {status === "approved" && expiresAt ? `Approved · ${daysLeft(expiresAt)}d left` : s.label}
    </span>
  );
}

export function MyOffers({ offers }: { offers: OfferRow[] }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  if (offers.length === 0) {
    return <p className="text-sm" style={{ opacity: 0.45 }}>You haven't made any offers yet.</p>;
  }

  async function handleAddToCart(offer: OfferRow) {
    if (!offer.products) return;
    setBusy(offer.id);

    const { ok } = await checkOfferInventory(offer.id);
    if (!ok) {
      // Offer marked out_of_stock server-side; refresh to show updated status
      setBusy(null);
      router.refresh();
      return;
    }

    addItem({
      productId: offer.product_id,
      name: offer.products.name,
      price: offer.offer_price,
      quantity: offer.quantity,
      image: offer.products.images?.[0] ?? null,
      weight_oz: offer.products.weight_oz,
      length_in: offer.products.length_in,
      width_in: offer.products.width_in,
      height_in: offer.products.height_in,
      offerId: offer.id,
    });
    setBusy(null);
    router.push("/cart");
  }

  async function handleDelete(offerId: string) {
    setBusy(offerId);
    await deleteOffer(offerId);
    setBusy(null);
    router.refresh();
  }

  const active   = offers.filter(o => ["pending", "approved"].includes(o.status));
  const history  = offers.filter(o => ["declined", "purchased", "expired", "out_of_stock"].includes(o.status));

  function OfferCard({ offer }: { offer: OfferRow }) {
    const isApproved = offer.status === "approved" && offer.expires_at && daysLeft(offer.expires_at) > 0;
    const canDelete  = ["pending", "approved", "declined", "expired", "out_of_stock"].includes(offer.status);

    return (
      <div className="rounded-lg p-4 space-y-3"
        style={{ border: "1px solid color-mix(in srgb, var(--site-fg) 20%, transparent)", backgroundColor: "var(--checkout-section-bg, color-mix(in srgb, var(--site-fg) 5%, var(--site-bg)))" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {offer.products?.slug ? (
              <Link href={`/products/${offer.products.slug}`} className="font-medium text-sm hover:underline line-clamp-2">
                {offer.products.name}
              </Link>
            ) : (
              <p className="font-medium text-sm">{offer.products?.name ?? "Product"}</p>
            )}
            <p className="text-xs mt-0.5" style={{ opacity: 0.5 }}>{offer.quantity} × {formatPrice(offer.offer_price * 100)} = {formatPrice(offer.offer_price * offer.quantity * 100)}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={offer.status} expiresAt={offer.expires_at} />
            {canDelete && (
              <button
                onClick={() => handleDelete(offer.id)}
                disabled={busy === offer.id}
                className="p-1 transition-opacity hover:opacity-60 disabled:opacity-30"
                style={{ opacity: 0.45 }}
                aria-label="Delete offer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {offer.status === "declined" && offer.decline_reason && (
          <p className="text-xs rounded px-3 py-2" style={{ backgroundColor: "color-mix(in srgb, #ef4444 10%, var(--site-bg))", opacity: 0.85 }}>
            Reason: {offer.decline_reason}
          </p>
        )}

        {isApproved && (
          <button
            onClick={() => handleAddToCart(offer)}
            disabled={busy === offer.id}
            className="w-full rounded-md py-2.5 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: "var(--site-fg)", color: "var(--site-bg)", fontFamily: "inherit" }}
          >
            {busy === offer.id ? "Adding…" : "Add to Cart"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {active.length > 0 && (
        <div className="space-y-3">
          {active.map(o => <OfferCard key={o.id} offer={o} />)}
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ opacity: 0.45 }}>History</p>
          {history.map(o => <OfferCard key={o.id} offer={o} />)}
        </div>
      )}
    </div>
  );
}
