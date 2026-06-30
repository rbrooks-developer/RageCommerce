import type { SupabaseClient } from "@supabase/supabase-js";
import type { Product } from "@/types";

export interface SubtotalItem {
  productId: string;
  quantity: number;
  offerId?: string | null;
}

/**
 * Resolves the authoritative subtotal for a set of cart items, using each
 * item's approved offer price when present and the product's list price
 * otherwise. Never trusts a client-supplied price.
 */
export async function resolveSubtotal(
  supabase: SupabaseClient,
  items: SubtotalItem[],
  userId: string | null,
): Promise<number> {
  const productIds = items.map((i) => i.productId);
  const { data: rawProducts } = await supabase
    .from("products")
    .select("id, price")
    .in("id", productIds);
  const products = (rawProducts ?? []) as Pick<Product, "id" | "price">[];

  const offerIds = items.map((i) => i.offerId).filter(Boolean) as string[];
  let offerMap: Record<string, { offer_price: number }> = {};

  if (offerIds.length > 0 && userId) {
    const { data: rawOffers } = await supabase
      .from("product_offers")
      .select("id, offer_price")
      .in("id", offerIds)
      .eq("user_id", userId)
      .eq("status", "approved");
    offerMap = Object.fromEntries(
      ((rawOffers ?? []) as { id: string; offer_price: number }[]).map((o) => [o.id, o]),
    );
  }

  return items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return sum;
    const price = item.offerId && offerMap[item.offerId]
      ? Number(offerMap[item.offerId].offer_price)
      : Number(product.price);
    return sum + price * item.quantity;
  }, 0);
}
