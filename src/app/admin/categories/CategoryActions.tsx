"use client";

import { useState } from "react";
import { deleteCategory } from "@/lib/actions/categories";
import { Spinner } from "@/components/ui/spinner";

export function DeleteCategoryButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this category? Products in it will become uncategorized.")) return;
    setLoading(true);
    await deleteCategory(id);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:underline disabled:opacity-50 inline-flex items-center gap-1"
    >
      {loading ? <Spinner className="h-3 w-3" /> : null}
      Delete
    </button>
  );
}
