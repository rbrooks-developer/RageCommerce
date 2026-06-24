"use server";

import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validations/product";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseProductFormData(formData: FormData) {
  const imagesRaw = formData.get("images") as string;
  return {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    description: (formData.get("description") as string) || undefined,
    price: parseFloat(formData.get("price") as string),
    inventory: parseInt(formData.get("inventory") as string, 10),
    category_id: (formData.get("category_id") as string) || null,
    weight_oz: (parseFloat(formData.get("weight_lbs") as string) || 0) * 16
             + (parseFloat(formData.get("weight_oz") as string) || 0),
    length_in: parseFloat(formData.get("length_in") as string) || undefined,
    width_in: parseFloat(formData.get("width_in") as string) || undefined,
    height_in: parseFloat(formData.get("height_in") as string) || undefined,
    is_published: formData.get("is_published") === "true",
    seo_title: (formData.get("seo_title") as string) || undefined,
    seo_description: (formData.get("seo_description") as string) || undefined,
    images: imagesRaw ? JSON.parse(imagesRaw) : [],
  };
}

export async function createProduct(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const parsed = productSchema.safeParse(parseProductFormData(formData));
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from("products").insert(parsed.data);
  if (error) return { error: { _form: [error.message] } };

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, _prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const parsed = productSchema.safeParse(parseProductFormData(formData));
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from("products")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: { _form: [error.message] } };

  revalidatePath("/admin/products");
  revalidatePath(`/products/${parsed.data.slug}`);
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function togglePublished(id: string, current: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_published: !current })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/products");
}
