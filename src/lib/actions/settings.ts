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

  // Separate columns added by later migrations from the original schema.
  // This lets core settings save even if those migrations haven't been run yet.
  const { bg_color, font_color, font_family, ...baseData } = parsed.data;

  const { error } = await supabase
    .from("site_settings")
    .update(baseData)
    .eq("id", 1);

  if (error) return { error: { _form: [error.message] } };

  // Best-effort: update columns added by migrations 010 and 012.
  // Silently ignored if the columns don't exist yet.
  await supabase
    .from("site_settings")
    .update({ bg_color, font_color, font_family } as any)
    .eq("id", 1);

  revalidatePath("/", "layout");
  return { success: true };
}
