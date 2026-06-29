"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

type CategoryRow = { id: string; name: string; parent_id: string | null };

interface Props {
  categories: CategoryRow[];
}

/** Recursively collects descendants in depth-first alphabetical order. */
function collectDescendants(
  parentId: string,
  all: CategoryRow[],
  depth: number,
): { cat: CategoryRow; depth: number }[] {
  const children = all
    .filter((c) => c.parent_id === parentId)
    .sort((a, b) => a.name.localeCompare(b.name));

  const result: { cat: CategoryRow; depth: number }[] = [];
  for (const child of children) {
    result.push({ cat: child, depth });
    result.push(...collectDescendants(child.id, all, depth + 1));
  }
  return result;
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

  const roots = categories
    .filter((c) => !c.parent_id)
    .sort((a, b) => a.name.localeCompare(b.name));

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
        className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 w-full sm:w-56"
      >
        <option value="">All categories</option>
        {roots.map((root) => {
          const descendants = collectDescendants(root.id, categories, 0);
          return (
            // Root category is a non-selectable group header — avoids
            // "Collectibles (all)" which would be identical to "All categories"
            <optgroup key={root.id} label={root.name}>
              {descendants.map(({ cat, depth }) => (
                <option key={cat.id} value={cat.id}>
                  {"  ".repeat(depth * 2)}
                  {depth > 0 ? "— " : ""}
                  {cat.name}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
    </div>
  );
}
