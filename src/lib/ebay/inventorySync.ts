import { fetchAllActiveListings } from "@/lib/ebay/trading";
import { createServiceClient } from "@/lib/supabase/server";
import type { EbayConfig } from "@/types";

export interface InventorySyncResult {
  total: number;
  updated: number;
  zeroed: number;
  unchanged: number;
  errors: number;
}

export interface InventorySyncItemProgress {
  current: number;
  total: number;
  title: string;
  status: "updated" | "zeroed" | "unchanged" | "error";
}

export interface InventorySyncCallbacks {
  onTotal?: (total: number) => void | Promise<void>;
  onItem?: (progress: InventorySyncItemProgress) => void | Promise<void>;
}

/**
 * Pulls every active listing from eBay in one paginated GetSellerList call
 * (rather than a GetItem call per product) and reconciles local inventory
 * against it. Only writes to the DB when a quantity actually changed.
 */
export async function runEbayInventorySync(
  config: EbayConfig,
  callbacks?: InventorySyncCallbacks,
): Promise<InventorySyncResult> {
  const supabase = createServiceClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, inventory, ebay_listing_id")
    .not("ebay_listing_id", "is", null);

  const items = (products ?? []) as {
    id: string; name: string; inventory: number; ebay_listing_id: string;
  }[];

  await callbacks?.onTotal?.(items.length);

  const activeListings = await fetchAllActiveListings(config);
  const qtyByListingId = new Map(activeListings.map((l) => [l.listingId, l.inventory]));

  let updated = 0, zeroed = 0, unchanged = 0, errors = 0;

  for (let i = 0; i < items.length; i++) {
    const product = items[i];
    try {
      // Listings absent from the active-listings list have ended or were deleted
      const ebayQty = qtyByListingId.has(product.ebay_listing_id)
        ? qtyByListingId.get(product.ebay_listing_id)!
        : null;

      let status: InventorySyncItemProgress["status"];

      if (ebayQty === null) {
        if (product.inventory !== 0) {
          await supabase.from("products").update({ inventory: 0 }).eq("id", product.id);
          zeroed++;
          status = "zeroed";
        } else {
          unchanged++;
          status = "unchanged";
        }
      } else if (ebayQty !== product.inventory) {
        await supabase.from("products").update({ inventory: ebayQty }).eq("id", product.id);
        updated++;
        status = "updated";
      } else {
        unchanged++;
        status = "unchanged";
      }

      await callbacks?.onItem?.({ current: i + 1, total: items.length, title: product.name, status });
    } catch (err: any) {
      errors++;
      console.error(`[ebay-inv-sync] error on ${product.ebay_listing_id}:`, err.message);
      await callbacks?.onItem?.({ current: i + 1, total: items.length, title: product.name, status: "error" });
    }
  }

  return { total: items.length, updated, zeroed, unchanged, errors };
}
