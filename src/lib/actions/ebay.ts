"use server";

import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getEbayConfig, saveEbayConfig } from "@/lib/ebay/auth";
import { revalidatePath } from "next/cache";

export async function saveEbayCredentials(_prevState: unknown, formData: FormData) {
  const auth = await requireAdmin();
  if (auth.error) return { error: auth.error };

  const app_id  = (formData.get("app_id")  as string)?.trim();
  const dev_id  = (formData.get("dev_id")  as string)?.trim();
  const cert_id = (formData.get("cert_id") as string)?.trim();
  const ru_name = (formData.get("ru_name") as string)?.trim();

  if (!app_id || !dev_id || !cert_id || !ru_name) {
    return { error: "All four credential fields are required." };
  }

  try {
    await saveEbayConfig({ app_id, dev_id, cert_id, ru_name });
    revalidatePath("/admin/ebay");
    return { success: true as const };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function disconnectEbay(_prevState: unknown) {
  const auth = await requireAdmin();
  if (auth.error) return { error: auth.error };

  try {
    await saveEbayConfig({
      access_token: null,
      refresh_token: null,
      token_expires_at: null,
      ebay_user_id: null,
      ebay_username: null,
    });
    revalidatePath("/admin/ebay");
    return { success: true as const };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function saveEbayCategoryMapping(
  categoryId: string,
  ebayCategoryId: string | null,
  ebayCategoryName: string | null
) {
  const auth = await requireAdmin();
  if (auth.error) return { error: auth.error };

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ ebay_category_id: ebayCategoryId, ebay_category_name: ebayCategoryName } as any)
    .eq("id", categoryId);

  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  return { success: true as const };
}
