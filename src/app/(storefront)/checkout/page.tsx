import type { Metadata } from "next";
import { getSettings } from "@/lib/data/settings";
import { COUNTRIES } from "@/lib/data/countries";
import { createClient } from "@/lib/supabase/server";
import { CheckoutFlow } from "./CheckoutFlow";
import type { UserAddress } from "@/types";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [settings, supabase] = await Promise.all([getSettings(), createClient()]);
  const allowedCodes = ((settings as any)?.shipping_countries as string[] | null) ?? ["US"];
  const allowedCountries = COUNTRIES.filter((c) => allowedCodes.includes(c.code));

  const { data: { user } } = await supabase.auth.getUser();
  let defaultShipping: UserAddress | null = null;
  if (user) {
    const { data } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", user.id)
      .eq("label", "shipping")
      .eq("is_default_shipping", true)
      .maybeSingle();
    defaultShipping = (data as UserAddress | null) ?? null;
  }

  return <CheckoutFlow allowedCountries={allowedCountries} defaultShipping={defaultShipping} />;
}
