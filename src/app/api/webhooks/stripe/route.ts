import { NextRequest } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";
import { sendOrderConfirmation } from "@/lib/emails/orderConfirmation";
import { getSettings } from "@/lib/data/settings";
import type { Order, OrderItem } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  console.log("[webhook] POST received at", new Date().toISOString());
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  console.log("[webhook] stripe-signature present:", !!sig);

  if (!sig) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripeClient();
  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("[webhook] signature verification failed:", err.message);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("[webhook] event type:", event.type);
  const supabase = createServiceClient();

  switch (event.type) {
    // ── Payment completed ──────────────────────────────────────────────────
    case "checkout.session.completed": {
      const session = event.data.object as {
        id: string;
        payment_intent?: string | null;
        metadata?: { order_id?: string; offer_ids?: string };
        customer_email?: string | null;
      };
      const orderId = session.metadata?.order_id;

      if (!orderId) {
        console.error("checkout.session.completed: no order_id in metadata");
        break;
      }

      const { data: orderRaw } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();

      if (!orderRaw) {
        console.error("checkout.session.completed: order not found:", orderId);
        break;
      }

      const order = orderRaw as Order;

      await supabase
        .from("orders")
        .update({
          status: "paid",
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent ?? null,
        })
        .eq("id", orderId);

      const { data: rawItems } = await supabase
        .from("order_items")
        .select("*, products(name)")
        .eq("order_id", orderId);

      const orderItems = (rawItems ?? []) as (OrderItem & { products: { name: string } | null })[];

      // Decrement inventory for each ordered item
      for (const item of orderItems) {
        const { data: prod } = await supabase
          .from("products")
          .select("inventory")
          .eq("id", item.product_id)
          .maybeSingle();
        const current = (prod as { inventory: number } | null)?.inventory ?? 0;
        const next    = Math.max(0, current - item.quantity);
        const { error: invErr } = await supabase
          .from("products")
          .update({ inventory: next })
          .eq("id", item.product_id);
        if (invErr) {
          console.error(`inventory update failed for ${item.product_id}:`, invErr.message);
        } else {
          console.log(`[webhook] inventory ${item.product_id}: ${current} → ${next}`);
        }
      }

      // Mark offers as purchased using IDs stored in session metadata.
      const offerIdsRaw = session.metadata?.offer_ids ?? "";
      const offerIds = offerIdsRaw.split(",").map(s => s.trim()).filter(Boolean);
      if (offerIds.length > 0) {
        const { error: offerErr } = await supabase
          .from("product_offers")
          .update({ status: "purchased", updated_at: new Date().toISOString() })
          .in("id", offerIds);
        if (offerErr) {
          console.error("[webhook] failed to mark offers purchased:", offerErr.message);
        } else {
          console.log(`[webhook] marked ${offerIds.length} offer(s) as purchased`);
        }
      }

      // Clear the user's DB cart now that payment succeeded so the
      // success page loads with an empty cart immediately.
      if (order.user_id) {
        await supabase.from("cart_items").delete().eq("user_id", order.user_id);
        console.log(`[webhook] cart cleared for user ${order.user_id}`);
      }

      // Send confirmation email
      console.log(`[webhook] order ${orderId} paid — looking up email for user ${order.user_id}`);

      const { data: profileRaw, error: profileErr } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", order.user_id)
        .maybeSingle();

      if (profileErr) console.error("[webhook] profile lookup error:", profileErr.message);
      console.log("[webhook] profile email:", (profileRaw as any)?.email ?? "(none)");
      console.log("[webhook] session customer_email:", session.customer_email ?? "(none)");

      const customerEmail =
        (profileRaw as { email: string } | null)?.email ?? session.customer_email ?? null;

      console.log("[webhook] resolved customerEmail:", customerEmail ?? "(null — skipping email)");

      if (customerEmail) {
        const settings = await getSettings();
        const homepage = settings?.homepage_config as import("@/types").HomepageConfig | null;
        const footer   = settings?.footer_config   as import("@/types").FooterConfig   | null;
        const displayName = homepage?.hero_display_name || footer?.display_name || null;

        const shippingAddressParts = [
          order.shipping_address_line1,
          order.shipping_address_line2,
          `${order.shipping_city}, ${order.shipping_state} ${order.shipping_zip}`,
          order.shipping_country,
        ].filter(Boolean);

        console.log(`[webhook] sending confirmation email to ${customerEmail}`);
        await sendOrderConfirmation({
          to: customerEmail,
          orderNumber: orderId.slice(0, 8).toUpperCase(),
          items: orderItems.map((i) => ({
            name: i.products?.name ?? "Product",
            quantity: i.quantity,
            price: Number(i.price),
          })),
          subtotal: Number(order.subtotal),
          shippingCost: Number(order.shipping_cost),
          taxAmount: Number(order.tax_amount),
          totalPrice: Number(order.total_price),
          shippingName: order.shipping_name ?? "",
          shippingAddress: shippingAddressParts.join(", "),
          siteTitle: settings?.site_title ?? "My Store",
          displayName,
        }).then(() => console.log("[webhook] confirmation email sent successfully"))
          .catch((err) => console.error("[webhook] failed to send confirmation email:", err.message, err));
      }

      break;
    }

    // ── Checkout abandoned / timed out ────────────────────────────────────
    case "checkout.session.expired": {
      const session = event.data.object as { metadata?: { order_id?: string } };
      const orderId = session.metadata?.order_id;

      if (!orderId) break;

      // Only cancel if still pending — don't touch paid orders
      await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId)
        .eq("status", "pending");

      console.log("checkout.session.expired: cancelled order", orderId);
      break;
    }

    // ── Refund issued ─────────────────────────────────────────────────────
    case "charge.refunded": {
      const charge = event.data.object as {
        payment_intent?: string | null;
        amount_refunded: number;
        amount: number;
      };

      if (!charge.payment_intent) break;

      // Look up the order directly — faster and avoids a Stripe API round-trip
      const { data: orderRow } = await supabase
        .from("orders")
        .select("id")
        .eq("stripe_payment_intent_id", charge.payment_intent)
        .maybeSingle();
      const orderId = (orderRow as { id: string } | null)?.id;

      if (!orderId) {
        console.error("charge.refunded: no order found for payment_intent", charge.payment_intent);
        break;
      }

      const isFullRefund = charge.amount_refunded >= charge.amount;
      await supabase
        .from("orders")
        .update({ status: isFullRefund ? "refunded" : "partially_refunded" })
        .eq("id", orderId);

      console.log(`charge.refunded: order ${orderId} → ${isFullRefund ? "refunded" : "partially_refunded"}`);
      break;
    }

    default:
      break;
  }

  return Response.json({ received: true });
}
