"use server";

import { createClient } from "@/lib/supabase/server";
import { siteSettingsSchema, type SiteSettingsInput } from "@/lib/validations/settings";
import { revalidatePath } from "next/cache";

export async function updateSettings(data: SiteSettingsInput) {
  const parsed = siteSettingsSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("site_settings")
    .update(parsed.data as any)
    .eq("id", 1);

  if (error) return { error: { _form: [error.message] } };

  revalidatePath("/", "layout");
  return { success: true };
}
