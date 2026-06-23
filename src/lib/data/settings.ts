import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import type { SiteSettings } from "@/types";

export const getSettings = cache(async (): Promise<SiteSettings | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();
  return data;
});
