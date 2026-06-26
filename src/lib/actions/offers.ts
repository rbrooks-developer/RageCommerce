"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendOfferReceived } from "@/lib/emails/offerReceived";
import { sendOfferApproved } from "@/lib/emails/offerApproved";
import { sendOfferDeclined } from "@/lib/emails/offerDeclined";
import { getSettings } from "@/lib/data/settings";
import type { HomepageConfig, FooterConfig } from "@/types";

async function getDisplayName() {
  const settings = await getSettings();
  const homepage = settings?.homepage_config as HomepageConfig | null;
  const footer   = settings?.footer_config   as FooterConfig   | null;
  return homepage?.hero_display_name || footer?.display_name || settings?.site_title || "My Store";
}

export async function submitOffer(productId: string, quantity: number, offerPrice: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to make an offer" };

  const { data: product } = await supabase
    .from("products")
    .select("id, name, price, inventory, is_published")
    .eq("id", productId)
    .eq("is_published", true)
    .maybeSingle();

  if (!product) return { error: "Product not found" };
  if (product.inventory < 1) return { error: "This product is out of stock" };
  if (offerPrice >= Number(product.price)) return { error: "Offer must be less than the list price" };
  if (quantity < 1) return { error: "Quantity must be at least 1" };
  if (quantity > product.inventory) return { error: `Only ${product.inventory} unit${product.inventory === 1 ? "" : "s"} available` };

  const MAX_OFFERS = 4;

  // Block if a pending or approved offer exists
  const { data: existing } = await supabase
    .from("product_offers")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .in("status", ["pending", "approved"])
    .maybeSingle();

  if (existing) {
    return {
      error: existing.status === "pending"
        ? "You already have a pending offer on this product"
        : "You already have an approved offer on this product — check My Offers",
    };
  }

  // Enforce per-product offer limit (expired offers don't count)
  const { count } = await supabase
    .from("product_offers")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .in("status", ["pending", "approved", "declined", "purchased", "out_of_stock"]);

  if ((count ?? 0) >= MAX_OFFERS) {
    return { error: `You've reached the maximum of ${MAX_OFFERS} offers for this product` };
  }

  const { error: insertError } = await supabase
    .from("product_offers")
    .insert({ user_id: user.id, product_id: productId, quantity, offer_price: offerPrice });

  if (insertError) {
    console.error("submitOffer:", insertError.message);
    return { error: "Failed to submit offer. Please try again." };
  }

  // Send receipt email
  const { data: profile } = await supabase.from("profiles").select("email").eq("id", user.id).maybeSingle();
  const customerEmail = (profile as { email: string } | null)?.email ?? user.email ?? null;
  if (customerEmail) {
    const displayName = await getDisplayName();
    sendOfferReceived({ to: customerEmail, productName: product.name, quantity, offerPrice, displayName })
      .catch(err => console.error("offerReceived email:", err));
  }

  revalidatePath(`/products/${product.id}`);
  revalidatePath("/account");
  return { success: true };
}

export async function approveOffer(offerId: string) {
  const sb = createServiceClient();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 3);

  const { data: offer, error } = await sb
    .from("product_offers")
    .update({ status: "approved", expires_at: expiresAt.toISOString(), updated_at: new Date().toISOString() })
    .eq("id", offerId)
    .select("*, products(name)")
    .single();

  if (error) { console.error("approveOffer:", error.message); return { error: "Failed to approve offer" }; }

  const { data: profile } = await sb.from("profiles").select("email").eq("id", offer.user_id).maybeSingle();
  const customerEmail = (profile as { email: string } | null)?.email;
  if (customerEmail) {
    const displayName = await getDisplayName();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    sendOfferApproved({
      to: customerEmail,
      productName: (offer.products as any)?.name ?? "Product",
      quantity: offer.quantity,
      offerPrice: Number(offer.offer_price),
      expiresAt,
      displayName,
      appUrl,
    }).catch(err => console.error("offerApproved email:", err));
  }

  revalidatePath("/admin/offers");
  return { success: true };
}

