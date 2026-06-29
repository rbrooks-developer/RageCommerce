"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

interface Props {
  categories: { id: string; name: string }[];
}

export function ProductFilters({ categories }: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/admin/products?${params.toString()}`);
  }

  function handleSearch(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam("search", value), 300);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type="text"
        placeholder="Search by name…"
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => handleSearch(e.target.value)}
        className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 w-full sm:w-56"
      />
      <select
        value={searchParams.get("category") ?? ""}
        onChange={(e) => updateParam("category", e.target.value)}
        className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 w-full sm:w-48"
      >
        <option value="">All categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
    </div>
  );
}
