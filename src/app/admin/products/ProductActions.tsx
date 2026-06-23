"use client";

import { useState } from "react";
import { deleteProduct, togglePublished } from "@/lib/actions/products";
import { Spinner } from "@/components/ui/spinner";

export function DeleteProductButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setLoading(true);
    await deleteProduct(id);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:underline disabled:opacity-50 inline-flex items-center gap-1 text-sm"
    >
      {loading ? <Spinner className="h-3 w-3" /> : null}
      Delete
    </button>
  );
}

export function TogglePublishedButton({ id, isPublished }: { id: string; isPublished: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await togglePublished(id, isPublished);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="text-gray-600 hover:underline disabled:opacity-50 inline-flex items-center gap-1 text-sm"
    >
      {loading ? <Spinner className="h-3 w-3" /> : null}
      {isPublished ? "Unpublish" : "Publish"}
    </button>
  );
}
