import { createServiceClient } from "@/lib/supabase/server";

export type NotificationSeverity = "info" | "warning" | "error";

export interface AdminNotificationMetadata {
  order_id?: string;
  order_number?: string;
  product_id?: string;
  product_name?: string;
  ebay_listing_id?: string;
  quantity?: number;
  action?: string;
  error?: string;
  [key: string]: unknown;
}

/** Plain server utility — no "use server", safe to call from API routes and webhooks. */
export async function writeAdminNotification(payload: {
  type: string;
  severity?: NotificationSeverity;
  title: string;
  body: string;
  metadata?: AdminNotificationMetadata;
}): Promise<void> {
  try {
    const supabase = createServiceClient();
    await supabase.from("admin_notifications").insert({
      type:     payload.type,
      severity: payload.severity ?? "error",
      title:    payload.title,
      body:     payload.body,
      metadata: payload.metadata ?? {},
    });
  } catch (err: any) {
    console.error("[notify] failed to write notification:", err.message);
  }
}
