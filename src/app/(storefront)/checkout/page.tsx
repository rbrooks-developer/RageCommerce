import { getSettings } from "@/lib/data/settings";
import { COUNTRIES } from "@/lib/data/countries";
import { CheckoutFlow } from "./CheckoutFlow";

export default async function CheckoutPage() {
  const settings = await getSettings();
  const allowedCodes = ((settings as any)?.shipping_countries as string[] | null) ?? ["US"];
  const allowedCountries = COUNTRIES.filter((c) => allowedCodes.includes(c.code));

  return <CheckoutFlow allowedCountries={allowedCountries} />;
}
