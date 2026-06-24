"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const addressSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  address_line1: z.string().min(1, "Street address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional().default(""),
  zip: z.string().min(1, "Postal code is required"),
  country: z.string().min(2).default("US"),
  phone: z.string().optional(),
  label: z.enum(["shipping", "billing"]),
});

export async function saveAddress(_prev: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { _form: ["Not authenticated"] } };

  const addressId = formData.get("address_id") as string | null;

  const parsed = addressSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    company: formData.get("company") || undefined,
    address_line1: formData.get("address_line1"),
    address_line2: formData.get("address_line2") || undefined,
    city: formData.get("city"),
    state: formData.get("state") || undefined,
    zip: formData.get("zip"),
    country: formData.get("country") || "US",
    phone: formData.get("phone") || undefined,
    label: formData.get("address_type"),
  });

  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { label, ...addressData } = parsed.data;
  const isShipping = label === "shipping";
  const isBilling = label === "billing";

  // Check if this will be the first address of its type → auto-default
  const defaultField = isShipping ? "is_default_shipping" : "is_default_billing";
  const { count } = await supabase
    .from("user_addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("label", label)
    .neq("id", addressId ?? "");

  const autoDefault = (count ?? 0) === 0;

  if (autoDefault) {
    // Clear existing default for this type so the new one becomes sole default
    await supabase.from("user_addresses").update({ [defaultField]: false } as any).eq("user_id", user.id);
  }

  if (addressId) {
    const { error } = await supabase
      .from("user_addresses")
      .update({ ...addressData, label, ...(autoDefault ? { [defaultField]: true } : {}) } as any)
      .eq("id", addressId)
      .eq("user_id", user.id);
    if (error) return { error: { _form: [error.message] } };
  } else {
    const { error } = await supabase
      .from("user_addresses")
      .insert({ ...addressData, label, [defaultField]: autoDefault, user_id: user.id } as any);
    if (error) return { error: { _form: [error.message] } };
  }

  revalidatePath("/account");
  return { success: true };
}

export async function deleteAddress(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await supabase.from("user_addresses").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/account");
  return { success: true };
}

export async function setDefaultAddress(id: string, type: "shipping" | "billing") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const field = type === "shipping" ? "is_default_shipping" : "is_default_billing";

  await supabase.from("user_addresses").update({ [field]: false } as any).eq("user_id", user.id);
  await supabase.from("user_addresses").update({ [field]: true } as any).eq("id", id).eq("user_id", user.id);

  revalidatePath("/account");
  return { success: true };
}
