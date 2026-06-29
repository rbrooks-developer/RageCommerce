import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function createAdminNotification(payload: {
  type: string;
  severity?: NotificationSeverity;
  title: string;
  body: string;
  metadata?: AdminNotificationMetadata;
}): Promise<void> {
  try {
    const supabase = createServiceClient();
    await supabase.from("admin_notifications").insert({
      type: payload.type,
      severity: payload.severity ?? "error",
      title: payload.title,
      body: payload.body,
      metadata: payload.metadata ?? {},
    });
  } catch (err: any) {
    console.error("[notifications] failed to create notification:", err.message);
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  "use server";
  const supabase = createServiceClient();
  await supabase
    .from("admin_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/notifications");
}

export async function markAllNotificationsRead(): Promise<void> {
  "use server";
  const supabase = createServiceClient();
  await supabase
    .from("admin_notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);
  revalidatePath("/admin/notifications");
}
