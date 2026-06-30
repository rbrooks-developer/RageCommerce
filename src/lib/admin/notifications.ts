"use server";

import { revalidatePath, refresh } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { writeAdminNotification } from "./notify";

export type { NotificationSeverity, AdminNotificationMetadata } from "./notify";

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase
    .from("admin_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/notifications");
  refresh();
}

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = createServiceClient();
  await supabase
    .from("admin_notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);
  revalidatePath("/admin/notifications");
  refresh();
}

export async function deleteNotification(id: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from("admin_notifications").delete().eq("id", id);
  revalidatePath("/admin/notifications");
  refresh();
}