export async function declineOffer(offerId: string, reason?: string) {
  const sb = createServiceClient();

  const { data: offer, error } = await sb
    .from("product_offers")
    .update({ status: "declined", decline_reason: reason ?? null, updated_at: new Date().toISOString() })
    .eq("id", offerId)
    .select("*, products(name)")
    .single();

  if (error) { console.error("declineOffer:", error.message); return { error: "Failed to decline offer" }; }

  const { data: profile } = await sb.from("profiles").select("email").eq("id", offer.user_id).maybeSingle();
  const customerEmail = (profile as { email: string } | null)?.email;
  if (customerEmail) {
    const displayName = await getDisplayName();
    sendOfferDeclined({
      to: customerEmail,
      productName: (offer.products as any)?.name ?? "Product",
      quantity: offer.quantity,
      offerPrice: Number(offer.offer_price),
      reason: reason ?? null,
      displayName,
    }).catch(err => console.error("offerDeclined email:", err));
  }

  revalidatePath("/admin/offers");
  return { success: true };
}

export async function deleteOffer(offerId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("product_offers")
    .delete()
    .eq("id", offerId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/account");
  return { success: true };
}

export async function markOfferPurchased(offerId: string) {
  const sb = createServiceClient();
  await sb
    .from("product_offers")
    .update({ status: "purchased", updated_at: new Date().toISOString() })
    .eq("id", offerId);
  revalidatePath("/account");
}

// Checks inventory and, if sufficient, inserts the offer item directly into
// cart_items so the DB write is complete before the client navigates to /cart.
export async function addOfferToCart(offerId: string): Promise<{ ok: boolean; item?: {
  productId: string; name: string; price: number; quantity: number;
  image: string | null; weight_oz: number; length_in: number;
  width_in: number; height_in: number; offerId: string;
} }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const sb = createServiceClient();

  const { data: offerRaw, error: offerErr } = await sb
    .from("product_offers")
    .select("id, product_id, quantity, offer_price, status, products(id, name, images, inventory, weight_oz, length_in, width_in, height_in)")
    .eq("id", offerId)
    .eq("user_id", user.id)
    .eq("status", "approved")
    .maybeSingle();

  if (!offerRaw) return { ok: false };

  const offer = offerRaw as any;
  const product = Array.isArray(offer.products) ? offer.products[0] : offer.products;
  if (!product || product.inventory < offer.quantity) {
    await sb.from("product_offers")
      .update({ status: "out_of_stock", updated_at: new Date().toISOString() })
      .eq("id", offerId);
    return { ok: false };
  }

  const cartRow = {
    user_id:    user.id,
    product_id: offer.product_id,
    name:       product.name,
    price:      Number(offer.offer_price),
    quantity:   offer.quantity,
    image:      product.images?.[0] ?? null,
    weight_oz:  product.weight_oz,
    length_in:  product.length_in,
    width_in:   product.width_in,
    height_in:  product.height_in,
    offer_id:   offerId,
    updated_at: new Date().toISOString(),
  };

  const { error: upsertErr } = await sb
    .from("cart_items")
    .upsert(cartRow, { onConflict: "user_id,product_id" });

  if (upsertErr) return { ok: false };

  return {
    ok: true,
    item: {
      productId:  offer.product_id,
      name:       product.name,
      price:      Number(offer.offer_price),
      quantity:   offer.quantity,
      image:      product.images?.[0] ?? null,
      weight_oz:  product.weight_oz,
      length_in:  product.length_in,
      width_in:   product.width_in,
      height_in:  product.height_in,
      offerId,
    },
  };
}

// Called before adding an approved offer to cart. Returns ok=true if inventory
// is sufficient, or marks the offer as out_of_stock and returns ok=false.
export async function checkOfferInventory(offerId: string): Promise<{ ok: boolean }> {
  const sb = createServiceClient();

  const { data: offerRaw } = await sb
    .from("product_offers")
    .select("id, quantity, status, products(inventory)")
    .eq("id", offerId)
    .eq("status", "approved")
    .maybeSingle();

  if (!offerRaw) return { ok: false };

  const offer = offerRaw as { id: string; quantity: number; status: string; products: any };
  const productsData = Array.isArray(offer.products) ? offer.products[0] : offer.products;
  const inventory = (productsData as { inventory: number } | null)?.inventory ?? 0;

  if (inventory < offer.quantity) {
    await sb.from("product_offers")
      .update({ status: "out_of_stock", updated_at: new Date().toISOString() })
      .eq("id", offerId);
    revalidatePath("/account");
    return { ok: false };
  }

  return { ok: true };
}
