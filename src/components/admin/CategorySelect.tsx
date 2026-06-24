"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

export type CategoryOption = { id: string; label: string; depth: number };

/**
 * Builds an ordered, indented option list from a flat category array.
 * Walks top-level → level-2 → level-3 so children appear under their parent.
 *
 * @param maxParentDepth  If set, categories deeper than this are omitted (use when
 *                        choosing a parent to avoid exceeding the 3-level limit).
 */
export function buildCategoryOptions(
  categories: Category[],
  {
    noneLabel = "None",
    excludeId,
    maxDepth,
  }: { noneLabel?: string; excludeId?: string; maxDepth?: number } = {}
): CategoryOption[] {
  const depthMap = new Map<string, number>();
  // Multi-pass to handle arbitrary depth in the data
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of categories) {
      if (!c.parent_id) {
        if (depthMap.get(c.id) !== 0) { depthMap.set(c.id, 0); changed = true; }
      } else {
        const parentDepth = depthMap.get(c.parent_id);
        if (parentDepth !== undefined) {
          const d = parentDepth + 1;
          if (depthMap.get(c.id) !== d) { depthMap.set(c.id, d); changed = true; }
        }
      }
    }
  }

  const options: CategoryOption[] = [{ id: "", label: noneLabel, depth: 0 }];

  function walk(parentId: string | null, depth: number) {
    const kids = categories.filter(
      (c) =>
        (parentId === null ? !c.parent_id : c.parent_id === parentId) &&
        c.id !== excludeId
    );
    for (const c of kids) {
      if (maxDepth === undefined || depth <= maxDepth) {
        options.push({ id: c.id, label: c.name, depth });
        walk(c.id, depth + 1);
      }
    }
  }

  walk(null, 0);
  return options;
}

export function CategorySelect({
  options,
  value,
  onChange,
  inputName,
}: {
  options: CategoryOption[];
  value: string;
  onChange: (v: string) => void;
  inputName: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.id === value) ?? options[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const indent = (depth: number) =>
    depth === 0 ? "pl-3" : depth === 1 ? "pl-7" : "pl-11";

  const prefix = (depth: number) =>
    depth === 1 ? "— " : depth === 2 ? "— — " : "";

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={inputName} value={value} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-gray-900"
      >
        <span className="text-gray-900">
          {prefix(selected.depth)}{selected.label}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform duration-150 shrink-0",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.id || "__none__"}
              type="button"
              onClick={() => { onChange(opt.id); setOpen(false); }}
              className={cn(
                "flex w-full items-center py-2 text-sm text-left transition-colors",
                indent(opt.depth),
                opt.id === value
                  ? "bg-gray-900 text-white"
                  : opt.depth > 0
                  ? "text-gray-600 hover:bg-gray-50"
                  : "text-gray-900 hover:bg-gray-50"
              )}
            >
              {opt.depth > 0 && (
                <span className="mr-1 text-gray-400">{prefix(opt.depth)}</span>
              )}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
