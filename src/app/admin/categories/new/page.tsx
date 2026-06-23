import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { createCategory } from "@/lib/actions/categories";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewCategoryPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("name");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/admin/categories" className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Category</h1>
      </div>
      <CategoryForm action={createCategory} categories={categories ?? []} submitLabel="Create Category" />
    </div>
  );
}
